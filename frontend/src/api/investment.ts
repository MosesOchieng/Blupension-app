import axios from 'axios';
import { Investment, RiskProfile } from './types';

const API_URL = process.env.REACT_APP_API_URL;

export const investmentApi = {
    createInvestment: async (amount: number, stablecoinPercentage: number): Promise<Investment> => {
        const response = await axios.post(`${API_URL}/investments`, {
            amount,
            stablecoin_percentage: stablecoinPercentage,
        });
        return response.data;
    },

    getPortfolio: async (): Promise<Investment[]> => {
        const response = await axios.get(`${API_URL}/investments`);
        return response.data;
    },

    updateRiskProfile: async (profile: Omit<RiskProfile, 'recommendedAllocation'>): Promise<RiskProfile> => {
        const response = await axios.put(`${API_URL}/investments/risk-profile`, profile);
        return response.data;
    },
}; 