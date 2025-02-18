import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface MpesaIntegrationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function MpesaIntegration({ onSuccess, onError }: MpesaIntegrationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // Implement M-Pesa STK push integration
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, amount }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        onError(data.message);
      }
    } catch (error) {
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <PhoneIcon className="h-8 w-8 text-primary-500" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">M-Pesa Payment</h3>
          <p className="text-sm text-gray-500">
            Enter your M-Pesa number to make a payment
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+254"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount (KES)
          </label>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handlePayment}
            variant="primary"
            className="w-full"
            isLoading={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay with M-Pesa'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
} 