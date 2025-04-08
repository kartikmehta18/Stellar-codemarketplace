
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as freighterApi from '@stellar/freighter-api';
import { 
  checkFreighterInstalled, 
  checkNetwork, 
  formatAddress 
} from './wallet/connection';
import { xlmToStroops, sendTransaction } from './wallet/transactions';
import { 
  initAccount as initTokenAccount, 
  getBalance as getTokenBalance, 
  transferTokens as transferTokenAmount 
} from './wallet/tokenContract';

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  // Connect to Freighter Wallet
  const connectWallet = useCallback(async () => {
    if (!checkFreighterInstalled()) {
      toast.error('Freighter wallet is not installed. Please install Freighter to use this marketplace.');
      window.open('https://www.freighter.app/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Check if we're on the correct network
      const networkOk = await checkNetwork();
      if (!networkOk) {
        setIsConnecting(false);
        return;
      }

      // Request public key
      try {
        await freighterApi.setAllowed();
        const key = await freighterApi.getPublicKey();
        
        if (key) {
          setAddress(key);
          setPublicKey(key);
          setIsConnected(true);
          toast.success('Wallet connected successfully!');
        }
      } catch (error: any) {
        // Handle user rejection gracefully
        if (error.message?.includes('User declined')) {
          toast.error('Connection was rejected by user');
        } else {
          toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
        }
        console.error('Error connecting wallet:', error);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet (frontend only)
  const disconnectWallet = useCallback(() => {
    setAddress('');
    setPublicKey('');
    setIsConnected(false);
    toast.info('Wallet disconnected');
  }, []);

  // Helper function to send a transaction
  const sendPayment = useCallback(async (to: string, value: string): Promise<string | null> => {
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first');
      return null;
    }
    return await sendTransaction(publicKey, to, value);
  }, [isConnected, publicKey]);

  // Initialize wallet connection and check status
  useEffect(() => {
    const checkConnection = async () => {
      if (checkFreighterInstalled()) {
        try {
          const isAllowed = await freighterApi.isAllowed();
          if (isAllowed) {
            const publicKey = await freighterApi.getPublicKey();
            if (publicKey) {
              setAddress(publicKey);
              setPublicKey(publicKey);
              setIsConnected(true);
              // Verify network after connection
              await checkNetwork();
            }
          }
        } catch (error) {
          console.error('Error checking connection status:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Initialize account with token balance
  const initAccount = useCallback(async (amount: number): Promise<boolean> => {
    return await initTokenAccount(isConnected, publicKey, amount);
  }, [isConnected, publicKey]);

  // Get token balance
  const getBalance = useCallback(async (): Promise<number> => {
    return await getTokenBalance(isConnected);
  }, [isConnected]);

  // Transfer tokens
  const transferTokens = useCallback(async (to: string, amount: number): Promise<boolean> => {
    return await transferTokenAmount(isConnected, publicKey, to, amount);
  }, [isConnected, publicKey]);

  return {
    isConnected,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    sendTransaction: sendPayment,
    xlmToStroops,
    // Stellar Soroban Contract specific functions
    initAccount,
    getBalance,
    transferTokens,
  };
};

export default useWallet;
