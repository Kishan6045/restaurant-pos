const TopItemsTable = ({ items }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Top Selling Items</h3>
        <span className="text-xs text-gray-500">
          {items?.length || 0} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="py-3 px-3 w-12 rounded-tl-xl">#</th>
              <th className="py-3 px-3">Item</th>
              <th className="py-3 px-3 text-right rounded-tr-xl">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item, idx) => (
              <tr
                key={item.id}
                className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-3 text-gray-500 tabular-nums">
                  {idx + 1}
                </td>
                <td className="py-3 px-3 font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="py-3 px-3 text-right font-semibold tabular-nums">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopItemsTable;