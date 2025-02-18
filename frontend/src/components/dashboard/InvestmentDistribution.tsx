import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatPercentage } from '@/utils/format';

interface InvestmentDistributionProps {
  stablecoinPercentage: number;
  growingAssetsPercentage: number;
}

export default function InvestmentDistribution({
  stablecoinPercentage,
  growingAssetsPercentage,
}: InvestmentDistributionProps) {
  const data = [
    { name: 'Stablecoin', value: stablecoinPercentage, color: '#3B82F6' },
    { name: 'Growing Assets', value: growingAssetsPercentage, color: '#F97316' },
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Investment Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatPercentage(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.5rem',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Stablecoin</div>
          <div className="mt-1 text-2xl font-semibold text-blue-900">
            {formatPercentage(stablecoinPercentage)}
          </div>
          <div className="mt-1 text-sm text-blue-700">Low risk, stable returns</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-800">Growing Assets</div>
          <div className="mt-1 text-2xl font-semibold text-orange-900">
            {formatPercentage(growingAssetsPercentage)}
          </div>
          <div className="mt-1 text-sm text-orange-700">Higher risk, potential growth</div>
        </div>
      </div>
    </div>
  );
} 