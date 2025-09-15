import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Modal, Form, Select, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Product = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productForm] = Form.useForm();
  const [editingBrand, setEditingBrand] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchCategory = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form${nameSearch ? `?name=${nameSearch}` : ''}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách');
      const data = await res.json();
      const product = data?.data?.items ?? [];
      setData(
        product.map(product => ({
          key: product.id,
          name: product.name,
          thumbnail: product.thumbnail,
          slug: product.slug,
          description: product.description,
          status: product.status,
          gallery: product.gallery,
          sku: product.sku,
          price: product.price,
          cost: product.cost,
          discount: product.discount,
          stock: product.stock,
          weight: product.weight,
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
    productForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/view?id=${record.key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Cannot fetch data');

      const product = data?.data || {};

      const formValues = {
        name: product.name,
        thumbnail: product.thumbnail,
        slug: product.slug,
        description: product.description,
        status: product.status,
        gallery: product.gallery,
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        discount: product.discount,
        stock: product.stock,
        weight: product.weight,
      };

      setEditingBrand(product.id);
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
      let method = '';
      if (editingBrand) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/update`;
        method = 'POST';
        values.id = editingBrand;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/create`;
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
      productForm.resetFields();
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
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/delete`, {
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
      content: `name: ${record.username}`,
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() { return handleDelete(record.key); },
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Sku', dataIndex: 'sku', sorter: (a, b) => a.slug.localeCompare(b.sku) },
    {
      title: 'Image',
      dataIndex: 'thumbnail',
      sorter: (a, b) => a.thumbnail.localeCompare(b.thumbnail),
      render: url =>
        url ? (
          <Image
            src={url}
            alt="thumbnail"
            width={80}
            height={80}
            style={{ width: 80, height: 80, objectFit: 'contain', objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          '—'
        ),
    }, 
    { title: 'Slug', dataIndex: 'slug', sorter: (a, b) => a.slug.localeCompare(b.slug) },
    { title: 'Price', dataIndex: 'price', sorter: (a, b) => a.slug.localeCompare(b.price) },
    { title: 'Cost', dataIndex: 'cost', sorter: (a, b) => a.slug.localeCompare(b.cost) },
    { title: 'Stock', dataIndex: 'stock', sorter: (a, b) => a.slug.localeCompare(b.stock) },
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
        <Col>
          <Title level={2}>Product</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Search by name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleSearch}>Filter</Button>
            <Button type="primary" onClick={handleCreate}>Create</Button>
          </Space>
        </Col>
      </Row>

      <Table columns={columns} dataSource={data} loading={loading} />
       <Modal
        title={editingBrand ? 'Edit' : 'Creater'}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); productForm.resetFields(); setEditingBrand(null); }}
        onOk={handleModalOk}
        okText={editingBrand ? 'Update' : 'Create'}
        width={900}
      >
        <Form form={productForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="sku" label="Sku" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="slug" label="Slug"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="discount" label="Discount"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="price" label="Price" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="cost" label="Cost" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="stock" label="Stock" rules={[{ required: true }]}><Input /></Form.Item></Col>
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
              <Form.Item name="thumnail" label="Thumnail">
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
                      if (url && path) {
                        productForm.setFieldsValue({ logo: url, logo_path: path });
                        message.success('Upload thành công');
                      }
                    } else if (file.status === 'error') {
                      message.error('Upload thất bại');
                    }
                  }}
                  onRemove={async (file) => {
                    try {
                      const path = file.response?.data?.path || productForm.getFieldValue('logo_path');
                      if (path) {
                        await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/delete`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ path }),
                        });
                        productForm.setFieldsValue({ logo: null, logo_path: null });
                        message.success('Xoá ảnh thành công');
                      }
                    } catch (err) {
                      message.error('Xoá ảnh thất bại');
                    }
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
                {productForm.getFieldValue('logo') && (
                  <Image
                    src={productForm.getFieldValue('logo')}
                    alt="Current logo"
                    width={100}
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
              {editingBrand?.logo && (
                <Image
                  src={editingBrand.logo}
                  alt="Current logo"
                  width={100}
                  style={{ marginTop: 8 }}
                />
              )}
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

export default Product;
