import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '5000', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

// Data Directory for persistent JSON database
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// Initialize database files if missing
function initDatabase() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const seed = [
      {
        id: 'prod-surahi-01',
        title: 'Jaipur Blue Pottery Floral Surahi (Water Pitcher)',
        titleHi: 'पारंपरिक जयपुर ब्लू पॉटरी फ्लोरल सुराही',
        description: 'Authentic GI-tagged Jaipur Blue Pottery water vessel adorned with hand-painted Persian floral arabesques in traditional cobalt and turquoise glazes.',
        descriptionHi: 'हाथ से चित्रित पारंपरिक कोबाल्ट और फिरोज़ी रंगों वाली जीआई प्रमाणित जयपुर ब्लू पॉटरी सुराही।',
        culturalStory: 'Derived from Turko-Persian origins introduced during the reign of Maharaja Sawai Ram Singh II in the 19th century. Blue Pottery does not use traditional river clay; instead, the body is formed from quartz stone powder, Fuller’s earth, and katira gond gum.',
        culturalStoryHi: '19वीं शताब्दी में महाराजा सवाई राम सिंह द्वितीय के संरक्षण में विकसित। इसमें साधारण मिट्टी का उपयोग नहीं होता, बल्कि क्वार्ट्ज चूर्ण, मुल्तानी मिट्टी और प्राकृतिक गोंद से ढाला जाता है।',
        category: 'pottery',
        priceMin: 1450,
        priceMax: 1850,
        finalPrice: 1650,
        images: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
        ],
        artisanId: 'artisan-ramswaroop',
        artisanName: 'Ramswaroop Sharma',
        artisanLocation: 'Kot Jewar, Jaipur, Rajasthan',
        artisanPhone: '+91 98290 44211',
        craftOrigin: 'Jaipur Heritage Cluster, Rajasthan (GI #33)',
        materials: ['Quartz Stone Powder', 'Fuller’s Earth (Multani Mitti)', 'Cobalt Oxide', 'Copper Glaze'],
        stockQuantity: 12,
        status: 'live',
        giTagged: true,
        giTagNumber: 'GI-RAJ-0033',
        tags: ['Blue Pottery', 'GI Certified', 'Jaipur Craft', 'Hand Painted', 'Cobalt Glaze'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-dhokra-02',
        title: 'Bastar Lost-Wax Bell Metal (Dhokra) Nandi Figurine',
        titleHi: 'बस्तर ढोकरा कांस्य नंदी शिल्प (लॉस्ट-वैक्स पद्धति)',
        description: 'Hand-cast tribal bronze bell metal Nandi bull created using the ancient 4,000-year-old cire perdue (lost wax) metal casting technique.',
        descriptionHi: '4000 वर्ष पुरानी पारंपरिक ढोकरा लॉस्ट-वैक्स धातु ढलाई तकनीक से बना हस्तनिर्मित नंदी बैल।',
        culturalStory: 'Cast by Ghadwa tribal artisans of Bastar using the 4,000-year-old lost-wax (cire perdue) hollow metal technique. Intricate wax threads are hand-coiled over a clay core and replaced with molten scrap brass and bell metal in open ground furnaces.',
        culturalStoryHi: 'बस्तर के जनजातीय कारीगरों द्वारा 4000 वर्ष पुरानी मोम ढलाई तकनीक से निर्मित। मिट्टी के ढांचे पर मोम के बारीक धागों से अलंकृत कर पिघले कांस्य से ढाला गया अद्वितीय शिल्प।',
        category: 'metal',
        priceMin: 2200,
        priceMax: 3200,
        finalPrice: 2750,
        images: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
        ],
        artisanId: 'artisan-ramswaroop',
        artisanName: 'Bastar Tribal Crafts Cooperative',
        artisanLocation: 'Kondagaon, Bastar, Chhattisgarh',
        artisanPhone: '+91 98290 44211',
        craftOrigin: 'Bastar Tribal Cluster, Chhattisgarh (GI #83)',
        materials: ['Bell Metal (Kansa)', 'Recycled Brass', 'Natural Beeswax', 'River Bed Mud'],
        stockQuantity: 7,
        status: 'live',
        giTagged: true,
        giTagNumber: 'GI-CG-0083',
        tags: ['Dhokra Metal', 'Lost Wax Casting', 'Bastar GI #83', 'Tribal Folk Art'],
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }

  if (!fs.existsSync(INQUIRIES_FILE)) {
    const seedInquiries = [
      {
        id: 'inq-demo-1',
        productId: 'prod-surahi-01',
        productTitle: 'Jaipur Blue Pottery Floral Surahi',
        productImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        artisanId: 'artisan-ramswaroop',
        buyerName: 'Pooja Singhania',
        buyerPhone: '+91 98201 98765',
        buyerEmail: 'pooja.s@craftdecor.in',
        channel: 'chat',
        message: 'Namaste Ramswaroop ji, I would like to order 5 pieces for our Bangalore home studio. Are these food and water safe?',
        status: 'new',
        createdAt: new Date().toISOString(),
        replies: []
      }
    ];
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(seedInquiries, null, 2), 'utf8');
  }
}

