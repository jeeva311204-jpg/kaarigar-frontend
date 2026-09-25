export type UserRole = 'artisan' | 'buyer' | 'admin';

export type CraftCategory = 
  | 'pottery' 
  | 'textiles' 
  | 'woodwork' 
  | 'metal' 
  | 'painting' 
  | 'basketry' 
  | 'jewelry' 
  | 'leather' 
  | 'terracotta'
  | 'stonecraft'
  | 'embroidery'
  | 'paper_mache'
  | 'glasscraft'
  | 'carpets'
  | 'other';

export type ProductStatus = 'live' | 'draft' | 'sold' | 'pending_sync' | 'archived';

export interface PriceBand {
  min: number;
  max: number;
  suggested: number;
  rationale: string;
  rationaleHi?: string;
  quantity?: number;
  unitSuggested?: number;
  totalBatchSuggested?: number;
  breakdown?: {
    rawMaterialsCost: number;
    laborHours: number;
    estimatedLaborWage: number;
    craftFairMargin: number;
    clusterBenchmark: string;
  };
}

export interface Product {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  culturalStory: string;
  culturalStoryHi?: string;
  category: CraftCategory;
  priceMin: number;
  priceMax: number;
  finalPrice: number;
  images: string[];
  ownerId?: string;
  artisanId: string;
  artisanName: string;
  artisanLocation: string;
  artisanPhone: string;
  craftOrigin: string;
  materials: string[];
  stockQuantity: number;
  status: ProductStatus;
  giTagged: boolean;
  giTagNumber?: string;
  tags: string[];
  detectedLanguage?: string;
  audioTranscript?: string;
  audioTranscriptHi?: string;
  createdAt: string;
  soldAt?: string;
}

export type InquiryChannel = 'chat' | 'call' | 'sms' | 'order';
export type InquiryStatus = 'new' | 'contacted' | 'resolved';

export interface InquiryReply {
  id: string;
  sender: 'artisan' | 'buyer';
  message: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  artisanId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  channel: InquiryChannel;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  replies?: InquiryReply[];
}

export interface Artisan {
  id: string;
  name: string;
  nameHi: string;
  phone: string;
  location: string;
  state: string;
  craftSpecialty: string;
  experienceYears: number;
  cooperativeName: string;
  isCooperativeMember: boolean;
  rating: number;
  totalSales: number;
  activeListingsCount: number;
  openInquiriesCount: number;
  avatar: string;
  bio: string;
  bioHi: string;
}

export interface AnalysisResult {
  isHandicraft?: boolean;
  detectedSubject?: string;
  isValidCraft?: boolean;
  isProduct?: boolean;
  rejectionReason?: string;
  rejectionReasonHi?: string;
  detectedNonCraftObject?: string;
  detectedNonCraftObjectHi?: string;
  nonCraftExplanation?: string;
  validationError?: string;
  enhancedImage: string;
  originalImage?: string;
  detectedCategory: CraftCategory;
  suggestedTitle: string;
  suggestedTitleHi: string;
  culturalStory: string;
  culturalStoryHi: string;
  materials: string[];
  state?: string;
  stateOrigin?: string;
  stateHi?: string;
  giTagNumber?: string;
  tags: string[];
  detectedLanguage: string;
  audioTranscript: string;
  audioTranscriptHi: string;
  priceBand: PriceBand;
  confidenceScore: number;
}

export interface SalesRecord {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistribution {
  category: string;
  percentage: number;
  itemCount: number;
}
