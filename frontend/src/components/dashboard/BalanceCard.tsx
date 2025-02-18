import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '@/utils/format';

interface BalanceCardProps {
  balance: number;
  percentageChange: number;
  timeFrame: string;
}

export default function BalanceCard({ balance, percentageChange, timeFrame }: BalanceCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`
              rounded-md p-2
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
                  {formatCurrency(balance)}
                </div>
                <div className={`
                  ml-2 flex items-baseline text-sm font-semibold
                  ${isPositive ? 'text-green-600' : 'text-red-600'}
                `}>
                  {isPositive ? '+' : ''}{percentageChange}%
                </div>
                <span className="ml-1 text-sm text-gray-500">
                  vs {timeFrame}
                </span>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 