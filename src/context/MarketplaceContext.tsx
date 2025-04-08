
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { CodeListing, Transaction } from '@/types';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';
import { MarketplaceContextType } from './marketplace/types';
import { 
  fetchListings, 
  addListing as addNewListing, 
  getUserListings, 
  getUserPurchases,
  getListingById,
  recordTransaction,
} from './marketplace/listingsService';

const MarketplaceContext = createContext<MarketplaceContextType>({
  listings: [],
  transactions: [],
  userListings: [],
  userPurchases: [],
  addListing: async () => ({} as CodeListing),
  purchaseListing: async () => false,
  getUserListings: async () => [],
  getUserPurchases: async () => [],
  getListingById: async () => undefined,
  loading: true,
  refreshListings: async () => {},
});

export const useMarketplace = () => useContext(MarketplaceContext);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<CodeListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userListings, setUserListings] = useState<CodeListing[]>([]);
  const [userPurchases, setUserPurchases] = useState<CodeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, sendTransaction, xlmToStroops, transferTokens } = useWallet();
  
  // Prevent Infinite Loop by using a Ref
  const hasFetchedListings = React.useRef(false);
  
  const refreshListings = useCallback(async () => {
    if (hasFetchedListings.current) return; // Prevent multiple calls
    hasFetchedListings.current = true;
    
    setLoading(true);
    try {
      const fetchedListings = await fetchListings();
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (address) {
        try {
          const [userListingsData, userPurchasesData] = await Promise.all([
            getUserListings(address),
            getUserPurchases(address)
          ]);
          setUserListings(userListingsData);
          setUserPurchases(userPurchasesData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserListings([]);
        setUserPurchases([]);
      }
    };

    fetchUserData();
  }, [address]);

  const addListing = useCallback(async (listingData: Omit<CodeListing, 'id' | 'createdAt'>): Promise<CodeListing> => {
    try {
      const newListing = await addNewListing(listingData);
      setListings(prev => [newListing, ...prev]);
      return newListing;
    } catch (error) {
      throw error;
    }
  }, []);

  const purchaseListing = useCallback(async (listingId: string, buyerAddress: string): Promise<boolean> => {
    try {
      const listing = listings.find(item => item.id === listingId);
      if (!listing) {
        toast.error('Listing not found');
        return false;
      }
      
      // Show transaction preparation toast
      toast.info('Preparing your transaction. Please confirm in Freighter wallet when prompted.');
      
      let txHash;
      const paymentMethod = 'native'; // 'native' for XLM, 'token' for contract tokens

      if (paymentMethod === 'native') {
        // Native XLM payment through Freighter
        // Convert XLM to stroops for the Stellar transaction (1 XLM = 10,000,000 stroops)
        const valueInStroops = xlmToStroops(listing.price).toString();
        
        // Send the transaction
        txHash = await sendTransaction(listing.sellerAddress, valueInStroops);
      } else {
        // Contract token transfer
        const success = await transferTokens(listing.sellerAddress, Math.round(listing.price * 100));
        if (!success) {
          toast.error('Token transfer failed');
          return false;
        }
        txHash = `TX-TOKEN-${Date.now()}`;
      }
      
      if (!txHash) {
        toast.error('Transaction failed or was cancelled');
        return false;
      }
      
      try {
        // Record the transaction in the database
        const newTransaction = await recordTransaction(
          buyerAddress,
          listing.sellerAddress,
          listing.id,
          listing.price,
          txHash
        );
        
        if (!newTransaction) {
          throw new Error('Failed to record transaction');
        }
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        const updatedPurchases = await getUserPurchases(buyerAddress);
        setUserPurchases(updatedPurchases);
        
        toast.success('Purchase successful! You can now access the full code.');
        return true;
      } catch (error) {
        console.error('Error recording transaction:', error);
        toast.warning('Payment was successful, but there was an issue recording the transaction.');
        return true;
      }
    } catch (error) {
      console.error('Error purchasing listing:', error);
      toast.error('Transaction failed. Please try again.');
      return false;
    }
  }, [listings, sendTransaction, xlmToStroops, transferTokens, getUserPurchases]);

  const value = React.useMemo(() => ({
    listings,
    transactions,
    userListings,
    userPurchases,
    addListing,
    purchaseListing,
    getUserListings,
    getUserPurchases,
    getListingById,
    loading,
    refreshListings,
  }), [listings, transactions, userListings, userPurchases, loading, address, addListing, purchaseListing, refreshListings]);

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
