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
  Modal,
  Form,
  Select,
  Upload,
  Image,
  InputNumber
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import VariantTable from './table/VariantTable';

const { Title } = Typography;
const { confirm } = Modal;

const Product = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productForm] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);

  const [thumbnailList, setThumbnailList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);
  const baseURL = process.env.REACT_APP_ADMIN_INSIGHT_URL;

  const api = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchProducts = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/admin/product/form${nameSearch ? `?name=${nameSearch}` : ''}`);
      const product = res?.data?.data?.items ?? [];
      setData(product.map(p => ({
        key: p.id,
        name: p.name,
        thumbnail: p.thumbnail,
        slug: p.slug,
        description: p.description,
        status: p.status,
        gallery: p.gallery,
        sku: p.sku,
        barcode: p.barcode,
        price: p.price,
        cost: p.cost,
        discount: p.discount,
        stock: p.stock,
        weight: p.weight,
        brand_id: p.brand_id,
        brand_name: p.brand_name
      })));
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  const handleSearch = () => fetchProducts(searchText);

  const generateCode = (length = 12) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/api/v1/admin/category/form`);
      setCategories(res?.data?.data?.items || []);
    } catch (err) {
      message.error(err.message || 'Không thể tải danh mục');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get(`/api/v1/admin/brand/form`);
      setBrands(res?.data?.data?.items || []);
    } catch (err) {
      message.error(err.message || 'Không thể tải nhãn hiệu');
    }
  };

  const handleCreate = async () => {
    setEditingProduct(null);
    productForm.resetFields();
    setThumbnailList([]);
    setGalleryList([]);
    productForm.setFieldsValue({
      sku: generateCode(8),
      barcode: generateCode(12),
    });
    await fetchCategories();
    await fetchBrands();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      await fetchCategories();
      await fetchBrands();
      const res = await api.get(`/api/v1/admin/product/form/view`, { params: { id: record.key } });
      const product = res?.data?.data || {};
      productForm.setFieldsValue({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        slug: product.slug,
        description: product.description,
        status: product.status,
        gallery: product.gallery,
        price: product.price,
        cost: product.cost,
        discount: product.discount,
        stock: product.stock,
        weight: product.weight,
        category_id: product.category_id,
        brand_id: product.brand_id,
        thumbnail: product.thumbnail,
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
      message.error(err.message || 'Không thể lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await productForm.validateFields();

      if (values.discount !== undefined && values.discount !== null) {
        values.discount = values.discount.toString();
      }

      setLoading(true);
      let url = editingProduct
        ? '/api/v1/admin/product/form/update'
        : '/api/v1/admin/product/form/create';

      if (editingProduct) values.id = editingProduct;

      const res = await api.post(url, values);
      const dataRes = res.data;

      if (!dataRes.status) {
        if (dataRes.data && typeof dataRes.data === 'object') {
          Object.entries(dataRes.data).forEach(([field, errors]) => {
            if (Array.isArray(errors)) errors.forEach(errMsg => message.error(`${field}: ${errMsg}`));
          });
        } else {
          message.error(dataRes.messages || 'Thao tác thất bại');
        }
        return;
      }
      message.success(editingProduct ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      productForm.resetFields();
      setEditingProduct(null);
      setThumbnailList([]);
      setGalleryList([]);
      fetchProducts();
    } catch (err) {
      message.error(err.message || 'Lỗi xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await api.post(`/api/v1/admin/product/form/delete`, { id });
      if (!res.data) throw new Error('Xóa thất bại');
      setData(prev => prev.filter(item => item.key !== id));
      message.success('Đã xóa thành công');
    } catch (err) {
      message.error(err.message || 'Xóa thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Bạn có chắc muốn xóa?',
      content: `Tên sản phẩm: ${record.name}`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() { return handleDelete(record.key); },
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    productForm.resetFields();
    setEditingProduct(null);
    setThumbnailList([]);
    setGalleryList([]);
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Mã vạch', dataIndex: 'barcode' },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      render: url =>
        url ? <Image src={url} alt="thumbnail" width={80} height={80} style={{ objectFit: 'cover' }} preview={false} /> : '—',
    },
    { title: 'Nhãn hiệu', dataIndex: 'brand_name' },
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Giá', dataIndex: 'price', render: val => val?.toLocaleString('vi-VN') },
    { title: 'Giá vốn', dataIndex: 'cost', render: val => val?.toLocaleString('vi-VN') },
    { title: 'Giảm giá (%)', dataIndex: 'discount', render: val => val || 0 },
    { title: 'Tồn kho', dataIndex: 'stock' },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: value => value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ẩn</Tag>
    },
    {
      title: 'Thao tác',
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
        <Col><Title level={2}>Sản phẩm</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm theo tên"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleSearch}>Lọc</Button>
            <Button type="primary" onClick={handleCreate}>Tạo mới</Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        expandable={{
          expandedRowRender: (record) => (
            <VariantTable
              productId={record.key}
              productName={record.name}
            />
          ),
          rowExpandable: () => true,
        }}
      />

      <Modal
        className="product-modal"
        open={isModalVisible}
        width="90vw"
        style={{ maxWidth: '1200px', overflowX: 'hidden' }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden', paddingRight: 24 }}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      >
        <Form form={productForm} layout="vertical" style={{ width: '100%' }}>
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}
              >
                <Input placeholder="VD: Laptop Dell XPS 13..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Nhập hoặc random SKU' }]}
              >
                <Input
                  placeholder="Tự động / Nhập thủ công"
                  addonAfter={
                    <Button
                      icon={<ReloadOutlined />}
                      size="small"
                      onClick={() => productForm.setFieldsValue({ sku: generateCode(8) })}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="barcode"
                label="Mã vạch"
                rules={[{ required: true, message: 'Nhập hoặc random mã vạch' }]}
              >
                <Input
                  placeholder="Tự động / Nhập thủ công"
                  addonAfter={
                    <Button
                      icon={<ReloadOutlined />}
                      size="small"
                      onClick={() => productForm.setFieldsValue({ barcode: generateCode(12) })}
                    />
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col span={8}>
              <Form.Item name="slug" label="Slug">
                <Input placeholder="slug-tuy-chinh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán (VNĐ)"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={value => value ? value.replace(/\./g, '') : ''}
                  placeholder="1.000.000"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cost"
                label="Giá vốn (VNĐ)"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={value => value ? value.replace(/\./g, '') : ''}
                  placeholder="500.000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col span={8}>
              <Form.Item
                name="discount"
                label="Giảm giá (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  formatter={value => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={value => value ? value.replace(/\./g, '') : ''}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Tồn kho"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value={1}>Đang bán</Select.Option>
                  <Select.Option value={2}>Ngừng bán</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn danh mục" loading={!categories.length} allowClear>
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand_id"
                label="Nhãn hiệu"
              >
                <Select placeholder="Chọn nhãn hiệu" loading={!brands.length} allowClear>
                  {brands.map(brand => (
                    <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                name="thumbnail"
                label="Ảnh đại diện"
                rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
              >
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
            <Col span={12}>
              <Form.Item
                name="gallery"
                label="Bộ sưu tập"
                rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
              >
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
                      .map(f => f.response?.data || { url: f.url });
                    productForm.setFieldsValue({ gallery: imgs });
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

          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm..." showCount maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Product;
