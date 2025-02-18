import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { investmentApi } from '../api/investment';
import { Investment, RiskProfile } from '../api/types';

interface InvestmentState {
    investments: Investment[];
    riskProfile: RiskProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: InvestmentState = {
    investments: [],
    riskProfile: null,
    loading: false,
    error: null,
};

export const fetchInvestments = createAsyncThunk(
    'investment/fetchInvestments',
    async () => {
        const response = await investmentApi.getPortfolio();
        return response;
    }
);

export const createInvestment = createAsyncThunk(
    'investment/createInvestment',
    async ({ amount, stablecoinPercentage }: { amount: number; stablecoinPercentage: number }) => {
        const response = await investmentApi.createInvestment(amount, stablecoinPercentage);
        return response;
    }
);

const investmentSlice = createSlice({
    name: 'investment',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvestments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInvestments.fulfilled, (state, action) => {
                state.loading = false;
                state.investments = action.payload;
            })
            .addCase(fetchInvestments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch investments';
            })
            .addCase(createInvestment.fulfilled, (state, action) => {
                state.investments.push(action.payload);
            });
    },
});

export default investmentSlice.reducer; 