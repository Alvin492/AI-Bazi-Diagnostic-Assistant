import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import "../styles/globals.css";

// 开屏页面组件：展示应用启动画面，3秒后跳转到首页
const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  // 使用 useEffect 实现自动跳转
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home/index'); // 跳转到首页
    }, 3000); // 3秒后跳转

    // 清理定时器
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-black min-h-screen flex flex-col justify-center items-center text-white relative overflow-hidden">
      {/* 顶部星形装饰：添加闪烁动画 */}
      <div className="absolute top-10 left-10 text-2xl animate-twinkle">✨</div>
      <div className="absolute top-10 right-10 text-2xl animate-twinkle delay-200">✨</div>
      {/* 主标题：垂直排列，添加渐入动画 */}
      <div className="flex flex-col items-center space-y-3 text-4xl md:text-5xl font-bold">
        {['集', '群', '中', '心', '平', '台', 'AI', '知', '识', '库'].map((char, index) => (
          <span
            key={index}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {char}
          </span>
        ))}
      </div>
      {/* 底部星形装饰：添加闪烁动画 */}
      <div className="absolute bottom-20 left-10 text-2xl animate-twinkle delay-400">✨</div>
      <div className="absolute bottom-20 right-10 text-2xl animate-twinkle delay-600">✨</div>
      {/* 底部标志：添加淡入动画和微妙缩放效果 */}
      <div className="absolute bottom-8 text-lg animate-fadeInUp flex items-center space-x-2">
    
      </div>
    </div>
  );
};

export default SplashScreen;