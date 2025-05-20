import React from 'react';
import { useNavigate } from 'react-router';
import "../index.css";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-start py-10 px-4">
      {/* 头像区域 */}
      <div className="w-24 h-24 rounded-full bg-gray-700 mb-4 animate-fadeIn">
        {/* 这里可以放置用户头像 */}
      </div>

      {/* 用户信息 */}
      <div className="text-center mb-8 animate-fadeIn delay-200">
        <h2 className="text-xl font-medium mb-2">用户名</h2>
        <p className="text-gray-400">ID: 123456</p>
      </div>

      {/* 功能列表 */}
      <div className="w-full max-w-md space-y-4 animate-fadeInUp delay-400">
        <button className="w-full p-4 bg-gray-800 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors">
          <span>个人资料</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        <button 
          onClick={() => navigate('/home/order-record')}
          className="w-full p-4 bg-gray-800 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <span>订单记录</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        <button className="w-full p-4 bg-gray-800 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors">
          <span>历史记录</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        <button className="w-full p-4 bg-gray-800 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors">
          <span>设置</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Profile;