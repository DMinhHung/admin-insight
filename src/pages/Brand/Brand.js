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
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Brand = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [brandForm] = Form.useForm();
  const [editingBrand, setEditingBrand] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchBrand = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/brand/form${nameSearch ? `?name=${nameSearch}` : ''
        }`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách thương hiệu');
      const data = await res.json();
      const brand = data?.data?.items ?? [];
      setData(
        brand.map((brand) => ({
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
    fetchBrand();
  }, []);

  const handleSearch = () => fetchBrand(searchText);

  const handleCreate = () => {
    setEditingBrand(null);
    brandForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/brand/form/view?id=${record.key}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data)
        throw new Error(data?.data?.message || 'Không thể lấy dữ liệu');

      const brand = data?.data || {};

      const formValues = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
      };

      setEditingBrand(brand.id);
      brandForm.setFieldsValue(formValues);
      setIsModalVisible(true);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await brandForm.validateFields();
      setLoading(true);
      let url = '';
      let method = '';
      if (editingBrand) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/brand/form/update`;
        method = 'POST';
        values.id = editingBrand;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/brand/form/create`;
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
      if (!res.ok || !data)
        throw new Error(data?.data?.message || 'Thao tác thất bại');

      message.success(editingBrand ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      brandForm.resetFields();
      setEditingBrand(null);
      fetchBrand();
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
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/brand/form/delete`,
        {
          method: 'POST',
          body: JSON.stringify({ id }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Xoá thất bại');

      setData((prev) => prev.filter((item) => item.key !== id));
      message.success('Xoá thành công');
    } catch (err) {
      message.error(err.message || 'Xoá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Bạn có chắc muốn xoá thương hiệu này?',
      content: `Tên: ${record.name}`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        return handleDelete(record.key);
      },
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      sorter: (a, b) => a.logo.localeCompare(b.logo),
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="logo"
            width={80}
            height={80}
            style={{ width: 80, height: 80, objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      sorter: (a, b) => a.slug.localeCompare(b.slug),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: (value) =>
        value === 1 ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngưng</Tag>
        ),
    },
    {
      title: 'Hành động',
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
          <Title level={2}>Thương hiệu</Title>
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
        title={editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          brandForm.resetFields();
          setEditingBrand(null);
        }}
        onOk={handleModalOk}
        okText={editingBrand ? 'Cập nhật' : 'Tạo'}
        width={900}
        maskClosable={false}
      >
        <Form form={brandForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slug" label="Slug">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Select status' }]}
              >
                <Select placeholder="Chọn trạng thái hoạt động" style={{ width: '100%' }}>
                  <Select.Option value={1}>
                    <span><Tag color="green">Hoạt động</Tag></span>
                  </Select.Option>
                  <Select.Option value={0}>
                    <span><Tag color="red">Ngưng hoạt động</Tag></span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="logo" label="Logo">
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
                        brandForm.setFieldsValue({ logo: url, logo_path: path });
                        message.success('Tải ảnh thành công');
                      }
                    } else if (file.status === 'error') {
                      message.error('Tải ảnh thất bại');
                    }
                  }}
                  onRemove={async (file) => {
                    try {
                      const path =
                        file.response?.data?.path ||
                        brandForm.getFieldValue('logo_path');
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
                        brandForm.setFieldsValue({ logo: null, logo_path: null });
                        message.success('Xoá ảnh thành công');
                      }
                    } catch (err) {
                      message.error('Xoá ảnh thất bại');
                    }
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                </Upload>
                {brandForm.getFieldValue('logo') && (
                  <Image
                    src={brandForm.getFieldValue('logo')}
                    alt="Logo hiện tại"
                    width={100}
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
            </Col>
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

export default Brand;
