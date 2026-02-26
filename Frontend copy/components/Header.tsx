import React from 'react';
import logo from "../assets/logo.svg";

const Header: React.FC = () => {
  return (
    <header className="pt-8 pb-4 px-4 flex flex-col items-center justify-center text-center sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="flex items-center gap-4 mb-1">
        <div className="w-19 h-19 bg-black rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
           {/* SVG Reconstruction of the K logo with speed lines, fork and spoon */}
           <img src={logo} alt="Khaoo Gully Logo" className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-brand text-black">
          KHAOO <span className="text-[#89D500]">GULLY</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-[2px] w-6 bg-black/10"></span>
        <p className="text-black/40 font-black uppercase tracking-[0.25em] text-[10px]">
          Pocket Friendly Hunger
        </p>
        <span className="h-[2px] w-6 bg-black/10"></span>
      </div>
    </header>
  );
};

export default Header;
