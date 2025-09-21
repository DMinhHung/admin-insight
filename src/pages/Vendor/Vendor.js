import React, { useState, useEffect, useRef } from 'react';
import {
    Table, Typography, Input, Button, Space, message,
    Row, Col, Modal, Form, Collapse, Card, Select, Dropdown
} from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';
import ColumnVisibility from '../../components/ColumnVisibility';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const Vendor = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [vendorForm] = Form.useForm();
    const [editingVendor, setEditingVendor] = useState(null);
    const [groupOptions, setGroupOptions] = useState([]);
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

    const fetchVendors = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await api.get(
                `api/v1/admin/supplier/form${nameSearch ? `?name=${nameSearch}` : ''}`
            );
            const vendors = res?.data?.data?.items || [];
            setData(vendors.map(v => ({
                key: v.id,
                code: v.code,
                name: v.name,
                thumbnail: v.thumbnail,
                phone: v.phone,
                email: v.email,
                gender: v.gender,
                company_name: v.company_name,
                tax_code: v.tax_code,
                debt: v.debt,
            })));
        } catch (err) {
            message.error(err.message || 'Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/api/v1/admin/supplier/group');
            setGroupOptions(res?.data?.data?.items || []);
        } catch {
            message.error('Không tải được nhóm nhà cung cấp');
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
            vendorForm.setFieldsValue({ ward: undefined });
        } catch {
            message.error('Không tải được Phường/Xã');
        } finally {
            setLoadingWard(false);
        }
    };

    useEffect(() => { fetchGroups(); }, []);
    useEffect(() => { fetchCities(); }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchVendors();
        fetchGroups();
        fetchCities();
    }, []);

    const handleSearch = () => fetchVendors(searchText);

    const handleCreate = () => {
        setEditingVendor(null);
        vendorForm.resetFields();
        vendorForm.setFieldsValue({
            code: generateCode(12),
            type: 1,
        });
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/v1/admin/supplier/form/view`,
                { params: { id: record.key } });
            const vendor = res?.data?.data || {};
            vendorForm.setFieldsValue({
                ...vendor,
                type: vendor.type ? Number(vendor.type) : 1,
            });
            setEditingVendor(vendor.id);
            setIsModalVisible(true);
        } catch (err) {
            message.error(err.message || 'Không thể lấy dữ liệu nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await vendorForm.validateFields();
            const cityObj = cities.find(c => c.code === values.city);
            const wardObj = wards.find(w => w.code === values.ward);
            values.city = cityObj?.name || '';
            values.ward = wardObj?.name || '';

            setLoading(true);
            const url = editingVendor
                ? '/api/v1/admin/supplier/form/update'
                : '/api/v1/admin/supplier/form/create';
            if (editingVendor) values.id = editingVendor;

            const res = await api.post(url, values);
            if (!res.data.status) {
                message.error(res.data.message || 'Thao tác thất bại');
                return;
            }
            message.success(editingVendor ? 'Cập nhật nhà cung cấp thành công' : 'Tạo mới nhà cung cấp thành công');
            setIsModalVisible(false);
            vendorForm.resetFields();
            setEditingVendor(null);
            fetchVendors();
        } catch (err) {
            message.error(err.message || 'Validate failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await api.post(`/api/v1/admin/supplier/form/delete`, { id });
            setData(prev => prev.filter(item => item.key !== id));
            message.success('Đã xóa nhà cung cấp thành công');
        } catch (err) {
            message.error(err.message || 'Xóa nhà cung cấp thất bại');
        } finally {
            setLoading(false);
        }
    };

    const defaultVisible = ['code', 'name', 'phone', 'email', 'gender', 'actions'];
    const [visibleColumns, setVisibleColumns] = useState(defaultVisible);

    const columns = [
        { title: 'Mã NCC', dataIndex: 'code', key: 'code', sorter: (a, b) => a.code.localeCompare(b.code) },
        { title: 'Tên', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Công ty', dataIndex: 'company_name', key: 'company_name' },
        { title: 'MST', dataIndex: 'tax_code', key: 'tax_code' },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, r) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(r)}>Sửa</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => confirm({
                        title: 'Xóa nhà cung cấp?',
                        onOk: () => handleDelete(r.key),
                    })}>Xóa</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={2}>Nhà Cung Cấp</Title></Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Tìm tên..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={handleCreate}>Tạo mới</Button>
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
                columns={columns.filter(c => visibleColumns.includes(c.dataIndex || c.key))}
                dataSource={data}
                loading={loading}
            />

            <Modal
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); vendorForm.resetFields(); }}
                onOk={handleModalOk}
                width="90vw"
                style={{ maxWidth: 1200 }}
                bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
                maskClosable={false}
            >
                <Form form={vendorForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên nhà cung cấp" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="code" label="Mã nhà cung cấp" rules={[{ required: true }]}>
                                <Input
                                    addonAfter={
                                        <Button
                                            icon={<ReloadOutlined />}
                                            size="small"
                                            onClick={() => vendorForm.setFieldsValue({ code: generateCode() })}
                                        />
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="phone" label="Điện thoại"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                    </Row>

                    <Card style={{ marginBottom: 16 }}>
                        <Collapse ghost>
                            <Collapse.Panel header="Địa chỉ" key="addr">
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
                                                optionFilterProp="children"
                                                filterOption={(input, opt) =>
                                                    opt?.children.toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {cities.map(c => (
                                                    <Option key={c.code} value={c.code}>{c.name}</Option>
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
                                                optionFilterProp="children"
                                                filterOption={(input, opt) =>
                                                    opt?.children.toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {wards.map(w => (
                                                    <Option key={w.code} value={w.code}>{`${w.name} (${w.division_type})`}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="address" label="Địa chỉ chi tiết">
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                            </Collapse.Panel>
                        </Collapse>
                    </Card>

                    <Card style={{ marginBottom: 16 }}>
                        <Collapse ghost>
                            <Collapse.Panel header="Nhóm nhà cung cấp & Ghi chú" key="group">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="group_vendor"
                                            label="Nhóm nhà cung cấp"
                                            rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
                                        >
                                            <Select
                                                placeholder="Chọn nhóm nhà cung cấp"
                                                optionFilterProp="children"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {groupOptions.map(g => (
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
                            </Collapse.Panel>
                        </Collapse>
                    </Card>

                    <Card>
                        <Collapse ghost>
                            <Collapse.Panel header="Thông tin xuất hóa đơn" key="invoice">
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="tax_code" label="Mã số thuế"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="company_name" label="Tên công ty"><Input /></Form.Item></Col>
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
