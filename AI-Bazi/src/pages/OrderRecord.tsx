import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import "../index.css";

// 订单数据接口
interface OrderItem {
  id: string;         // 订单号
  paymentMethod: string; // 支付方式
  productName: string;   // 商品名称
  time: string;       // 订单时间
  amount: number;     // 金额
}
// const testOrders = [
//   {
//     id: "202409301744440015",
//     paymentMethod: "微信",
//     productName: "次卡",
//     time: "2024-09-10 20:36",
//     amount: 1.99
//   },
//   {
//     id: "202409301744440014",
//     paymentMethod: "微信",
//     productName: "周卡",
//     time: "2024-09-02 09:01",
//     amount: 9.9
//   }
// ];
// localStorage.setItem('tarot_orders', JSON.stringify(testOrders));
const OrderRecord: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  
  // 模拟从本地存储加载订单数据
  useEffect(() => {
    const savedOrders = localStorage.getItem('tarot_orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error('Failed to parse orders from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 头部 */}
      <header className="p-4 border-b border-gray-800 flex items-center relative">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <h1 className="text-xl font-medium flex-1 text-center">订单记录</h1>
      </header>

      {/* 内容区域 */}
      <div className="flex-1 p-4">
        {orders.length === 0 ? (
          // 空状态
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-32 h-32 mb-4">
              <img 
                src="/cat-wizard.png" 
                alt="空状态图标"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-gray-400">空空如也</p>
          </div>
        ) : (
          // 订单列表
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-gray-800 rounded-lg p-4"
              >
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>订单号: {order.id}</span>
                  <span>支付方式: {order.paymentMethod}</span>
                </div>
                <div className="font-medium mb-2">{order.productName}</div>
                <div className="flex justify-between text-sm">
                  <span>{order.time}</span>
                  <span className="text-yellow-500">实付款 ¥{order.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderRecord;