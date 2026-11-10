import { Product } from '../types';

/**
 * Checks if a product's Flash Sale / discount promo is currently active
 * based on flag, time window, and quota.
 */
export function isPromoActive(product: Product): boolean {
  if (!product.promo || !product.promo.isActive) return false;
  if (!product.promo.discountPrice || product.promo.discountPrice >= product.promo.originalPrice) {
    return false;
  }

  const now = Date.now();

  // Check start time
  if (product.promo.startTime) {
    const start = new Date(product.promo.startTime).getTime();
    if (!isNaN(start) && now < start) return false;
  }

  // Check end time
  if (product.promo.endTime) {
    const end = new Date(product.promo.endTime).getTime();
    if (!isNaN(end) && now > end) return false;
  }

  // Check quota if specified
  if (
    typeof product.promo.quota === 'number' &&
    product.promo.quota > 0 &&
    (product.promo.soldCount || 0) >= product.promo.quota
  ) {
    return false;
  }

  return true;
}

/**
 * Returns the price to charge: discountPrice if promo active, otherwise regular price
 */
export function getEffectivePrice(product: Product): number {
  if (isPromoActive(product)) {
    return product.promo!.discountPrice;
  }
  return product.price;
}

/**
 * Returns the original price before discount
 */
export function getOriginalPrice(product: Product): number {
  if (product.promo?.originalPrice) {
    return product.promo.originalPrice;
  }
  return product.price;
}

/**
 * Calculates discount percentage
 */
export function getDiscountPercentage(originalPrice: number, discountPrice: number): number {
  if (!originalPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * Calculates sold progress percentage for flash sale visual meter
 */
export function getPromoProgress(soldCount = 0, quota = 50): number {
  if (!quota || quota <= 0) return 0;
  return Math.min(100, Math.max(5, Math.round((soldCount / quota) * 100)));
}

/**
 * Calculates countdown time remaining until endTime
 */
export function getRemainingTime(endTimeStr?: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  if (!endTimeStr) {
    // Default fallback to end of day
    const now = new Date();
    const end = new Date();
    end.setHours(13, 0, 0, 0); // End of shop operational slot
    if (end.getTime() <= now.getTime()) {
      end.setDate(end.getDate() + 1);
      end.setHours(13, 0, 0, 0);
    }
    const diff = Math.max(0, end.getTime() - now.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      hours: h,
      minutes: m,
      seconds: s,
      isExpired: false,
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    };
  }

  const end = new Date(endTimeStr).getTime();
  const diff = Math.max(0, end - Date.now());

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: '00:00:00' };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
}
