import React, { useState } from 'react';
import { Table, Typography, Input, Button, Space, Popconfirm, message, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const User = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([
    { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
    { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
    { key: '3', name: 'Joe Black', age: 32, address: 'Sydney No. 1 Lake Park' },
    { key: '4', name: 'Jim Red', age: 32, address: 'London No. 2 Lake Park' },
  ]);

  const handleSearch = () => {
    console.log('Search:', searchText);
  };

  const handleCreate = () => {
    console.log('Create new product');
  };

  const handleEdit = (record) => {
    message.info(`Edit product: ${record.name}`);
  };

  const handleDelete = (key) => {
    setData(prev => prev.filter(item => item.key !== key));
    message.success('Deleted successfully');
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
    { title: 'Address', dataIndex: 'address', sorter: (a, b) => a.address.localeCompare(b.address) },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Top row: title + controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>User</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleSearch}>Filter</Button>
            <Button type="primary" onClick={handleCreate}>Create</Button>
          </Space>
        </Col>
      </Row>

      {/* Table dưới */}
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default User;
