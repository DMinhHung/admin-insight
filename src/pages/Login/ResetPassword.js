import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title } = Typography;

export const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const userId = location.state?.userId; // Lấy userId từ VerifyOtp

    if (!userId) {
        navigate('/login'); // Nếu ko có userId, quay về login
    }

    const onFinish = async (values) => {
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (values.password !== values.confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp!');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/update?id=${userId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: values.password }),
                }
            );

            const data = await res.json();
            if (!res.ok || !data.status) throw new Error(data.message || 'Reset password thất bại');

            setSuccess('Mật khẩu đã được cập nhật thành công!');
            setTimeout(() => navigate('/login'), 2000);
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
                minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16
            }
        },
        React.createElement(
            'div',
            { style: { width: 360, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } },
            React.createElement(Title, { level: 3, style: { textAlign: 'center' } }, 'Đặt lại mật khẩu'),
            error && React.createElement(Alert, { message: error, type: 'error', style: { marginBottom: 16 } }),
            success && React.createElement(Alert, { message: success, type: 'success', style: { marginBottom: 16 } }),
            React.createElement(
                Form,
                { layout: 'vertical', onFinish },
                React.createElement(
                    Form.Item,
                    { name: 'password', label: 'Mật khẩu mới', rules: [{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }] },
                    React.createElement(Input.Password, { placeholder: 'Nhập mật khẩu mới' })
                ),
                React.createElement(
                    Form.Item,
                    { name: 'confirmPassword', label: 'Xác nhận mật khẩu', rules: [{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }] },
                    React.createElement(Input.Password, { placeholder: 'Xác nhận mật khẩu mới' })
                ),
                React.createElement(
                    Form.Item,
                    null,
                    React.createElement(Button, { type: 'primary', htmlType: 'submit', block: true, loading }, 'Cập nhật mật khẩu')
                )
            )
        )
    );
};
