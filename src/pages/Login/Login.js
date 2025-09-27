import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (token && expiryTime && Date.now() < parseInt(expiryTime)) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onLogin = async (values) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) throw new Error('Đăng nhập thất bại');
      const data = await res.json();
      const token = data?.data?.user?.token;

      if (token) {
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('tokenExpiry', expiryTime);
        const userId = data?.data?.user?.id;
        if (userId) localStorage.setItem('userId', userId);
        navigate('/dashboard');
      }
    } catch (e) {
      setError(e.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        {/* Logo / Title */}
        <div style={{ marginBottom: 24 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="logo"
            style={{ width: 80, marginBottom: 12 }}
          />
          <Title level={3} style={{ margin: 0, color: '#333' }}>
            Đăng nhập
          </Title>
          <Text type="secondary">Chào mừng bạn trở lại 👋</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, textAlign: 'left' }}
          />
        )}

        <Form
          name="login"
          onFinish={onLogin}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={<Text strong>Email</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              size="large"
              placeholder="admin@example.com"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Mật khẩu</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              size="large"
              placeholder="••••••"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
            style={{
              borderRadius: 8,
              background: 'linear-gradient(90deg,#6a11cb,#2575fc)',
              border: 'none',
              fontWeight: 'bold',
            }}
          >
            Đăng nhập
          </Button>
        </Form>

        <div style={{ marginTop: 24 }}>
          <Text type="secondary">
            Quên mật khẩu?{' '}
            <a href="/forgot-password" style={{ color: '#2575fc', fontWeight: 500 }}>
              Khôi phục ngay
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
}
