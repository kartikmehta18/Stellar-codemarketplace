
import * as freighterApi from '@stellar/freighter-api';
import { toast } from 'sonner';
import { STELLAR_NETWORK } from './constants';

// Check if Freighter is installed
export const checkFreighterInstalled = (): boolean => {
  const isConnected = freighterApi.isConnected();
  return !!isConnected; // Ensuring we return a boolean value
};

// Get the current Freighter network
export const getCurrentNetwork = async (): Promise<string | null> => {
  try {
    return await freighterApi.getNetwork();
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

// Check if we're on the correct network and switch if needed
export const checkNetwork = async (): Promise<boolean> => {
  if (!checkFreighterInstalled()) return false;
  
  try {
    const network = await getCurrentNetwork();
    if (network !== STELLAR_NETWORK) {
      toast.warning(`Please switch to ${STELLAR_NETWORK} in your Freighter wallet`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Format address for display (G1234...5678)
export const formatAddress = (addr: string): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
