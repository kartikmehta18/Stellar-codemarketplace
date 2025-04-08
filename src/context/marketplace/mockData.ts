
import { CodeListing } from '@/types';

export const MOCK_LISTINGS: CodeListing[] = [
  {
    id: '1',
    title: 'Smart Contract Boilerplate',
    description: 'A secure and gas-optimized smart contract template for NFT marketplaces.',
    price: 0.05,
    language: 'Solidity',
    category: 'Blockchain',
    previewCode: 'contract NFTMarket {\n    // Basic contract structure\n    // View more after purchase\n}',
    sellerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['smart-contract', 'ethereum', 'NFT'],
    imageUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'React State Management Library',
    description: 'A lightweight alternative to Redux with hooks-based API.',
    price: 0.03,
    language: 'TypeScript',
    category: 'Frontend',
    previewCode: 'export const createStore = (initialState) => {\n  // Store implementation\n  // Purchase to see full code\n}',
    sellerAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    createdAt: Date.now() - 86400000,
    tags: ['react', 'state-management', 'typescript'],
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'AI Image Generation API',
    description: 'Backend service for AI-powered image generation with multiple model support.',
    price: 0.08,
    language: 'Python',
    category: 'Backend',
    previewCode: 'class ImageGenerator:\n    def __init__(self, model="stable-diffusion"):\n        # Initialization code\n        # Full implementation available after purchase',
    sellerAddress: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    createdAt: Date.now() - 86400000 * 3,
    tags: ['AI', 'python', 'API'],
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2830&auto=format&fit=crop',
  },
];
