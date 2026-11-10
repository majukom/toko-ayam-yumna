export type UserRole = 'PEMBELI' | 'PENJUAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
}

export type ProductCategory = 'Daging Ayam' | 'Telur' | 'Jeroan/Lainnya';

export interface ProductPromo {
  isActive: boolean;
  originalPrice: number; // Harga Asli sebelum diskon (Harga Coret)
  discountPrice: number; // Harga Promo setelah diskon
  startTime?: string; // Waktu mulai promo (ISO string atau YYYY-MM-DDTHH:mm)
  endTime?: string; // Waktu berakhir promo (ISO string atau YYYY-MM-DDTHH:mm)
  quota?: number; // Batas kuota promo
  soldCount?: number; // Jumlah yang sudah terjual
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: 'ekor' | 'kg' | 'butir' | 'pack';
  cutOptions: string[]; // e.g. ['Utuh', 'Potong 4', 'Potong 8', 'Potong 12', 'Fillet'] or []
  isAvailable: boolean;
  image: string;
  description: string;
  isChickenCount?: boolean; // indicates if counted as chicken carcass for daily report
  promo?: ProductPromo; // Pengaturan Flash Sale & Harga Coret
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  isPromo?: boolean;
  unit: string;
  quantity: number;
  selectedCut: string;
  notes: string;
  subtotal: number;
  image: string;
}

export type DeliveryType = 'AMBIL' | 'DELIVERY';

export type PaymentMethod = 'QRIS' | 'TRANSFER' | 'COD';

export type OrderStatus = 'DITERIMA' | 'DIPOTONG' | 'SIAP';

export interface Order {
  id: string;
  queueNumber: string; // e.g. #A-05 or #D-02
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryNotes?: string;
  timeSlot: string; // e.g. "07:00 - 08:00"
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface TimeSlotConfig {
  slot: string; // e.g. "07:00 - 08:00"
  maxQuota: number; // default 10
  isClosed?: boolean;
}
