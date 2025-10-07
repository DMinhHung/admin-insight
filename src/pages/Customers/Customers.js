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
    Select,
    Dropdown,
    Tag
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import ColumnVisibility from '../../components/ColumnVisibility';

const { Title } = Typography;
const { confirm } = Modal;

const Customers = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('accessToken');
    const hasFetched = useRef(false);

    const api = axios.create({
        baseURL: process.env.REACT_APP_ADMIN_INSIGHT_URL,
        headers: { Authorization: `Bearer ${token}` },
    });


    const fetchCustomers = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await api.get(
                `api/v1/admin/customer/form${nameSearch ? `?name=${nameSearch}` : ''}`
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


    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchCustomers();
    }, []);

    const handleSearch = () => fetchCustomers(searchText);


    const [visibleColumns, setVisibleColumns] = useState(['thumbnail', 'name', 'phone', 'email', 'gender', 'actions', 'status']);

    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (g) => ({ 1: 'Nam', 2: 'Nữ' }[g] || '-'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            render: value => value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng hoạt động</Tag>
        }
    ];


    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>Khách Hàng</Title>
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
        </div>
    );
};

export default Customers;
