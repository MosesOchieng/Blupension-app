import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { initiateDeposit } from '@/services/mpesa';
import { useNotification } from '@/hooks/useNotification';
import { formatPhoneNumber, validatePhoneNumber } from '@/utils/format';

interface MpesaDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function MpesaDepositModal({ isOpen, onClose, walletAddress }: MpesaDepositModalProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { showNotification } = useNotification();

  const depositMutation = useMutation({
    mutationFn: initiateDeposit,
    onSuccess: () => {
      showNotification(
        'M-Pesa prompt sent! Please check your phone to complete the transaction.',
        'success'
      );
      onClose();
    },
    onError: () => {
      showNotification(
        'Failed to initiate M-Pesa deposit. Please try again.',
        'error'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      showNotification('Please enter a valid M-Pesa number', 'error');
      return;
    }

    if (Number(amount) < 100) {
      showNotification('Minimum deposit amount is KES 100', 'error');
      return;
    }

    depositMutation.mutate({
      phoneNumber,
      amount: Number(amount),
      walletAddress,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit via M-Pesa">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>M-Pesa</span>
            <ArrowRightIcon className="w-4 h-4" />
            <span>Wallet</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="M-Pesa Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 0712345678"
            required
            icon={<PhoneIcon className="w-5 h-5 text-gray-400" />}
          />

          <Input
            label="Amount (KES)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            step="1"
            required
            helperText="Minimum amount: KES 100"
          />

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              isLoading={depositMutation.isPending}
            >
              Deposit
            </Button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <p>Note: You will receive an M-Pesa prompt on your phone to complete the transaction.</p>
        </div>
      </div>
    </Modal>
  );
} 