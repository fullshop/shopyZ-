
import { Product } from './types';

export const WILAYAS_DATA: Record<string, { desk: number, home: number }> = {
  "01 - Adrar": { desk: 800, home: 1300 },
  "02 - Chlef": { desk: 450, home: 750 },
  "03 - Laghouat": { desk: 450, home: 900 },
  "04 - Oum El Bouaghi": { desk: 450, home: 700 },
  "05 - Batna": { desk: 450, home: 700 },
  "06 - Béjaïa": { desk: 450, home: 750 },
  "07 - Biskra": { desk: 450, home: 900 },
  "08 - Béchar": { desk: 600, home: 1000 },
  "09 - Blida": { desk: 450, home: 700 },
  "10 - Bouira": { desk: 450, home: 750 },
  "11 - Tamanrasset": { desk: 750, home: 1500 },
  "12 - Tébessa": { desk: 450, home: 800 },
  "13 - Tlemcen": { desk: 450, home: 850 },
  "14 - Tiaret": { desk: 450, home: 850 },
  "15 - Tizi Ouzou": { desk: 450, home: 750 },
  "16 - Alger": { desk: 450, home: 600 },
  "17 - Djelfa": { desk: 500, home: 900 },
  "18 - Jijel": { desk: 450, home: 700 },
  "19 - Sétif": { desk: 300, home: 450 },
  "20 - Saïda": { desk: 450, home: 900 },
  "21 - Skikda": { desk: 450, home: 750 },
  "22 - Sidi Bel Abbès": { desk: 450, home: 850 },
  "23 - Annaba": { desk: 450, home: 750 },
  "24 - Guelma": { desk: 450, home: 700 },
  "25 - Constantine": { desk: 450, home: 700 },
  "26 - Médéa": { desk: 450, home: 750 },
  "27 - Mostaganem": { desk: 450, home: 850 },
  "28 - M'Sila": { desk: 450, home: 800 },
  "29 - Mascara": { desk: 450, home: 850 },
  "30 - Ouargla": { desk: 450, home: 900 },
  "31 - Oran": { desk: 450, home: 850 },
  "32 - El Bayadh": { desk: 450, home: 1000 },
  "33 - Illizi": { desk: 800, home: 1700 },
  "34 - Bordj Bou Arreridj": { desk: 450, home: 550 },
  "35 - Boumerdès": { desk: 450, home: 700 },
  "36 - El Tarf": { desk: 450, home: 750 },
  "37 - Tindouf": { desk: 800, home: 1600 },
  "38 - Tissemsilt": { desk: 450, home: 800 },
  "39 - El Oued": { desk: 450, home: 900 },
  "40 - Khenchela": { desk: 450, home: 750 },
  "41 - Souk Ahras": { desk: 450, home: 750 },
  "42 - Tipaza": { desk: 450, home: 700 },
  "43 - Mila": { desk: 450, home: 700 },
  "44 - Aïn Defla": { desk: 450, home: 750 },
  "45 - Naâma": { desk: 500, home: 1000 },
  "46 - Aïn Témouchent": { desk: 450, home: 850 },
  "47 - Ghardaïa": { desk: 600, home: 900 },
  "48 - Relizane": { desk: 450, home: 850 },
  "49 - Timimoun": { desk: 800, home: 1300 },
  "50 - Bordj Badji Mokhtar": { desk: 850, home: 1500 },
  "51 - Ouled Djellal": { desk: 500, home: 900 },
  "52 - Béni Abbès": { desk: 650, home: 1050 },
  "53 - In Salah": { desk: 800, home: 1400 },
  "54 - In Guezzam": { desk: 900, home: 1700 },
  "55 - Touggourt": { desk: 550, home: 1000 },
  "56 - Djanet": { desk: 800, home: 2000 },
  "57 - El M'Ghair": { desk: 500, home: 1000 },
  "58 - El Meniaa": { desk: 500, home: 1000 }
};

export const ALGERIAN_WILAYAS = Object.keys(WILAYAS_DATA);

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Astral Minimalist Watch',
    category: 'Accessories',
    price: 189.99,
    description: 'A timeless timepiece featuring a sapphire crystal face and premium Italian leather strap.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    stock: 12,
    reviews: [
      { id: 'r1', userName: 'Alex M.', rating: 5, comment: 'Absolutely stunning watch. The leather is so soft.', date: '2024-02-15', isVerified: true },
      { id: 'r2', userName: 'Sarah J.', rating: 4, comment: 'Beautiful design, though the strap was a bit stiff at first.', date: '2024-01-20', isVerified: true }
    ]
  },
  {
    id: '2',
    name: 'Zenith Noise Cancelling Headphones',
    category: 'Electronics',
    price: 349.00,
    description: 'Immersive sound quality with advanced hybrid active noise cancellation technology.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    stock: 8,
    reviews: [
      { id: 'r3', userName: 'David K.', rating: 5, comment: 'Better than the leading brands. ANC is magic.', date: '2024-03-01', isVerified: true }
    ]
  },
  {
    id: '3',
    name: 'Linen Comfort Set',
    category: 'Apparel',
    price: 120.00,
    description: 'Breathable, sustainable linen blend perfect for lounging or casual outings.',
    images: [
      'https://images.unsplash.com/photo-1594932224828-b4b059b6f68d?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.5,
    stock: 25,
    reviews: []
  },
  {
    id: '4',
    name: 'Prism Table Lamp',
    category: 'Home Decor',
    price: 85.50,
    description: 'A geometric masterpiece that casts beautiful patterns across your living space.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.7,
    stock: 15,
    reviews: [
      { id: 'r4', userName: 'Emma W.', rating: 5, comment: 'The lighting patterns are mesmerizing.', date: '2024-02-28', isVerified: false }
    ]
  }
];

export const CATEGORIES = ['All', 'Accessories', 'Electronics', 'Apparel', 'Home Decor', 'Stationery'];
