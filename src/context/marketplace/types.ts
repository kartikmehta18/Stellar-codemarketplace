
import { CodeListing, Transaction } from '@/types';

export type MarketplaceContextType = {
  listings: CodeListing[];
  transactions: Transaction[];
  userListings: CodeListing[];
  userPurchases: CodeListing[];
  addListing: (listing: Omit<CodeListing, 'id' | 'createdAt'>) => Promise<CodeListing>;
  purchaseListing: (listingId: string, buyerAddress: string) => Promise<boolean>;
  getUserListings: (address: string) => Promise<CodeListing[]>;
  getUserPurchases: (address: string) => Promise<CodeListing[]>;
  getListingById: (id: string) => Promise<CodeListing | undefined>;
  loading: boolean;
  refreshListings: () => Promise<void>;
};
