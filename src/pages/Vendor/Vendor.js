import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Modal, Form, Upload, Collapse, Radio, Card, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const Vendor = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [customerForm] = Form.useForm();
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [thumbnailList, setThumbnailList] = useState([]);
    const token = localStorage.getItem('accessToken');
    const hasFetched = useRef(false);

    const api = axios.create({
        baseURL: process.env.REACT_APP_ADMIN_INSIGHT_URL,
        headers: { Authorization: `Bearer ${token}` },
    });

    const generateCode = (length = 12) => {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    };

    const fetchCustomers = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/admin/customer/list${nameSearch ? `?name=${nameSearch}` : ''}`);
            const customers = res?.data?.data?.items || [];
            setData(
                customers.map(c => ({
                    key: c.id,
                    code: c.code,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    gender: c.gender,
                    company: c.company,
                    tax_code: c.tax_code,
                    cccd: c.cccd,
                    debt: c.debt,
                    total_sales: c.total_sales,
                }))
            );
        } catch (err) {
            message.error(err.message || 'Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchCustomers();
    }, []);

    const handleSearch = () => fetchCustomers(searchText);

    const handleCreate = () => {
        setEditingCustomer(null);
        customerForm.resetFields();
        customerForm.setFieldsValue({
            code: generateCode(12),
        });
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/admin/customer/view`, { params: { id: record.key } });
            const customer = res?.data?.data || {};
            customerForm.setFieldsValue(customer);
            setEditingCustomer(customer.id);
            setIsModalVisible(true);
        } catch (err) {
            message.error(err.message || 'Không thể lấy dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await customerForm.validateFields();
            setLoading(true);
            let url = editingCustomer
                ? '/api/v1/admin/customer/update'
                : '/api/v1/admin/customer/create';
            if (editingCustomer) values.id = editingCustomer;

            const res = await api.post(url, values);
            const dataRes = res.data;
            if (!dataRes.status) {
                message.error(dataRes.message || 'Thao tác thất bại');
                return;
            }
            message.success(editingCustomer ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setIsModalVisible(false);
            customerForm.resetFields();
            setEditingCustomer(null);
            fetchCustomers();
        } catch (err) {
            message.error(err.message || 'Validate failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await api.post(`/api/v1/admin/customer/delete`, { id });
            if (!res.data) throw new Error('Xóa thất bại');
            setData(prev => prev.filter(item => item.key !== id));
            message.success('Đã xóa thành công');
        } catch (err) {
            message.error(err.message || 'Xóa thất bại');
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (record) => {
        confirm({
            title: 'Bạn có chắc muốn xóa khách hàng này?',
            content: `Tên: ${record.name}`,
            okText: 'Xác nhận',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() { return handleDelete(record.key); },
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        customerForm.resetFields();
        setEditingCustomer(null);
        setThumbnailList([]);
    };

    const columns = [
        { title: 'Mã Khách hàng', dataIndex: 'code', sorter: (a, b) => a.code.localeCompare(b.code) },
        { title: 'Tên khách hàng', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Điện thoại', dataIndex: 'phone', sorter: (a, b) => a.phone.localeCompare(b.phone) },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Giới tính', dataIndex: 'gender', render: g => g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : '-' },
        { title: 'Công ty', dataIndex: 'company' },
        { title: 'Mã số thuế', dataIndex: 'tax_code' },
        { title: 'CCCD', dataIndex: 'cccd' },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)}>Xoá</Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={2}>Nhà Cung Cấp</Title></Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm theo tên..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                            onPressEnter={handleSearch}
                        />
                        <Button type="primary" onClick={handleCreate}>Tạo mới</Button>
                    </Space>
                </Col>
            </Row>
            <Table columns={columns} dataSource={data} loading={loading} />

            <Modal
                className="product-modal"
                open={isModalVisible}
                width="90vw"
                style={{ maxWidth: '1200px', overflowX: 'hidden' }}
                bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden', paddingRight: 24 }}
                onCancel={handleModalCancel}
                onOk={handleModalOk}
                maskClosable={false}
            >
                <Form form={customerForm} layout="vertical" style={{ width: '100%' }}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="code" label="Mã nhà cung cấp" rules={[{ required: true }]}><Input
                            placeholder="Tự động / Nhập thủ công"
                            addonAfter={
                                <Button
                                    icon={<ReloadOutlined />}
                                    size="small"
                                    onClick={() => customerForm.setFieldsValue({ code: generateCode(12) })}
                                />
                            }
                        /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="phone" label="Điện thoại"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                    </Row>

                    <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 16 }}>
                        <Collapse ghost>
                            <Collapse.Panel header="Địa chỉ" key="1">
                                <Row gutter={16}>
                                    <Col span={8}><Form.Item name="province" label="Tỉnh/Thành phố"><Input /></Form.Item></Col>
                                    <Col span={8}><Form.Item name="district" label="Quận/Huyện"><Input /></Form.Item></Col>
                                    <Col span={8}><Form.Item name="ward" label="Phường/Xã"><Input /></Form.Item></Col>
                                </Row>
                                <Form.Item name="address" label="Địa chỉ chi tiết"><Input.TextArea rows={2} /></Form.Item>
                            </Collapse.Panel>
                        </Collapse>
                    </Card>

                    <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 16 }}>
                        <Collapse ghost>
                            <Collapse.Panel header="Nhóm nhà cung cấp & ghi chú" key="2">
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="customer_group" label="Nhóm khách hàng"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item></Col>
                                </Row>
                            </Collapse.Panel>
                        </Collapse>
                    </Card>

                    <Card style={{ borderRadius: 8, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 16 }}>
                        <Collapse ghost>
                            <Collapse.Panel header="Thông tin xuất hóa đơn" key="3">
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="tax_code" label="Mã số thuế"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="company" label="Tên công ty"><Input /></Form.Item></Col>
                                </Row>
                            </Collapse.Panel>
                        </Collapse>
                    </Card>
                </Form>
            </Modal>
        </div>
    );
};

export default Vendor;
