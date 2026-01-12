import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const SalesLineChart = ({ data }) => {

  // ✅ EMPTY DATA GUARD
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400">
        No sales data available
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Sales Trend</h3>
        <span className="text-xs text-gray-500">
          {data.length} points
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            dataKey="amount"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default SalesLineChart;
