import { CraftCategory, PriceBand } from '../types/index';

export interface FestivalSituation {
  isFestivalSeason: boolean;
  festivalId: string;
  festivalName: string;
  festivalNameHi: string;
  festivalNameTa: string;
  seasonPeriod: string;
  demandSurgePercent: number; // e.g. 25 for +25%
  surgeMultiplier: number;    // e.g. 1.25
  craftRelevance: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'STANDARD';
  reasoning: string;
  reasoningHi: string;
  reasoningTa: string;
  topCrafts: string[];
}

export interface PriceEvaluation {
  status: 'HIGH' | 'LOW' | 'FAIR' | 'FESTIVAL_OPTIMAL';
  level: 'warning' | 'info' | 'success' | 'festival';
  label: string;
  badge: string;
  explanation: string;
  explanationVoice: string;
  suggestedPrice: number;
  baseFairPrice: number;
  festivalFairPrice: number;
  marketMin: number;
  marketMax: number;
  festivalMin: number;
  festivalMax: number;
  differencePercent: number;
}

/**
 * Detect active or upcoming Indian festival & seasonal craft market situation
 */
export function getFestivalSituation(
  category: CraftCategory = 'pottery',
  testDate?: Date
): FestivalSituation {
  const now = testDate || new Date();
  const month = now.getMonth(); // 0 = Jan, 8 = Sept, 9 = Oct, 10 = Nov, 11 = Dec
  const day = now.getDate();

  // Late September to November: Diwali, Dussehra, Navratri Grand Festive Season
  if (month === 8 || month === 9 || month === 10) {
    let surge = 25;
    let relevance: FestivalSituation['craftRelevance'] = 'VERY_HIGH';

    if (category === 'pottery' || category === 'terracotta') {
      surge = 25; // Diyas, terracotta puja bells, earthen festive cookware
      relevance = 'VERY_HIGH';
    } else if (category === 'metal') {
      surge = 25; // Brass puja lamps, bells, copper urulis, bronze idols
      relevance = 'VERY_HIGH';
    } else if (category === 'textiles' || category === 'embroidery') {
      surge = 20; // Festive sarees, dupattas, zari stoles
      relevance = 'HIGH';
    } else if (category === 'painting') {
      surge = 20; // Traditional Pichwai, Madhubani festive wall hangings
      relevance = 'HIGH';
    } else {
      surge = 15;
      relevance = 'MODERATE';
    }

    return {
      isFestivalSeason: true,
      festivalId: 'diwali_festive',
      festivalName: 'Diwali & Dussehra Grand Festive Season',
      festivalNameHi: 'दीपावली एवं दशहरा महापर्व सीज़न',
      festivalNameTa: 'தீபாவளி & தசரா பெருவிழா காலம்',
      seasonPeriod: 'September – November (Active Peak Demand)',
      demandSurgePercent: surge,
      surgeMultiplier: 1 + surge / 100,
      craftRelevance: relevance,
      reasoning: `Peak annual demand for authentic handmade ${category}. Craft patrons across India are actively shopping for festive home decor, puja rituals, and family gifting. Buyer willingness to pay a fair premium is up by +${surge}%.`,
      reasoningHi: `${category} हस्तशिल्प की मांग अपने वार्षिक शिखर पर है। देश भर के ग्राहक त्योहारों, पूजा और उपहारों के लिए प्रामाणिक हस्तशिल्प खरीद रहे हैं। ग्राहक +${surge}% तक का उचित त्योहारी प्रीमियम खुशी से देते हैं।`,
      reasoningTa: `கைவினை ${category} பொருட்களுக்கான வருடாந்திர உச்ச தேவை காலம். பண்டிகை வீட்டு அலங்காரம், பூஜை மற்றும் அன்பளிப்புகளுக்கு மக்கள் ஆர்வத்துடன் வாங்குகின்றனர். +${surge}% வரை கூடுதல் மதிப்பு செலுத்த தயாராக உள்ளனர்.`,
      topCrafts: ['Pottery & Terracotta Diyas', 'Brass Puja Metalware', 'Festive Zari Textiles', 'Pichwai & Folk Paintings']
    };
  }

  // December to February: Winter & Grand Indian Wedding + Pongal / Makar Sankranti
  if (month === 11 || month === 0 || month === 1) {
    const isHarvestPottery = category === 'pottery' || category === 'terracotta';
    const surge = isHarvestPottery ? 20 : 25;

    return {
      isFestivalSeason: true,
      festivalId: 'wedding_pongal',
      festivalName: 'Royal Wedding & Harvest Season (Pongal / Makar Sankranti)',
      festivalNameHi: 'विवाह एवं मकर संक्रांति / पोंगल उत्सव सीज़न',
      festivalNameTa: 'திருமண & பொங்கல் / அறுவடை திருநாள் காலம்',
      seasonPeriod: 'December – February (Wedding & Gifting Peak)',
      demandSurgePercent: surge,
      surgeMultiplier: 1 + surge / 100,
      craftRelevance: 'HIGH',
      reasoning: `High demand for wedding gifting, heirloom trousseau items, and harvest festival clay/brass cookware. Craft sales surge by +${surge}%.`,
      reasoningHi: `विवाह उपहारों, रेशमी वस्त्रों और पोंगल/संक्रांति के लिए पारंपरिक मिट्टी और धातु के बर्तनों की विशेष मांग।`,
      reasoningTa: `திருமண சீர்வரிசை மற்றும் பொங்கல் திருநாளுக்கான பாரம்பரிய மண்பாண்டங்கள் மற்றும் கைத்தறி ஆடைகளுக்கான அதிக தேவை.`,
      topCrafts: ['Pure Silk Textiles', 'Heirloom Jewelry', 'Harvest Terracotta Pots', 'Bhadohi Carpets']
    };
  }

  // March to May: Spring Craft Fairs & Summer Terracotta
  if (month >= 2 && month <= 4) {
    const isSummerPottery = category === 'pottery' || category === 'terracotta';
    const surge = isSummerPottery ? 20 : 15;

    return {
      isFestivalSeason: true,
      festivalId: 'spring_summer',
      festivalName: 'Spring Craft Fairs & Summer Earth Season',
      festivalNameHi: 'वसंत शिल्प मेला एवं ग्रीष्मकालीन मिट्टी पर्व',
      festivalNameTa: 'வசந்த கைவினை கண்காட்சி & கோடைக்கால பருவம்',
      seasonPeriod: 'March – May (Spring Fairs & Summer Ware)',
      demandSurgePercent: surge,
      surgeMultiplier: 1 + surge / 100,
      craftRelevance: isSummerPottery ? 'VERY_HIGH' : 'MODERATE',
      reasoning: isSummerPottery
        ? `High seasonal demand for natural terracotta cooling water matkas, porous earthen planters, and summer tableware (+${surge}%).`
        : `Spring artisan fairs and regional tourist season bring healthy +${surge}% buyer interest.`,
      reasoningHi: `प्राकृतिक लाल मिट्टी के मटकों, गमलों और पारंपरिक गर्मियों के बर्तनों की विशेष मांग (+${surge}%)।`,
      reasoningTa: `கோடைக்கால குளிர்ச்சி தரும் மண் பானைகள் மற்றும் செடி தொட்டிகளுக்கான அதிக தேவை (+${surge}%).`,
      topCrafts: ['Earthen Water Matkas', 'Terracotta Planters', 'Cotton Handlooms', 'Palm Leaf Fans']
    };
  }

  // June to August: Standard Sustainable Season
  return {
    isFestivalSeason: false,
    festivalId: 'standard_season',
    festivalName: 'Standard Fair Trade Season',
    festivalNameHi: 'सामान्य स्थायी बाज़ार सीज़न',
    festivalNameTa: 'இயல்பான நியாய வணிக காலம்',
    seasonPeriod: 'June – August (Sustainable Baseline Demand)',
    demandSurgePercent: 0,
    surgeMultiplier: 1.0,
    craftRelevance: 'STANDARD',
    reasoning: `Steady sustainable demand. Regular fair-market pricing is recommended to ensure high turnover and steady weekly artisan income.`,
    reasoningHi: `स्थिर दैनिक मांग। निरंतर बिक्री और साप्ताहिक आय के लिए मानक उचित मूल्य सबसे उपयुक्त है।`,
    reasoningTa: `நிலையான இயல்பான தேவை. தொடர்ந்து விற்பனையாகி வருமானம் பெற இயல்பான நியாய விலையே சிறந்தது.`,
    topCrafts: ['Everyday Functional Pottery', 'Daily Wear Textiles', 'Utility Basketry']
  };
}

