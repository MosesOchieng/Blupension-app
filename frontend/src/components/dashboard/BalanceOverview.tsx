import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '@/utils/format';

interface BalanceOverviewProps {
  totalBalance: number;
  stablecoinBalance: number;
  growingAssetsBalance: number;
  percentageChange: number;
}

export default function BalanceOverview({
  totalBalance,
  stablecoinBalance,
  growingAssetsBalance,
  percentageChange,
}: BalanceOverviewProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`
                rounded-md p-3
                ${isPositive ? 'bg-green-100' : 'bg-red-100'}
              `}>
                {isPositive ? (
                  <ArrowUpIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Balance
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalBalance)}
                  </div>
                  <div className={`
                    ml-2 flex items-baseline text-sm font-semibold
                    ${isPositive ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {isPositive ? '+' : ''}{percentageChange}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Stablecoin Balance
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stablecoinBalance)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-orange-100 rounded-md p-3">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Growing Assets
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(growingAssetsBalance)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 