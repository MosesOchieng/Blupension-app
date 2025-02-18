import { ethers } from 'ethers';
import PensionFundABI from '@/contracts/PensionFund.json';

export class BlockchainService {
  private provider: ethers.BrowserProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor(contractAddress: string) {
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.contract = new ethers.Contract(contractAddress, PensionFundABI, this.provider);
  }

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = await this.provider.getSigner();
    return this.signer.getAddress();
  }

  async invest(amount: bigint, stablecoinPercentage: number): Promise<ethers.TransactionResponse> {
    if (!this.signer) throw new Error('Not connected');
    
    const contract = this.contract.connect(this.signer);
    return contract.invest(stablecoinPercentage, { value: amount });
  }

  async withdraw(amount: bigint): Promise<ethers.TransactionResponse> {
    if (!this.signer) throw new Error('Not connected');
    
    const contract = this.contract.connect(this.signer);
    return contract.withdraw(amount);
  }

  async getInvestment(address: string): Promise<{
    amount: bigint;
    timestamp: number;
    stablecoinPercentage: number;
    growingAssetsPercentage: number;
  }> {
    return this.contract.investments(address);
  }
} 