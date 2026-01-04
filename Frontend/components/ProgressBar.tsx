
import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, goal }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-8">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-black/30 text-[10px] font-black uppercase tracking-widest mb-1">Impact Tracker</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-black italic leading-none">{current}</span>
            <span className="text-black/20 font-bold text-xl">/ {goal}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-[#A3FF00]/20 border border-[#A3FF00]/50 rounded-full px-4 py-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#89D500] animate-pulse"></span>
            <span className="text-black font-black text-[10px] uppercase tracking-widest">
              {goal - current > 0 ? `${goal - current} more to unlock` : 'Mission Accomplished'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-6 w-full bg-black/5 rounded-2xl overflow-hidden border border-black/5 p-1.5 relative">
        <div 
          className="h-full bg-gradient-to-r from-[#A3FF00] to-[#89D500] rounded-xl transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-white/30 skew-x-12 translate-x-10"></div>
        </div>
      </div>
      
      <div className="mt-6 group bg-white p-5 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-black text-[#A3FF00] w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-truck-fast text-2xl"></i>
          </div>
          <div>
            <h4 className="text-black font-black text-base uppercase tracking-tight italic">Unlock Free Delivery!</h4>
            <p className="text-sm text-black/50 leading-relaxed font-medium">
              Join in the first <span className="text-black font-bold">500 students</span> to unlock 
              <span className="text-black font-bold"> FREE DELIVERY </span> for a week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
