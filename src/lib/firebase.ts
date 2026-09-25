import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Product, Inquiry, Artisan, InquiryReply } from '../types';
import { initialProducts, initialInquiries, initialArtisan } from './mockData';

// Firebase configuration from environment or fallback placeholders
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kaarigar-civicsync.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kaarigar-civicsync',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kaarigar-civicsync.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Check if credentials are live or using fallback mode
const hasValidConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'mock' && 
  !firebaseConfig.apiKey.includes('YOUR_')
);

export const isFirebaseConfigured = hasValidConfig;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.info('Kaarigar: Connected to live Firebase instance');
  } catch (err) {
    console.warn('Kaarigar: Failed to initialize live Firebase, falling back to local reactive store', err);
  }
} else {
  console.info('Kaarigar: Running with local reactive fallback store (No live credentials needed for full interactivity)');
}

export { app, db, auth, storage };

// ---------------------------------------------------------------------------
// Local Reactive Store Layer (Fallback & Offline Caching)
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  PRODUCTS: 'kaarigar_products_store',
  INQUIRIES: 'kaarigar_inquiries_store',
  ARTISAN: 'kaarigar_artisan_store'
};

function getLocalStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocalStore<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('kaarigar_store_updated', { detail: { key } }));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ---------------------------------------------------------------------------
// Unified Data API (Works seamlessly whether Firebase is live or offline)
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      }
    } catch (e) {
      console.warn('Firestore fetch failed, using local store', e);
    }
  }
  return getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Product;
      }
    } catch (e) {
      console.warn('Firestore fetchById failed, using local store', e);
    }
  }
  const prods = getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  return prods.find(p => p.id === id);
}

export async function saveProductRecord(product: Product): Promise<void> {
  // Update local store first for instant UI reactivity
  const prods = getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const existingIdx = prods.findIndex(p => p.id === product.id);
  if (existingIdx >= 0) {
    prods[existingIdx] = product;
  } else {
    prods.unshift(product);
  }
  setLocalStore(STORAGE_KEYS.PRODUCTS, prods);

  // Sync to Backend Server Persistent Database (data/products.json)
  try {
    const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    await fetch('/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(product)
    });
  } catch (apiErr) {
    console.warn('Backend server products.json sync skipped:', apiErr);
  }

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (e) {
      console.error('Firestore save failed:', e);
    }
  }
}

export async function fetchInquiries(artisanId?: string): Promise<Inquiry[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Inquiry));
        return artisanId ? items.filter(i => i.artisanId === artisanId) : items;
      }
    } catch (e) {
      console.warn('Firestore fetchInquiries failed, using local store', e);
    }
  }
  const allInquiries = getLocalStore<Inquiry[]>(STORAGE_KEYS.INQUIRIES, initialInquiries);
  return artisanId ? allInquiries.filter(i => i.artisanId === artisanId) : allInquiries;
}

export async function saveInquiryRecord(inquiry: Inquiry): Promise<void> {
  const inqs = getLocalStore<Inquiry[]>(STORAGE_KEYS.INQUIRIES, initialInquiries);
  inqs.unshift(inquiry);
  setLocalStore(STORAGE_KEYS.INQUIRIES, inqs);

  // Sync to backend persistent store
  try {
    await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry)
    });
  } catch (apiErr) {
    console.warn('Backend server inquiries.json sync skipped:', apiErr);
  }

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'inquiries', inquiry.id), inquiry);
    } catch (e) {
      console.error('Firestore save inquiry failed:', e);
    }
  }
}

