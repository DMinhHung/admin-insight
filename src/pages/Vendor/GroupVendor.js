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
  Modal,
  Form,
  Tag,
  Select
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm } = Modal;

const GroupVendor = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerForm] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('accessToken');
  const hasFetched = useRef(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_ADMIN_INSIGHT_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchGroupCustomers = async (nameSearch = '') => {
    setLoading(true);
    try {
      const res = await api.get(
        `api/v1/admin/supplier/group${nameSearch ? `?name=${encodeURIComponent(nameSearch)}` : ''}`
      );
      const vendor_group = res?.data?.data?.items || [];
      setData(
        vendor_group.map((vg) => ({
          key: vg.id,
          name: vg.name,
          value: vg.value,
          status: vg.status,
        }))
      );
    } catch (err) {
      message.error(err.message || 'Không thể tải danh sách nhóm khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchGroupCustomers();
  }, []);

  const handleSearch = () => fetchGroupCustomers(searchText);

  const handleCreate = () => {
    setEditingId(null);
    customerForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/admin/supplier/group/view`, {
        params: { id: record.key },
      });
      const group = res?.data?.data || {};
      customerForm.setFieldsValue(group);
      setEditingId(group.id);
      setIsModalVisible(true);
    } catch (err) {
      message.error(err.message || 'Không thể lấy dữ liệu nhóm khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await customerForm.validateFields();
      setLoading(true);
      const url = editingId
        ? '/api/v1/admin/supplier/group/update'
        : '/api/v1/admin/supplier/group/create';
      if (editingId) values.id = editingId;

      const res = await api.post(url, values);
      const dataRes = res.data;
      if (!dataRes.status) {
        message.error(dataRes.message || 'Thao tác thất bại');
        return;
      }

      message.success(editingId ? 'Cập nhật thành công' : 'Tạo mới thành công');
      setIsModalVisible(false);
      customerForm.resetFields();
      setEditingId(null);
      fetchGroupCustomers();
    } catch (err) {
      message.error(err.message || 'Validate thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    confirm({
      title: 'Xóa nhóm khách hàng?',
      onOk: async () => {
        try {
          setLoading(true);
          const res = await api.post(`/api/v1/admin/supplier/group/delete`, { id });
          if (!res.data.status) throw new Error(res.data.message || 'Xóa thất bại');
          setData((prev) => prev.filter((item) => item.key !== id));
          message.success('Đã xóa thành công');
        } catch (err) {
          message.error(err.message || 'Xóa thất bại');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    { title: 'Mô tả', dataIndex: 'value' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      sorter: (a, b) => (a.status ?? 0) - (b.status ?? 0),
      render: (value) =>
        value === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng hoạt động</Tag>,
    },
    {
      title: 'Hành động',
      render: (_, r) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
            Sửa
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.key)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Nhóm Nhà Cung Cấp</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Tìm tên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleCreate}>
              Tạo mới
            </Button>
          </Space>
        </Col>
      </Row>

      <Table columns={columns} dataSource={data} loading={loading} />

      <Modal
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          customerForm.resetFields();
          setEditingId(null);
        }}
        onOk={handleModalOk}
        width={600}
        maskClosable={false}
        title={editingId ? 'Sửa nhóm nhà cung cấp' : 'Tạo nhóm nhà cung cấp'}
      >
        <Form form={customerForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Nhập tên nhóm' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="value"
            label="Mô tả nhóm"
            rules={[{ required: true, message: 'Nhập mô tả' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
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
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupVendor;