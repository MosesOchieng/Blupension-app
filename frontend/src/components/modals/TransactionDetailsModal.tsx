import { useQuery } from 'react-query';
import Modal from '@/components/common/Modal';
import { fetchTransactionDetails } from '@/utils/api';
import { formatCurrency } from '@/utils/format';
import { generateReceipt } from '@/utils/receipt';
import { Button } from '@/components/ui/button';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
}

interface TransactionDetails {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
  mpesaReference?: string;
  phoneNumber: string;
  failureReason?: string;
  completedAt?: string;
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  transactionId,
}: TransactionDetailsModalProps) {
  const { data: transaction, isLoading } = useQuery(
    ['transaction', transactionId],
    () => fetchTransactionDetails(transactionId),
    {
      enabled: isOpen,
    }
  );

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  const handleDownloadReceipt = () => {
    if (transaction) {
      generateReceipt(transaction);
    }
  };

  if (isLoading || !transaction) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Amount</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(transaction.amount)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div className="mt-1">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${statusColors[transaction.status]}
              `}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date</div>
            <div className="mt-1 text-sm text-gray-900">
              {new Date(transaction.date).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Type</div>
            <div className="mt-1 text-sm text-gray-900 capitalize">
              {transaction.type}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Phone Number</div>
            <div className="mt-1 text-sm text-gray-900">
              {transaction.phoneNumber}
            </div>
          </div>
          {transaction.mpesaReference && (
            <div>
              <div className="text-sm font-medium text-gray-500">M-Pesa Reference</div>
              <div className="mt-1 text-sm text-gray-900">
                {transaction.mpesaReference}
              </div>
            </div>
          )}
        </div>

        {transaction.failureReason && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {transaction.failureReason}
            </div>
          </div>
        )}

        {transaction.status === 'completed' && transaction.completedAt && (
          <div className="text-sm text-gray-500">
            Completed on {new Date(transaction.completedAt).toLocaleString()}
          </div>
        )}

        {transaction.status === 'completed' && (
          <div className="mt-6">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="w-full"
            >
              Download Receipt
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
} 