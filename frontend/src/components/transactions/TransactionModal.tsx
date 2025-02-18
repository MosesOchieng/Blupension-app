import { useState } from 'react';
import Modal from '@/components/common/Modal';
import TransactionForm from './TransactionForm';
import { useNotification } from '@/hooks/useNotification';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdrawal';
  onSubmit: (amount: number, phoneNumber: string) => Promise<void>;
  minAmount?: number;
  maxAmount?: number;
}

export default function TransactionModal({
  isOpen,
  onClose,
  type,
  onSubmit,
  minAmount,
  maxAmount,
}: TransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (amount: number, phoneNumber: string) => {
    setIsLoading(true);
    try {
      await onSubmit(amount, phoneNumber);
      showNotification(
        `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} initiated successfully`,
        'success'
      );
      onClose();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'deposit' ? 'Make a Deposit' : 'Withdraw Funds'}
    >
      <TransactionForm
        type={type}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        minAmount={minAmount}
        maxAmount={maxAmount}
      />
    </Modal>
  );
} 