/**
 * Intelligent Price Advisory Engine
 * Compares artisan's set or spoken price with objective market appraisal and festival situation
 */
export function analyzeArtisanPrice({
  artisanPrice,
  marketBand,
  category = 'pottery',
  festivalSituation,
  useFestivalSurge = true,
  language = 'en-IN'
}: {
  artisanPrice: number;
  marketBand?: Partial<PriceBand> | null;
  category?: CraftCategory;
  festivalSituation?: FestivalSituation;
  useFestivalSurge?: boolean;
  language?: string;
}): PriceEvaluation {
  const fest = festivalSituation || getFestivalSituation(category);

  // Market baseline appraisal from AI
  const marketMin = Math.max(100, Number(marketBand?.min) || 1200);
  const marketMax = Math.max(marketMin + 200, Number(marketBand?.max) || 1800);
  const baseFairPrice = Math.max(
    marketMin,
    Number(marketBand?.suggested) || Math.round((marketMin + marketMax) / 2)
  );

  // Festival season multipliers
  const effectiveSurge = (fest.isFestivalSeason && useFestivalSurge) ? fest.surgeMultiplier : 1.0;
  const festivalFairPrice = Math.round(baseFairPrice * fest.surgeMultiplier);
  const festivalMin = Math.round(marketMin * fest.surgeMultiplier);
  const festivalMax = Math.round(marketMax * fest.surgeMultiplier);

  const activeMin = (fest.isFestivalSeason && useFestivalSurge) ? festivalMin : marketMin;
  const activeMax = (fest.isFestivalSeason && useFestivalSurge) ? festivalMax : marketMax;
  const activeSuggested = (fest.isFestivalSeason && useFestivalSurge) ? festivalFairPrice : baseFairPrice;

  const currentPrice = Number(artisanPrice) || activeSuggested;
  const diffPercent = Math.round(((currentPrice - activeSuggested) / activeSuggested) * 100);

  const isHindi = language.startsWith('hi');
  const isTamil = language.startsWith('ta');

  // 1. PRICE IS TOO HIGH (Above activeMax + 10%)
  if (currentPrice > activeMax * 1.08) {
    const label = isTamil
      ? '⚠️ விலை சற்று அதிகமாக உள்ளது'
      : (isHindi ? '⚠️ निर्धारित कीमत बाज़ार दर से अधिक है' : '⚠️ Price is Higher Than Market Average');

    const badge = isTamil
      ? `சந்தை விலையை விட +${diffPercent}% அதிகம்`
      : (isHindi ? `बाज़ार दर से +${diffPercent}% अधिक` : `Price Alert: +${diffPercent}% Above Fair Market`);

    const explanation = isTamil
      ? `உங்கள் விலை ₹${currentPrice.toLocaleString('en-IN')}, தற்போதைய சந்தை ஏற்புத்திறனை (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}) விட அதிகமாக உள்ளது. இதனால் வாடிக்கையாளர்கள் யோசிக்கலாம் மற்றும் விற்பனை தாமதமாகலாம். முழு கைவினைப் பொருட்களும் உடனே விற்றுத் தீர ₹${activeSuggested.toLocaleString('en-IN')} விலையை பரிந்துரைக்கிறோம்.`
      : (isHindi
        ? `आपकी ₹${currentPrice.toLocaleString('en-IN')} की कीमत बाज़ार के सामान्य दायरे (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}) से अधिक है। इससे ग्राहकों को निर्णय लेने में समय लग सकता है और बिक्री धीमी हो सकती है। पूरे बैच की तेज़ी से बिक्री और 100% कारीगर मुनाफे के लिए ₹${activeSuggested.toLocaleString('en-IN')} की उचित कीमत सबसे उपयुक्त रहेगी।`
        : `Your price of ₹${currentPrice.toLocaleString('en-IN')} is higher than typical buyer willingness (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}). Craft patrons may hesitate, which could slow down your inventory sales. We suggest a fair price of ₹${activeSuggested.toLocaleString('en-IN')} to sell your full batch faster with 100% fair artisan profit.`);

    const explanationVoice = isTamil
      ? `உங்கள் விலை ${currentPrice} ரூபாய் சந்தை மதிப்பை விட அதிகம். விரைவான விற்பனைக்கு ${activeSuggested} ரூபாய் வைக்க பரிந்துரைக்கிறோம்.`
      : (isHindi
        ? `आपकी कीमत ${currentPrice} रुपये बाज़ार दर से अधिक है। शीघ्र बिक्री के लिए ${activeSuggested} रुपये उचित मूल्य रहेगा।`
        : `Your price of ${currentPrice} rupees is higher than average. We suggest ${activeSuggested} rupees for faster sales.`);

    return {
      status: 'HIGH',
      level: 'warning',
      label,
      badge,
      explanation,
      explanationVoice,
      suggestedPrice: activeSuggested,
      baseFairPrice,
      festivalFairPrice,
      marketMin,
      marketMax,
      festivalMin,
      festivalMax,
      differencePercent: diffPercent
    };
  }

  // 2. UNDERPRICED (Below activeMin * 0.85)
  if (currentPrice < activeMin * 0.85) {
    const label = isTamil
      ? '💎 விலை மிகக் குறைவு! உழைப்பை மதிக்கவும்'
      : (isHindi ? '💎 कीमत बहुत कम है! अपनी मेहनत का पूरा मूल्य लें' : '💎 Underpriced! Don’t Undersell Your Labor');

    const badge = isTamil
      ? `உழைப்பு மதிப்பை விட ${Math.abs(diffPercent)}% குறைவு`
      : (isHindi ? `उचित मूल्य से ${Math.abs(diffPercent)}% कम` : `Underpriced Alert: ${Math.abs(diffPercent)}% Below Value`);

    const explanation = isTamil
      ? `கைவினைஞரே, நீங்கள் ₹${currentPrice.toLocaleString('en-IN')} மட்டுமே கேட்கிறீர்கள். ஆனால் உங்கள் பாரம்பரிய கைவினை உழைப்பு, இயற்கை மூலப்பொருட்கள் மற்றும் தயாரிப்பு நேரத்திற்கு இதன் நியாயமான மதிப்பு குறைந்தபட்சம் ₹${activeSuggested.toLocaleString('en-IN')} ஆகும்! உங்கள் கலைத்திறனை குறைத்து விற்காதீர்கள்.`
      : (isHindi
        ? `कारीगर भाई, आप सिर्फ ₹${currentPrice.toLocaleString('en-IN')} मांग रहे हैं, जबकि आपकी पुश्तैनी मेहनत, कच्ची सामग्री और कला का वास्तविक मूल्यांकन कम से कम ₹${activeSuggested.toLocaleString('en-IN')} है! अपनी विरासत कला को कम मत आंकिए। हम कीमत बढ़ाकर ₹${activeSuggested.toLocaleString('en-IN')} करने की सलाह देते हैं।`
        : `Artisan, you are setting ₹${currentPrice.toLocaleString('en-IN')}, but your authentic handcrafting labor, natural ingredients, and hours of kiln work are appraised at ₹${activeSuggested.toLocaleString('en-IN')}! Don't undersell your heritage skill. We strongly recommend claiming your fair value of ₹${activeSuggested.toLocaleString('en-IN')}.`);

    const explanationVoice = isTamil
      ? `கைவினைஞரே, உங்கள் உழைப்புக்கு இந்த விலை குறைவு. நியாயமான மதிப்பான ${activeSuggested} ரூபாய் வைக்க பரிந்துரைக்கிறோம்.`
      : (isHindi
        ? `कारीगर जी, आपकी कला का यह मूल्य बहुत कम है। अपनी मेहनत का उचित मूल्य ${activeSuggested} रुपये रखें।`
        : `Artisan, you are underpricing your hard work. We recommend setting ${activeSuggested} rupees.`);

    return {
      status: 'LOW',
      level: 'info',
      label,
      badge,
      explanation,
      explanationVoice,
      suggestedPrice: activeSuggested,
      baseFairPrice,
      festivalFairPrice,
      marketMin,
      marketMax,
      festivalMin,
      festivalMax,
      differencePercent: diffPercent
    };
  }

  // 3. FESTIVAL SURGE OPTIMAL (During festival season, price captures the premium)
  if (fest.isFestivalSeason && useFestivalSurge && currentPrice >= baseFairPrice && currentPrice <= festivalMax) {
    const label = isTamil
      ? '🪔 பண்டிகை கால தேவைக்கு மிகவும் ஏற்ற விலை!'
      : (isHindi ? '🪔 उत्सव मांग के बिल्कुल अनुकूल!' : '🪔 Perfect for Festive Season Demand!');

    const badge = isTamil
      ? `பண்டிகை கால தேவை (+${fest.demandSurgePercent}%)`
      : (isHindi ? `त्योहारी मांग अनुकूल (+${fest.demandSurgePercent}%)` : `Festive Demand Match (+${fest.demandSurgePercent}%)`);

    const explanation = isTamil
      ? `சிறப்பான விலை! சாதாரண நாட்களில் இதன் விலை ₹${baseFairPrice.toLocaleString('en-IN')}, ஆனால் தற்போதைய ${fest.festivalNameTa} காலத்தில் வாங்குவோர் மகிழ்ச்சியுடன் கூடுதல் மதிப்பு அளிக்கின்றனர் (+${fest.demandSurgePercent}%). உங்கள் ₹${currentPrice.toLocaleString('en-IN')} விலை அதிகபட்ச லாபத்தையும் விரைவான விற்பனையையும் தரும்!`
      : (isHindi
        ? `उत्कृष्ट निर्णय! सामान्य दिनों में इसका बाज़ार मूल्य ₹${baseFairPrice.toLocaleString('en-IN')} होता है, लेकिन वर्तमान ${fest.festivalNameHi} के दौरान ग्राहक +${fest.demandSurgePercent}% त्योहारी प्रीमियम खुशी से देते हैं। आपकी ₹${currentPrice.toLocaleString('en-IN')} की कीमत उत्सव मांग से पूरी तरह मेल खाती है!`
        : `Excellent choice! Standard off-peak fair price is ₹${baseFairPrice.toLocaleString('en-IN')}, but during the active ${fest.festivalName}, patrons eagerly pay a festive premium (+${fest.demandSurgePercent}%). Your price of ₹${currentPrice.toLocaleString('en-IN')} captures high seasonal demand while keeping your craft completely competitive!`);

    const explanationVoice = isTamil
      ? `சிறந்த முடிவு! ${currentPrice} ரூபாய் பண்டிகை கால தேவைக்கு மிகச் சரியானது.`
      : (isHindi
        ? `शानदार निर्णय! ${currentPrice} रुपये की कीमत त्योहारी मांग के बिल्कुल अनुकूल है।`
        : `Great choice! ${currentPrice} rupees matches the festival season demand perfectly.`);

    return {
      status: 'FESTIVAL_OPTIMAL',
      level: 'festival',
      label,
      badge,
      explanation,
      explanationVoice,
      suggestedPrice: currentPrice,
      baseFairPrice,
      festivalFairPrice,
      marketMin,
      marketMax,
      festivalMin,
      festivalMax,
      differencePercent: diffPercent
    };
  }

  // 4. BALANCED & FAIR MARKET PRICE
  const label = isTamil
    ? '✅ நியாயமான & சமச்சீரான சந்தை விலை'
    : (isHindi ? '✅ संतुलित एवं उचित बाज़ार मूल्य' : '✅ Fair & Competitive Market Price');

  const badge = isTamil
    ? 'நியாய சந்தை மதிப்பு'
    : (isHindi ? 'संतुलित बाज़ार मूल्य' : 'Fair Market Match');

  const explanation = isTamil
    ? `₹${currentPrice.toLocaleString('en-IN')} நியாயமான சந்தை வரம்பிற்குள் (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}) உள்ளது. இது உங்களுக்கான 100% நியாயமான வருவாயை உறுதிசெய்து, வாங்குவோரையும் கவரும்.`
    : (isHindi
      ? `₹${currentPrice.toLocaleString('en-IN')} की कीमत संतुलित दायरे (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}) में है। यह आपको 100% उचित पारिश्रमिक देता है और ग्राहकों के लिए भी बहुत आकर्षक है।`
      : `₹${currentPrice.toLocaleString('en-IN')} is within the ideal fair market band (₹${activeMin.toLocaleString('en-IN')}–₹${activeMax.toLocaleString('en-IN')}). It guarantees 100% fair artisan compensation while remaining very attractive to craft patrons.`);

  const explanationVoice = isTamil
    ? `${currentPrice} ரூபாய் உங்களுக்கான நியாயமான மற்றும் சமச்சீரான விலை.`
    : (isHindi
      ? `${currentPrice} रुपये आपके शिल्प का संतुलित और उचित मूल्य है।`
      : `${currentPrice} rupees is a fair and competitive price.`);

  return {
    status: 'FAIR',
    level: 'success',
    label,
    badge,
    explanation,
    explanationVoice,
    suggestedPrice: currentPrice,
    baseFairPrice,
    festivalFairPrice,
    marketMin,
    marketMax,
    festivalMin,
    festivalMax,
    differencePercent: diffPercent
  };
}

/**
 * Text-to-Speech audio reader for rural artisans
 */
export function speakArtisanPriceAdvice(text: string, language: string = 'en-IN'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Cancel any prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.95; // Slightly slower, respectful clear tone
    utterance.pitch = 1.0;

    // Pick matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(language.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
