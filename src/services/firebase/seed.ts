import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './config';
import { Product, Category, StoreSettings } from '../../shared/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-audio',
    name: 'Audio & Acoustics',
    slug: 'audio',
    description: 'Precision-engineered wireless headphones, ANC earbuds, and studio monitors.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    productCount: 4,
  },
  {
    id: 'cat-keyboards',
    name: 'Keyboards & Peripherals',
    slug: 'keyboards',
    description: 'Custom mechanical keyboards, low-profile switches, and precision input tools.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    productCount: 3,
  },
  {
    id: 'cat-desk',
    name: 'Workspace & Desk Setup',
    slug: 'desk',
    description: 'Minimalist desk mats, anodized aluminum monitor stands, and cable organizers.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    productCount: 3,
  },
  {
    id: 'cat-wearables',
    name: 'Wearables & Lifestyle',
    slug: 'wearables',
    description: 'Everyday carry essentials, smart track rings, and protective cases.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    productCount: 2,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'arc-sonic-pro',
    name: 'ARC Sonic Pro Active Noise-Cancelling Headphones',
    description: 'Crafted with 45mm custom planar drivers, 48-hour battery life, and aircraft-grade aluminum headband. Features studio acoustic tuning with adaptive spatial immersion.',
    category: 'Audio & Acoustics',
    brand: 'ARC',
    sku: 'ARC-AUD-001',
    price: 34999,
    originalPrice: 42000,
    discount: 17,
    stock: 24,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Driver Size': '45mm Custom Titanium',
      'Frequency Response': '10Hz - 40kHz',
      'Battery Life': '48 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.4 / USB-C Lossless',
      'Weight': '265g',
      'Warranty': '1 Year ARC Official Replacement',
    },
    tags: ['Headphones', 'ANC', 'Wireless', 'Lossless'],
    featured: true,
    status: 'published',
    rating: 4.9,
    reviewCount: 42,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-pulse-earbuds',
    name: 'ARC Pulse Spatial True Wireless Earbuds',
    description: 'Ultra-compact earbuds featuring IPX7 water resistance, transparent passthrough audio, and seamless multipoint device pairing. Includes Qi-wireless fast charging aluminum case.',
    category: 'Audio & Acoustics',
    brand: 'ARC',
    sku: 'ARC-AUD-002',
    price: 18500,
    originalPrice: 22000,
    discount: 16,
    stock: 45,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Water Resistance': 'IPX7 Certified',
      'Playtime': '9h earbuds + 28h charging case',
      'Noise Cancellation': '-42dB Hybrid ANC',
      'Microphones': '6 MEMS with AI beamforming',
    },
    tags: ['Earbuds', 'TWS', 'ANC', 'Sports'],
    featured: true,
    status: 'published',
    rating: 4.8,
    reviewCount: 31,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-keystone-75',
    name: 'ARC Keystone 75 Mechanical Keyboard',
    description: 'A 75% gasket-mounted wireless mechanical keyboard machined from CNC 6063 aluminum. Hot-swappable PCB, south-facing RGB, factory pre-lubed silent switches.',
    category: 'Keyboards & Peripherals',
    brand: 'ARC',
    sku: 'ARC-KEY-001',
    price: 28900,
    originalPrice: 32500,
    discount: 11,
    stock: 12,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Layout': '75% Compact (82 Keys + Rotary Knob)',
      'Mounting': 'Gasket Mount with Poron Dampeners',
      'Case Material': 'Anodized 6063 Aluminum',
      'Switch Type': 'ARC Linear Morandi 45g (Pre-lubed)',
      'Battery': '4000mAh Lithium-Polymer',
    },
    tags: ['Mechanical', 'Gasket', 'Wireless', 'Hot-swap'],
    featured: true,
    status: 'published',
    rating: 5.0,
    reviewCount: 19,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-glide-mouse',
    name: 'ARC Glide Pro Wireless Gaming & Productivity Mouse',
    description: 'Ultralight 49-gram ergonomic design with PixArt 3395 26,000 DPI optical sensor, optical micro-switches rated for 90M clicks, and zero-latency 4000Hz polling rate support.',
    category: 'Keyboards & Peripherals',
    brand: 'ARC',
    sku: 'ARC-PER-002',
    price: 14500,
    originalPrice: 16500,
    discount: 12,
    stock: 4,
    stockStatus: 'low_stock',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Weight': '49g Featherweight',
      'Sensor': 'PixArt PAW3395 (26,000 DPI)',
      'Battery': 'Up to 90 Hours Continuous',
      'Feet': '100% Virgin Grade PTFE Glides',
    },
    tags: ['Mouse', 'Wireless', 'Ultralight', 'Gaming'],
    featured: false,
    status: 'published',
    rating: 4.7,
    reviewCount: 22,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-strata-riser',
    name: 'ARC Strata Dual-Monitor Aluminum Stand',
    description: 'Elevate your screens for ergonomic posture. Solid unibody walnut timber shelf with sandblasted anodized space gray aluminum legs and integrated cable channels.',
    category: 'Workspace & Desk Setup',
    brand: 'ARC',
    sku: 'ARC-DSK-001',
    price: 19900,
    originalPrice: 24000,
    discount: 17,
    stock: 18,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Dimensions': '110cm x 24cm x 11cm',
      'Load Capacity': 'Up to 50kg (110 lbs)',
      'Material': 'American Natural Walnut + Anodized Aluminum',
    },
    tags: ['Desk Setup', 'Ergonomic', 'Wood', 'Monitor Stand'],
    featured: true,
    status: 'published',
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-matrix-mat',
    name: 'ARC Matrix Felt & Italian Leather Desk Mat',
    description: 'Dual-sided large workspace pad crafted with natural merino wool felt on one side and scratch-resistant hydrophobic vegan Italian leather on reverse.',
    category: 'Workspace & Desk Setup',
    brand: 'ARC',
    sku: 'ARC-DSK-002',
    price: 6800,
    originalPrice: 8500,
    discount: 20,
    stock: 0,
    stockStatus: 'out_of_stock',
    imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Size': '900mm x 400mm x 4mm (XL)',
      'Finish': 'Merino Wool Felt / Textured Leather',
      'Waterproof': 'Spill-resistant surface coating',
    },
    tags: ['Desk Mat', 'Merino Felt', 'Leather', 'Workspace'],
    featured: false,
    status: 'published',
    rating: 4.6,
    reviewCount: 28,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'arc-titan-case',
    name: 'ARC Titan MagSafe Matte Armor Phone Case',
    description: 'Precision forged titanium frame with military-grade 14ft drop protection, scratch-proof frosted sapphire backplate, and strong neodymium MagSafe magnets.',
    category: 'Wearables & Lifestyle',
    brand: 'ARC',
    sku: 'ARC-CAS-001',
    price: 7900,
    originalPrice: 9500,
    discount: 17,
    stock: 35,
    stockStatus: 'in_stock',
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    ],
    specifications: {
      'Drop Standard': 'MIL-STD-810H (14 Feet)',
      'Magnet Strength': '15N Ultra-Strong N52',
      'Bezel Raised Edge': '1.8mm Screen & Camera Protection',
    },
    tags: ['Phone Case', 'MagSafe', 'Titanium', 'Armor'],
    featured: false,
    status: 'published',
    rating: 4.8,
    reviewCount: 14,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'ARC',
  tagline: 'Precision Engineered Minimalist Hardware',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  freeShippingThreshold: 10000,
  defaultShippingFee: 450,
  supportEmail: 'support@arc-store.com',
  supportPhone: '+92 300 1234567',
  address: 'ARC Flagship Studio, Gulberg III, Lahore, Pakistan',
  codEnabled: true,
};

export async function seedInitialStoreData(): Promise<void> {
  const batch = writeBatch(db);

  // Seed categories
  for (const cat of INITIAL_CATEGORIES) {
    batch.set(doc(db, 'categories', cat.id), cat);
  }

  // Seed products
  for (const prod of INITIAL_PRODUCTS) {
    batch.set(doc(db, 'products', prod.id), prod);
  }

  // Seed settings
  batch.set(doc(db, 'settings', 'global'), INITIAL_SETTINGS);

  await batch.commit();
}

export async function ensureStoreInitialized(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      try {
        await seedInitialStoreData();
      } catch (seedErr: any) {
        // Unauthenticated or non-admin users cannot write to Firestore under security rules.
        // The store will fallback to initial offline/cached catalog.
        console.debug('Catalog seeding deferred to store owner authentication:', seedErr?.message || seedErr);
      }
    }
  } catch (error: any) {
    console.debug('Store initialization check completed with fallback:', error?.message || error);
  }
}
