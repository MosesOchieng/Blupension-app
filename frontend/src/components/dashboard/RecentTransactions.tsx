import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '@/utils/format';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  mpesaReference?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const statusStyles = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Transactions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            A list of your recent deposits and withdrawals
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a
            href="/transactions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            View all
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`
                        inline-flex items-center justify-center h-8 w-8 rounded-full
                        ${transaction.type === 'deposit' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                        }
                      `}>
                        {transaction.type === 'deposit' ? (
                          <ArrowUpIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="h-5 w-5 text-red-600" />
                        )}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`
                            text-sm font-medium
                            ${transaction.type === 'deposit' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            }
                          `}>
                            {transaction.type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.mpesaReference && (
                            <p className="text-sm text-gray-500">
                              • Ref: {transaction.mpesaReference}
                            </p>
                          )}
                        </div>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${statusStyles[transaction.status]}
                        `}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {transactions.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 