import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Form, Select, Image, InputNumber, Drawer, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Tabs } from 'antd';

const { Title } = Typography;
const { TabPane } = Tabs

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
            const res = await api.get(`/api/v1/admin/product/item-variant/list`);
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
                    product_variant_id: it.product_variant_id,
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
                const product = products.find(p => p.id === item.product_variant_id);
                const systemQuantity = product?.stock || 0;
                const actualQuantity = item.quantity || 0;
                return {
                    check_id: editingWarehouse || null,
                    product_variant_id: item.product_variant_id,
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
            title: 'Hành động', key: 'actions', render: (_, record) => (
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
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Thông tin phiếu" key="1">
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Nhập hoặc random' }]}>
                                        <Input
                                            placeholder="Tự động / Nhập thủ công"
                                            addonAfter={<Button icon={<ReloadOutlined />} size="small" onClick={() => form.setFieldsValue({ code: generateCode(12) })} />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name="status"
                                        label="Trạng thái"
                                        rules={[{ required: true, message: 'Select status' }]}
                                    >
                                        <Select placeholder="Select status" style={{ width: '100%' }}>
                                            <Select.Option value={1}>
                                                <span><Tag color="green">Hoạt động</Tag></span>
                                            </Select.Option>
                                            <Select.Option value={0}>
                                                <span><Tag color="red">Ngưng hoạt động</Tag></span>
                                            </Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="warehouse_id" label="Chọn Kho" rules={[{ required: true, message: 'Chọn kho' }]}>
                                        <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                                            {warehouses.map(wh => <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Người tạo">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {user?.profile?.thumbnail ? <Image src={user.profile.thumbnail} width={32} height={32} style={{ borderRadius: '50%' }} preview={false} /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }} />}
                                            <span>{user?.username || 'Unknown'}</span>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="note" label="Ghi chú">
                                <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={4} />
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Danh sách sản phẩm" key="2">
                        <Form form={form} layout="vertical">
                            <Form.List name="items">
                                {(fields, { add, remove }) => (
                                    <>
                                        <Row gutter={[16, 16]}>
                                            {fields.map(({ key, name, ...restField }) => {
                                                const item = form.getFieldValue('items')[name];
                                                const variant = products.find(p => p.id === item?.product_variant_id);

                                                const quantity = item?.quantity || 0;
                                                const price = variant?.price || 0;
                                                const total = quantity * price;

                                                return (
                                                    <Col key={key} xs={24} sm={12} md={8} lg={6}>
                                                        <Card
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                            title={variant?.name || 'Sản phẩm mới'}
                                                            extra={
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => remove(name)}
                                                                />
                                                            }
                                                            bodyStyle={{ padding: 16 }}
                                                        >
                                                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                                                {variant?.thumbnail ? (
                                                                    <Image src={variant.thumbnail} width={60} height={60} preview={false} />
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            width: 60,
                                                                            height: 60,
                                                                            background: '#f0f0f0',
                                                                            borderRadius: 4,
                                                                            margin: '0 auto',
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Chọn sản phẩm */}
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'product_variant_id']}
                                                                label="Sản phẩm"
                                                                rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                                            >
                                                                <Select
                                                                    placeholder="Chọn sản phẩm"
                                                                    onChange={(val) => {
                                                                        const selected = products.find(p => p.id === val);
                                                                        const updatedItems = form.getFieldValue('items').map((it, idx) =>
                                                                            idx === name
                                                                                ? {
                                                                                    ...it,
                                                                                    product_variant_id: selected.id,
                                                                                    quantity: 1,
                                                                                }
                                                                                : it
                                                                        );
                                                                        form.setFieldsValue({ items: updatedItems });
                                                                    }}
                                                                >
                                                                    {products.map(p => (
                                                                        <Select.Option key={p.id} value={p.id}>
                                                                            {p.name}
                                                                        </Select.Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>

                                                            {/* Số lượng */}
                                                            <Form.Item {...restField} name={[name, 'quantity']} label="Số lượng">
                                                                <InputNumber
                                                                    min={0}
                                                                    style={{ width: '100%' }}
                                                                    value={quantity}
                                                                    onChange={(val) => {
                                                                        const updatedItems = form.getFieldValue('items').map((it, idx) =>
                                                                            idx === name ? { ...it, quantity: val } : it
                                                                        );
                                                                        form.setFieldsValue({ items: updatedItems });
                                                                    }}
                                                                />
                                                            </Form.Item>

                                                            {/* Giá tiền */}
                                                            <Form.Item label="Giá tiền">
                                                                <InputNumber value={price} readOnly style={{ width: '100%' }} />
                                                            </Form.Item>

                                                            {/* Tổng tiền */}
                                                            <Form.Item label="Tổng tiền">
                                                                <InputNumber value={total} readOnly style={{ width: '100%', background: '#f5f5f5' }} />
                                                            </Form.Item>
                                                        </Card>
                                                    </Col>
                                                );
                                            })}
                                        </Row>

                                        <Form.Item style={{ marginTop: 16 }}>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Thêm sản phẩm mới
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form>
                    </Tabs.TabPane>
                </Tabs>
            </Drawer>
        </div>
    );
};

export default Check;
