export interface DashboardData {
  totalBalance: number;
  stablecoinBalance: number;
  growingAssetsBalance: number;
  percentageChange: number;
  stablecoinPercentage: number;
  growingAssetsPercentage: number;
  performanceData: PerformanceDataPoint[];
  recentTransactions: Transaction[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  mpesaReference?: string;
} 