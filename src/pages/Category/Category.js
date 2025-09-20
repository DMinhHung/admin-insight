import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Modal, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Category = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [editingBrand, setEditingBrand] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchCategory = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form${nameSearch ? `?name=${nameSearch}` : ''}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách');
      const data = await res.json();
      const brand = data?.data?.items ?? [];
      setData(
        brand.map(brand => ({
          key: brand.id,
          name: brand.name,
          logo: brand.logo,
          slug: brand.slug,
          description: brand.description,
          status: brand.status,
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
    fetchCategory();
  }, []);

  const handleSearch = () => fetchCategory(searchText);

  const handleCreate = () => {
    setEditingBrand(null);
    categoryForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form/view?id=${record.key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Cannot fetch data');

      const brand = data?.data || {};

      const formValues = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
      };

      setEditingBrand(brand.id);
      categoryForm.setFieldsValue(formValues);
      setIsModalVisible(true);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await categoryForm.validateFields();
      setLoading(true);
      let url = '';
      let method = '';
      if (editingBrand) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form/update`;
        method = 'POST';
        values.id = editingBrand;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form/create`;
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Operation failed');

      message.success(editingBrand ? 'Updated successfully' : 'Created successfully');
      setIsModalVisible(false);
      categoryForm.resetFields();
      setEditingBrand(null);
      fetchCategory();
    } catch (err) {
      message.error(err.message || 'Validate Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form/delete`, {
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
      onOk() { return handleDelete(record.key); },
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Slug', dataIndex: 'slug', sorter: (a, b) => a.slug.localeCompare(b.slug) },
    { title: 'Description', dataIndex: 'description', sorter: (a, b) => a.description.localeCompare(b.description) },
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
        <Col><Title level={2}>Category</Title></Col>
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
        title={editingBrand ? 'Edit' : 'Creater'}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); categoryForm.resetFields(); setEditingBrand(null); }}
        onOk={handleModalOk}
        okText={editingBrand ? 'Update' : 'Create'}
        width={900}
        maskClosable={false}
      >
        <Form form={categoryForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="slug" label="Slug"><Input /></Form.Item></Col>
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
            <Col span={12}>
              <Form.Item name="parent" label="Parent" rules={[{ message: 'Select parent' }]}>
                <Select placeholder="Select parent">
                  <Select.Option value={1}>Active</Select.Option>
                  <Select.Option value={2}>Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: false }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter description..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Category;
