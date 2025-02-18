import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface PlanDetails {
  name: string;
  description: string;
  stablecoin: number;
  growingAssets: number;
  riskLevel: string;
  recommended?: boolean;
}

const plans: PlanDetails[] = [
  {
    name: 'Conservative',
    description: 'Stable growth with minimal risk',
    stablecoin: 80,
    growingAssets: 20,
    riskLevel: 'Low',
  },
  {
    name: 'Moderate',
    description: 'Balanced growth and stability',
    stablecoin: 50,
    growingAssets: 50,
    riskLevel: 'Medium',
    recommended: true,
  },
  {
    name: 'Aggressive',
    description: 'Maximum growth potential',
    stablecoin: 20,
    growingAssets: 80,
    riskLevel: 'High',
  },
];

interface InvestmentPlanCardProps {
  onSelectPlan: (plan: string) => void;
  selectedPlan?: string;
}

export default function InvestmentPlanCard({ onSelectPlan, selectedPlan }: InvestmentPlanCardProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Investment Plans
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-lg border p-4 cursor-pointer
                ${selectedPlan === plan.name
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-blue-500'
                }
              `}
              onClick={() => onSelectPlan(plan.name)}
            >
              {plan.recommended && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    {plan.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>
                {selectedPlan === plan.name && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Risk Level</span>
                  <span className="font-medium text-gray-900">{plan.riskLevel}</span>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${plan.growingAssets}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Stablecoin ({plan.stablecoin}%)</span>
                    <span>Growing Assets ({plan.growingAssets}%)</span>
                  </div>
                </div>

                <div className="mt-4">
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {plan.stablecoin}% in USDC
                    </li>
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {plan.growingAssets}% in Bitcoin
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 