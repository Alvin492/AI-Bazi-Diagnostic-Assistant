import React from 'react';
import "../index.css";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-between py-10 text-white relative">
      {/* 顶部文字 */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-xl font-medium mb-2">古老的智慧，为你指引 📚</h1>
      </div>

      {/* 中间部分：猫咪和书本图片 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-4">
        <div className="relative w-64 h-64 mb-16 animate-fadeIn delay-200">
          <img 
            src="/cat-wizard.png" 
            alt="智慧猫咪"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-full"></div>
        </div>

        {/* 探索按钮 */}
        <button 
          className="w-32 h-32 rounded-full bg-blue-500 hover:bg-blue-600 
                     flex items-center justify-center text-xl font-medium
                     transition-all duration-300 transform hover:scale-105
                     animate-fadeInUp delay-400
                     shadow-lg shadow-blue-500/50"
        >
          探索
        </button>
      </div>
    </div>
  );
};

export default Home; 