import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Typography, Input, Button, Space, message,
  Row, Col, Tag, Modal, Form, Select, Upload, DatePicker, Tabs
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const User = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [thumbnailList, setThumbnailList] = useState([]);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const fetchUsers = async (usernameSearch = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form${usernameSearch ? `?username=${usernameSearch}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
      const data = await res.json();
      const users = data?.data?.items ?? [];
      setData(users.map(u => ({
        key: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        logged_at: u.logged_at,
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
    fetchUsers();
  }, []);

  const handleSearch = () => fetchUsers(searchText);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setThumbnailList([]);
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/view?id=${record.key}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Không lấy được dữ liệu');

      const user = data?.data?.user || {};
      const profile = data?.data?.user.profile || {};

      const formValues = {
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        firstname: profile.firstname,
        lastname: profile.lastname,
        gender: profile.gender,
        code: profile.code,
        thumbnail: profile.thumbnail,
      };

      setThumbnailList(profile.thumbnail
        ? [{ uid: '-1', name: 'thumb.jpg', status: 'done', url: profile.thumbnail }]
        : []);

      setEditingUser(user.id);
      form.setFieldsValue(formValues);
      setIsModalVisible(true);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let url = editingUser
        ? `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/update?id=${editingUser}`
        : `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/create`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Thao tác thất bại');

      message.success(editingUser ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công');
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      setThumbnailList([]);
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'Lỗi xác thực');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/delete?id=${id}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Xóa thất bại');

      setData(prev => prev.filter(item => item.key !== id));
      message.success('Xóa người dùng thành công');
    } catch (err) {
      message.error(err.message || 'Không thể xóa');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Bạn có chắc muốn xóa người dùng này?',
      content: `Tài khoản: ${record.username}`,
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() { return handleDelete(record.key); },
    });
  };

  const columns = [
    { title: 'Tên đăng nhập', dataIndex: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
    { title: 'Email', dataIndex: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => {
        let color = role === 'admin' ? 'red' : role === 'manager' ? 'green' : 'blue';
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: value => value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng</Tag>
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'logged_at',
      sorter: (a, b) => new Date(a.logged_at) - new Date(b.logged_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}></Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record)}></Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={2}>Tài Khoản</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm theo tên đăng nhập..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 220 }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleCreate}>Thêm mới</Button>
          </Space>
        </Col>
      </Row>

      <Table columns={columns} dataSource={data} loading={loading} />

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingUser(null);
          setThumbnailList([]);
        }}
        onOk={handleModalOk}
        okText={editingUser ? 'Cập nhật' : 'Tạo mới'}
        width={1000}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: 24 }}
         maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="password" label="Mật khẩu">
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstname" label="Họ" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastname" label="Tên" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Select.Option value={0}>Khác</Select.Option>
                  <Select.Option value={1}>Nam</Select.Option>
                  <Select.Option value={2}>Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                <Select placeholder="Chọn vai trò">
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng Thái"
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
            <Col span={12}>
              <Form.Item name="thumbnail" label="Ảnh đại diện" rules={[{ required: true }]}>
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
                      form.setFieldsValue({ thumbnail: url, thumbnail_path: path });
                    }
                  }}
                >
                  {thumbnailList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
