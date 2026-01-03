
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  rating: number;
  stock: number;
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  id: string;
}

export type DeliveryMethod = 'home' | 'desk';

export type Language = 'EN' | 'FR' | 'AR';

export type View = 'home' | 'product' | 'cart' | 'checkout' | 'admin';

export interface CheckoutData {
  fullName: string;
  phone: string;
  homeAddress: string; // Focusing on homeAddress
  wilaya: string;
  deliveryMethod: DeliveryMethod;
}
