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
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Tabs } from 'antd';

const { Title, Text } = Typography;
const { confirm: modalConfirm } = Modal;
const { TabPane } = Tabs


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
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/stock${nameSearch ? `?name=${nameSearch}` : ''}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Cannot load stock invoices');
            const resData = await res.json();
            const items = resData?.data?.items || [];
            setData(items.map((item) => ({ ...item, key: item.id })));
        } catch (err) {
            message.error(err.message);
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
        setIsDrawerOpen(true);
        form.setFieldsValue({ code: generateCode(12), items: [] });
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/stock/view?id=${record.key}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || !data?.data) throw new Error(data?.data?.message || 'Cannot fetch data');

            const invoice = data.data;
            setEditingInvoice(invoice.id);
            form.setFieldsValue({
                code: invoice.code,
                type: invoice.type,
                warehouse_id: invoice.warehouse_id,
                note: invoice.note,
                status: invoice.status,
                vendor_id: invoice.vendor_id,
                items: invoice.items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price,
                })),
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

            const itemsWithTotal = (values.items || []).map(item => ({
                invoice_id: editingInvoice || null,
                product_id: item.productId,
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
                items: itemsWithTotal,
                id: editingInvoice || undefined,
            };

            const url = editingInvoice
                ? `${baseURL}/api/v1/admin/invoice/stock/update`
                : `${baseURL}/api/v1/admin/invoice/stock/create`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.data?.message || 'Operation failed');

            message.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
            setIsDrawerOpen(false);
            form.resetFields();
            setEditingInvoice(null);
            fetchStockInvoice();
        } catch (err) {
            message.error(err.message || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`${baseURL}/api/v1/admin/invoice/stock/delete`, {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.message || 'Failed to delete');

            setData(prev => prev.filter(item => item.key !== id));
            message.success('Invoice deleted successfully');
        } catch (err) {
            message.error(err.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (record) => {
        modalConfirm({
            title: 'Are you sure you want to delete this invoice?',
            content: `Code: ${record.code}`,
            okText: 'Confirm',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                return handleDelete(record.key);
            },
        });
    };

    const columns = [
        { title: 'Mã nhập hàng', dataIndex: 'code' },
        { title: 'Thời gian', dataIndex: 'created_at' },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'vendor',
            render: (vendorArray) => vendorArray?.[0]?.name || 'Không có',
        },
        {
            title: 'Loại hóa đơn',
            dataIndex: 'type',
            render: (type) => {
                switch (type) {
                    case 1: return 'Nhập Kho';
                    case 2: return 'Xuất Kho';
                    case 3: return 'Hủy Kho';
                    default: return 'Không xác định';
                }
            },
        },
        { title: 'Mô tả', dataIndex: 'note' },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (value) => value === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>Xuất Nhập Kho</Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Search by code..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                            onPressEnter={handleSearch}
                        />
                        <Button type="primary" onClick={handleCreate}>Tạo</Button>
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
                        <Button type="primary" loading={loading} onClick={handleDrawerOk}>{editingInvoice ? 'Update' : 'Create'}</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical">
                    <Tabs defaultActiveKey="1" type="card">
                        <Tabs.TabPane tab="Thông tin phiếu" key="1">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Nhập hoặc random' }]}>
                                        <Input
                                            placeholder="Tự động / Nhập thủ công"
                                            addonAfter={<Button icon={<ReloadOutlined />} size="small" onClick={() => form.setFieldsValue({ code: generateCode(8) })} />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="type" label="Loại hóa đơn" rules={[{ required: true, message: 'Chọn loại hóa đơn' }]}>
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
                                    <Form.Item name="vendor_id" label="Nhà Cung Cấp" rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}>
                                        <Select placeholder="Chọn nhà cung cấp" showSearch optionFilterProp="children">
                                            {vendors.map(v => <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="warehouse_id" label="Chọn Kho" rules={[{ required: true, message: 'Chọn kho' }]}>
                                        <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                                            {warehouses.map(wh => <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                                        <Select placeholder="Chọn trạng thái">
                                            <Select.Option value={1}>Active</Select.Option>
                                            <Select.Option value={2}>Inactive</Select.Option>
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

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name="note" label="Ghi chú">
                                        <Input.TextArea placeholder="Ghi chú" rows={4} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Danh sách sản phẩm" key="2">
                            <Row gutter={32}>
                                <Col span={24}>
                                    <Form.List name="items">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name, ...restField }) => {
                                                    const productId = form.getFieldValue(['items', name, 'productId']);
                                                    const product = products.find(p => p.id === productId);

                                                    const getProductName = (product) => {
                                                        if (!product) return '';
                                                        const baseName = product.item?.name || '';
                                                        const attrs = product.attributes?.map(a => a.value).join(' - ') || '';
                                                        return attrs ? `${baseName} - ${attrs}` : baseName;
                                                    };

                                                    const getProductThumbnail = (product) => {
                                                        if (!product) return '';
                                                        return product.thumbnail || product.item?.thumbnail || '';
                                                    };

                                                    return (
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
                                                            <Col>
                                                                <Image
                                                                    src={getProductThumbnail(product)}
                                                                    width={50}
                                                                    height={50}
                                                                    preview={false}
                                                                    placeholder
                                                                />
                                                            </Col>

                                                            <Col flex={2}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'productId']}
                                                                    rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <Select
                                                                        placeholder="Chọn sản phẩm"
                                                                        showSearch
                                                                        optionFilterProp="children"
                                                                        onChange={(val) => {
                                                                            const selected = products.find(p => p.id === val);
                                                                            form.setFieldsValue({
                                                                                items: form.getFieldValue('items').map((it, idx) =>
                                                                                    idx === name
                                                                                        ? {
                                                                                            ...it,
                                                                                            price: selected?.price || 0,
                                                                                            quantity: 1,
                                                                                            total: selected?.price || 0,
                                                                                        }
                                                                                        : it
                                                                                ),
                                                                            });
                                                                        }}
                                                                    >
                                                                        {products.map((p) => (
                                                                            <Select.Option key={p.id} value={p.id}>
                                                                                {getProductName(p)}
                                                                            </Select.Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>

                                                            <Col flex={1}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'quantity']}
                                                                    rules={[{ required: true, message: 'Nhập số lượng' }]}
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <InputNumber
                                                                        min={1}
                                                                        placeholder="Số lượng"
                                                                        style={{ width: '100%' }}
                                                                        onChange={(val) => {
                                                                            const price = form.getFieldValue(['items', name, 'price']) || 0;
                                                                            form.setFieldsValue({
                                                                                items: form.getFieldValue('items').map((it, idx) =>
                                                                                    idx === name ? { ...it, total: val * price } : it
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col flex={1}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'price']}
                                                                    rules={[{ required: true, message: 'Nhập giá' }]}
                                                                    style={{ marginBottom: 0 }}
                                                                >
                                                                    <InputNumber
                                                                        min={0}
                                                                        placeholder="Giá"
                                                                        style={{ width: '100%' }}
                                                                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                                        parser={(val) => val.replace(/\./g, '')}
                                                                        onChange={(val) => {
                                                                            const quantity = form.getFieldValue(['items', name, 'quantity']) || 0;
                                                                            form.setFieldsValue({
                                                                                items: form.getFieldValue('items').map((it, idx) =>
                                                                                    idx === name ? { ...it, total: quantity * val } : it
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col flex={1}>
                                                                <Form.Item {...restField} name={[name, 'total']} style={{ marginBottom: 0 }}>
                                                                    <InputNumber
                                                                        placeholder="Tổng"
                                                                        style={{ width: '100%' }}
                                                                        disabled
                                                                        value={
                                                                            (form.getFieldValue(['items', name, 'quantity']) || 0) *
                                                                            (form.getFieldValue(['items', name, 'price']) || 0)
                                                                        }
                                                                        formatter={(val) => val?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                                        parser={(val) => val?.replace(/\./g, '')}
                                                                    />
                                                                </Form.Item>
                                                            </Col>

                                                            <Col>
                                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                                            </Col>
                                                        </Row>
                                                    );
                                                })}
                                                <Form.Item>
                                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                        Thêm sản phẩm mới
                                                    </Button>
                                                </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                    </Tabs>
                </Form>
            </Drawer>
        </div>
    );
};

export default Stock;