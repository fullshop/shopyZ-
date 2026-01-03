
import { Product } from '../types';

const PRODUCTS_KEY = 'shopyz_stored_products_v2';
const SEED_STATUS_KEY = 'shopyz_was_seeded_v2';

export class DatabaseService {
  private get db() {
    if (typeof window !== 'undefined' && (window as any).firebase && (window as any).firebase.apps.length) {
      return (window as any).firebase.firestore();
    }
    return null;
  }

  /**
   * Check if the app has ever been initialized with default products.
   */
  async isSeeded(): Promise<boolean> {
    const firestore = this.db;
    if (firestore) {
      try {
        const doc = await firestore.collection('metadata').doc('seed_info').get();
        if (doc.exists) return doc.data().isSeeded;
      } catch (e) {
        console.warn("Firestore metadata check failed, using local fallback.");
      }
    }
    return localStorage.getItem(SEED_STATUS_KEY) === 'true';
  }

  /**
   * Mark the store as initialized.
   */
  async markAsSeeded(): Promise<void> {
    const firestore = this.db;
    if (firestore) {
      try {
        await firestore.collection('metadata').doc('seed_info').set({ isSeeded: true });
      } catch (e) {
        console.error("Failed to mark seeded in Firestore");
      }
    }
    localStorage.setItem(SEED_STATUS_KEY, 'true');
  }

  /**
   * Fetches all products. Tries Firestore first, then falls back to LocalStorage.
   */
  async fetchProducts(): Promise<Product[]> {
    const firestore = this.db;
    if (firestore) {
      try {
        const snapshot = await firestore.collection('products').get();
        if (!snapshot.empty) {
          return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as Product));
        }
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    }

    const localData = localStorage.getItem(PRODUCTS_KEY);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error("LocalStorage corruption:", e);
        return [];
      }
    }
    return [];
  }

  /**
   * Saves a product. Syncs with Firestore if available, otherwise LocalStorage.
   */
  async addProduct(product: Product): Promise<void> {
    const firestore = this.db;
    if (firestore) {
      try {
        await firestore.collection('products').doc(product.id).set(product);
        return; // Success, don't need local backup if we have a live DB
      } catch (e) {
        console.error("Firestore add failed, falling back to local.");
      }
    }
    
    // Local Update
    const current = await this.fetchProducts();
    if (!current.some(p => p.id === product.id)) {
      const updated = [product, ...current];
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    }
  }

  async updateProduct(product: Product): Promise<void> {
    const firestore = this.db;
    if (firestore) {
      try {
        await firestore.collection('products').doc(product.id).update(product);
        return;
      } catch (e) {
        console.error("Firestore update failed.");
      }
    }

    const current = await this.fetchProducts();
    const updated = current.map(p => p.id === product.id ? product : p);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  }

  async deleteProduct(id: string): Promise<void> {
    const firestore = this.db;
    if (firestore) {
      try {
        await firestore.collection('products').doc(id).delete();
      } catch (e) {
        console.error("Firestore delete failed.");
      }
    }

    const current = await this.fetchProducts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  }
}

export const dbService = new DatabaseService();
