import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { initiateWithdrawal, fetchWithdrawalLimits } from '@/utils/api';
import { validatePhoneNumber } from '@/utils/validation';
import { formatCurrency } from '@/utils/format';
import { useTransactionPolling } from '@/hooks/useTransactionPolling';
import { useNotification } from '@/components/common/Notification';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WithdrawalLimits {
  minAmount: number;
  maxDailyAmount: number;
  maxMonthlyAmount: number;
  remainingDailyLimit: number;
  remainingMonthlyLimit: number;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionId, setTransactionId] = useState<string>();
  const { status, isPolling } = useTransactionPolling(transactionId);
  const { showNotification } = useNotification();

  const { data: limits, isLoading: isLoadingLimits } = useQuery<WithdrawalLimits>(
    'withdrawalLimits',
    fetchWithdrawalLimits,
    {
      enabled: isOpen,
    }
  );

  const withdrawMutation = useMutation(initiateWithdrawal, {
    onSuccess: (data) => {
      setTransactionId(data.transactionId);
      showNotification(
        'Withdrawal initiated. Please wait for M-Pesa prompt.',
        'success'
      );
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
      showNotification(error.message, 'error');
    },
  });

  useEffect(() => {
    if (status) {
      if (status.status === 'completed') {
        showNotification('Withdrawal completed successfully!', 'success');
        onClose();
      } else if (status.status === 'failed') {
        showNotification(
          status.failureReason || 'Withdrawal failed. Please try again.',
          'error'
        );
        onClose();
      }
    }
  }, [status, onClose, showNotification]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const numAmount = Number(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (limits) {
      if (numAmount < limits.minAmount) {
        newErrors.amount = `Minimum withdrawal amount is ${formatCurrency(limits.minAmount)}`;
      }
      if (numAmount > limits.remainingDailyLimit) {
        newErrors.amount = `Amount exceeds daily limit. Remaining: ${formatCurrency(limits.remainingDailyLimit)}`;
      }
      if (numAmount > limits.remainingMonthlyLimit) {
        newErrors.amount = `Amount exceeds monthly limit. Remaining: ${formatCurrency(limits.remainingMonthlyLimit)}`;
      }
    }

    if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid M-Pesa phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    withdrawMutation.mutate({
      amount: numAmount,
      phoneNumber,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Funds"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {limits && (
          <div className="bg-gray-50 rounded-md p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Daily Limit Remaining</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(limits.remainingDailyLimit)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monthly Limit Remaining</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(limits.remainingMonthlyLimit)}
              </span>
            </div>
          </div>
        )}

        <Input
          label="Amount (KES)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          error={errors.amount}
          min={limits?.minAmount || 0}
          max={limits?.remainingDailyLimit || 0}
          step="0.01"
          disabled={isLoadingLimits}
        />

        <Input
          label="M-Pesa Phone Number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. 254712345678"
          error={errors.phoneNumber}
        />

        <div className="text-sm text-gray-500 space-y-1">
          <p>• Withdrawals are processed via M-Pesa</p>
          <p>• Minimum withdrawal: {limits ? formatCurrency(limits.minAmount) : '...'}</p>
          <p>• Processing time: 1-2 minutes</p>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            isLoading={withdrawMutation.isLoading || isLoadingLimits}
            disabled={isLoadingLimits}
            className="w-full sm:col-start-2"
          >
            Withdraw
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="mt-3 w-full sm:col-start-1 sm:mt-0"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
} 