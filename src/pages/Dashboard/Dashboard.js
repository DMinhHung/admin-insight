import React, { useState, useMemo } from 'react';
import { Line, Column, Pie, Bar } from '@ant-design/plots';
import { Select } from 'antd';

const { Option } = Select;

const Dashboard = () => {
  const [period, setPeriod] = useState('today');

  const revenueData = {
    today: [
      { time: '00-06h', revenue: 1_200_000 },
      { time: '06-12h', revenue: 3_500_000 },
      { time: '12-18h', revenue: 4_800_000 },
      { time: '18-24h', revenue: 2_700_000 },
    ],
    '7days': [
      { time: 'Mon', revenue: 5_000_000 },
      { time: 'Tue', revenue: 6_200_000 },
      { time: 'Wed', revenue: 4_500_000 },
      { time: 'Thu', revenue: 8_000_000 },
      { time: 'Fri', revenue: 7_200_000 },
      { time: 'Sat', revenue: 9_000_000 },
      { time: 'Sun', revenue: 6_500_000 },
    ],
    month: Array.from({ length: 30 }).map((_, i) => ({
      time: `Ngày ${i + 1}`,
      revenue: Math.floor(Math.random() * 8_000_000 + 2_000_000),
    })),
  };

  const topProducts = [
    { product: 'Laptop Dell XPS', sold: 120 },
    { product: 'MacBook Air M2', sold: 100 },
    { product: 'Asus ROG', sold: 95 },
    { product: 'HP Omen', sold: 80 },
    { product: 'Lenovo ThinkPad', sold: 60 },
  ];

  const orderStatus = [
    { type: 'Hoàn thành', value: 420 },
    { type: 'Đang xử lý', value: 80 },
    { type: 'Đã hủy', value: 30 },
  ];

  const revenueConfig = useMemo(() => ({
    data: revenueData[period],
    xField: 'time',
    yField: 'revenue',
    color: '#1677ff',
    point: { size: 4 },
    height: 220,
    yAxis: {
      label: { formatter: v => `${(v / 1_000_000).toFixed(1)}tr` },
    },
    tooltip: { formatter: d => ({ name: 'Doanh thu', value: d.revenue.toLocaleString() + ' đ' }) },
  }), [period]);

  const topProductConfig = {
    data: topProducts,
    xField: 'product',
    yField: 'sold',
    color: '#52c41a',
    height: 220,
    columnWidthRatio: 0.6,
  };

  const orderConfig = {
    data: orderStatus,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    height: 220,
    legend: { position: 'bottom' },
    label: {
      content: item => {
        const total = orderStatus.reduce((s, i) => s + i.value, 0);
        return `${item.type}: ${((item.value / total) * 100).toFixed(1)}%`;
      },
    },
  };

  return (
    <div style={{ padding: 20, background: '#f5f5f5'}}>
      <div style={{
        marginTop: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))',
        gap: 20
      }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Doanh thu</h4>
            <Select value={period} onChange={setPeriod} size="small" style={{ width: 120 }}>
              <Option value="today">Hôm nay</Option>
              <Option value="7days">7 ngày</Option>
              <Option value="month">1 tháng</Option>
            </Select>
          </div>
          <Line {...revenueConfig} />
        </div>

        {/* <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <h4>Top sản phẩm</h4>
          <Column {...topProductConfig} />
        </div> */}

        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <h4>Trạng thái đơn hàng</h4>
          <Pie {...orderConfig} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
