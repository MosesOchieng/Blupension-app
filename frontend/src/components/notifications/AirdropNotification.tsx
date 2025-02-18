import { motion, AnimatePresence } from 'framer-motion';
import { GiftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

interface AirdropNotificationProps {
  show: boolean;
  onClose: () => void;
  amount: number;
}

export default function AirdropNotification({ show, onClose, amount }: AirdropNotificationProps) {
  if (show) {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-2">
                    <GiftIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    Airdrop Received!
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close notification"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="text-center py-4"
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {amount} BPT
                </div>
                <p className="text-gray-600">
                  You've received a BPT token airdrop! 
                  Stake them to earn more rewards.
                </p>
              </motion.div>

              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Later
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    // Implement stake action
                  }}
                >
                  Stake Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 