export async function replyToInquiryRecord(inquiryId: string, reply: InquiryReply): Promise<void> {
  const inqs = getLocalStore<Inquiry[]>(STORAGE_KEYS.INQUIRIES, initialInquiries);
  const target = inqs.find(i => i.id === inquiryId);
  if (target) {
    if (!target.replies) target.replies = [];
    target.replies.push(reply);
    target.status = 'contacted';
    setLocalStore(STORAGE_KEYS.INQUIRIES, inqs);
  }

  // Sync reply to backend
  try {
    const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    await fetch(`/api/inquiries/${inquiryId}/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: reply.message, senderName: 'Artisan' })
    });
  } catch (apiErr) {
    console.warn('Backend server reply sync skipped:', apiErr);
  }

  if (db && isFirebaseConfigured) {
    try {
      const ref = doc(db, 'inquiries', inquiryId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const existingReplies = snap.data().replies || [];
        await updateDoc(ref, {
          replies: [...existingReplies, reply],
          status: 'contacted'
        });
      }
    } catch (e) {
      console.error('Firestore reply failed:', e);
    }
  }
}

export async function fetchArtisanProfile(): Promise<Artisan> {
  return getLocalStore<Artisan>(STORAGE_KEYS.ARTISAN, initialArtisan);
}

export async function markProductAsSoldRecord(productId: string): Promise<boolean> {
  // Update local store for instant reactive UI
  const prods = getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const targetIdx = prods.findIndex(p => p.id === productId);
  if (targetIdx >= 0) {
    prods[targetIdx] = {
      ...prods[targetIdx],
      status: 'sold',
      soldAt: new Date().toISOString()
    };
    setLocalStore(STORAGE_KEYS.PRODUCTS, prods);
  }

  // Sync to Backend Server API (POST /api/products/:id/sold)
  try {
    const token = auth?.currentUser 
      ? await auth.currentUser.getIdToken() 
      : (localStorage.getItem('kaarigar_auth_token') || 'test-token-artisan-ramswaroop');
    
    await fetch(`/api/products/${productId}/sold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (apiErr) {
    console.warn('Backend mark-sold sync skipped:', apiErr);
  }

  // Sync to Firestore if configured
  if (db && isFirebaseConfigured) {
    try {
      const ref = doc(db, 'products', productId);
      await updateDoc(ref, {
        status: 'sold',
        soldAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore mark-sold update failed:', e);
    }
  }

  return true;
}

export async function purchaseProductRecord(
  productId: string,
  quantityToBuy: number = 1,
  buyerInfo?: { name: string; phone: string; address?: string }
): Promise<{ success: boolean; remainingStock: number; product: Product }> {
  const prods = getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const targetIdx = prods.findIndex(p => p.id === productId);
  if (targetIdx < 0) {
    throw new Error('Product not found in catalog');
  }

  const currentStock = prods[targetIdx].stockQuantity || 0;
  if (currentStock < quantityToBuy) {
    throw new Error(`Insufficient stock. Only ${currentStock} piece(s) available.`);
  }

  const newStock = Math.max(0, currentStock - quantityToBuy);
  prods[targetIdx] = {
    ...prods[targetIdx],
    stockQuantity: newStock,
    status: newStock === 0 ? 'sold' : prods[targetIdx].status,
    soldAt: newStock === 0 ? new Date().toISOString() : prods[targetIdx].soldAt
  };
  setLocalStore(STORAGE_KEYS.PRODUCTS, prods);

  // Log order inquiry for artisan
  const inqs = getLocalStore<Inquiry[]>(STORAGE_KEYS.INQUIRIES, initialInquiries);
  const newOrder: Inquiry = {
    id: `ord-${Date.now().toString(36)}`,
    productId,
    productTitle: prods[targetIdx].title,
    productImage: (prods[targetIdx].images && prods[targetIdx].images[0]) || '',
    artisanId: prods[targetIdx].artisanId,
    buyerName: buyerInfo?.name || 'Verified Patron',
    buyerPhone: buyerInfo?.phone || '+91 98201 12345',
    channel: 'order',
    message: `Direct Order: ${quantityToBuy} piece(s) purchased for ₹${(prods[targetIdx].finalPrice * quantityToBuy).toLocaleString('en-IN')}. Delivery Address: ${buyerInfo?.address || 'Direct Patron Pickup'}. Stock remaining: ${newStock} pieces.`,
    status: 'new',
    createdAt: new Date().toISOString(),
    replies: []
  };
  inqs.unshift(newOrder);
  setLocalStore(STORAGE_KEYS.INQUIRIES, inqs);

  // Sync to Backend Server API
  try {
    await fetch(`/api/products/${productId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: quantityToBuy,
        buyerName: buyerInfo?.name,
        buyerPhone: buyerInfo?.phone,
        buyerAddress: buyerInfo?.address
      })
    });
  } catch (apiErr) {
    console.warn('Backend purchase sync skipped:', apiErr);
  }

  // Sync to Firestore if configured
  if (db && isFirebaseConfigured) {
    try {
      const ref = doc(db, 'products', productId);
      await updateDoc(ref, {
        stockQuantity: newStock,
        status: newStock === 0 ? 'sold' : prods[targetIdx].status,
        soldAt: newStock === 0 ? new Date().toISOString() : null
      });
    } catch (e) {
      console.warn('Firestore purchase update failed:', e);
    }
  }

  return {
    success: true,
    remainingStock: newStock,
    product: prods[targetIdx]
  };
}

export async function deleteProductRecord(productId: string): Promise<boolean> {
  // Remove from local reactive store
  const prods = getLocalStore<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const updatedProds = prods.filter(p => p.id !== productId);
  setLocalStore(STORAGE_KEYS.PRODUCTS, updatedProds);

  // Sync to Backend Server API (DELETE /api/products/:id)
  try {
    const token = auth?.currentUser 
      ? await auth.currentUser.getIdToken() 
      : (localStorage.getItem('kaarigar_auth_token') || 'test-token-artisan-ramswaroop');

    await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (apiErr) {
    console.warn('Backend delete sync skipped:', apiErr);
  }

  return true;
}
