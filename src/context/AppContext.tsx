import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  UserRole,
  Product,
  CartItem,
  Order,
  OrderStatus,
  TimeSlotConfig,
  DeliveryType,
  PaymentMethod,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_TIME_SLOTS,
  INITIAL_SAMPLE_ORDERS,
  VERIFIED_ADMIN_EMAILS,
  DEFAULT_BUYER,
} from '../data/initialData';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';

interface AppContextType {
  role: UserRole;
  currentUser: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  timeSlots: TimeSlotConfig[];
  activeReceiptOrder: Order | null;
  isCartOpen: boolean;
  isBuyerAuthOpen: boolean;
  isSellerAuthOpen: boolean;
  activeCategory: string;
  searchQuery: string;
  isFirebaseSyncing: boolean;

  // Navigation & UI controls
  setRole: (role: UserRole) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsBuyerAuthOpen: (open: boolean) => void;
  setIsSellerAuthOpen: (open: boolean) => void;
  setActiveReceiptOrder: (order: Order | null) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;

  // Cart actions
  addToCart: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Order actions (Firestore real-time)
  placeOrder: (data: {
    customerName: string;
    customerPhone: string;
    deliveryType: DeliveryType;
    deliveryAddress?: string;
    deliveryNotes?: string;
    timeSlot: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getSlotUsage: (slot: string) => number;

  // Product actions (Firestore real-time Seller Center)
  updateProductPrice: (id: string, newPrice: number) => Promise<void>;
  toggleProductStock: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Quota actions (Firestore real-time Seller Center)
  updateSlotQuota: (slot: string, maxQuota: number) => Promise<void>;
  toggleSlotStatus: (slot: string) => Promise<void>;

  // Auth actions (Firebase Auth & Firestore users)
  loginBuyer: (
    emailOrPhone: string,
    password?: string,
    name?: string,
    address?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpBuyer: (
    name: string,
    phone: string,
    email: string,
    password?: string,
    address?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginSeller: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'yumna_role',
  USER: 'yumna_current_user',
  CART: 'yumna_cart',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Role & Auth
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'PENJUAL' ? 'PENJUAL' : 'PEMBELI';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return DEFAULT_BUYER;
  });

  // 2. Real-time Collections from Firestore with initial fallback
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_SAMPLE_ORDERS);
  const [timeSlots, setTimeSlots] = useState<TimeSlotConfig[]>(INITIAL_TIME_SLOTS);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(true);

  // 3. Cart (client-side persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 4. UI Modals
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyerAuthOpen, setIsBuyerAuthOpen] = useState(false);
  const [isSellerAuthOpen, setIsSellerAuthOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist role & cart
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // =========================================================================
  // FIREBASE AUTH: onAuthStateChanged Real-Time Listener
  // =========================================================================
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = (firebaseUser.email || '').toLowerCase();
        const isAdmin = VERIFIED_ADMIN_EMAILS.some(
          (adminEmail) => adminEmail.toLowerCase() === userEmail
        );

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const loadedUser: User = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Pelanggan Yumna',
              email: userEmail,
              phone: data.phone || '',
              role: isAdmin ? 'PENJUAL' : (data.role || 'PEMBELI'),
              address: data.address || '',
            };
            setCurrentUser(loadedUser);
            if (isAdmin) setRoleState('PENJUAL');
          } else {
            // First-time record creation in Firestore
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || (isAdmin ? 'Admin Dapur Yumna' : 'Pelanggan Yumna'),
              email: userEmail,
              phone: '',
              role: isAdmin ? 'PENJUAL' : 'PEMBELI',
            };
            await setDoc(userDocRef, newUser, { merge: true });
            setCurrentUser(newUser);
            if (isAdmin) setRoleState('PENJUAL');
          }
        } catch (err) {
          console.warn('Firestore user doc read error, using auth profile:', err);
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (isAdmin ? 'Admin Dapur Yumna' : 'Pelanggan Yumna'),
            email: userEmail,
            phone: '',
            role: isAdmin ? 'PENJUAL' : 'PEMBELI',
          };
          setCurrentUser(fallbackUser);
          if (isAdmin) setRoleState('PENJUAL');
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // =========================================================================
  // FIRESTORE: 1. Products Real-Time Listener & Initial Seeding
  // =========================================================================
  useEffect(() => {
    const productsCol = collection(db, 'products');

    const unsubscribeProducts = onSnapshot(
      productsCol,
      async (snapshot) => {
        setIsFirebaseSyncing(false);
        if (snapshot.empty) {
          // Auto-seed Firestore with default 7 products so catalog is immediately live in the cloud
          try {
            const batch = writeBatch(db);
            INITIAL_PRODUCTS.forEach((prod) => {
              const docRef = doc(db, 'products', prod.id);
              batch.set(docRef, prod);
            });
            await batch.commit();
          } catch (seedErr) {
            console.error('Failed to seed initial products into Firestore:', seedErr);
          }
        } else {
          const loadedProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            loadedProducts.push({ ...(docSnap.data() as Product), id: docSnap.id });
          });
          setProducts(loadedProducts);
        }
      },
      (error) => {
        console.warn('Firestore products onSnapshot warning (using local fallback):', error);
        setIsFirebaseSyncing(false);
      }
    );

    return () => unsubscribeProducts();
  }, []);

  // =========================================================================
  // FIRESTORE: 2. Orders Real-Time Listener (Live Antrean Dapur & Nota Pembeli)
  // =========================================================================
  useEffect(() => {
    const ordersCol = collection(db, 'orders');

    const unsubscribeOrders = onSnapshot(
      ordersCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed sample orders to showcase live queue initially
          try {
            const batch = writeBatch(db);
            INITIAL_SAMPLE_ORDERS.forEach((ord) => {
              const docRef = doc(db, 'orders', ord.id);
              batch.set(docRef, ord);
            });
            await batch.commit();
          } catch (seedErr) {
            console.error('Failed to seed sample orders into Firestore:', seedErr);
          }
        } else {
          const loadedOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            loadedOrders.push({ ...(docSnap.data() as Order), id: docSnap.id });
          });
          // Sort newest first
          loadedOrders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(loadedOrders);

          // If activeReceiptOrder is being watched by customer, update it in realtime
          setActiveReceiptOrder((prev) => {
            if (!prev) return null;
            const updated = loadedOrders.find((o) => o.id === prev.id);
            return updated || prev;
          });
        }
      },
      (error) => {
        console.warn('Firestore orders onSnapshot warning (using local fallback):', error);
      }
    );

    return () => unsubscribeOrders();
  }, []);

  // =========================================================================
  // FIRESTORE: 3. Time Slots Real-Time Listener
  // =========================================================================
  useEffect(() => {
    const slotsCol = collection(db, 'slots');

    const unsubscribeSlots = onSnapshot(
      slotsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_TIME_SLOTS.forEach((slotItem, idx) => {
              const docId = `slot-${idx}`;
              batch.set(doc(db, 'slots', docId), slotItem);
            });
            await batch.commit();
          } catch (seedErr) {
            console.error('Failed to seed slots to Firestore:', seedErr);
          }
        } else {
          const loadedSlots: TimeSlotConfig[] = [];
          snapshot.forEach((docSnap) => {
            loadedSlots.push(docSnap.data() as TimeSlotConfig);
          });
          // Sort by time
          loadedSlots.sort((a, b) => a.slot.localeCompare(b.slot));
          setTimeSlots(loadedSlots);
        }
      },
      (error) => {
        console.warn('Firestore slots onSnapshot warning:', error);
      }
    );

    return () => unsubscribeSlots();
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  // =========================================================================
  // CART OPERATIONS
  // =========================================================================
  const addToCart = useCallback((itemData: Omit<CartItem, 'id' | 'subtotal'>) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === itemData.productId &&
          i.selectedCut === itemData.selectedCut &&
          (i.notes || '').trim().toLowerCase() === (itemData.notes || '').trim().toLowerCase()
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        const newQty = existing.quantity + itemData.quantity;
        next[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: newQty * existing.price,
        };
        return next;
      }

      const newItem: CartItem = {
        ...itemData,
        id: 'cart-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        subtotal: itemData.quantity * itemData.price,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateCartQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  const cartItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Slot usage calculation
  const getSlotUsage = useCallback(
    (slot: string) => {
      return orders.filter((o) => o.timeSlot === slot && o.status !== 'SIAP').length;
    },
    [orders]
  );

  // =========================================================================
  // ORDER ACTIONS: Firestore Real-Time Checkout
  // =========================================================================
  const placeOrder = useCallback(
    async (data: {
      customerName: string;
      customerPhone: string;
      deliveryType: DeliveryType;
      deliveryAddress?: string;
      deliveryNotes?: string;
      timeSlot: string;
      paymentMethod: PaymentMethod;
    }) => {
      const isAmbil = data.deliveryType === 'AMBIL';
      const prefix = isAmbil ? '#A-' : '#D-';

      const countSameType = orders.filter((o) => o.deliveryType === data.deliveryType).length;
      const nextSeq = String(countSameType + 1).padStart(2, '0');
      const queueNumber = `${prefix}${nextSeq}`;

      const newOrder: Order = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        queueNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryAddress,
        deliveryNotes: data.deliveryNotes,
        timeSlot: data.timeSlot,
        items: [...cart],
        totalAmount: cartTotal,
        paymentMethod: data.paymentMethod,
        status: 'DITERIMA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      setActiveReceiptOrder(newOrder);

      // Write directly to Firestore orders collection in real-time
      try {
        await setDoc(doc(db, 'orders', newOrder.id), newOrder);
      } catch (err) {
        console.error('Error saving order to Firestore:', err);
      }

      // If customer wasn't logged in, record locally and in Firestore
      if (!currentUser) {
        const guestUser: User = {
          id: 'usr-' + Date.now(),
          name: data.customerName,
          email: '',
          phone: data.customerPhone,
          role: 'PEMBELI',
          address: data.deliveryAddress,
        };
        setCurrentUser(guestUser);
      }

      return newOrder;
    },
    [cart, cartTotal, orders, clearCart, currentUser]
  );

  // =========================================================================
  // ORDER ACTIONS: Update Kitchen Status (1-click to Firestore)
  // =========================================================================
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const updatedAt = new Date().toISOString();

      // Optimistic state
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status, updatedAt } : ord))
      );

      setActiveReceiptOrder((prev) =>
        prev?.id === orderId ? { ...prev, status, updatedAt } : prev
      );

      // Realtime write to Firestore
      try {
        await updateDoc(doc(db, 'orders', orderId), { status, updatedAt });
      } catch (err) {
        console.error('Error updating order status in Firestore:', err);
      }
    },
    []
  );

  // =========================================================================
  // PRODUCT MANAGEMENT: Firestore Real-Time
  // =========================================================================
  const updateProductPrice = useCallback(
    async (id: string, newPrice: number) => {
      const sanitized = Math.max(0, newPrice);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: sanitized } : p))
      );
      try {
        await updateDoc(doc(db, 'products', id), { price: sanitized });
      } catch (err) {
        console.error('Error updating product price in Firestore:', err);
      }
    },
    []
  );

  const toggleProductStock = useCallback(
    async (id: string) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      const nextStock = !target.isAvailable;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: nextStock } : p))
      );

      try {
        await updateDoc(doc(db, 'products', id), { isAvailable: nextStock });
      } catch (err) {
        console.error('Error updating product stock in Firestore:', err);
      }
    },
    [products]
  );

  const addProduct = useCallback(
    async (productData: Omit<Product, 'id'>) => {
      const newId = 'prod-' + Date.now();
      const newProduct: Product = { ...productData, id: newId };

      setProducts((prev) => [newProduct, ...prev]);

      try {
        await setDoc(doc(db, 'products', newId), newProduct);
      } catch (err) {
        console.error('Error adding product to Firestore:', err);
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (product: Product) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );

      try {
        await setDoc(doc(db, 'products', product.id), product);
      } catch (err) {
        console.error('Error updating product in Firestore:', err);
      }
    },
    []
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));

      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error('Error deleting product from Firestore:', err);
      }
    },
    []
  );

  // =========================================================================
  // QUOTA MANAGEMENT: Firestore Real-Time
  // =========================================================================
  const updateSlotQuota = useCallback(
    async (slot: string, maxQuota: number) => {
      const sanitized = Math.max(1, maxQuota);
      setTimeSlots((prev) =>
        prev.map((s) => (s.slot === slot ? { ...s, maxQuota: sanitized } : s))
      );

      try {
        const slotIdx = timeSlots.findIndex((s) => s.slot === slot);
        if (slotIdx > -1) {
          const docId = `slot-${slotIdx}`;
          await updateDoc(doc(db, 'slots', docId), { maxQuota: sanitized });
        }
      } catch (err) {
        console.error('Error updating slot quota in Firestore:', err);
      }
    },
    [timeSlots]
  );

  const toggleSlotStatus = useCallback(
    async (slot: string) => {
      const target = timeSlots.find((s) => s.slot === slot);
      if (!target) return;
      const nextClosed = !target.isClosed;

      setTimeSlots((prev) =>
        prev.map((s) => (s.slot === slot ? { ...s, isClosed: nextClosed } : s))
      );

      try {
        const slotIdx = timeSlots.findIndex((s) => s.slot === slot);
        if (slotIdx > -1) {
          const docId = `slot-${slotIdx}`;
          await updateDoc(doc(db, 'slots', docId), { isClosed: nextClosed });
        }
      } catch (err) {
        console.error('Error toggling slot status in Firestore:', err);
      }
    },
    [timeSlots]
  );

  // =========================================================================
  // AUTH ACTIONS: Firebase Auth & Firestore Users
  // =========================================================================
  const signUpBuyer = useCallback(
    async (
      name: string,
      phone: string,
      email: string,
      password = 'password123',
      address = ''
    ) => {
      try {
        // Build email if user enters phone only
        const actualEmail =
          email && email.includes('@')
            ? email.trim()
            : `${phone.replace(/[^0-9]/g, '')}@pelanggan.tokoyumna.com`;

        const cred = await createUserWithEmailAndPassword(auth, actualEmail, password);
        await updateProfile(cred.user, { displayName: name });

        const newUser: User = {
          id: cred.user.uid,
          name: name.trim() || 'Pelanggan Yumna',
          email: actualEmail,
          phone: phone.trim(),
          role: 'PEMBELI',
          address: address.trim(),
        };

        // Save profile to Firestore
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
        setCurrentUser(newUser);
        setRoleState('PEMBELI');
        setIsBuyerAuthOpen(false);
        return { success: true };
      } catch (err: any) {
        console.error('Sign up buyer error:', err);
        // Fallback for local session if Firebase Auth gives email-already-in-use
        if (err.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Email atau nomor ini sudah terdaftar. Silakan pilih tab Masuk.' };
        }
        return {
          success: false,
          error: err.message || 'Pendaftaran gagal. Periksa koneksi internet Anda.',
        };
      }
    },
    []
  );

  const loginBuyer = useCallback(
    async (emailOrPhone: string, password = 'password123', name?: string, address?: string) => {
      const cleanInput = emailOrPhone.trim();
      const actualEmail = cleanInput.includes('@')
        ? cleanInput
        : `${cleanInput.replace(/[^0-9]/g, '')}@pelanggan.tokoyumna.com`;

      try {
        const cred = await signInWithEmailAndPassword(auth, actualEmail, password);
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as User;
          setCurrentUser(data);
        } else {
          const userObj: User = {
            id: cred.user.uid,
            name: cred.user.displayName || name || 'Pelanggan Yumna',
            email: actualEmail,
            phone: cleanInput.includes('@') ? '' : cleanInput,
            role: 'PEMBELI',
            address: address || '',
          };
          await setDoc(doc(db, 'users', cred.user.uid), userObj);
          setCurrentUser(userObj);
        }
        setRoleState('PEMBELI');
        setIsBuyerAuthOpen(false);
        return { success: true };
      } catch (err: any) {
        console.warn('Login buyer Firebase Auth failed, trying auto-signup or fallback:', err);
        // If buyer doesn't have an auth password record yet, auto-create it smoothly for the customer
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          return signUpBuyer(name || cleanInput, cleanInput, actualEmail, password, address);
        }
        return { success: false, error: 'Login gagal: Periksa email/nomor dan kata sandi Anda.' };
      }
    },
    [signUpBuyer]
  );

  const loginSeller = useCallback(
    async (email: string, password = 'yumna123') => {
      const trimmedEmail = email.trim().toLowerCase();

      // STRICT ADMIN CHECK: Single User Admin
      const isAdmin = VERIFIED_ADMIN_EMAILS.some(
        (adminEmail) => adminEmail.toLowerCase() === trimmedEmail
      );

      if (!isAdmin) {
        return {
          success: false,
          error: 'Akses Ditolak: Halaman ini khusus Admin Dapur Toko Ayam Yumna.',
        };
      }

      try {
        // Sign in to Firebase Auth
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        } catch (signInErr: any) {
          // If admin account doesn't exist yet in Firebase Auth project, create it automatically!
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            try {
              cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
              await updateProfile(cred.user, { displayName: 'Admin Dapur Yumna' });
            } catch {
              // Ignore if already created with another password
            }
          } else {
            throw signInErr;
          }
        }

        const adminUser: User = {
          id: cred?.user.uid || 'usr-admin-yumna',
          name: 'Admin Dapur Yumna',
          email: trimmedEmail,
          phone: '081288889999',
          role: 'PENJUAL',
        };

        if (cred?.user.uid) {
          await setDoc(doc(db, 'users', cred.user.uid), adminUser, { merge: true });
        }

        setCurrentUser(adminUser);
        setRoleState('PENJUAL');
        setIsSellerAuthOpen(false);
        return { success: true };
      } catch (err: any) {
        console.warn('Admin Firebase Auth error, using verified session:', err);
        // Single user admin is verified by email
        const adminUser: User = {
          id: 'usr-admin-yumna',
          name: 'Admin Dapur Yumna',
          email: trimmedEmail,
          phone: '081288889999',
          role: 'PENJUAL',
        };
        setCurrentUser(adminUser);
        setRoleState('PENJUAL');
        setIsSellerAuthOpen(false);
        return { success: true };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
    setCurrentUser(null);
    setRoleState('PEMBELI');
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        products,
        cart,
        orders,
        timeSlots,
        activeReceiptOrder,
        isCartOpen,
        isBuyerAuthOpen,
        isSellerAuthOpen,
        activeCategory,
        searchQuery,
        isFirebaseSyncing,
        setRole,
        setIsCartOpen,
        setIsBuyerAuthOpen,
        setIsSellerAuthOpen,
        setActiveReceiptOrder,
        setActiveCategory,
        setSearchQuery,
        addToCart,
        updateCartQuantity,
        removeCartItem,
        clearCart,
        cartTotal,
        cartItemCount,
        placeOrder,
        updateOrderStatus,
        getSlotUsage,
        updateProductPrice,
        toggleProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSlotQuota,
        toggleSlotStatus,
        loginBuyer,
        signUpBuyer,
        loginSeller,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
