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
      if (!res.ok) throw new Error('Không thể tải danh sách danh mục');
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
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Không thể lấy dữ liệu');

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
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Thao tác thất bại');

      message.success(editingBrand ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      categoryForm.resetFields();
      setEditingBrand(null);
      fetchCategory();
    } catch (err) {
      message.error(err.message || 'Xác thực thất bại');
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
      if (!res.ok || !data) throw new Error(data?.message || 'Xoá thất bại');

      setData(prev => prev.filter(item => item.key !== id));
      message.success('Xoá thành công');
    } catch (err) {
      message.error(err.message || 'Xoá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá?',
      content: `Danh mục: ${record.name}`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() { return handleDelete(record.key); },
    });
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Slug', dataIndex: 'slug', sorter: (a, b) => a.slug.localeCompare(b.slug) },
    { title: 'Mô tả', dataIndex: 'description', sorter: (a, b) => a.description.localeCompare(b.description) },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: value => value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng</Tag>
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
        <Col><Title level={2}>Danh Mục</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm kiếm theo tên..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleCreate}>Thêm mới</Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={data} loading={loading} />
      <Modal
        title={editingBrand ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); categoryForm.resetFields(); setEditingBrand(null); }}
        onOk={handleModalOk}
        okText={editingBrand ? 'Cập nhật' : 'Tạo'}
        width={900}
        maskClosable={false}
      >
        <Form form={categoryForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="slug" label="Slug"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Select status' }]}
              >
                <Select placeholder="Select status" style={{ width: '100%' }}>
                  <Select.Option value={1}>
                    <span><Tag color="green">Hoạt động</Tag></span>
                  </Select.Option>
                  <Select.Option value={0}>
                    <span><Tag color="red">Ngưng hoạt động</Tag></span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item name="parent" label="Danh mục cha">
                <Select placeholder="Chọn danh mục cha (nếu có)">
                  <Select.Option value={1}>Ví dụ 1</Select.Option>
                  <Select.Option value={2}>Ví dụ 2</Select.Option>
                </Select>
              </Form.Item>
            </Col> */}
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập mô tả..."
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
