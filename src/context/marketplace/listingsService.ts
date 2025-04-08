
import { CodeListing, Transaction } from '@/types';
import { toast } from 'sonner';
import { 
  getListings as supabaseGetListings,
  addListing as supabaseAddListing, 
  getUserListings as supabaseGetUserListings,
  getUserPurchases as supabaseGetUserPurchases,
  getListingById as supabaseGetListingById,
  addTransaction as supabaseAddTransaction
} from '@/lib/supabase';
import { MOCK_LISTINGS } from './mockData';

// Fetch all listings
export const fetchListings = async (): Promise<CodeListing[]> => {
  try {
    const fetchedListings = await supabaseGetListings();
    if (fetchedListings.length > 0) {
      return fetchedListings;
    } else {
      console.log('No listings found in Supabase, using mock data');
      return MOCK_LISTINGS;
    }
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return MOCK_LISTINGS;
  }
};

// Add a new listing
export const addListing = async (listingData: Omit<CodeListing, 'id' | 'createdAt'>): Promise<CodeListing> => {
  try {
    const newListing = await supabaseAddListing(listingData);
    
    if (!newListing) {
      throw new Error('Failed to create listing');
    }
    
    toast.success('Your code has been listed successfully!');
    return newListing;
  } catch (error: any) {
    console.error('Error adding listing:', error);
    let errorMessage = 'Failed to create listing. Please try again.';
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      errorMessage = 'Database tables have not been created. Please set up your Supabase tables first.';
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Get listings for a specific user
export const getUserListings = async (address: string): Promise<CodeListing[]> => {
  try {
    return await supabaseGetUserListings(address);
  } catch (error) {
    console.error('Error getting user listings:', error);
    return [];
  }
};

// Get purchases made by a specific user
export const getUserPurchases = async (address: string): Promise<CodeListing[]> => {
  try {
    return await supabaseGetUserPurchases(address);
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return [];
  }
};

// Get a specific listing by ID
export const getListingById = async (id: string): Promise<CodeListing | undefined> => {
  try {
    const listing = await supabaseGetListingById(id);
    return listing || undefined;
  } catch (error) {
    console.error('Error getting listing by id:', error);
    return undefined;
  }
};

// Record a transaction in the database
export const recordTransaction = async (
  buyerAddress: string,
  sellerAddress: string,
  listingId: string,
  amount: number,
  txHash: string
): Promise<Transaction | null> => {
  try {
    const newTransaction = await supabaseAddTransaction({
      buyerAddress,
      sellerAddress,
      listingId,
      amount,
      status: 'success',
      txHash,
    });
    
    if (!newTransaction) {
      throw new Error('Failed to record transaction');
    }
    
    return newTransaction;
  } catch (error) {
    console.error('Error recording transaction:', error);
    return null;
  }
};
