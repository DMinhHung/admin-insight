import React, { useState, useMemo } from 'react';
import { Line, Pie } from '@ant-design/plots';
import { Tabs, Select } from 'antd';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

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

  const orderStatus = [
    { type: 'Hoàn thành', value: 420 },
    { type: 'Đang xử lý', value: 80 },
    { type: 'Đã hủy', value: 30 },
  ];

  const revenueConfig = useMemo(
    () => ({
      data: revenueData[period],
      xField: 'time',
      yField: 'revenue',
      color: '#1677ff',
      point: { size: 4 },
      height: 220,
      yAxis: {
        label: { formatter: v => `${(v / 1_000_000).toFixed(1)}tr` },
      },
      tooltip: {
        formatter: d => ({
          name: 'Doanh thu',
          value: d.revenue.toLocaleString() + ' đ',
        }),
      },
    }),
    [period],
  );

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

  // Thẻ thống kê đầu trang
  const stats = [
    {
      title: 'DANH MỤC',
      value: 4,
      icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
      borderColor: '#1890ff',
    },
    {
      title: 'SẢN PHẨM',
      value: 16,
      icon: <ShoppingOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
      borderColor: '#52c41a',
    },
    {
      title: 'ĐƠN HÀNG',
      value: 12,
      icon: <ProfileOutlined style={{ fontSize: 28, color: '#13c2c2' }} />,
      borderColor: '#13c2c2',
    },
    {
      title: 'BÀI VIẾT',
      value: 3,
      icon: <FileTextOutlined style={{ fontSize: 28, color: '#faad14' }} />,
      borderColor: '#faad14',
    },
  ];

  return (
    <div style={{ padding: 20}}>
      <h2 style={{ marginBottom: 16 }}>Bảng điều khiển</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              borderLeft: `4px solid ${s.borderColor}`,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))',
          gap: 20,
        }}
      >
        <div
          style={{ background: '#fff', padding: 16, borderRadius: 8 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h4>Doanh thu</h4>
            <Select
              value={period}
              onChange={setPeriod}
              size="small"
              style={{ width: 120 }}
            >
              <Option value="today">Hôm nay</Option>
              <Option value="7days">7 ngày</Option>
              <Option value="month">1 tháng</Option>
            </Select>
          </div>
          <Line {...revenueConfig} />
        </div>

        <div
          style={{ background: '#fff', padding: 16, borderRadius: 8 }}
        >
          <h4>Trạng thái đơn hàng</h4>
          <Pie {...orderConfig} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
