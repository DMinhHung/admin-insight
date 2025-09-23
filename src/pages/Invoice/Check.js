import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Form, Select, Image, InputNumber, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Check = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);

    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const hasFetched = useRef(false);
    const baseURL = process.env.REACT_APP_ADMIN_INSIGHT_URL;

    const api = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${token}` },
    });

    const fetchStockCheck = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/check${nameSearch ? `?name=${nameSearch}` : ''}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Cannot load stock check list');
            const result = await res.json();
            const items = result?.data?.items ?? [];
            setData(items.map(item => ({ ...item, key: item.id })));
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouse = async () => {
        try {
            const res = await api.get(`/api/v1/admin/invoice/warehouse`);
            setWarehouses(res?.data?.data?.items || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải kho');
        }
    };

    const fetchUser = async () => {
        try {
            const res = await api.get(`/api/v1/admin/user/form/view?id=${userId}`);
            setUser(res?.data?.data?.user || null);
        } catch (err) {
            message.error(err.message || 'Không thể tải user');
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/api/v1/admin/product/form`);
            setProducts(res?.data?.data?.items || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải sản phẩm');
        }
    };

    const generateCode = (length = 12) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchStockCheck();
        fetchUser();
        fetchWarehouse();
        fetchProduct();
    }, []);

    const handleSearch = () => fetchStockCheck(searchText);

    const handleCreate = () => {
        setEditingWarehouse(null);
        form.resetFields();
        setIsDrawerVisible(true);
        form.setFieldsValue({ code: generateCode(12), items: [] });
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/check/view?id=${record.key}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.data?.message || 'Cannot fetch data');

            const item = data?.data || {};
            setEditingWarehouse(item.id);
            form.setFieldsValue({
                code: item.code,
                warehouse_id: item.warehouse_id,
                status: item.status,
                note: item.note,
                items: item.items.map(it => ({
                    productId: it.product_id,
                    quantity: it.actual_quantity || 0,
                    note: it.note || ''
                })),
            });
            setIsDrawerVisible(true);
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const itemsPayload = (values.items || []).map(item => {
                const product = products.find(p => p.id === item.productId);
                const systemQuantity = product?.stock || 0;
                const actualQuantity = item.quantity || 0;
                return {
                    check_id: editingWarehouse || null,
                    product_id: item.productId,
                    actual_quantity: actualQuantity,
                    system_quantity: systemQuantity,
                    difference_quantity: actualQuantity - systemQuantity,
                    note: item.note || ''
                };
            });

            const payload = {
                code: values.code,
                warehouse_id: values.warehouse_id,
                user_id: userId,
                note: values.note || '',
                items: itemsPayload,
                id: editingWarehouse || undefined
            };

            const url = editingWarehouse
                ? `${baseURL}/api/v1/admin/invoice/check/update`
                : `${baseURL}/api/v1/admin/invoice/check/create`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.data?.message || 'Operation failed');

            message.success(editingWarehouse ? 'Cập nhật thành công' : 'Tạo thành công');
            setIsDrawerVisible(false);
            form.resetFields();
            setEditingWarehouse(null);
            fetchStockCheck();
        } catch (err) {
            message.error(err.message || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/check/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.message || 'Failed to delete');

            setData(prev => prev.filter(item => item.key !== id));
            message.success('Xóa thành công');
        } catch (err) {
            message.error(err.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Mã nhập hàng', dataIndex: 'code' },
        { title: 'Thời gian', dataIndex: 'created_at' },
        { title: 'Loại hóa đơn', dataIndex: 'type', render: type => type === 1 ? 'Nhập' : type === 2 ? 'Xuất' : 'Hủy' },
        { title: 'Mô tả', dataIndex: 'value' },
        { title: 'Trạng thái', dataIndex: 'status', render: value => value === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} />
                </Space>
            )
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={2}>Kiểm Kê Kho</Title></Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Search by name..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                            onPressEnter={handleSearch}
                        />
                        <Button type="primary" onClick={handleCreate}>Tạo</Button>
                    </Space>
                </Col>
            </Row>

            <Table columns={columns} dataSource={data} loading={loading} rowKey="key" />

            <Drawer
                title={editingWarehouse ? 'Sửa kiểm kê kho' : 'Tạo kiểm kê kho'}
                width={1500}
                onClose={() => { setIsDrawerVisible(false); form.resetFields(); setEditingWarehouse(null); }}
                open={isDrawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button onClick={() => { setIsDrawerVisible(false); form.resetFields(); setEditingWarehouse(null); }}>Hủy</Button>
                        <Button type="primary" onClick={handleDrawerSubmit}>{editingWarehouse ? 'Cập nhật' : 'Tạo'}</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical">
                    <Row gutter={32}>
                        <Col span={16}>
                            <Title level={5}>Danh sách sản phẩm</Title>
                            <Form.List name="items">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row
                                                key={key}
                                                gutter={12}
                                                align="middle"
                                                style={{
                                                    marginBottom: 12,
                                                    padding: 12,
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 6,
                                                    background: '#fafafa',
                                                }}
                                            >
                                                <Col span={2}>
                                                    <Form.Item {...restField} noStyle shouldUpdate>
                                                        {() => {
                                                            const productId = form.getFieldValue(['items', name, 'productId']);
                                                            const product = products.find(p => p.id === productId);
                                                            return product?.thumbnail ? (
                                                                <Image src={product.thumbnail} width={50} height={50} preview={false} />
                                                            ) : (
                                                                <div style={{ width: 50, height: 50, background: '#ccc', borderRadius: 4 }} />
                                                            );
                                                        }}
                                                    </Form.Item>
                                                </Col>

                                                <Col span={6}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'productId']}
                                                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Select placeholder="Chọn sản phẩm" showSearch optionFilterProp="children">
                                                            {products.map(p => (
                                                                <Select.Option key={p.id} value={p.id}>
                                                                    <span
                                                                        style={{
                                                                            display: 'inline-block',
                                                                            maxWidth: '140px',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                        title={p.name}
                                                                    >
                                                                        {p.name}
                                                                    </span>
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'quantity']}
                                                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <InputNumber min={0} placeholder="Hiện tại" style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item noStyle shouldUpdate>
                                                        {() => {
                                                            const productId = form.getFieldValue(['items', name, 'productId']);
                                                            const product = products.find(p => p.id === productId);
                                                            const systemQuantity = product?.stock || 0;
                                                            return <InputNumber value={systemQuantity} readOnly style={{ width: '100%' }} placeholder="Hệ thống" />;
                                                        }}
                                                    </Form.Item>
                                                </Col>

                                                <Col span={3}>
                                                    <Form.Item noStyle shouldUpdate>
                                                        {() => {
                                                            const productId = form.getFieldValue(['items', name, 'productId']);
                                                            const product = products.find(p => p.id === productId);
                                                            const systemQuantity = product?.stock ?? null;
                                                            const actualQuantity = form.getFieldValue(['items', name, 'quantity']) ?? null;

                                                            if (actualQuantity !== null && systemQuantity !== null) {
                                                                const difference = actualQuantity - systemQuantity;
                                                                return (
                                                                    <InputNumber
                                                                        value={difference}
                                                                        readOnly
                                                                        style={{
                                                                            width: '100%',
                                                                            color: difference < 0 ? 'red' : difference > 0 ? 'green' : 'black',
                                                                            fontWeight: 'bold',
                                                                        }}
                                                                        placeholder="Chênh lệch"
                                                                    />
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    </Form.Item>
                                                </Col>

                                                <Col span={5}>
                                                    <Form.Item {...restField} name={[name, 'note']} style={{ marginBottom: 0 }}>
                                                        <Input placeholder="Ghi chú" />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={2}>
                                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                                </Col>
                                            </Row>
                                        ))}

                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm sản phẩm mới
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Col>

                        <Col span={8}>
                            <Title level={5}>Thông tin hóa đơn</Title>
                            <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Nhập hoặc random' }]}>
                                <Input
                                    placeholder="Tự động / Nhập thủ công"
                                    addonAfter={<Button icon={<ReloadOutlined />} size="small" onClick={() => form.setFieldsValue({ code: generateCode(12) })} />}
                                />
                            </Form.Item>

                            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                                <Select placeholder="Chọn trạng thái">
                                    <Select.Option value={1}>Active</Select.Option>
                                    <Select.Option value={2}>Inactive</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="warehouse_id" label="Chọn Kho" rules={[{ required: true, message: 'Chọn kho' }]}>
                                <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                                    {warehouses.map(wh => <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Người tạo">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {user?.profile?.thumbnail ? <Image src={user.profile.thumbnail} width={32} height={32} style={{ borderRadius: '50%' }} preview={false} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }} />}
                                    <span>{user?.username || 'Unknown'}</span>
                                </div>
                            </Form.Item>

                            <Form.Item name="note" label="Ghi chú">
                                <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={6} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </div>
    );
};

export default Check;
