import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpIcon, ArrowDownIcon, GiftIcon } from '@heroicons/react/24/outline';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/format';
import { useBPTStore } from '@/stores/bptStore';

export default function BPTManagement() {
  const { data: bptBalance } = useQuery(['bptBalance'], () => fetchBPTBalance());
  const { showStakingModal, showUnstakeModal } = useBPTStore();

  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          BPT Token Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white"
          >
            <div className="text-sm opacity-80 mb-2">Total BPT Balance</div>
            <div className="text-3xl font-bold mb-4">
              {bptBalance?.total || 0} BPT
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="opacity-80">Staked</div>
                <div className="font-semibold">{bptBalance?.staked || 0} BPT</div>
              </div>
              <div>
                <div className="opacity-80">Available</div>
                <div className="font-semibold">{bptBalance?.available || 0} BPT</div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={showStakingModal}
                className="w-full flex items-center justify-center"
              >
                <ArrowUpIcon className="w-5 h-5 mr-2" />
                Stake BPT
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={showUnstakeModal}
                variant="secondary"
                className="w-full flex items-center justify-center"
              >
                <ArrowDownIcon className="w-5 h-5 mr-2" />
                Unstake BPT
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent BPT Activity
          </h3>
          <div className="space-y-4">
            {bptBalance?.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'stake' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'stake' ? (
                      <ArrowUpIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {activity.type === 'stake' ? 'Staked' : 'Unstaked'} BPT
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="font-medium">
                  {activity.amount} BPT
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 