import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export default function Stats({ stats }: { stats: StatProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6"
        >
          <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
          {stat.change !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {stat.change >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-success-main" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-error-main" />
              )}
              <span
                className={`ml-1 ${
                  stat.change >= 0 ? 'text-success-main' : 'text-error-main'
                }`}
              >
                {Math.abs(stat.change)}%
              </span>
              {stat.changeLabel && (
                <span className="ml-2 text-gray-500">{stat.changeLabel}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 