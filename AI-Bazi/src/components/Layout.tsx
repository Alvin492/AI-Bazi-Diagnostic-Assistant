import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 判断当前路由
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 主要内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <nav className="w-full px-8 py-4 border-t border-gray-800">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => navigate('/home/index')}
            className={`flex flex-col items-center transition-opacity ${
              isActive('/home/index') ? 'text-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
              </svg>
            </div>
            <span className="text-sm">首页</span>
          </button>

          <button 
            onClick={() => navigate('/home/profile')}
            className={`flex flex-col items-center transition-opacity ${
              isActive('/home/profile') ? 'text-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <span className="text-sm">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout; 