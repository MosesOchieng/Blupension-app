import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/common/Card';

const plans = [
  {
    name: "Conservative",
    description: "Low risk, stable returns",
    allocation: {
      stablecoin: 80,
      growingAssets: 20
    },
    riskLevel: "Low",
    recommended: "Approaching retirement"
  },
  {
    name: "Balanced",
    description: "Moderate risk and returns",
    allocation: {
      stablecoin: 50,
      growingAssets: 50
    },
    riskLevel: "Medium",
    recommended: "Mid-career professionals"
  },
  {
    name: "Aggressive",
    description: "Higher risk, potential for higher returns",
    allocation: {
      stablecoin: 20,
      growingAssets: 80
    },
    riskLevel: "High",
    recommended: "Early career, long-term investors"
  }
];

export default function InvestmentPlans() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Investment Plans
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <Card className="h-full">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Asset Allocation
                        </h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span>Stablecoin</span>
                            <span>{plan.allocation.stablecoin}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Growing Assets</span>
                            <span>{plan.allocation.growingAssets}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Risk Level
                        </h4>
                        <p className="mt-1">{plan.riskLevel}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Recommended For
                        </h4>
                        <p className="mt-1">{plan.recommended}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 