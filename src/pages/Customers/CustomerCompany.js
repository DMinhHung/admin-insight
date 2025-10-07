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
    Modal,
    Form,
    Upload,
    Tabs,
    Radio,
    Select,
    Dropdown,
    Tag,
    Image
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import ColumnVisibility from '../../components/ColumnVisibility';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const CustomerCompany = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [customerForm] = Form.useForm();
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [groupOptions, setGroupOptions] = useState([]);
    const [banks, setBanks] = useState([]);
    const [cities, setCities] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingCity, setLoadingCity] = useState(false);
    const [loadingWard, setLoadingWard] = useState(false);

    const token = localStorage.getItem('accessToken');
    const hasFetched = useRef(false);

    const api = axios.create({
        baseURL: process.env.REACT_APP_ADMIN_INSIGHT_URL,
        headers: { Authorization: `Bearer ${token}` },
    });

    const generateCode = (length = 12) =>
        Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

    const fetchCustomers = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await api.get(
                `api/v1/admin/customer/company${nameSearch ? `?name=${nameSearch}` : ''}`
            );
            const customers = res?.data?.data?.items || [];
            setData(
                customers.map((c) => ({
                    key: c.id,
                    code: c.code,
                    name: c.name,
                    thumbnail: c.thumbnail,
                    phone: c.phone,
                    email: c.email,
                    gender: c.gender,
                    company_name: c.company_name,
                    tax_code: c.tax_code,
                    group_customer: c?.group?.name,
                    fb_url: c.fb_url,
                    status: c.status,
                    debt: c.debt,
                }))
            );
        } catch (err) {
            message.error(err.message || 'Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/api/v1/admin/customer/group');
            setGroupOptions(res?.data?.data?.items || []);
        } catch {
            message.error('Không tải được nhóm KH');
        }
    };

    const fetchBanks = async () => {
        try {
            const res = await axios.get('https://api.vietqr.io/v2/banks');
            setBanks(res.data?.data || []);
        } catch {
            message.error('Không tải được ngân hàng');
        }
    };

    const fetchCities = async () => {
        try {
            setLoadingCity(true);
            const res = await axios.get('https://provinces.open-api.vn/api/v2/');
            setCities(res.data || []);
        } catch {
            message.error('Không tải được danh sách thành phố');
        } finally {
            setLoadingCity(false);
        }
    };

    const handleProvinceChange = async (provinceCode) => {
        try {
            setLoadingWard(true);
            const res = await axios.get(
                `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
            );
            setWards(res.data.wards || []);
            customerForm.setFieldsValue({ ward: undefined });
        } catch {
            message.error('Không tải được Phường/Xã');
        } finally {
            setLoadingWard(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchCustomers();
        fetchGroups();
        fetchCities();
        fetchBanks();
    }, []);

    const handleSearch = () => fetchCustomers(searchText);

    const handleCreate = () => {
        setEditingCustomer(null);
        customerForm.resetFields();
        customerForm.setFieldsValue({
            code: generateCode(12),
            type: 1,
        });
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/admin/customer/company/view`, {
                params: { id: record.key },
            });
            const customer = res?.data?.data || {};
            customerForm.setFieldsValue({
                ...customer,
                type: customer.type ? Number(customer.type) : 1,
            });
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
            const cityObj = cities.find((c) => c.code === values.city);
            const wardObj = wards.find((w) => w.code === values.ward);
            values.city = cityObj?.name || '';
            values.ward = wardObj?.name || '';

            setLoading(true);
            const url = editingCustomer
                ? '/api/v1/admin/customer/company/update'
                : '/api/v1/admin/customer/company/create';
            if (editingCustomer) values.id = editingCustomer;

            const res = await api.post(url, values);
            if (!res.data.status) {
                message.error(res.data.message || 'Thao tác thất bại');
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
            await api.post(`/api/v1/admin/customer/company/delete`, { id });
            setData((prev) => prev.filter((item) => item.key !== id));
            message.success('Đã xóa thành công');
        } catch (err) {
            message.error(err.message || 'Xóa thất bại');
        } finally {
            setLoading(false);
        }
    };

    const [visibleColumns, setVisibleColumns] = useState(['code', 'thumbnail', 'name', 'phone', 'email', 'gender', 'actions', 'status']);

    const columns = [
        { title: 'Mã KH', dataIndex: 'code', key: 'code' },
        {
            title: 'Ảnh',
            dataIndex: 'thumbnail',
            render: url =>
                url ? <Image src={url} alt="thumbnail" width={80} height={80} style={{ objectFit: 'cover' }} preview={false} /> : '—',
        },
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Facebook', dataIndex: 'fb_url', key: 'fb_url' },
        { title: 'Nhóm', dataIndex: 'group_customer', key: 'group_customer' },
        { title: 'MST', dataIndex: 'tax_code', key: 'tax_code' },

        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (g) => ({ 1: 'Nam', 2: 'Nữ' }[g] || '-'),
        },
        { title: 'Công ty', dataIndex: 'company_name', key: 'company_name' },
        { title: 'MST', dataIndex: 'tax_code', key: 'tax_code' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            render: value => value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng hoạt động</Tag>
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, r) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                            confirm({
                                title: 'Xóa khách hàng?',
                                onOk: () => handleDelete(r.key),
                            })
                        }
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin chung',
            children: (
                <>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên khách hàng"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Mã khách hàng"
                                rules={[{ required: true }]}
                            >
                                <Input
                                    addonAfter={
                                        <Button
                                            icon={<ReloadOutlined />}
                                            size="small"
                                            onClick={() =>
                                                customerForm.setFieldsValue({ code: generateCode() })
                                            }
                                        />
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="phone" label="Điện thoại"><Input /></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn">
                                    <Option value={1}>Nam</Option>
                                    <Option value={2}>Nữ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                    </Row>
                    <Form.Item name="fb_url" label="Facebook"><Input /></Form.Item>

                    <Row gutter={16}>
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
                        <Col span={12}>
                            <Form.Item name="thumbnail" label="Ảnh">
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    maxCount={1}
                                    accept="image/*"
                                    action={`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/create`}
                                    headers={{ Authorization: `Bearer ${token}` }}
                                    onChange={({ file }) => {
                                        if (file.status === 'done') {
                                            const { url, path } = file.response?.data || {};
                                            customerForm.setFieldsValue({
                                                thumbnail: url,
                                                thumbnail_path: path,
                                            });
                                        } else if (file.status === 'error') message.error('Upload thất bại');
                                    }}
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: '2',
            label: 'Địa chỉ',
            children: (
                <>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="city"
                                label="Tỉnh/Thành phố"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn tỉnh/thành"
                                    loading={loadingCity}
                                    onChange={handleProvinceChange}
                                >
                                    {cities.map((c) => (
                                        <Option key={c.code} value={c.code}>
                                            {c.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ward"
                                label="Quận/Huyện/Phường/Xã"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn khu vực"
                                    loading={loadingWard}
                                    disabled={!wards.length}
                                >
                                    {wards.map((w) => (
                                        <Option key={w.code} value={w.code}>
                                            {`${w.name} (${w.division_type})`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="address" label="Địa chỉ chi tiết">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '3',
            label: 'Nhóm & Ghi chú',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="group_customer"
                            label="Nhóm khách hàng"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Chọn nhóm khách hàng" showSearch>
                                {groupOptions.map((g) => (
                                    <Option key={g.id} value={g.id}>
                                        {g.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="note" label="Ghi chú">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
            ),
        },
        {
            key: '4',
            label: 'Xuất hóa đơn',
            children: (
                <>
                    <Form.Item
                        name="type"
                        label="Loại khách hàng"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group>
                            <Radio value={1}>Cá nhân</Radio>
                            <Radio value={2}>Tổ chức/Hộ kinh doanh</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="tax_code" label="Mã số thuế">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="company_name" label="Tên công ty">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="national" label="CCCD/CMND">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="passport_number" label="Số hộ chiếu">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="bank_name" label="Ngân hàng">
                                <Select
                                    placeholder="Chọn ngân hàng"
                                    showSearch
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                >
                                    {banks.map((b) => (
                                        <Option key={b.code} value={b.code}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <img
                                                    src={b.logo}
                                                    alt={b.shortName}
                                                    style={{ width: 80, height: 80, objectFit: 'contain' }}
                                                />
                                                <span>
                                                    {b.shortName} - {b.name}
                                                </span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="bank_account_number" label="Số tài khoản">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>Khách Hàng Công Ty</Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm tên..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={handleCreate}>
                            Tạo mới
                        </Button>
                        <Dropdown
                            overlay={
                                <ColumnVisibility
                                    columns={columns}
                                    visibleColumns={visibleColumns}
                                    onChange={setVisibleColumns}
                                />
                            }
                            trigger={['click']}
                        >
                            <Button icon={<SettingOutlined />}>Chọn cột</Button>
                        </Dropdown>
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns.filter(
                    (c) => visibleColumns.includes(c.dataIndex || c.key)
                )}
                dataSource={data}
                loading={loading}
            />

            <Modal
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    customerForm.resetFields();
                }}
                onOk={handleModalOk}
                width={1000}
                maskClosable={false}
                bodyStyle={{
                    height: 600,
                }}
                title={editingCustomer ? 'Cập nhật khách hàng' : 'Tạo khách hàng mới'}
            >
                <Form form={customerForm} layout="vertical">
                    <Tabs items={tabItems} />
                </Form>
            </Modal>
        </div>
    );
};

export default CustomerCompany;
