import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Typography, Input, Button, Space, message,
  Row, Col, Tag, Modal, Form, Select, Upload, Image
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Product = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productForm] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);

  const [thumbnailList, setThumbnailList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchProduct = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form${nameSearch ? `?name=${nameSearch}` : ''}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách');
      const data = await res.json();
      const product = data?.data?.items ?? [];
      setData(product.map(p => ({
        key: p.id,
        name: p.name,
        thumbnail: p.thumbnail,
        slug: p.slug,
        description: p.description,
        status: p.status,
        gallery: p.gallery,
        sku: p.sku,
        price: p.price,
        cost: p.cost,
        discount: p.discount,
        stock: p.stock,
        weight: p.weight,
      })));
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProduct();
  }, []);

  const handleSearch = () => fetchProduct(searchText);

  const handleCreate = async () => {
    setEditingProduct(null);
    productForm.resetFields();
    setThumbnailList([]);
    setGalleryList([]);
    await fetchCategories();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      await fetchCategories();
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/view?id=${record.key}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Cannot fetch data');

      const product = data?.data || {};

      productForm.setFieldsValue({
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
        category_id: product.category_id,
      });

      setThumbnailList(
        product.thumbnail
          ? [{ uid: '-1', name: 'thumb.jpg', status: 'done', url: product.thumbnail }]
          : []
      );

      setGalleryList(
        (product.gallery || []).map((img, i) => ({
          uid: String(i),
          name: `gallery-${i}.jpg`,
          status: 'done',
          url: img.url,
          response: { data: img },
        }))
      );

      setEditingProduct(product.id);
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
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/update`;
        values.id = editingProduct;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/create`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data.status) {
        if (data.data && typeof data.data === 'object') {
          Object.entries(data.data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) errors.forEach(errMsg => message.error(`${field}: ${errMsg}`));
          });
        } else {
          message.error(data.messages || 'Operation failed');
        }
        return;
      }
      message.success(editingProduct ? 'Updated successfully' : 'Created successfully');
      setIsModalVisible(false);
      productForm.resetFields();
      setEditingProduct(null);
      setThumbnailList([]);
      setGalleryList([]);
      fetchProduct();
    } catch (err) {
      message.error(err.message || 'Validate Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/form/delete`,
        {
          method: 'POST',
          body: JSON.stringify({ id }),
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
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

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/category/form`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách category');
      const data = await res.json();
      setCategories(data?.data?.items || []);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Sku', dataIndex: 'sku', sorter: (a, b) => a.sku.localeCompare(b.sku) },
    {
      title: 'Image',
      dataIndex: 'thumbnail',
      render: url =>
        url ? <Image src={url} alt="thumbnail" width={80} height={80} style={{ objectFit: 'cover' }} preview={false} /> : '—',
    },
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Price', dataIndex: 'price' },
    { title: 'Cost', dataIndex: 'cost' },
    { title: 'Stock', dataIndex: 'stock' },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Status',
      dataIndex: 'status',
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
        <Col><Title level={2}>Product</Title></Col>
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
        title={editingProduct ? 'Edit' : 'Create'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          productForm.resetFields();
          setEditingProduct(null);
          setThumbnailList([]);
          setGalleryList([]);
        }}
        onOk={handleModalOk}
        okText={editingProduct ? 'Update' : 'Create'}
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
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Select status' }]}>
                <Select placeholder="Select status">
                  <Select.Option value={1}>Active</Select.Option>
                  <Select.Option value={2}>Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: 'Select category' }]}
              >
                <Select placeholder="Select category" loading={!categories.length} allowClear>
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Thumbnail */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="thumbnail" label="Thumbnail" rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}>
                <Upload
                  name="file"
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  action={`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/create`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  fileList={thumbnailList}
                  onChange={({ fileList }) => {
                    setThumbnailList(fileList);
                    const done = fileList.find(f => f.status === 'done');
                    if (done?.response?.data) {
                      const { url, path } = done.response.data;
                      productForm.setFieldsValue({ thumbnail: url, thumbnail_path: path });
                    }
                  }}
                  onRemove={async (file) => {
                    try {
                      const path = file.response?.data?.path;
                      if (path) {
                        await fetch(
                          `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/delete`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ path }),
                          }
                        );
                        productForm.setFieldsValue({ thumbnail: null, thumbnail_path: null });
                      }
                    } catch {
                      message.error('Xoá ảnh thất bại');
                    }
                  }}
                >
                  {thumbnailList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            {/* Gallery */}
            <Col span={12}>
              <Form.Item name="gallery" label="Gallery" rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}>
                <Upload
                  name="file"
                  listType="picture-card"
                  accept="image/*"
                  multiple
                  action={`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/create`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  fileList={galleryList}
                  onChange={({ fileList }) => {
                    setGalleryList(fileList);
                    const imgs = fileList
                      .filter(f => f.status === 'done')
                      .map(f => f.response?.data || { url: f.url, path: f.response?.data?.path });
                    productForm.setFieldsValue({ gallery: imgs });
                  }}
                  onRemove={async (file) => {
                    try {
                      const path = file.response?.data?.path;
                      if (path) {
                        await fetch(
                          `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/delete`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ path }),
                          }
                        );
                        const images = productForm
                          .getFieldValue('gallery')
                          .filter(img => img.path !== path);
                        productForm.setFieldsValue({ gallery: images });
                      }
                    } catch {
                      message.error('Xoá ảnh thất bại');
                    }
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} placeholder="Enter description..." showCount maxLength={500} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Product;
