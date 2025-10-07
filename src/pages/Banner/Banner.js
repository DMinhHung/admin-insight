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

const Banner = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bannerForm] = Form.useForm();
  const [editingBanner, setEditingBanner] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchBanners = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/banner/form${nameSearch ? `?name=${nameSearch}` : ''}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách banner');
      const json = await res.json();
      const banners = json?.data?.items || [];
      setData(
        banners.map((b) => ({
          key: b.id,
          title: b.title,
          link: b.link,
          sort_order: b.sort_order,
          status: b.status,
          image: b.image,
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
    fetchBanners();
  }, []);

  const handleSearch = () => fetchBanners(searchText);

  const handleCreate = () => {
    setEditingBanner(null);
    bannerForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    bannerForm.setFieldsValue({
      title: record.title,
      link: record.link,
      sort_order: record.sort_order,
      status: record.status,
      image: record.image,
    });
    setEditingBanner(record.key);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await bannerForm.validateFields();
      setLoading(true);
      let url = '';
      if (editingBanner) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/banner/form/update`;
        values.id = editingBanner;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/banner/form/create`;
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
      if (!res.ok || !data) throw new Error(data?.data?.message || 'Thao tác thất bại');

      message.success(editingBanner ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      bannerForm.resetFields();
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      message.error(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Bạn có chắc muốn xoá banner này?',
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          setLoading(true);
          const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/banner/form/delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (!res.ok || !data) throw new Error(data?.message || 'Xoá thất bại');
          setData((prev) => prev.filter((item) => item.key !== id));
          message.success('Xoá thành công');
        } catch (err) {
          message.error(err.message || 'Xoá thất bại');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', sorter: (a, b) => a.title.localeCompare(b.title) },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      render: (url) =>
        url ? (
          <Image src={url} alt="banner" width={80} height={80} style={{ objectFit: 'cover' }} preview={false} />
        ) : (
          '—'
        ),
    },
    { title: 'Link', dataIndex: 'link' },
    { title: 'Thứ tự', dataIndex: 'sort_order', sorter: (a, b) => a.sort_order - b.sort_order },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (status === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng hoạt động</Tag>),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Banner</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm theo tiêu đề..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleCreate}>
              Thêm mới
            </Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          bannerForm.resetFields();
          setEditingBanner(null);
        }}
        onOk={handleModalOk}
        okText={editingBanner ? 'Cập nhật' : 'Tạo'}
        width={900}
        maskClosable={false}
      >
        <Form form={bannerForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder="Nhập tiêu đề..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="link"
                label="Link"
                rules={[{ required: true, message: 'Vui lòng nhập link' }]}
              >
                <Input placeholder="Nhập link..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort_order"
                label="Thứ tự hiển thị"
                rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
              >
                <Input type="number" placeholder="Nhập số thứ tự..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value={1}>
                    <Tag color="green">Hoạt động</Tag>
                  </Select.Option>
                  <Select.Option value={0}>
                    <Tag color="red">Ngưng hoạt động</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="image" label="Hình ảnh" rules={[{ required: true, message: 'Chọn hình ảnh' }]}>
                <Upload
                  name="file"
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  action={`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/create`}
                  headers={{ Authorization: `Bearer ${token}` }}
                  onChange={({ file }) => {
                    if (file.status === 'done') {
                      const resData = file.response?.data || {};
                      const url = resData.url || (resData.base_url && resData.path ? `${resData.base_url}/${resData.path}` : null);
                      const path = resData.path || null;
                      if (url && path) bannerForm.setFieldsValue({ image: url, image_path: path });
                      message.success('Tải ảnh thành công');
                    } else if (file.status === 'error') {
                      message.error('Tải ảnh thất bại');
                    }
                  }}
                  onRemove={async (file) => {
                    try {
                      const path = file.response?.data?.path || bannerForm.getFieldValue('image_path');
                      if (path) {
                        await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/general/upload/delete`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ path }),
                        });
                        bannerForm.setFieldsValue({ image: null, image_path: null });
                        message.success('Xoá ảnh thành công');
                      }
                    } catch {
                      message.error('Xoá ảnh thất bại');
                    }
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                </Upload>
                {bannerForm.getFieldValue('image') && (
                  <Image src={bannerForm.getFieldValue('image')} alt="Hình hiện tại" width={100} style={{ marginTop: 8 }} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Banner;