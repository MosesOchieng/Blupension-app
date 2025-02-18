export interface Investment {
    id: string;
    amount: number;
    stablecoinPercentage: number;
    growingAssetsPercentage: number;
    status: 'PENDING' | 'ACTIVE' | 'CLOSED';
    createdAt: string;
    returns?: number;
}

export interface RiskProfile {
    age: number;
    income: number;
    riskTolerance: number;
    investmentHorizon: number;
    recommendedAllocation: {
        stablecoinPercentage: number;
        growingAssetsPercentage: number;
        explanation: string;
    };
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
    details?: {
        phoneNumber?: string;
        mpesaReceipt?: string;
        blockchainTx?: string;
    };
} 