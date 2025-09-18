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
} from 'antd';

const { Option } = Select;

const VariantTable = ({ productId }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attributesList, setAttributesList] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [valueOptions, setValueOptions] = useState({});
  const [form] = Form.useForm();
  const token = localStorage.getItem('accessToken');

  const fetchedRef = useRef(false);

  // --- Lấy danh sách biến thể ---
  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/get?id=${productId}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Không thể tải danh sách biến thể');
      const data = await res.json();
      const items = data?.data || [];

      const mapped = items.map((variant, idx) => ({
        id: idx,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        name: `${variant.item?.name || ''} - ${variant.attributes.map(a => `${a.name}: ${a.value}`).join(', ')}`,
        attributes: variant.attributes || [],
      }));

      setVariants(mapped);
    } catch (err) {
      console.error(err);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchVariants();
  }, [productId, token]);

  // --- Lấy danh sách attributes ---
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute`,
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setAttributesList(
          data?.data?.items?.map(a => ({ id: a.id, name: a.name })) || []
        );
      } catch (err) {
        console.error(err);
        message.error('Không thể tải danh sách thuộc tính');
      }
    };
    fetchAttributes();
  }, [token]);

  // --- Khi chọn attribute => load value ---
  const handleAttrChange = async (ids) => {
    setSelectedAttrs(ids);
    const newValueOptions = {};
    for (const attrId of ids) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-attribute/view?id=${attrId}`,
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        newValueOptions[attrId] = data?.data?.value || [];
      } catch (err) {
        console.error(err);
        message.error(`Không thể tải giá trị cho attribute ID ${attrId}`);
      }
    }
    setValueOptions(newValueOptions);
  };

  // --- Mở modal ---
  const openModal = () => {
    form.resetFields();
    setSelectedAttrs([]);
    setValueOptions({});
    setIsModalVisible(true);
  };

  // --- Submit tạo biến thể ---
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        item_id: productId,
        sku: values.sku,
        price: values.price,
        stock: values.stock,
        item_attribute_id: values.attributes,
        item_attribute_value_id: values.attributes.map(id => values.values[id]),
      };

      const res = await fetch(
        `${process.env.REACT_APP_ADMIN_INSIGHT_URL}/api/v1/admin/product/item-variant/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      const dataRes = await res.json();
      if (!res.ok || !dataRes.status) throw new Error(dataRes.messages || 'Tạo biến thể thất bại');

      message.success('Tạo biến thể thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchVariants();
    } catch (err) {
      message.error(err.message || 'Tạo biến thể thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button type="primary" onClick={openModal}>Tạo biến thể</Button>
          </Space>
        </Col>
      </Row>

      <Table
        size="small"
        loading={loading}
        pagination={false}
        columns={[
          { title: 'Tên sản phẩm', dataIndex: 'name' },
          { title: 'SKU', dataIndex: 'sku' },
          { title: 'Giá', dataIndex: 'price' },
          { title: 'Tồn kho', dataIndex: 'stock' },
          {
            title: 'Thuộc tính',
            dataIndex: 'attributes',
            render: (_, record) => (
              <>
                {record.attributes.map(attr => (
                  <Tag color="blue" key={attr.name}>{`${attr.name}: ${attr.value}`}</Tag>
                ))}
              </>
            ),
          },
        ]}
        dataSource={variants.map(v => ({ ...v, key: v.id }))}
        locale={{ emptyText: 'Không có biến thể' }}
      />

      <Modal
        title="Tạo biến thể mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleModalOk}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Nhập SKU' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="stock" label="Tồn kho" rules={[{ required: true, message: 'Nhập tồn kho' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="attributes"
            label="Chọn thuộc tính"
            rules={[{ required: true, message: 'Chọn ít nhất một thuộc tính' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn thuộc tính"
              onChange={handleAttrChange}
            >
              {attributesList.map(attr => (
                <Option key={attr.id} value={attr.id}>{attr.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {selectedAttrs.map(attrId => (
            <Form.Item
              key={attrId}
              name={['values', attrId]}
              label={`Giá trị cho ${attributesList.find(a => a.id === attrId)?.name}`}
              rules={[{ required: true, message: 'Chọn giá trị' }]}
            >
              <Select placeholder="Chọn giá trị">
                {(valueOptions[attrId] || []).map(v => (
                  <Option key={v.id} value={v.id}>{v.value}</Option>
                ))}
              </Select>
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
};

export default VariantTable;
