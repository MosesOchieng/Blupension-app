import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCodeIcon, ClipboardIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { walletService, WalletInfo } from '@/services/wallet';
import { formatAddress } from '@/utils/format';
import { useNotification } from '@/hooks/useNotification';
import MpesaDepositModal from './MpesaDepositModal';

export default function WalletManager() {
  const [showQR, setShowQR] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { showNotification } = useNotification();
  
  const { data: walletInfo, isLoading, refetch } = useQuery<WalletInfo>({
    queryKey: ['walletInfo'],
    queryFn: () => walletService.getWalletInfo()
  });

  const copyAddress = async () => {
    if (walletInfo?.address) {
      await navigator.clipboard.writeText(walletInfo.address);
      showNotification('Address copied to clipboard!', 'success');
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Digital Asset Wallet
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => refetch()}
              className="flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center"
            >
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>
        </div>

        {/* Wallet Address Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Wallet Address</div>
              <div className="font-mono text-sm">
                {formatAddress(walletInfo?.address || '')}
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyAddress}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ClipboardIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQR(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <QrCodeIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Balances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { token: 'BPT', balance: walletInfo?.balance.bpt || '0', color: 'blue' },
            { token: 'ETH', balance: walletInfo?.balance.eth || '0', color: 'purple' },
            { token: 'USDC', balance: walletInfo?.balance.usdc || '0', color: 'green' }
          ].map((item) => (
            <motion.div
              key={item.token}
              whileHover={{ y: -2 }}
              className={`bg-${item.color}-50 rounded-lg p-4`}
            >
              <div className="text-sm text-gray-500 mb-1">{item.token} Balance</div>
              <div className="text-lg font-semibold text-gray-900">
                {item.balance} {item.token}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {walletInfo?.transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {tx.amount} {tx.token}
                  </div>
                  <div className={`text-sm ${
                    tx.status === 'completed' ? 'text-green-600' :
                    tx.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <MpesaDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        walletAddress={walletInfo?.address || ''}
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Implement QR code display */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
} 