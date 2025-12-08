/**
 * TickX Type Definitions
 */

// Listing Types
export type ListingType = 'auction' | 'fixed' | 'hybrid' | 'declining';

// Event Categories
export type EventCategory = 'concert' | 'sports' | 'theater' | 'festival' | 'comedy' | 'other';

// Listing Status
export type ListingStatus = 'active' | 'ended' | 'sold' | 'cancelled';

// Bid Status
export type BidStatus = 'active' | 'outbid' | 'won' | 'withdrawn';

// Transaction Status
export type TransactionStatus =
  | 'pending_payment'
  | 'paid'
  | 'transfer_pending'
  | 'completed'
  | 'refunded';

// Group Status
export type GroupStatus = 'forming' | 'complete' | 'bidding' | 'won' | 'failed';

// Payment Status
export type PaymentStatus = 'pending' | 'confirmed';

// Verification Level
export type VerificationLevel = 'unverified' | 'email_verified' | 'id_verified' | 'trusted_seller';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  verificationLevel: VerificationLevel;
  rating?: number;
  totalSales?: number;
  totalPurchases?: number;
  createdAt: string;
}

// Venue
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  capacity: number;
  imageUrl?: string;
  seatingChartUrl?: string;
}

// Event
export interface Event {
  id: string;
  name: string;
  description?: string;
  category: EventCategory;
  venue: Venue;
  eventDate: string;
  doorsTime?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status: 'scheduled' | 'postponed' | 'cancelled';
  minPrice?: number;
  maxPrice?: number;
  listingCount?: number;
  isFeatured?: boolean;
  artists?: string[];
  tags?: string[];
}

// Listing
export interface Listing {
  id: string;
  sellerId: string;
  seller: User;
  eventId: string;
  event: Event;
  listingType: ListingType;
  status: ListingStatus;
  section: string;
  row: string;
  seats: string[];
  quantity: number;

  // Pricing
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  floorPrice?: number; // For declining

  // Auction specifics
  bidCount?: number;
  auctionEndTime?: string;
  reserveMet?: boolean;

  // Declining specifics
  declineSchedule?: {
    amount: number;
    intervalMinutes: number;
  };

  // Configuration
  allowSplitting: boolean;
  minQuantity: number;
  bidIncrement: number;

  // Metadata
  watcherCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Bid
export interface Bid {
  id: string;
  listingId: string;
  bidderId: string;
  bidder: User;
  amount: number;
  maxAmount?: number; // For proxy bidding
  quantity: number;
  status: BidStatus;
  createdAt: string;
}

// Counter Offer
export interface CounterOffer {
  id: string;
  listingId: string;
  bidId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

// Transaction
export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  buyerFee: number;
  sellerFee: number;
  status: TransactionStatus;
  paymentIntentId?: string;
  transferConfirmedAt?: string;
  createdAt: string;
}

// Group Purchase
export interface Group {
  id: string;
  listingId: string;
  listing: Listing;
  organizerId: string;
  organizer: User;
  targetQuantity: number;
  deadline: string;
  status: GroupStatus;
  inviteCode: string;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: User;
  quantity: number;
  maxPricePerTicket?: number;
  paymentStatus: PaymentStatus;
  joinedAt: string;
  confirmedAt?: string;
}

// Watchlist Item
export interface WatchlistItem {
  id: string;
  userId: string;
  eventId: string;
  event: Event;
  priceAlertThreshold?: number;
  createdAt: string;
}

// Search/Filter Types
export interface EventFilters {
  category?: EventCategory;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  query?: string;
}

export interface ListingFilters {
  section?: string;
  priceMin?: number;
  priceMax?: number;
  listingType?: ListingType;
  quantity?: number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'outbid' | 'auction_won' | 'auction_lost' | 'price_drop' | 'group_update' | 'counter_offer' | 'transfer_reminder';
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

// Price Analysis (AI Feature)
export interface PriceAnalysis {
  listingId: string;
  fairPriceRange: {
    low: number;
    high: number;
  };
  rating: 'great_deal' | 'fair' | 'above_market' | 'overpriced';
  comparableSales: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  priceHistory: {
    date: string;
    avgPrice: number;
  }[];
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
