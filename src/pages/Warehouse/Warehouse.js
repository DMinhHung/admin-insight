import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Modal, Form, Select, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Warehouse = () => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [warehouseForm] = Form.useForm();
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const token = localStorage.getItem('accessToken');
    const hasFetched = useRef(false);

    const fetchWarehouse = async (nameSearch = '') => {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/invoice/warehouse${nameSearch ? `?name=${nameSearch}` : ''}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error('Cannot load warehouse list');
            const data = await res.json();
            const warehouses = data?.data?.items ?? [];
            setData(
                warehouses.map(item => ({
                    name: item.name,
                    value: item.value,
                    status: item.status,
                }))
            );
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchWarehouse();
    }, []);

    const handleSearch = () => fetchWarehouse(searchText);

    const handleCreate = () => {
        setEditingWarehouse(null);
        warehouseForm.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/invoice/warehouse/view?id=${record.key}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.data?.message || 'Cannot fetch data');

            const warehouse = data?.data || {};
            setEditingWarehouse(warehouse.id);
            warehouseForm.setFieldsValue({
                name: warehouse.name,
                value: warehouse.value,
                status: warehouse.status,
            });
            setIsModalVisible(true);
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await warehouseForm.validateFields();
            setLoading(true);
            let url = '';
            if (editingWarehouse) {
                url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/invoice/warehouse/update`;
                values.id = editingWarehouse;
            } else {
                url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/invoice/warehouse/create`;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.data?.message || 'Operation failed');

            message.success(editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse created successfully');
            setIsModalVisible(false);
            warehouseForm.resetFields();
            setEditingWarehouse(null);
            fetchWarehouse();
        } catch (err) {
            message.error(err.message || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/invoice/warehouse/delete`, {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok || !data) throw new Error(data?.message || 'Failed to delete');

            setData(prev => prev.filter(item => item.key !== id));
            message.success('Warehouse deleted successfully');
        } catch (err) {
            message.error(err.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (record) => {
        confirm({
            title: 'Are you sure you want to delete this warehouse?',
            content: `Name: ${record.name}`,
            okText: 'Confirm',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() { return handleDelete(record.key); },
        });
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Mô tả', dataIndex: 'value', sorter: (a, b) => a.slug.localeCompare(b.slug) },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => a.status - b.status,
            render: value => value === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col><Title level={2}>Kho</Title></Col>
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
            <Table columns={columns} dataSource={data} loading={loading} />
            <Modal
                title={editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}
                visible={isModalVisible}
                onCancel={() => { setIsModalVisible(false); warehouseForm.resetFields(); setEditingWarehouse(null); }}
                onOk={handleModalOk}
                okText={editingWarehouse ? 'Update' : 'Create'}
                width={900}
                maskClosable={false}
            >
                <Form form={warehouseForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="value" label="Mô tả" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select status' }]}>
                                <Select placeholder="Select status">
                                    <Select.Option value={1}>Active</Select.Option>
                                    <Select.Option value={2}>Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Warehouse;
