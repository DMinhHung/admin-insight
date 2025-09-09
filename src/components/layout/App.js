import React, { useState, Suspense } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    RiseOutlined,
    ProductOutlined,
    TeamOutlined,
    SettingOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Dropdown, Spin, Badge, Drawer, List } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("User logged out");
        navigate("/login");
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
                    defaultSelectedKeys={['1']}
                    style={{ fontSize: 16, marginTop: 50 }}
                    items={[
                        { key: '1', icon: <RiseOutlined style={{ fontSize: 20 }} />, label: <Link to="/dashboard">Dashboard</Link>, style: { marginBottom: 12 }, },
                        { key: '2', icon: <ProductOutlined style={{ fontSize: 20 }} />, label: <Link to="/product">Product</Link>, style: { marginBottom: 12 }, },
                        { key: '3', icon: <UserOutlined style={{ fontSize: 20 }} />, label: <Link to="/user">User Manager</Link>, style: { marginBottom: 12 }, },
                        { key: '4', icon: <TeamOutlined style={{ fontSize: 20 }} />, label: <Link to="/customer">Customer</Link>, style: { marginBottom: 12 }, disabled: true },
                        { key: '5', icon: <SettingOutlined style={{ fontSize: 20 }} />, label: 'Setting', style: { marginBottom: 12 }, disabled: true },
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
                        {/* Chuông thông báo */}
                        <Badge count={notifications.length} size="small">
                            <BellOutlined
                                style={{ fontSize: 24, cursor: 'pointer' }}
                                onClick={() => setDrawerVisible(true)}
                            />
                        </Badge>

                        {/* Avatar */}
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

            {/* Drawer thông báo */}
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
