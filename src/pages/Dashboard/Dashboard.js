import React from "react";
import { Column, Line, Pie } from '@ant-design/plots';

const Dashboard = () => {
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 2000 },
    { month: 'Apr', sales: 2780 },
    { month: 'May', sales: 1890 },
    { month: 'Jun', sales: 2390 },
  ];

  const visitorsData = [
    { day: 'Mon', visitors: 200 },
    { day: 'Tue', visitors: 450 },
    { day: 'Wed', visitors: 300 },
    { day: 'Thu', visitors: 500 },
    { day: 'Fri', visitors: 400 },
  ];

  const orderStatusData = [
    { type: 'Completed', value: 400 },
    { type: 'Pending', value: 100 },
    { type: 'Cancelled', value: 50 },
  ];

  const salesConfig = {
    data: salesData,
    xField: 'month',
    yField: 'sales',
    color: '#1677ff',
  };

  const visitorsConfig = {
    data: visitorsData,
    xField: 'day',
    yField: 'visitors',
    color: '#ff7300',
    point: { size: 5, shape: 'diamond' },
  };

  const orderConfig = {
    data: orderStatusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      content: (item) => `${item.type}: ${((item.value / orderStatusData.reduce((a,b)=>a+b.value,0))*100).toFixed(1)}%`,
    },
    legend: { position: 'bottom' },
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Xin chào quản trị viên</h2>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ flex: '1 1 300px', background: '#fff', padding: 20, borderRadius: 8 }}>
          <h4>Doanh thu theo tháng</h4>
          <Column {...salesConfig} />
        </div>

        <div style={{ flex: '1 1 300px', background: '#fff', padding: 20, borderRadius: 8 }}>
          <h4>Lượt truy cập theo ngày</h4>
          <Line {...visitorsConfig} />
        </div>

        <div style={{ flex: '1 1 300px', background: '#fff', padding: 20, borderRadius: 8 }}>
          <h4>Trạng thái đơn hàng</h4>
          <Pie {...orderConfig} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
