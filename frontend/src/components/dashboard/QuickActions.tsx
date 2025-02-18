import { useState } from 'react';
import {
  PlusIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import DepositModal from '@/components/modals/DepositModal';
import WithdrawModal from '@/components/modals/WithdrawModal';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickActions() {
  const { isEmailVerified } = useAuth();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const actions = [
    {
      name: 'Deposit',
      icon: PlusIcon,
      onClick: () => setIsDepositModalOpen(true),
      disabled: !isEmailVerified,
    },
    {
      name: 'Withdraw',
      icon: ArrowDownIcon,
      onClick: () => setIsWithdrawModalOpen(true),
      disabled: !isEmailVerified,
    },
    {
      name: 'Rebalance',
      icon: ArrowPathIcon,
      href: '/portfolio/rebalance',
      disabled: !isEmailVerified,
    },
    {
      name: 'Investment Plan',
      icon: ChartBarIcon,
      href: '/portfolio/plan',
      disabled: false,
    },
  ];

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {actions.map((action) => (
              <div key={action.name}>
                {action.href ? (
                  <a
                    href={action.disabled ? '#' : action.href}
                    className={`
                      relative block w-full p-6 text-center rounded-lg border-2 border-dashed
                      ${action.disabled
                        ? 'border-gray-300 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }
                    `}
                  >
                    <action.icon
                      className={`
                        mx-auto h-8 w-8
                        ${action.disabled ? 'text-gray-400' : 'text-gray-600'}
                      `}
                    />
                    <span
                      className={`
                        mt-2 block text-sm font-medium
                        ${action.disabled ? 'text-gray-400' : 'text-gray-900'}
                      `}
                    >
                      {action.name}
                    </span>
                  </a>
                ) : (
                  <button
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`
                      relative block w-full p-6 text-center rounded-lg border-2 border-dashed
                      ${action.disabled
                        ? 'border-gray-300 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }
                    `}
                  >
                    <action.icon
                      className={`
                        mx-auto h-8 w-8
                        ${action.disabled ? 'text-gray-400' : 'text-gray-600'}
                      `}
                    />
                    <span
                      className={`
                        mt-2 block text-sm font-medium
                        ${action.disabled ? 'text-gray-400' : 'text-gray-900'}
                      `}
                    >
                      {action.name}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </>
  );
} 