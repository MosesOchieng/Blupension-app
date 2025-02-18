import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchTransactionStatus } from '@/utils/api';

export function useTransactionPolling(transactionId?: string) {
  const [shouldPoll, setShouldPoll] = useState(false);

  const { data: status, error } = useQuery(
    ['transactionStatus', transactionId],
    () => fetchTransactionStatus(transactionId!),
    {
      enabled: shouldPoll && !!transactionId,
      refetchInterval: (data) => {
        if (data?.status === 'completed' || data?.status === 'failed') {
          setShouldPoll(false);
          return false;
        }
        return 5000; // Poll every 5 seconds
      },
    }
  );

  useEffect(() => {
    if (transactionId) {
      setShouldPoll(true);
    }
  }, [transactionId]);

  return { status, error, isPolling: shouldPoll };
} 