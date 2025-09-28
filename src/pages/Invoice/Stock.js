import React, { useState, useEffect, useRef } from 'react';
import {
    Table,
    Typography,
    Input,
    Button,
    Space,
    message,
    Row,
    Col,
    Tag,
    Drawer,
    Form,
    Select,
    Image,
    InputNumber,
    Modal,
    Tabs,
    Card
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm: modalConfirm } = Modal;

const Stock = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [vendors, setVendors] = useState([]);
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

    const generateCode = (length = 12) =>
        Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

    const fetchStockInvoice = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/api/v1/admin/invoice/stock${nameSearch ? `?name=${nameSearch}` : ''}`);
            const items = res?.data?.data?.items || [];
            setData(items.map(item => ({ ...item, key: item.id })));
        } catch (err) {
            message.error(err.message || 'Không tải được phiếu kho');
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouse = async () => {
        try {
            const res = await api.get('/api/v1/admin/invoice/warehouse');
            setWarehouses(res?.data?.data?.items || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải kho');
        }
    };

    const fetchVendor = async () => {
        try {
            const res = await api.get('/api/v1/admin/supplier/form');
            setVendors(res?.data?.data?.items || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải nhà cung cấp');
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
            const res = await api.get('/api/v1/admin/product/item-variant/list');
            setProducts(res?.data?.data?.items || []);
        } catch (err) {
            message.error(err.message || 'Không thể tải sản phẩm');
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchStockInvoice();
        fetchProduct();
        fetchUser();
        fetchVendor();
        fetchWarehouse();
    }, []);

    const handleSearch = () => fetchStockInvoice(searchText);

    const handleCreate = () => {
        setEditingInvoice(null);
        form.resetFields();
        form.setFieldsValue({ code: generateCode(12), items: [] });
        setIsDrawerOpen(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/admin/invoice/stock/view`, { params: { id: record.key } });
            const invoice = res?.data?.data;
            if (!invoice) throw new Error('Cannot fetch invoice');

            setEditingInvoice(invoice.id);

            const itemsWithOld = invoice.items.map(item => ({
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                product_variant: item.product_variant || [],
            }));

            form.setFieldsValue({
                code: invoice.code,
                type: invoice.type,
                warehouse_id: invoice.warehouse_id,
                note: invoice.note,
                status: invoice.status,
                vendor_id: invoice.vendor_id,
                items: itemsWithOld,
            });

            setIsDrawerOpen(true);
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const itemsWithDelta = (values.items || []).map(item => ({
                invoice_id: editingInvoice || null,
                product_variant_id: item.product_variant_id,
                warehouse_id: values.warehouse_id || null,
                quantity: item.quantity || 0,
                price: item.price || 0,
                total: (item.quantity || 0) * (item.price || 0),
            }));

            const payload = {
                code: values.code,
                type: values.type,
                warehouse_id: values.warehouse_id || null,
                user_id: userId,
                vendor_id: values.vendor_id || null,
                note: values.note,
                status: values.status || 1,
                items: itemsWithDelta,
                id: editingInvoice || undefined,
            };

            const url = editingInvoice
                ? '/api/v1/admin/invoice/stock/update'
                : '/api/v1/admin/invoice/stock/create';

            const res = await api.post(url, payload);
            if (!res.data.status) throw new Error(res.data.message || 'Thao tác thất bại');

            message.success(editingInvoice ? 'Cập nhật phiếu thành công' : 'Tạo phiếu thành công');
            setIsDrawerOpen(false);
            form.resetFields();
            setEditingInvoice(null);
            fetchStockInvoice();
        } catch (err) {
            message.error(err.message || 'Validate failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await api.post('/api/v1/admin/invoice/stock/delete', { id });
            if (!res.data.status) throw new Error(res.data.message || 'Xóa thất bại');

            setData(prev => prev.filter(item => item.key !== id));
            message.success('Xóa phiếu thành công');
        } catch (err) {
            message.error(err.message || 'Xóa thất bại');
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (record) => {
        modalConfirm({
            title: 'Xác nhận xóa phiếu?',
            content: `Code: ${record.code}`,
            okText: 'Xác nhận',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                return handleDelete(record.key);
            },
        });
    };

    const columns = [
        { title: 'Mã phiếu', dataIndex: 'code' },
        { title: 'Thời gian', dataIndex: 'created_at' },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'vendor',
            render: v => v?.[0]?.name || 'Không có',
        },
        {
            title: 'Loại hóa đơn',
            dataIndex: 'type',
            render: t => t === 1 ? 'Nhập Kho' : t === 2 ? 'Xuất Kho' : t === 3 ? 'Hủy Kho' : 'Không xác định',
        },
        { title: 'Ghi chú', dataIndex: 'note' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: val => val === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng hoạt động</Tag>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={2}>Xuất Nhập Kho</Title></Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm code..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={handleCreate}>Tạo mới</Button>
                    </Space>
                </Col>
            </Row>

            <Table columns={columns} dataSource={data} loading={loading} rowKey="key" />

            <Drawer
                title={editingInvoice ? 'Sửa Phiếu Kho' : 'Tạo Phiếu Kho'}
                open={isDrawerOpen}
                onClose={() => { setIsDrawerOpen(false); form.resetFields(); setEditingInvoice(null); }}
                width={1500}
                maskClosable={false}
                bodyStyle={{ paddingBottom: 24 }}
                extra={
                    <Space>
                        <Button onClick={() => { setIsDrawerOpen(false); form.resetFields(); setEditingInvoice(null); }}>Hủy</Button>
                        <Button type="primary" loading={loading} onClick={handleDrawerOk}>{editingInvoice ? 'Cập nhật' : 'Tạo'}</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical">
                    <Tabs defaultActiveKey="1" type="card">
                        <Tabs.TabPane tab="Thông tin phiếu" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                                        <Input
                                            addonAfter={<Button icon={<ReloadOutlined />} size="small" onClick={() => form.setFieldsValue({ code: generateCode(8) })} />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="type" label="Loại hóa đơn" rules={[{ required: true }]}>
                                        <Select placeholder="Chọn loại hóa đơn">
                                            <Select.Option value={1}>Nhập Kho</Select.Option>
                                            <Select.Option value={2}>Xuất Kho</Select.Option>
                                            <Select.Option value={3}>Hủy Kho</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="vendor_id" label="Nhà Cung Cấp" rules={[{ required: true }]}>
                                        <Select placeholder="Chọn nhà cung cấp" showSearch optionFilterProp="children">
                                            {vendors.map(v => <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="warehouse_id" label="Chọn Kho" rules={[{ required: true }]}>
                                        <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                                            {warehouses.map(wh => <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                                        <Select>
                                            <Select.Option value={1}><Tag color="green">Hoạt động</Tag></Select.Option>
                                            <Select.Option value={0}><Tag color="red">Ngưng hoạt động</Tag></Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Người tạo">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {user?.profile?.thumbnail
                                                ? <Image src={user.profile.thumbnail} width={32} height={32} style={{ borderRadius: '50%' }} preview={false} />
                                                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }} />}
                                            <span>{user?.username || 'Unknown'}</span>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="note" label="Ghi chú">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Danh sách sản phẩm" key="2">
                            <Form.List name="items">
                                {(fields, { add, remove }) => (
                                    <>
                                        <Row gutter={[16, 16]}>
                                            {fields.map(({ key, name, ...restField }) => {
                                                const item = form.getFieldValue('items')[name];
                                                const variant = item?.product_variant?.[0];

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

                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'product_variant_id']}
                                                                label="Sản phẩm"
                                                                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                                                                labelCol={{ span: 24 }}
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
                                                                                    price: selected.price,
                                                                                    quantity: 1,
                                                                                    total: selected.price,
                                                                                    product_variant: [selected],
                                                                                    oldQuantity: 0,
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

                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'quantity']}
                                                                label="Số lượng"
                                                                labelCol={{ span: 24 }}
                                                            >
                                                                <InputNumber
                                                                    min={1}
                                                                    style={{ width: '100%' }}
                                                                    value={item?.quantity}
                                                                    onChange={(val) => {
                                                                        const updatedItems = form.getFieldValue('items').map((it, idx) =>
                                                                            idx === name
                                                                                ? { ...it, quantity: val, total: val * (it.price || 0) }
                                                                                : it
                                                                        );
                                                                        form.setFieldsValue({ items: updatedItems });
                                                                    }}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'price']}
                                                                label="Giá tiền"
                                                                labelCol={{ span: 24 }}
                                                            >
                                                                <InputNumber
                                                                    min={0}
                                                                    style={{ width: '100%' }}
                                                                    value={item?.price}
                                                                    onChange={(val) => {
                                                                        const updatedItems = form.getFieldValue('items').map((it, idx) =>
                                                                            idx === name
                                                                                ? { ...it, price: val, total: val * (it.quantity || 0) }
                                                                                : it
                                                                        );
                                                                        form.setFieldsValue({ items: updatedItems });
                                                                    }}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'total']}
                                                                label="Tổng tiền"
                                                                labelCol={{ span: 24 }}
                                                            >
                                                                <InputNumber
                                                                    value={(item?.quantity || 0) * (item?.price || 0)}
                                                                    disabled
                                                                    style={{ width: '100%', background: '#f5f5f5' }}
                                                                />
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
                        </Tabs.TabPane>
                    </Tabs>
                </Form>
            </Drawer>
        </div>
    );
};

export default Stock;
