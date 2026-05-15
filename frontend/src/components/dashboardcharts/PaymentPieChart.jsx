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
  CARD: "#6366f1",   // indigo
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
      <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
        No payment data available
      </div>
    );
  }
 
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card sm:p-5">
      <h3 className="mb-3 text-lg font-bold text-slate-900">
        Payment methods
      </h3>
 
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
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