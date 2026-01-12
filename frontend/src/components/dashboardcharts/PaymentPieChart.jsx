import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// 🎨 FIXED COLORS (POS STANDARD)
const COLOR_MAP = {
  CASH: "#22c55e",   // green
  UPI: "#3b82f6",    // blue
  CARD: "#f97316",   // orange
};

const PaymentPieChart = ({ data = {} }) => {

  // 🔄 DATA FORMAT & OPTIMIZATION
  const chartData = useMemo(() => {
    return Object.keys(data)
      .map((key) => ({
        name: key.toUpperCase(),
        value: Number(data[key]) || 0,
      }))
      .filter((item) => item.value > 0); // ❌ remove zero
  }, [data]);

  // 🚫 NO DATA UI
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <span className="text-xs text-gray-500">No data</span>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          No payment data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Payment Methods</h3>
        <span className="text-xs text-gray-500">
          {chartData.reduce((sum, x) => sum + (x.value || 0), 0).toLocaleString("en-IN")}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            labelLine={false}
            label={({ name, value }) => `${name}: ₹${value}`}
          >
            {chartData.map((item, index) => (
              <Cell
                key={index}
                fill={COLOR_MAP[item.name] || "#9ca3af"}
              />
            ))}
          </Pie>

          {/* 🧾 TOOLTIP */}
          <Tooltip
            formatter={(value) => [`₹${value}`, "Amount"]}
          />

          {/* 📌 LEGEND */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentPieChart;
