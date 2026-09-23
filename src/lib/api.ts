import axios from 'axios';
import { AnalysisResult, CraftCategory, Product, Inquiry, SalesRecord, CategoryDistribution } from '../types';
import { 
  fetchProducts, 
  fetchProductById, 
  saveProductRecord, 
  saveInquiryRecord, 
  fetchInquiries,
  replyToInquiryRecord
} from './firebase';
import { salesRecords6Months, categoryDistribution } from './mockData';
import { analyzeCraftPhoto } from './aiVisionAnalyzer';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'; // defaults to false (calling live backend)

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AnalyzePayload {
  imageFile?: File | string;
  category: CraftCategory;
  voiceNoteBlob?: Blob | null;
  sampleAudioKey?: string;
  materials: string[];
  quantity: number;
}

// Category-specific heritage AI models for simulated Gemini 1.5 Pro multimodal processing
const craftKnowledgeBase: Record<CraftCategory, {
  title: string;
  titleHi: string;
  story: string;
  storyHi: string;
  materials: string[];
  tags: string[];
  priceBand: { min: number; max: number; suggested: number; rationale: string; rationaleHi: string };
  audioTranscript: string;
  audioTranscriptHi: string;
}> = {
  pottery: {
    title: 'Handcrafted Jaipur Blue Pottery Heritage Floral Urn',
    titleHi: 'पारंपरिक हस्तनिर्मित जयपुर ब्लू पॉटरी पुष्प कलश',
    story: 'Meticulously crafted using traditional non-clay dough made of powdered quartz stone, Multani Mitti (Fuller’s earth), and natural plant gum. Decorated with classic Persian arabesque floral motifs in rich cobalt oxide blues and glazed with low-temperature wood-kiln firing.',
    storyHi: 'क्वार्ट्ज पत्थर, मुल्तानी मिट्टी और प्राकृतिक गोंद से बिना मिट्टी के बनाया गया प्रामाणिक पात्र। कोबाल्ट ऑक्साइड के गहरे नीले रंगों और पारंपरिक फ़ारसी बूटियों से हाथ द्वारा सजाया गया।',
    materials: ['Quartz Stone Powder', 'Fuller’s Earth (Multani Mitti)', 'Cobalt Blue Oxide', 'Natural Borax Glaze'],
    tags: ['Blue Pottery', 'GI Certified #33', 'Jaipur Craft', 'Hand Painted', 'Glazed Ceramic', 'Non-Toxic'],
    priceBand: {
      min: 1350,
      max: 1850,
      suggested: 1550,
      rationale: 'Based on 14 hours of artisan handcrafting, raw quartz stone preparation, double-firing kiln fuel, and Jaipur GI cluster benchmark.',
      rationaleHi: '14 घंटे की कारीगरी, क्वार्ट्ज घिसाई, भट्टी की लकड़ी और जयपुर जीआई बाज़ार मानकों के आधार पर।'
    },
    audioTranscript: 'मैंने यह कलश क्वार्ट्ज पत्थर और मुल्तानी मिट्टी के मिश्रण से तैयार किया है। इस पर हाथ से मोर और फूलों की चित्रकारी की गई है।',
    audioTranscriptHi: 'मैंने यह कलश क्वार्ट्ज पत्थर और मुल्तानी मिट्टी के मिश्रण से तैयार किया है। इस पर हाथ से मोर और फूलों की चित्रकारी की गई है।'
  },
  metal: {
    title: 'Bastar Lost-Wax Bell Metal (Dhokra) Tribal Artifact',
    titleHi: 'बस्तर ढोकरा पारंपरिक लॉस्ट-वैक्स कांस्य शिल्प',
    story: 'Created by tribal Ghadwa artisans of Bastar using the 4,000-year-old lost-wax (cire perdue) hollow metal casting technique. Fine beeswax threads are hand-wound over a clay core, encased in riverbed mud, and replaced with molten scrap brass and bell metal in an open fire pit.',
    storyHi: 'बस्तर के घड़वा आदिवासियों द्वारा 4000 साल पुरानी मोम ढलाई तकनीक से निर्मित। मिट्टी के ढांचे पर मधुमक्खी के मोम के बारीक धागों से अलंकृत कर पिघले कांस्य से ढाला गया।',
    materials: ['Bell Metal (Kansa)', 'Recycled Brass', 'Natural Beeswax', 'River Bed Mud'],
    tags: ['Dhokra Metal', 'Lost Wax Casting', 'Bastar GI #83', 'Tribal Folk Art', 'Antiqued Bronze'],
    priceBand: {
      min: 2100,
      max: 2900,
      suggested: 2450,
      rationale: 'Based on raw bell metal alloy market rate (₹650/kg), beeswax mold modeling labor, and open-pit casting risk factor.',
      rationaleHi: 'कांस्य धातु की बाज़ार दर, मोम के धागे गढ़ने की बारीक मेहनत और खुले भट्टी ढलाई जोखिम के आधार पर।'
    },
    audioTranscript: 'यह शिल्प हमने मोम के धागे और नदी की लाल मिट्टी से बनाया है। इसके बाद पीतल पिघलाकर इसमें ढाला गया है।',
    audioTranscriptHi: 'यह शिल्प हमने मोम के धागे और नदी की लाल मिट्टी से बनाया है। इसके बाद पीतल पिघलाकर इसमें ढाला गया है।'
  },
  textiles: {
    title: 'Heritage Pit-Loom Handwoven Mulberry Silk Brocade',
    titleHi: 'हथकरघा शुद्ध शहतूत रेशम पारंपरिक ज़री बुनाई',
    story: 'Woven on traditional wooden pit looms with extra-weft kadhwa patterning where every motif is engraved by hand. Crafted using pure mulberry silk and tested gold/silver metallic zari yarn with natural plant-based dyes.',
    storyHi: 'लकड़ी के पारंपरिक गड्ढा करघे (पिट लूम) पर कढ़वा तकनीक द्वारा बुना गया विशुद्ध रेशम। प्रत्येक बूटा हथकरघा बुनकर द्वारा बिना किसी पीछे के ढीले धागे के गढ़ा गया है।',
    materials: ['Pure Mulberry Silk', 'Tested Metallic Zari', 'Natural Indigo Dye', 'Vegetable Mordants'],
    tags: ['Handloom', 'Kadhwa Weave', 'Pure Silk', 'Heirloom Craft', 'GI Heritage'],
    priceBand: {
      min: 3800,
      max: 5200,
      suggested: 4500,
      rationale: 'Based on 22 days of handloom weaver labor, 100% certified silk yarn count, and certified zari grade.',
      rationaleHi: '22 दिनों की अथक हथकरघा बुनाई, शुद्ध रेशम धागे और ज़री की प्रमाणिकता के आधार पर।'
    },
    audioTranscript: 'यह बुनाई हमारे खानदानी करघे पर हुई है। इसमें शुद्ध रेशम और सुनहरी ज़री का काम है, जो सालों साल चमकता रहेगा।',
    audioTranscriptHi: 'यह बुनाई हमारे खानदानी करघे पर हुई है। इसमें शुद्ध रेशम और सुनहरी ज़री का काम है, जो सालों साल चमकता रहेगा।'
  },
  painting: {
    title: 'Mithila Madhubani Folk Art on Handmade Bamboo Parchment',
    titleHi: 'मधुबनी हस्तचित्रित लोक कला (प्राकृतिक वनस्पति रंगों से निर्मित)',
    story: 'Traditional Madhubani Kachni-Bharni painting rendered with sharpened bamboo twigs and cotton swabs. Features sacred geometric motifs drawn with natural dyes derived from turmeric ochre, indigo leaves, marigold petals, and soothing soot ink.',
    storyHi: 'बांस की कलम और प्राकृतिक रंगों (हल्दी, नील, पलाश के फूल) से हस्तनिर्मित कागज़ पर उकेरी गई मिथिला की पावन लोक चित्रकला।',
    materials: ['Handmade Bamboo Paper', 'Indigo Plant Pigment', 'Turmeric Ochre', 'Lamp Soot Ink'],
    tags: ['Madhubani', 'Mithila Folk Painting', 'Natural Plant Dyes', 'GI #105', 'Eco Friendly'],
    priceBand: {
      min: 1600,
      max: 2300,
      suggested: 1950,
      rationale: 'Based on organic color extraction time, delicate freehand line work, and archival-grade bamboo paper preservation.',
      rationaleHi: 'प्राकृतिक रंगों के निष्कर्षण समय, महीन रेखांकन और टिकाऊ बांस कागज़ के आधार पर।'
    },
    audioTranscript: 'यह चित्रकला हमने घर में बनाई है, प्राकृतिक हल्दी, काजल और नीम के पत्तों के रस से। यह समृद्धि और शुभता का प्रतीक है।',
    audioTranscriptHi: 'यह चित्रकला हमने घर में बनाई है, प्राकृतिक हल्दी, काजल और नीम के पत्तों के रस से। यह समृद्धि और शुभता का प्रतीक है।'
  },
  woodwork: {
    title: 'Channapatna Natural Lacquerware Turned Woodcraft',
    titleHi: 'चन्नपटना प्राकृतिक लाख रंगीन हस्तनिर्मित काष्ठ शिल्प',
    story: 'Turned on high-speed hand-lathes from seasoned Ivory Wood (Aale Mara). Colored naturally through thermal friction applying sticks of purified natural shellac blended with non-toxic turmeric yellow, indigo blue, and vermilion.',
    storyHi: 'आइवरी की लकड़ी को खराद पर घुमाकर प्राकृतिक लाख की बत्तियों से बिना किसी कृत्रिम रंग के रंगा गया पारंपरिक खिलौना शिल्प।',
    materials: ['Ivory Wood (Aale Mara)', 'Purified Lac Resin', 'Natural Turmeric Dye', 'Plant Resins'],
    tags: ['Channapatna', 'GI #01', 'Non-Toxic', 'Turned Wood', 'Eco Toy', 'Loom Town'],
    priceBand: {
      min: 800,
      max: 1250,
      suggested: 950,
      rationale: 'Based on seasoned soft-wood block curing, friction lacquer buffing, and child-safe certification standard.',
      rationaleHi: 'लकड़ी की घिसाई, प्राकृतिक लाख की पॉलिश और बाल-सुरक्षित मानकों के आधार पर।'
    },
    audioTranscript: 'यह खिलौना हमने खराद मशीन पर आले की लकड़ी से बनाया है। इसमें कोई जहरीला रंग नहीं है, केवल प्राकृतिक लाख है।',
    audioTranscriptHi: 'यह खिलौना हमने खराद मशीन पर आले की लकड़ी से बनाया है। इसमें कोई जहरीला रंग नहीं है, केवल प्राकृतिक लाख है।'
  },
  basketry: {
    title: 'Hand-Coiled Golden Grass (Sikki) Tribal Craft Basket',
    titleHi: 'हस्तनिर्मित सिककी सुनहरी घास पारंपरिक टोकरी',
    story: 'Woven with natural wild Sikki golden grass harvested from marshlands. Hand-dyed using organic roots and coiled meticulously to create utilitarian and ceremonial eco-friendly vessels.',
    storyHi: 'नदियों के कछार में उगने वाली प्राकृतिक सिककी सुनहरी घास से हाथ से गूंथी गई पारंपरिक व पर्यावरण अनुकूल टोकरी।',
    materials: ['Wild Sikki Grass', 'Munj Reed Core', 'Natural Madder Root Dye'],
    tags: ['Sikki Grass', 'Golden Grass', 'Tribal Weaving', 'Eco Basketry', 'Sustainable'],
    priceBand: {
      min: 700,
      max: 1100,
      suggested: 890,
      rationale: 'Reflects seasonal wild grass harvesting, split-stem fiber twisting, and durable moisture-resistant coiling.',
      rationaleHi: 'सिककी घास की मौसमी कटाई, रेशों की बारीक बुनाई और टिकाऊपन के आधार पर।'
    },
    audioTranscript: 'यह टोकरी सिककी घास से हाथों से बुनी गई है। इसमें अनाज और आभूषण सुरक्षित रखे जा सकते हैं।',
    audioTranscriptHi: 'यह टोकरी सिककी घास से हाथों से बुनी गई है। इसमें अनाज और आभूषण सुरक्षित रखे जा सकते हैं।'}
  ,
  jewelry: {
    title: 'Tribal Filigree & Hand-Chased Silver Talisman',
    titleHi: 'पारंपरिक जनजातीय चांदी तारकशी ताबीज व आभूषण',
    story: 'Created by beating high-grade silver into fine threads, twisted and soldered together into intricate openwork patterns inspired by tribal amulets and forest deities.',
    storyHi: 'चांदी के महीन तारों को मोड़कर और जोड़कर बनाई गई पारंपरिक जनजातीय तारकशी कला।',
    materials: ['925 Sterling Silver', 'Natural Borax Flux', 'Semiprecious Agate Stone'],
    tags: ['Tribal Jewelry', 'Silver Filigree', 'Talisman', 'Handcrafted', 'Heritage'],
    priceBand: {
      min: 2400,
      max: 3400,
      suggested: 2850,
      rationale: 'Reflects spot silver weight, delicate 0.3mm wire soldering labor, and tribal design uniqueness.',
      rationaleHi: 'चांदी के भार, बारीक तार जोड़ने के हुनर और पारंपरिक डिजाइन के आधार पर।'
    },
    audioTranscript: 'यह चांदी का ताबीज हमने बारीक तारों को हाथों से जोड़कर तैयार किया है।',
    audioTranscriptHi: 'यह चांदी का ताबीज हमने बारीक तारों को हाथों से जोड़कर तैयार किया है।'
  },
  leather: {
    title: 'Hand-Embroidered Rajasthani Rawhide Jutti / Mojari',
    titleHi: 'हस्तनिर्मित राजस्थानी कसीदाकारी मोजड़ी (जूती)',
    story: 'Tanned using natural acacia tree barks, hand-stitched with durable cotton thread and embellished with fine silk thread dabka embroidery on pure rawhide.',
    storyHi: 'बबूल की छाल से तैयार चमड़े पर रेशमी धागों से कसीदाकारी कर हाथों से सिली गई पारंपरिक मोजड़ी।',
    materials: ['Naturally Tanned Leather', 'Silk Dabka Thread', 'Cotton Twine'],
    tags: ['Mojari', 'Handcrafted Leather', 'Rajasthani Jutti', 'Traditional Footwear'],
    priceBand: {
      min: 1100,
      max: 1650,
      suggested: 1350,
      rationale: 'Reflects herbal vegetable tanning, hand sole stitching, and dense needle embroidery.',
      rationaleHi: 'प्राकृतिक चमड़ा रंगाई, मजबूत हाथ की सिलाई और कसीदाकारी के आधार पर।'
    },
    audioTranscript: 'यह मोजड़ी शुद्ध चमड़े की है और इस पर हाथों से रेशम का काम किया गया है। बहुत आरामदायक और मजबूत है।',
    audioTranscriptHi: 'यह मोजड़ी शुद्ध चमड़े की है और इस पर हाथों से रेशम का काम किया गया है। बहुत आरामदायक और मजबूत है।'
  },
  other: {
    title: 'Traditional Indian Artisanal Craft Artifact',
    titleHi: 'पारंपरिक भारतीय हस्तशिल्प कलाकृति',
    story: 'Authentic handmade artifact crafted following ancestral heritage techniques passed down through generations of craft families.',
    storyHi: 'पीढ़ियों से चली आ रही पारंपरिक हस्तशिल्प पद्धति द्वारा तैयार विशिष्ट भारतीय धरोहर कृति।',
    materials: ['Natural Handcrafted Materials', 'Organic Pigments'],
    tags: ['Handcrafted', 'Heritage Craft', 'Artisan Made', 'Vocal for Local'],
    priceBand: {
      min: 950,
      max: 1500,
      suggested: 1200,
      rationale: 'Based on traditional artisan bench time and natural material sourcing.',
      rationaleHi: 'कारीगर के श्रम समय और प्राकृतिक सामग्री की लागत के आधार पर।'
    },
    audioTranscript: 'यह कलाकृति हमारे पारंपरिक हुनर से बनी है। इसमें शुद्ध प्राकृतिक सामग्री का उपयोग किया गया है।',
    audioTranscriptHi: 'यह कलाकृति हमारे पारंपरिक हुनर से बनी है। इसमें शुद्ध प्राकृतिक सामग्री का उपयोग किया गया है।'
  }
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Multistage AI Analysis Pipeline (Gemini Vision + Craft Intelligence + Image Enhancement)
 */
export async function analyzeProduct(
  payload: AnalyzePayload,
  onProgress?: (stage: number, stageName: string) => void
): Promise<AnalysisResult> {
  // If a live backend exists and mock mode is off, attempt remote call to backend
  if (!FORCE_MOCK) {
    try {
      if (onProgress) onProgress(1, 'Connecting to Kaarigar AI Backend API...');

      let imageDataUrl = '';
      if (payload.imageFile instanceof Blob) {
        imageDataUrl = await blobToDataUrl(payload.imageFile);
      } else if (typeof payload.imageFile === 'string') {
        imageDataUrl = payload.imageFile;
      }

      let audioDataUrl = '';
      if (payload.voiceNoteBlob instanceof Blob) {
        audioDataUrl = await blobToDataUrl(payload.voiceNoteBlob);
      } else if (typeof (payload as any).audioUrl === 'string') {
        audioDataUrl = (payload as any).audioUrl;
      }

      if (onProgress) onProgress(2, 'Processing multimodal craft appraisal via Gemini...');

      const res = await apiClient.post<AnalysisResult>('/analyze-product', {
        image: imageDataUrl,
        audio: audioDataUrl,
        category: payload.category,
        materials: payload.materials || [],
        quantity: payload.quantity || 1,
        description: (payload as any).description || '',
        language: (payload as any).language || 'hi'
      });

      if (onProgress) onProgress(3, 'Analysis Complete');
      return res.data;
    } catch (err) {
      console.warn('Backend call failed, continuing with Gemini Vision engine fallback:', err);
    }
  }

  // Determine image source
  let imageSource = payload.imageFile;
  if (!imageSource || (typeof imageSource === 'string' && imageSource.trim().length === 0)) {
    const fallbackImgs: Record<CraftCategory, string> = {
      pottery: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      metal: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      textiles: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      painting: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
      woodwork: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      basketry: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
      jewelry: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      leather: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      other: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    };
    imageSource = fallbackImgs[payload.category] || fallbackImgs.other;
  }

  // Deep AI Vision Analysis & Studio Image Enhancement
  const visualAnalysis = await analyzeCraftPhoto(imageSource, payload.category, onProgress);

  // Combine detected materials with any user-selected materials
  const combinedMaterials = Array.from(new Set([...visualAnalysis.materials, ...(payload.materials || [])]));

  return {
    isHandicraft: visualAnalysis.isValidCraft,
    detectedSubject: visualAnalysis.detectedNonCraftObject || visualAnalysis.craftName,
    isValidCraft: visualAnalysis.isValidCraft,
    isProduct: visualAnalysis.isProduct,
    rejectionReason: visualAnalysis.rejectionReason,
    rejectionReasonHi: visualAnalysis.rejectionReasonHi,
    detectedNonCraftObject: visualAnalysis.detectedNonCraftObject,
    detectedNonCraftObjectHi: visualAnalysis.detectedNonCraftObjectHi,
    nonCraftExplanation: visualAnalysis.nonCraftExplanation,
    enhancedImage: visualAnalysis.enhancementResult.enhancedUrl,
    originalImage: visualAnalysis.enhancementResult.originalUrl,
    detectedCategory: visualAnalysis.detectedCategory,
    suggestedTitle: visualAnalysis.suggestedTitle,
    suggestedTitleHi: visualAnalysis.suggestedTitleHi,
    culturalStory: visualAnalysis.culturalStory,
    culturalStoryHi: visualAnalysis.culturalStoryHi,
    materials: combinedMaterials,
    tags: visualAnalysis.tags,
    detectedLanguage: (payload as any).language || 'hi',
    audioTranscript: (payload as any).description || visualAnalysis.culturalStory,
    audioTranscriptHi: visualAnalysis.culturalStoryHi,
    priceBand: visualAnalysis.priceBand,
    confidenceScore: visualAnalysis.confidenceScore
  };
}

export async function getProducts(): Promise<Product[]> {
  return fetchProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return fetchProductById(id);
}

export async function publishProduct(product: Product): Promise<void> {
  await saveProductRecord(product);
}

export async function sendInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  const newInquiry: Inquiry = {
    ...inquiryData,
    id: `inq-${Date.now().toString(36)}`,
    status: 'new',
    createdAt: new Date().toISOString(),
    replies: []
  };
  await saveInquiryRecord(newInquiry);
  return newInquiry;
}

export async function replyToInquiry(inquiryId: string, replyMessage: string): Promise<void> {
  await replyToInquiryRecord(inquiryId, {
    id: `rep-${Date.now().toString(36)}`,
    sender: 'artisan',
    message: replyMessage,
    timestamp: new Date().toISOString()
  });
}

export async function getArtisanAnalytics(artisanId: string): Promise<{ records: SalesRecord[], distribution: CategoryDistribution[] }> {
  return {
    records: salesRecords6Months,
    distribution: categoryDistribution
  };
}
