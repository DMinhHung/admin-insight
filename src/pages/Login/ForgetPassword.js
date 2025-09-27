import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/forget-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: values.email }),
                }
            );

            const data = await res.json();
            if (!res.ok || !data.status) throw new Error(data.message || 'Gửi OTP thất bại');
            setSuccess('Mã OTP đã được gửi, vui lòng kiểm tra email.');

            setTimeout(() => {
                navigate('/verify-otp', { state: { email: values.email } });
            }, 2000);
        } catch (e) {
            setError(e.message || 'Đã xảy ra lỗi.');
        } finally {
            setLoading(false);
        }
    };

    return React.createElement(
        'div',
        {
            style: {
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
            },
        },
        React.createElement(
            'div',
            {
                style: {
                    width: 360,
                    background: '#fff',
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
            },
            React.createElement(Title, { level: 3, style: { textAlign: 'center' } }, 'Quên mật khẩu'),
            error && React.createElement(Alert, { message: error, type: 'error', style: { marginBottom: 16 } }),
            success && React.createElement(Alert, { message: success, type: 'success', style: { marginBottom: 16 } }),
            React.createElement(
                Form,
                { layout: 'vertical', onFinish },
                React.createElement(
                    Form.Item,
                    {
                        name: 'email',
                        label: 'Nhập email',
                        rules: [
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ],
                    },
                    React.createElement(Input, { placeholder: 'example@gmail.com' })
                ),
                React.createElement(
                    Form.Item,
                    null,
                    React.createElement(
                        Button,
                        { type: 'primary', htmlType: 'submit', block: true, loading },
                        'Gửi mã OTP'
                    )
                )
            )
        )
    );
};
