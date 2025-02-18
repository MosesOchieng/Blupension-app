import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { InvestmentDistribution } from '@/components/dashboard/InvestmentDistribution';
import Card from '@/components/common/Card';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolioAnalysis } from '@/utils/api';

export default function PortfolioAnalysis() {
  const { data, isLoading } = useQuery(['portfolioAnalysis'], fetchPortfolioAnalysis);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Portfolio Analysis
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card title="Performance Overview">
                <div className="h-80">
                  <PerformanceChart data={data?.performanceData || []} />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card title="Asset Distribution">
                <InvestmentDistribution
                  stablecoinPercentage={data?.stablecoinPercentage || 0}
                  growingAssetsPercentage={data?.growingAssetsPercentage || 0}
                />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card title="Investment Insights">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data?.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 