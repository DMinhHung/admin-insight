import React, { useState, useEffect, useRef } from 'react';
import {
    Table, Typography, Input, Button, Space, message,
    Row, Modal, Form, Select, Upload, DatePicker, Col, Dropdown
} from 'antd';
import {
    EditOutlined, DeleteOutlined, PlusOutlined,
    FilterOutlined, SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import ColumnVisibility from '../../components/ColumnVisibility';


const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;

const positionText = (val) => {
    switch (val) {
        case 1: return 'Giám đốc';
        case 2: return 'Quản lý';
        case 3: return 'Nhân viên';
        default: return '';
    }
};

const Employee = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [thumbnailList, setThumbnailList] = useState([]);
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const token = localStorage.getItem('accessToken');
    const hasFetched = useRef(false);
    const baseURL = process.env.REACT_APP_ADMIN_INSIGHT_URL;

    const api = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${token}` },
    });

    const fetchEmployees = async (params = {}) => {
        setLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const res = await api.get(`/api/v1/admin/employee/form${query ? `?${query}` : ''}`);
            const employee = res?.data?.data?.items ?? [];
            setData(
                employee.map(emp => ({
                    id: emp.id,
                    key: emp.id,
                    username: emp.username,
                    full_name: emp.full_name,
                    email: emp.email,
                    phone: emp.phone,
                    position: emp.position,
                    thumbnail: emp.thumbnail,
                    address: emp.address,
                    gender: emp.gender,
                    birthday: emp.birthday,
                    start_date: emp.start_date,
                    status: emp.status
                }))
            );
        } catch (err) {
            message.error(err.message || 'Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchEmployees();
        }
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (!values.thumbnail) {
                message.error('Vui lòng tải ảnh đại diện');
                return;
            }

            const payload = {
                ...values,
                birthday: values.birthday?.format('YYYY-MM-DD'),
                start_date: values.start_date?.format('YYYY-MM-DD')
            };

            const url = editingId
                ? `${baseURL}/api/v1/admin/employee/form/update`
                : `${baseURL}/api/v1/admin/employee/form/create`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || 'Lưu thất bại');

            message.success(editingId ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công');
            setIsModalVisible(false);
            setEditingId(null);
            form.resetFields();
            setThumbnailList([]);
            fetchEmployees();
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue({
            ...record,
            birthday: record.birthday ? dayjs(record.birthday) : null,
            start_date: record.start_date ? dayjs(record.start_date) : null,
            thumbnail: record.thumbnail,
            thumbnail_path: record.thumbnail_path || ''
        });
        setThumbnailList(
            record.thumbnail ? [{ uid: '-1', url: record.thumbnail, name: 'thumb' }] : []
        );
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        confirm({
            title: 'Xóa nhân viên?',
            onOk: async () => {
                setLoading(true);
                try {
                    const res = await fetch(`${baseURL}/api/v1/admin/employee/form/delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ id })
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.message || 'Xóa thất bại');
                    setData(prev => prev.filter(e => e.id !== id));
                    message.success('Đã xóa');
                } catch (err) {
                    message.error(err.message);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleFilter = async () => {
        try {
            const values = await filterForm.validateFields();
            const range = values.startRange || [];
            const params = {
                username: searchText.trim(),
                gender: values.gender,
                startFrom: range[0] ? range[0].format('YYYY-MM-DD') : undefined,
                startTo: range[1] ? range[1].format('YYYY-MM-DD') : undefined
            };
            setIsFilterVisible(false);
            fetchEmployees(params);
        } catch (err) {
            message.error(err.message);
        }
    };

    const defaultVisible = ['thumbnail', 'full_name', 'email', 'phone', 'position', 'address', 'start_date', 'actions'];
    const [visibleColumns, setVisibleColumns] = useState(defaultVisible);

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'thumbnail',
            render: url =>
                url && <img src={url} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
        },
        { title: 'Họ tên', dataIndex: 'full_name' },
        { title: 'Tên đăng nhập', dataIndex: 'username' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Điện thoại', dataIndex: 'phone' },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            render: val => positionText(val)
        },
        { title: 'Địa chỉ', dataIndex: 'address' },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            render: g => (g === 1 ? 'Nam' : g === 2 ? 'Nữ' : 'Khác')
        },
        { title: 'Ngày sinh', dataIndex: 'birthday' },
        { title: 'Ngày vào làm', dataIndex: 'start_date' },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Title level={2}>Nhân viên</Title>
                <Space>
                    <Input
                        placeholder="Tìm theo username"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={() => fetchEmployees({ username: searchText })}
                        style={{ width: 200 }}
                    />
                    <Button icon={<FilterOutlined />} onClick={() => setIsFilterVisible(true)}>
                        Lọc
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            form.resetFields();
                            setThumbnailList([]);
                            setIsModalVisible(true);
                        }}
                    >
                        Thêm mới
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
            </Row>

            <Table
                columns={columns.filter(c => visibleColumns.includes(c.dataIndex || c.key))}
                dataSource={data}
                loading={loading}
                rowKey="id"
            />

            <Modal
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); setEditingId(null); }}
                onOk={handleSave}
                title={editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Bắt buộc' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Điện thoại">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="position" label="Chức vụ">
                                <Select placeholder="Chọn chức vụ">
                                    <Option value={1}>Giám đốc</Option>
                                    <Option value={2}>Quản lý</Option>
                                    <Option value={3}>Nhân viên</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="address" label="Địa chỉ">
                                <Input.TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính">
                                    <Option value={1}>Nam</Option>
                                    <Option value={2}>Nữ</Option>
                                    <Option value={3}>Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="birthday" label="Ngày sinh">
                                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_date" label="Ngày vào làm">
                                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Title level={4}>Ảnh đại diện</Title>
                            <Upload
                                name="file"
                                listType="picture-card"
                                maxCount={1}
                                accept="image/*"
                                action={`${baseURL}/api/v1/general/upload/create`}
                                headers={{ Authorization: `Bearer ${token}` }}
                                fileList={thumbnailList}
                                onChange={({ fileList }) => {
                                    setThumbnailList(fileList);
                                    const done = fileList.find(f => f.status === 'done');
                                    if (done?.response?.data) {
                                        const { url, path } = done.response.data;
                                        form.setFieldsValue({ thumbnail: url, thumbnail_path: path });
                                    }
                                }}
                            >
                                {thumbnailList.length < 1 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                )}
                            </Upload>
                            <Form.Item name="thumbnail" hidden><Input /></Form.Item>
                            <Form.Item name="thumbnail_path" hidden><Input /></Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Employee;
