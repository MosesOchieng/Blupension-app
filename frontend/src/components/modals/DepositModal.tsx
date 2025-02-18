import { useState } from 'react';
import { useMutation } from 'react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { initiateDeposit } from '@/utils/api';
import { validatePhoneNumber } from '@/utils/validation';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const depositMutation = useMutation(initiateDeposit, {
    onSuccess: () => {
      onClose();
      // TODO: Show success notification
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid M-Pesa phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    depositMutation.mutate({
      amount: Number(amount),
      phoneNumber,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make a Deposit"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <Input
          label="Amount (KES)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          error={errors.amount}
          min="0"
          step="0.01"
        />

        <Input
          label="M-Pesa Phone Number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. 254712345678"
          error={errors.phoneNumber}
        />

        <div className="text-sm text-gray-500">
          <p>You will receive an M-Pesa prompt to complete the deposit.</p>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            isLoading={depositMutation.isLoading}
            className="w-full sm:col-start-2"
          >
            Deposit
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