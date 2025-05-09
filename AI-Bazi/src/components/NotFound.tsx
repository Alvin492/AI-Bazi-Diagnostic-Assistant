import React from 'react';
import { useNavigate } from 'react-router';
import "../index.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black min-h-screen flex flex-col justify-center items-center text-white relative overflow-hidden">
      {/* 装饰星星 */}
      <div className="absolute top-10 left-10 text-2xl animate-twinkle">✨</div>
      <div className="absolute top-10 right-10 text-2xl animate-twinkle delay-200">✨</div>
      
      {/* 404数字 */}
      <div className="text-8xl font-bold mb-8 animate-fadeIn">
        404
      </div>

      {/* 错误信息 */}
      <div className="text-2xl mb-8 animate-fadeIn delay-200">
        页面不见了
      </div>

      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium 
                 hover:bg-blue-700 transition-colors duration-300 animate-fadeInUp delay-400
                 flex items-center space-x-2"
      >
        <span>返回首页</span>
      </button>

      {/* 装饰星星 */}
      <div className="absolute bottom-20 left-10 text-2xl animate-twinkle delay-400">✨</div>
      <div className="absolute bottom-20 right-10 text-2xl animate-twinkle delay-600">✨</div>
    </div>
  );
};

export default NotFound; 