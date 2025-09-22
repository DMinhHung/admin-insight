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
} from 'antd';
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
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute${
          nameSearch ? `?name=${nameSearch}` : ''
        }`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách thuộc tính');
      const result = await res.json();
      const items = result?.data?.items ?? [];

      const formattedData = items.map((item) => ({
        key: item.id,
        name: item.name,
        status: item.status,
        values: Array.isArray(item.value)
          ? item.value.map((v) => ({ id: v.id, value: v.value }))
          : [],
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
      if (!res.ok || !result?.data)
        throw new Error(result?.data?.message || 'Không thể lấy dữ liệu');

      const item = result.data;

      const formValues = {
        name: item.name,
        status: item.status,
        value: Array.isArray(item.value)
          ? item.value.map((v) => v.value)
          : [],
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
      if (!res.ok || !result)
        throw new Error(result?.data?.message || 'Thao tác thất bại');

      message.success(editingProduct ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      productForm.resetFields();
      setEditingProduct(null);
      fetchProductAttribute();
    } catch (err) {
      message.error(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result)
        throw new Error(result?.message || 'Xóa thất bại');

      setData((prev) => prev.filter((item) => item.key !== id));
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
      content: `Tên: ${record.name}`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        return handleDelete(record.key);
      },
    });
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: 'Giá trị',
      dataIndex: 'values',
      render: (values) => (
        <>
          {values.map((v) => (
            <Tag color="blue" key={v.id}>
              {v.value}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: (value) =>
        value === 1 ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Thuộc tính sản phẩm</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm theo tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleCreate}>
              Thêm mới
            </Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={data} loading={loading} />
      <Modal
        title={editingProduct ? 'Chỉnh sửa' : 'Thêm mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          productForm.resetFields();
          setEditingProduct(null);
        }}
        onOk={handleModalOk}
        okText={editingProduct ? 'Cập nhật' : 'Tạo'}
        width={900}
        maskClosable={false}
      >
        <Form form={productForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Giá trị"
                rules={[{ required: true, message: 'Nhập ít nhất 1 giá trị' }]}
              >
                <Select
                  mode="tags"
                  tokenSeparators={[',']}
                  placeholder="Nhập nhiều giá trị, Enter hoặc , để thêm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value={1}>Đang hoạt động</Select.Option>
                  <Select.Option value={2}>Ngừng</Select.Option>
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
