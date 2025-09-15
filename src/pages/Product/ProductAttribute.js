import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Modal, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const ProductAttribute = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productForm] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchProductAttribute = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute${nameSearch ? `?name=${nameSearch}` : ''}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách');
      const result = await res.json();
      const items = result?.data?.items ?? [];

      const formattedData = items.map(item => ({
        key: item.id,
        name: item.name,
        status: item.status,
        value: item.value?.value || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setData(formattedData);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProductAttribute();
  }, []);

  const handleSearch = () => fetchProductAttribute(searchText);

  const handleCreate = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/view?id=${record.key}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      if (!res.ok || !result?.data) throw new Error(result?.data?.message || 'Cannot fetch data');

      const item = result.data; // đây là object chi tiết của product attribute
      const formValues = {
        name: item.name,
        slug: item.slug,
        status: item.status,
        parent: item.parent,
        description: item.description,
        value: item.value?.value || '',
      };

      setEditingProduct(item.id);
      productForm.setFieldsValue(formValues);
      setIsModalVisible(true);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await productForm.validateFields();
      setLoading(true);
      let url = '';
      if (editingProduct) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/update`;
        values.id = editingProduct;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/create`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const result = await res.json();
      if (!res.ok || !result) throw new Error(result?.data?.message || 'Operation failed');

      message.success(editingProduct ? 'Updated successfully' : 'Created successfully');
      setIsModalVisible(false);
      productForm.resetFields();
      setEditingProduct(null);
      fetchProductAttribute();
    } catch (err) {
      message.error(err.message || 'Validate Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok || !result) throw new Error(result?.message || 'Failed to delete');

      setData(prev => prev.filter(item => item.key !== id));
      message.success('Deleted successfully');
    } catch (err) {
      message.error(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Are you sure you want to delete this?',
      content: `name: ${record.name}`,
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return handleDelete(record.key);
      },
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Value', dataIndex: 'value', sorter: (a, b) => (a.value || '').localeCompare(b.value || '') },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: value => (value === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
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
        <Col><Title level={2}>Product Attribute</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Search by name..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleCreate}>Create</Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={data} loading={loading} />
      <Modal
        title={editingProduct ? 'Edit' : 'Create'}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); productForm.resetFields(); setEditingProduct(null); }}
        onOk={handleModalOk}
        okText={editingProduct ? 'Update' : 'Create'}
        width={900}
      >
        <Form form={productForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="value" label="Value"><Input /></Form.Item></Col>
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

export default ProductAttribute;
