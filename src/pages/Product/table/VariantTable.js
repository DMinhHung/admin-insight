import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Upload,
  Popconfirm,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Option } = Select;

// Hàm random code
const randomCode = (len = 8) => Math.random().toString().slice(2, 2 + len);

const VariantTable = ({ productId, productName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [valueOptions, setValueOptions] = useState({});
  const [thumbnailList, setThumbnailList] = useState([]);
  const [form] = Form.useForm();
  const token = localStorage.getItem('accessToken');
  const fetchedRef = useRef(false);

  // --- Fetch variants ---
  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/get?id=${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách biến thể');
      const data = await res.json();
      const items = data?.data || [];
      setVariants(
        items.map((v, i) => ({
          key: v.id || v.variant_id || i,
          id: v.id || v.variant_id || i,
          variant_id: v.id,
          name: v.name,
          sku: v.sku,
          barcode: v.barcode,
          price: v.price,
          stock: v.stock,
          thumbnail: v.thumbnail || '',
          thumbnail_path: v.thumbnail_path || '',
          attributes: (v.attributes || []).map(a => ({
            attribute_id: a.attribute_id,
            attribute_value_id: a.attribute_value_id,
            name: a.name,
            value: a.value,
          })),
        }))
      );

      console.log(items);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchVariants();
    }
  }, [productId]);

  // --- Fetch attributes ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAttributesList(
          data?.data?.items?.map(a => ({ id: a.id, name: a.name })) || []
        );
      } catch {
        message.error('Không thể tải danh sách thuộc tính');
      }
    })();
  }, [token]);

  // --- Cập nhật tên biến thể ---
  const updateVariantName = valuesObj => {
    const chosen = selectedAttrs
      .map(id => {
        const list = valueOptions[id] || [];
        const valId = valuesObj?.[id];
        return list.find(v => v.id === valId)?.value;
      })
      .filter(Boolean);
    form.setFieldsValue({ name: [productName, ...chosen].join(' - ') });
  };

  // --- Handle chọn thuộc tính ---
  const handleAttrChange = async ids => {
    setSelectedAttrs(ids);
    const opts = {};
    for (const id of ids) {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/view?id=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await res.json();
      opts[id] = d?.data?.value || [];
    }
    setValueOptions(opts);
    form.setFieldsValue({ name: productName });
  };

  // --- Mở modal ---
  const openModal = async record => {
    if (record) {
      setEditing(record);
      const attrIds = record.attributes.map(a => a.attribute_id);
      setSelectedAttrs(attrIds);

      const valuesMap = record.attributes.reduce((acc, a) => {
        acc[a.attribute_id] = a.attribute_value_id;
        return acc;
      }, {});

      const results = await Promise.all(
        attrIds.map(id =>
          fetch(
            `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/view?id=${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(r => r.json())
        )
      );
      const opts = {};
      results.forEach((res, i) => {
        opts[attrIds[i]] = res?.data?.value || [];
      });
      setValueOptions(opts);

      if (record.thumbnail) {
        setThumbnailList([
          { uid: '-1', name: 'thumbnail.jpg', status: 'done', url: record.thumbnail },
        ]);
      } else setThumbnailList([]);

      form.setFieldsValue({
        ...record,
        attributes: attrIds,
        values: valuesMap,
        name: record.name ?? productName,
        sku: record.sku,
        barcode: record.barcode,
        price: record.price,
        stock: record.stock,
        thumbnail: record.thumbnail || '',
        thumbnail_path: record.thumbnail_path || '',
      });
    } else {
      setEditing(null);
      setThumbnailList([]);
      form.resetFields();
      form.setFieldsValue({
        sku: randomCode(),
        barcode: randomCode(12),
        name: productName,
      });
      setSelectedAttrs([]);
      setValueOptions({});
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        item_id: productId,
        id: editing?.variant_id,
        name: values.name,
        sku: values.sku,
        barcode: values.barcode,
        price: values.price,
        stock: values.stock,
        thumbnail: values.thumbnail,
        thumbnail_path: values.thumbnail_path,
        item_attribute_id: values.attributes,
        item_attribute_value_id: values.attributes.map(id => values.values[id]),
      };

      const url = editing
        ? `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/update?id=${editing.variant_id}`
        : `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/create`;
      const method = editing ? 'POST' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.messages || 'Lưu thất bại');
      message.success(editing ? 'Đã cập nhật' : 'Đã tạo');
      setModalVisible(false);
      fetchVariants();
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Xóa biến thể ---
  const handleDelete = async id => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/delete?id=${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.messages || 'Xóa thất bại');
      message.success('Đã xóa');
      fetchVariants();
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Columns table ---
  const columns = [
    {
      title: 'Tên', dataIndex: 'name'
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      render: url =>
        url ? <Image src={url} alt="thumbnail" width={80} height={80} style={{ objectFit: 'cover' }} preview={false} /> : '—',
    },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Mã vạch', dataIndex: 'barcode' },
    { title: 'Giá', dataIndex: 'price' },
    { title: 'Tồn kho', dataIndex: 'stock' },
    {
      title: 'Thuộc tính',
      dataIndex: 'attributes',
      render: (_, r) =>
        r.attributes.map(a => (
          <Tag color="blue" key={a.attribute_id}>
            {`${a.name}: ${a.value}`}
          </Tag>
        )),
    },
    {
      title: 'Thao tác',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm title="Xóa biến thể?" onConfirm={() => handleDelete(r.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>


      <Table
        size="middle"
        loading={loading}
        columns={columns}
        dataSource={variants}
        pagination={false}
        bordered
        locale={{ emptyText: 'Không có biến thể' }}
      />

      <Row justify="center" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Tạo biến thể
          </Button>
        </Col>
      </Row>

      <Modal
        title={editing ? 'Chỉnh sửa biến thể' : 'Tạo biến thể mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        width="90vw"
        style={{ maxWidth: '1200px' }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: 24 }}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item name="thumbnail" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="thumbnail_path" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên biến thể"
            rules={[{ required: true, message: 'Nhập tên biến thể' }]}
          >
            <Input placeholder="Tên biến thể" />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input
                  addonAfter={
                    <ReloadOutlined
                      onClick={() => form.setFieldsValue({ sku: randomCode() })}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="barcode" label="Mã vạch" rules={[{ required: true }]}>
                <Input
                  addonAfter={
                    <ReloadOutlined
                      onClick={() => form.setFieldsValue({ barcode: randomCode(12) })}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value =>
                    value
                      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                      : ''
                  }
                  parser={value => (value ? value.replace(/\./g, '') : '')}
                  placeholder="1.000.000"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="attributes"
            label="Thuộc tính"
            rules={[{ required: true, message: 'Chọn ít nhất một thuộc tính' }]}
          >
            <Select mode="multiple" placeholder="Chọn thuộc tính" onChange={handleAttrChange}>
              {attributesList.map(attr => (
                <Option key={attr.id} value={attr.id}>
                  {attr.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh đại diện" required>
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
                if (fileList.length === 0) {
                  form.setFieldsValue({ thumbnail: '', thumbnail_path: '' });
                }
              }}
              onPreview={file => window.open(file.url || file.thumbUrl, '_blank')}
            >
              {thumbnailList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Row gutter={[24, 24]}>
            {selectedAttrs.map(attrId => (
              <Col xs={24} sm={12} md={8} key={attrId}>
                <Form.Item
                  name={['values', attrId]}
                  label={`Giá trị: ${attributesList.find(a => a.id === attrId)?.name}`}
                  rules={[{ required: true, message: 'Chọn giá trị' }]}
                >
                  <Select
                    placeholder="Chọn giá trị"
                    onChange={() => updateVariantName(form.getFieldValue('values'))}
                  >
                    {(valueOptions[attrId] || []).map(v => (
                      <Option key={v.id} value={v.id}>
                        {v.value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default VariantTable;
