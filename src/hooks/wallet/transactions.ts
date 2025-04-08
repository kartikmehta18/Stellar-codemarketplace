
import * as StellarSdk from 'stellar-sdk';
import * as freighterApi from '@stellar/freighter-api';
import { toast } from 'sonner';
import { HORIZON_URL, NETWORK_PASSPHRASE } from './constants';
import { checkNetwork } from './connection';

// Initialize Horizon server connection
// Fix: Changed Server initialization to use the correct SDK path
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// Convert XLM to stroops (1 XLM = 10,000,000 stroops)
export const xlmToStroops = (xlmAmount: number): number => {
  return Math.round(xlmAmount * 10000000);
};

// Send transaction through Freighter
export const sendTransaction = async (
  publicKey: string, 
  to: string, 
  value: string
): Promise<string | null> => {
  if (!freighterApi.isConnected()) {
    toast.error('Please connect your wallet first');
    return null;
  }
  
  try {
    // Ensure we're on the correct network
    const networkOk = await checkNetwork();
    if (!networkOk) {
      toast.error('Please switch to the Stellar Testnet in your Freighter wallet');
      return null;
    }
    
    try {
      // Load account details from the network
      const sourceAccount = await server.loadAccount(publicKey);
      
      // Create a payment transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: to,
          asset: StellarSdk.Asset.native(),
          amount: (parseInt(value) / 10000000).toString() // Convert back from stroops to XLM
        })
      )
      .setTimeout(30)
      .build();
      
      // Convert to XDR format for Freighter
      const xdrTransaction = transaction.toXDR();
      
      try {
        // Sign the transaction with Freighter
        const signedTransaction = await freighterApi.signTransaction(
          xdrTransaction,
          { 
            networkPassphrase: NETWORK_PASSPHRASE
          }
        );
        
        // Submit the signed transaction to the Stellar network
        const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedTransaction, NETWORK_PASSPHRASE);
        const transactionResult = await server.submitTransaction(transactionToSubmit);
        
        console.log("Transaction successful:", transactionResult);
        toast.success('Transaction completed successfully!');
        
        // Return the transaction hash
        return transactionResult.hash;
      } catch (error: any) {
        // Handle user rejection or other errors
        console.error('Transaction signing error:', error);
        
        if (error.message?.includes('User declined')) {
          toast.error('Transaction was rejected by user');
        } else {
          toast.error(`Transaction error: ${error.message || 'Unknown error'}`);
        }
        return null;
      }
    } catch (error: any) {
      console.error('Transaction preparation error:', error);
      toast.error(`Transaction preparation error: ${error.message || 'Unknown error'}`);
      return null;
    }
  } catch (error: any) {
    console.error('Transaction error:', error);
    toast.error(error.message || 'Transaction failed');
    return null;
  }
};
