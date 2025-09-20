import React, { useState, Suspense, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  RiseOutlined,
  ProductOutlined,
  SettingOutlined,
  BellOutlined,
  BlockOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
  FileDoneOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import {
  Button,
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Spin,
  Badge,
  Drawer,
  List
} from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
  };

  const pathKeyMap = {
    '/dashboard': '1',
    '/brand': '2',
    '/category': '3',
    '/product': '4-1',
    '/product-attribute': '4-2',
    '/product-variant': '4-3',
    '/customer': '5',
    '/vendor': '6-1',
    '/vendor': '6-2',
    '/vendor': '6-3',
    '/invoice': '7',
    '/user': '8',
  };

  const menuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const notifications = [
    'New user registered',
    'New order received',
    'Server downtime alert',
  ];

  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    if (location.pathname.startsWith('/product')) {
      setOpenKeys(['4']);
    }
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" width={300}>
        <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.3)" }}>
          <div
            style={{
              height: 48,
              margin: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 25,
              fontWeight: "bold",
              color: "#1677ff",
              letterSpacing: 1,
              borderRadius: 8,
            }}
          >
            {collapsed ? null : "Admin Insight"}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[pathKeyMap[location.pathname] || '1']}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          style={{ fontSize: 16, marginTop: 50 }}
          items={[
            {
              key: '1',
              icon: <RiseOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/dashboard">Dashboard</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '2',
              icon: <BlockOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/brand">Thương Hiệu</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '3',
              icon: <ApartmentOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/category">Danh Mục</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '4',
              icon: <ProductOutlined style={{ fontSize: 20 }} />,
              label: 'Sản Phẩm',
              style: { marginBottom: 12 },
              children: [
                { key: '4-1', label: <Link to="/product">Sản Phẩm</Link> },
                { key: '4-2', label: <Link to="/product-attribute">Thuộc Tính</Link> },
              ],
            },
            {
              key: '5',
              icon: <UsergroupAddOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/customer">Khách Hàng</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '6',
              icon: <UserSwitchOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/vendor">Nhập Hàng</Link>,
              style: { marginBottom: 12 },
              children: [
                { key: '6-1', label: <Link to="/vendor">Nhà Cung Cấp</Link> },
                { key: '6-1', label: <Link to="/nhap-hang">Nhập Hàng</Link> },
                { key: '6-2', label: <Link to="/tra-hang-nhap">Trả Hàng Nhập</Link> },
              ],
            },
            {
              key: '7',
              icon: <FileDoneOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/invoice">Kho Hàng</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '8',
              icon: <UserOutlined style={{ fontSize: 20 }} />,
              label: <Link to="/user">Quản Lý Người Dùng</Link>,
              style: { marginBottom: 12 },
            },
            {
              key: '9',
              icon: <SettingOutlined style={{ fontSize: 20 }} />,
              label: 'Setting',
              style: { marginBottom: 12 },
              disabled: true,
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={notifications.length} size="small">
              <BellOutlined
                style={{ fontSize: 24, cursor: 'pointer' }}
                onClick={() => setDrawerVisible(true)}
              />
            </Badge>

            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <Avatar
                style={{ cursor: "pointer", backgroundColor: "#87d068" }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Suspense
            fallback={
              <div style={{ textAlign: "center", marginTop: 50 }}>
                <Spin size="large" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </Content>
      </Layout>

      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={350}
      >
        <List
          dataSource={notifications}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Drawer>
    </Layout>
  );
};

export default App;
