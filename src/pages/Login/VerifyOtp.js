import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const VerifyOtp = () => {
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
                `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/verify-otp`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ otp: values.otp }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.status) throw new Error(data.message || 'Xác minh OTP thất bại');

            const userId = data?.data?.user_id;
            if (!userId) throw new Error('Không tìm thấy user_id');

            setSuccess('Xác minh thành công! Chuyển sang đặt lại mật khẩu...');

            setTimeout(() => {
                navigate('/reset-password', { state: { userId } });
            }, 1500);
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
            React.createElement(Title, { level: 3, style: { textAlign: 'center' } }, 'Xác minh OTP'),
            error && React.createElement(Alert, { message: error, type: 'error', style: { marginBottom: 16 } }),
            success && React.createElement(Alert, { message: success, type: 'success', style: { marginBottom: 16 } }),
            React.createElement(
                Form,
                { layout: 'vertical', onFinish },
                React.createElement(
                    Form.Item,
                    {
                        name: 'otp',
                        label: 'Nhập mã OTP',
                        rules: [
                            { required: true, message: 'Vui lòng nhập OTP!' },
                            { len: 6, message: 'OTP gồm 6 chữ số' },
                        ],
                    },
                    React.createElement(Input, { placeholder: 'Nhập 6 số OTP', maxLength: 6 })
                ),
                React.createElement(
                    Form.Item,
                    null,
                    React.createElement(
                        Button,
                        { type: 'primary', htmlType: 'submit', block: true, loading },
                        'Xác minh'
                    )
                )
            )
        )
    );
};
