import React, { useState, useEffect, useRef } from 'react';
import { Table, Typography, Input, Button, Space, message, Row, Col, Tag, Modal, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { confirm } = Modal;

const Brand = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null); // lưu user đang edit
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

//   const fetchUsers = async (usernameSearch = '') => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form${usernameSearch ? `?username=${usernameSearch}` : ''}`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error('Không thể tải danh sách user');
//       const data = await res.json();
//       const users = data?.data?.items ?? [];
//       setData(
//         users.map(u => ({
//           key: u.id,
//           username: u.username,
//           email: u.email,
//           role: u.role,
//           status: u.status,
//           logged_at: u.logged_at,
//         }))
//       );
//     } catch (err) {
//       message.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;
//     fetchUsers();
//   }, []);

  const handleSearch = () => fetchUsers(searchText);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/view?id=${record.key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Cannot fetch user data');

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
      };

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
      let url = '';
      let method = '';
      if (editingUser) {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/update?id=${editingUser}`;
        method = 'POST';
        values.id = editingUser;
      } else {
        url = `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/create`;
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
      if (!res.ok || !data) throw new Error(data?.message || 'Operation failed');

      message.success(editingUser ? 'User updated successfully' : 'User created successfully');
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'Validate Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/user/form/delete?id=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data) throw new Error(data?.message || 'Failed to delete user');

      setData(prev => prev.filter(item => item.key !== id));
      message.success('User deleted successfully');
    } catch (err) {
      message.error(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      content: `Username: ${record.username}`,
      okText: 'Confirm',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() { return handleDelete(record.key); },
    });
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.username.localeCompare(b.username) },
    { title: 'Slug', dataIndex: 'slug', sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: 'Description', dataIndex: 'description', sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: 'Logo', dataIndex: 'logo', sorter: (a, b) => a.email.localeCompare(b.email) },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: value => value === 1 ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
    },
    { title: 'Logged At', dataIndex: 'logged_at', sorter: (a, b) => new Date(a.logged_at) - new Date(b.logged_at) },
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
        <Col><Title level={2}>Brand</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Search by username..."
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
        title={editingUser ? 'Edit User' : 'Create User'}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); setEditingUser(null); }}
        onOk={handleModalOk}
        okText={editingUser ? 'Update' : 'Create'}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="password" label="Password"><Input.Password autoComplete="new-password" /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select placeholder="Select role">
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select gender">
                  <Select.Option value={0}>Other</Select.Option>
                  <Select.Option value={1}>Male</Select.Option>
                  <Select.Option value={2}>Female</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstname" label="First Name"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastname" label="Last Name"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Brand;
