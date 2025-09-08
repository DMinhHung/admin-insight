import React, { useState, Suspense } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Dropdown, Spin } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.3)" }}>
                    <img
                        src="/logo192.png"
                        alt="Logo"
                        style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        {
                            key: '1',
                            icon: <VideoCameraOutlined />,
                            label: <Link to="/dashboard">Dashboard</Link>,
                        },
                        {
                            key: '2',
                            icon: <VideoCameraOutlined />,
                            label: <Link to="/product">Product</Link>,
                        },
                        {
                            key: '3',
                            icon: <UserOutlined />,
                            label: <Link to="/user">User Manager</Link>,
                        },
                        {
                            key: '4',
                            icon: <UploadOutlined />,
                            label: 'Setting',
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
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                        <Avatar
                            style={{ cursor: "pointer", backgroundColor: "#87d068" }}
                            icon={<UserOutlined />}
                        />
                    </Dropdown>
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
                    {/* Loading khi chuyển trang */}
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
        </Layout>
    );
};

export default App;
