import React, { useState } from 'react';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { PieChart } from 'lucide-react';

interface SpendingBreakdownProps {
  categorySpend: { category: Category; amount: number; percentage: number }[];
  totalExpense: number;
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  categorySpend,
  totalExpense,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (categorySpend.length === 0 || totalExpense === 0) {
    return (
      <div className="bg-white border border-pink-100 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[320px] text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 mb-3">
          <PieChart className="w-7 h-7" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Spending Yet</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Copy an M-Pesa transaction SMS or add spending manually to see your category chart.
        </p>
      </div>
    );
  }

  // SVG Donut calculations
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = categorySpend.map((item, index) => {
    const strokeDasharray = `${(item.percentage * circumference) / 100} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent * circumference) / 100);
    accumulatedPercent += item.percentage;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      color: item.category.color || '#ec4899',
      index
    };
  });

  const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : slices[0];

  return (
    <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Spending by Category</h3>
          <p className="text-xs text-slate-400">Where your money goes</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700">
          {categorySpend.length} Categories
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* SVG Donut Visualizer */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-pink-50 fill-none"
                strokeWidth={strokeWidth}
              />
              {/* Slices */}
              {slices.map((slice) => (
                <circle
                  key={slice.category.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={hoveredIndex === slice.index ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                {activeItem?.category.name}
              </span>
              <span className="text-xl font-black text-slate-900">
                {activeItem?.percentage}%
              </span>
              <span className="text-[11px] text-pink-600 font-bold">
                {formatCurrency(activeItem?.amount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Legend List */}
        <div className="sm:col-span-7 space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
          {slices.map((slice) => (
            <div
              key={slice.category.id}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-2xl transition cursor-pointer ${
                hoveredIndex === slice.index ? 'bg-pink-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-xs font-bold text-slate-700 truncate">
                  {slice.category.name}
                </span>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-xs font-black text-slate-900">
                  {formatCurrency(slice.amount)}
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 w-11 text-right">
                  {slice.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