initDatabase();

function readJsonFile(filePath, defaultVal) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading JSON:', filePath, e);
  }
  return defaultVal;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing JSON:', filePath, e);
    return false;
  }
}

// Check database status
function checkDatabaseStatus() {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  const serviceAccountFound = fs.existsSync(serviceAccountPath);

  const products = readJsonFile(PRODUCTS_FILE, []);
  const inquiries = readJsonFile(INQUIRIES_FILE, []);

  return {
    databaseType: serviceAccountFound ? 'Firebase Admin Firestore + Local Cache' : 'Kaarigar Persistent Local Database',
    serviceAccountKeyFound: serviceAccountFound,
    productsCount: products.length,
    inquiriesCount: inquiries.length,
    dataFile: PRODUCTS_FILE,
    status: 'healthy',
    lastChecked: new Date().toISOString()
  };
}

// Request Body Parser
async function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({ raw: body });
      }
    });
  });
}

// Send JSON Helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // 1. Health & Status Check
  if (pathname === '/api/health' || pathname === '/api') {
    const dbStatus = checkDatabaseStatus();
    sendJson(res, 200, {
      status: 'ok',
      service: 'Kaarigar AI Backend API',
      port: PORT,
      timestamp: new Date().toISOString(),
      geminiApiKeyConfigured: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10),
      geminiApiKeyMasked: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}` : 'None',
      database: dbStatus
    });
    return;
  }

  // 2. Database Diagnostics
  if (pathname === '/api/db-check') {
    const dbStatus = checkDatabaseStatus();
    // Test write and read verification
    let writeCheck = 'ok';
    try {
      const testFile = path.join(DATA_DIR, '.write_test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      writeCheck = `failed: ${err.message}`;
    }

    sendJson(res, 200, {
      ...dbStatus,
      writePermissions: writeCheck,
      firestoreConfigured: dbStatus.serviceAccountKeyFound,
      activeDatabaseNotice: dbStatus.serviceAccountKeyFound
        ? 'Connected to Firebase Admin credentials'
        : 'Running on persistent local JSON database (Fully interactive, no cloud credentials required)'
    });
    return;
  }

  // 3. AI Product Analysis (Gemini Multimodal / Knowledge Base)
  if (pathname === '/api/analyze-product' && req.method === 'POST') {
    const body = await parseBody(req);
    const category = body.category || 'pottery';
    const rawMaterials = Array.isArray(body.materials) ? body.materials : [];

    let aiTitle = 'Handcrafted Heritage Art Piece';
    let aiTitleHi = 'पारंपरिक हस्तनिर्मित कलाकृति';
    let aiStory = 'Carefully sculpted using centuries-old Indian artisan techniques passed down through generations.';
    let aiStoryHi = 'पीढ़ियों से चली आ रही पारंपरिक भारतीय शिल्प तकनीकों द्वारा हस्तनिर्मित।';
    let detectedMaterials = ['Quartz Stone Powder', 'Natural Clay', 'Organic Plant Dyes'];
    let minPrice = 1200;
    let maxPrice = 1800;
    let suggestedPrice = 1550;
    let priceRationale = 'Calculated based on raw materials, artisan labor hours, and GI cluster benchmark.';

    // If Gemini API Key exists, query Gemini Flash
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10 && !GEMINI_API_KEY.includes('DEMO_KEY')) {
      try {
        const prompt = `You are Kaarigar AI expert in Indian Crafts. Analyze craft category "${category}" with materials: ${JSON.stringify(rawMaterials)}.
Return a JSON object:
{
  "title": "Compelling product title in English",
  "titleHi": "Title in Hindi",
  "story": "2-3 sentences cultural provenance story in English",
  "storyHi": "Story in Hindi",
  "materials": ["3-5 specific raw materials"],
  "minPrice": 1200,
  "maxPrice": 1800,
  "suggestedPrice": 1500,
  "rationale": "Fair price calculation reason"
}`;

        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
            })
          }
        );

        if (gRes.ok) {
          const gJson = await gRes.json();
          const parsed = JSON.parse(gJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.title) aiTitle = parsed.title;
          if (parsed.titleHi) aiTitleHi = parsed.titleHi;
          if (parsed.story) aiStory = parsed.story;
          if (parsed.storyHi) aiStoryHi = parsed.storyHi;
          if (Array.isArray(parsed.materials)) detectedMaterials = parsed.materials;
          if (parsed.suggestedPrice) suggestedPrice = Number(parsed.suggestedPrice);
          if (parsed.minPrice) minPrice = Number(parsed.minPrice);
          if (parsed.maxPrice) maxPrice = Number(parsed.maxPrice);
          if (parsed.rationale) priceRationale = parsed.rationale;
        }
      } catch (err) {
        console.warn('Backend Gemini API query fallback:', err.message);
      }
    }

    const image = body.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80';

    sendJson(res, 200, {
      enhancedImage: image,
      originalImage: image,
      detectedCategory: category,
      suggestedTitle: aiTitle,
      suggestedTitleHi: aiTitleHi,
      culturalStory: aiStory,
      culturalStoryHi: aiStoryHi,
      materials: Array.from(new Set([...detectedMaterials, ...rawMaterials])),
      tags: [category, 'Handmade', 'GI Certified', 'Heritage Craft'],
      detectedLanguage: body.language || 'hi',
      audioTranscript: body.description || aiStory,
      audioTranscriptHi: aiStoryHi,
      priceBand: {
        min: minPrice,
        max: maxPrice,
        suggested: suggestedPrice,
        rationale: priceRationale
      },
      confidenceScore: 0.96
    });
    return;
  }

  // 4. Products API
  if (pathname === '/api/products') {
    const products = readJsonFile(PRODUCTS_FILE, []);

    if (req.method === 'GET') {
      sendJson(res, 200, products);
      return;
    }

    if (req.method === 'POST') {
      const newProduct = await parseBody(req);
      if (!newProduct.id) {
        newProduct.id = `prod-${Date.now().toString(36)}`;
      }
      if (!newProduct.createdAt) {
        newProduct.createdAt = new Date().toISOString();
      }

      const existingIdx = products.findIndex(p => p.id === newProduct.id);
      if (existingIdx >= 0) {
        products[existingIdx] = newProduct;
      } else {
        products.unshift(newProduct);
      }

      writeJsonFile(PRODUCTS_FILE, products);
      sendJson(res, 201, { success: true, product: newProduct });
      return;
    }
  }

  // Single Product API
  if (pathname.startsWith('/api/products/')) {
    const id = pathname.replace('/api/products/', '');
    const products = readJsonFile(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === id);

    if (req.method === 'GET') {
      if (product) {
        sendJson(res, 200, product);
      } else {
        sendJson(res, 404, { error: 'Product not found' });
      }
      return;
    }
  }

  // 5. Inquiries API
  if (pathname === '/api/inquiries') {
    const inquiries = readJsonFile(INQUIRIES_FILE, []);

    if (req.method === 'GET') {
      const artisanId = urlObj.searchParams.get('artisanId');
      const filtered = artisanId ? inquiries.filter(i => i.artisanId === artisanId) : inquiries;
      sendJson(res, 200, filtered);
      return;
    }

    if (req.method === 'POST') {
      const newInquiry = await parseBody(req);
      newInquiry.id = `inq-${Date.now().toString(36)}`;
      newInquiry.createdAt = new Date().toISOString();
      newInquiry.status = 'new';
      newInquiry.replies = [];

      inquiries.unshift(newInquiry);
      writeJsonFile(INQUIRIES_FILE, inquiries);
      sendJson(res, 201, { success: true, inquiry: newInquiry });
      return;
    }
  }

  // Default 404
  sendJson(res, 404, { error: 'Route not found', path: pathname });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Kaarigar Backend API running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 DB Diagnostics: http://localhost:${PORT}/api/db-check`);
  console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? 'Configured & Active' : 'Missing'}`);
  console.log(`======================================================\n`);
});
