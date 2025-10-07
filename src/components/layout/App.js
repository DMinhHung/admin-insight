import React, { useState, Suspense } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  FundOutlined,
  ProductOutlined,
  SettingOutlined,
  BellOutlined,
  BlockOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
  FileDoneOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  FileImageOutlined
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiry');
    navigate("/login");
  };

  const getMenuKeys = (pathname) => {
    if (pathname.startsWith('/dashboard')) return { selectedKey: '1', openKeys: [] };
    if (pathname.startsWith('/brand')) return { selectedKey: '2', openKeys: [] };
    if (pathname.startsWith('/category')) return { selectedKey: '3', openKeys: [] };
    if (pathname.startsWith('/product-attribute')) return { selectedKey: '4-2', openKeys: ['4'] };
    if (pathname.startsWith('/product')) return { selectedKey: '4-1', openKeys: ['4'] };
    if (pathname.startsWith('/group-customer')) return { selectedKey: '5-3', openKeys: ['5'] };
    if (pathname.startsWith('/customer-company')) return { selectedKey: '5-2', openKeys: ['5'] };
    if (pathname.startsWith('/customer')) return { selectedKey: '5-1', openKeys: ['5'] };
    if (pathname.startsWith('/vendor')) return { selectedKey: '6-1', openKeys: ['6'] };
    if (pathname.startsWith('/group-vendor')) return { selectedKey: '6-2', openKeys: ['6'] };
    if (pathname.startsWith('/warehouse')) return { selectedKey: '7-1', openKeys: ['7'] };
    if (pathname.startsWith('/stock-invoice')) return { selectedKey: '7-2', openKeys: ['7'] };
    if (pathname.startsWith('/check-invoice')) return { selectedKey: '7-3', openKeys: ['7'] };
    if (pathname.startsWith('/employee')) return { selectedKey: '8', openKeys: [] };
    if (pathname.startsWith('/user')) return { selectedKey: '9', openKeys: [] };
    if (pathname.startsWith('/item-shopee-list')) return { selectedKey: '11-1', openKeys: [] };
    if (pathname.startsWith('/item-tiktok-list')) return { selectedKey: '11-2', openKeys: [] };
    if (pathname.startsWith('/banner')) return { selectedKey: '12', openKeys: [] };
    return { selectedKey: '1', openKeys: [] };
  };

  const { selectedKey, openKeys: defaultOpenKeys } = getMenuKeys(location.pathname);
  const [openKeys, setOpenKeys] = useState(defaultOpenKeys);

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
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          style={{
            fontSize: 18,
            padding: '0 12px',
            marginTop: 30,
          }}
          items={[
            {
              key: '1', icon: <FundOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: <Link to="/dashboard">Thống Kê</Link>
            },
            {
              key: '12', icon: <FileImageOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: <Link to="/banner">Hình Quảng Cáo</Link>
            },
            {
              key: '2', icon: <BlockOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: <Link to="/brand">Thương Hiệu</Link>
            },
            {
              key: '3', icon: <ApartmentOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: <Link to="/category">Danh Mục</Link>
            },
            {
              key: '4',
              icon: <AppstoreOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: 'Sản Phẩm',
              children: [
                { key: '4-1', label: <Link to="/product">Sản Phẩm</Link> },
                { key: '4-2', label: <Link to="/product-attribute">Thuộc Tính</Link> },
              ],
            },
            {
              key: '11',
              icon: <ProductOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: 'Sản Phẩm Mở Rộng',
              children: [
                { key: '11-1', label: <Link to="/item-shopee-list">Shopee</Link>, disabled: true },
                { key: '11-2', label: <Link to="/item-tiktok-list">TikTok</Link>, disabled: true },
              ],
            },
            {
              key: '5',
              icon: <UsergroupAddOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: 'Khách Hàng',
              children: [
                { key: '5-1', label: <Link to="/customer">Danh Sách</Link> },
                { key: '5-2', label: <Link to="/customer-company">Danh Sách Công Ty</Link> },
                { key: '5-3', label: <Link to="/group-customer">Nhóm Khách Hàng Công Ty</Link> },
              ],
            },
            {
              key: '6',
              icon: <UserSwitchOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: 'Nhà Cung Cấp',
              children: [
                { key: '6-1', label: <Link to="/vendor">Danh Sách</Link> },
                { key: '6-2', label: <Link to="/group-vendor">Nhóm Nhà Cung Cấp</Link> },
              ],
            },
            {
              key: '7',
              icon: <FileDoneOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: 'Kho Hàng',
              children: [
                { key: '7-1', label: <Link to="/warehouse">Kho</Link> },
                { key: '7-2', label: <Link to="/stock-invoice">Xuất Nhập Hủy Kho</Link> },
                { key: '7-3', label: <Link to="/check-invoice">Kiểm Kê Kho</Link> },
              ],
            },
            {
              key: '8',
              icon: <IdcardOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />,
              label: <Link to="/employee">Nhân Viên</Link>,
            },
            {
              key: '9', icon: <UserOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: <Link to="/user">Quản Lý Tài Khoản</Link>
            },
            {
              key: '10', icon: <SettingOutlined style={{
                height: 56,
                lineHeight: '56px',
                margin: '6px 0',
                borderRadius: 8,
              }} />, label: 'Setting', disabled: true
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
