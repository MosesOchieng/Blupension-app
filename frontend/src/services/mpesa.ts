import axios from '@/lib/axios';

interface DepositParams {
  phoneNumber: string;
  amount: number;
  walletAddress: string;
}

interface DepositResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
}

export const initiateDeposit = async (params: DepositParams): Promise<DepositResponse> => {
  const { data } = await axios.post('/api/mpesa/deposit', params);
  return data;
};

export const checkDepositStatus = async (checkoutRequestId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}> => {
  const { data } = await axios.get(`/api/mpesa/status/${checkoutRequestId}`);
  return data;
}; 