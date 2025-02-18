import { useQuery } from '@tanstack/react-query';
import { marketService, MarketData } from '@/services/market';

export function useMarketData(symbol: string) {
  return useQuery<MarketData, Error>(
    ['marketData', symbol],
    () => marketService.getMarketData(symbol),
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30000, // Consider data stale after 30 seconds
    }
  );
}

export function useMultipleMarketData(symbols: string[]) {
  return useQuery<Record<string, MarketData>, Error>(
    ['marketData', ...symbols],
    () => marketService.getMultipleMarketData(symbols),
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );
} 