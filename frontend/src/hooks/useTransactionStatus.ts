import { useState, useEffect } from 'react';
import { checkDepositStatus } from '@/services/mpesa';
import { useNotification } from '@/hooks/useNotification';

export function useTransactionStatus(checkoutRequestId: string | null) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | null>(
    checkoutRequestId ? 'pending' : null
  );
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!checkoutRequestId) return;

    const checkStatus = async () => {
      try {
        const result = await checkDepositStatus(checkoutRequestId);
        setStatus(result.status);

        if (result.status === 'completed') {
          showNotification('Deposit successful!', 'success');
        } else if (result.status === 'failed') {
          showNotification('Deposit failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkoutRequestId]);

  return status;
} 