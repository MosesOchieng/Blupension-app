import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '@/utils/format';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Recent Transactions
        </h3>
        <div className="mt-6 flow-root">
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
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
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