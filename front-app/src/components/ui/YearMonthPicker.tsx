'use client';

import { useState } from 'react';

export default function YearMonthPicker() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-md mx-auto bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold text-gray-700">年月を選択</h2>
      <div className="flex gap-4">
        <div className="flex flex-col w-1/2">
          <label htmlFor="year" className="text-sm text-gray-600 mb-1">年</label>
          <select
            id="year"
            className="border border-gray-300 rounded-md p-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-1/2">
          <label htmlFor="month" className="text-sm text-gray-600 mb-1">月</label>
          <select
            id="month"
            className="border border-gray-300 rounded-md p-2"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-gray-600 mt-2">
        選択された年月: <strong>{year}年 {month}月</strong>
      </p>
    </div>
  );
}
