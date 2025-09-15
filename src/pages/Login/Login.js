import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function Login({}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const onLogin = async (values) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });  

      if (!res.ok) throw new Error('Đăng nhập thất bại');
      const data = await res.json();
      const token = data?.data?.user?.token;
      if (token) {
        localStorage.setItem('accessToken', token);
        onLogin?.(data);
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5',
      }}
    >
      <div
        style={{
          width: 320,
          padding: 24,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center' }}>
          Đăng nhập
        </Title>

        {error && (
          <Alert message={error} type="error" style={{ marginBottom: 16 }} />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onLogin}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
