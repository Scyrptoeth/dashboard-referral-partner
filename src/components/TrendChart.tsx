'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type ChartData = {
  date: string;
  count: number;
};

export default function TrendChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#F5F5F2] rounded-3xl border-2 border-dashed border-[#E8E8E4]">
        <p className="text-[#738276] italic text-sm">Belum ada data tren untuk periode ini.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1C1C1A" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#1C1C1A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E4" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#738276', fontSize: 10 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#738276', fontSize: 10 }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1C1C1A', 
              border: 'none', 
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#1C1C1A', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#1C1C1A" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            name="Rujukan"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
