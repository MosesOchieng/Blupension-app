import { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { validatePhoneNumber } from '@/utils/validation';
import { formatCurrency } from '@/utils/format';

interface TransactionFormProps {
  type: 'deposit' | 'withdrawal';
  onSubmit: (amount: number, phoneNumber: string) => void;
  isLoading: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export default function TransactionForm({
  type,
  onSubmit,
  isLoading,
  minAmount = 1000,
  maxAmount,
}: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) < minAmount) {
      newErrors.amount = `Minimum amount is ${formatCurrency(minAmount)}`;
    }

    if (maxAmount && Number(amount) > maxAmount) {
      newErrors.amount = `Maximum amount is ${formatCurrency(maxAmount)}`;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid M-Pesa phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(Number(amount), phoneNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount (KES)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        error={errors.amount}
      />

      <Input
        label="M-Pesa Phone Number"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="e.g. 254712345678"
        error={errors.phoneNumber}
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        {type === 'deposit' ? 'Deposit' : 'Withdraw'}
      </Button>
    </form>
  );
} 