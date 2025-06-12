import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Card,
  Space,
  Typography,
  Table,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';

const { Title } = Typography;

type Revenue = {
  _id?: string;
  date: string;
  amount: number;
  comment?: string;
  branch?: string;
};

const AddRevenue = () => {
  const [form] = Form.useForm();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

   // Fetch revenues for selected branch
  const fetchRevenues = async () => {
    try {
      const branch = localStorage.getItem('selectedBranch') || '';
      const res = await axiosInstance.get('/revenue', {
        params: { branch }
      });
      setRevenues(res.data);
    } catch {
      setError('Failed to fetch revenue');
    }
  };

  useEffect(() => {
    fetchRevenues();
    // Set today's date as default selected
    form.setFieldsValue({ date: dayjs() });
  }, []);

  // Focus amount field when tab is selected (if used in a tab context)
  useEffect(() => {
    const tabBtns = document.querySelectorAll('.ant-tabs-tab');
    const focusAmount = () => setTimeout(() => amountInputRef.current?.focus(), 100);
    tabBtns.forEach(btn => btn.addEventListener('click', focusAmount));
    return () => {
      tabBtns.forEach(btn => btn.removeEventListener('click', focusAmount));
    };
  }, []);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFinish = async (values: any) => {
  setError('');
  setSuccess('');
  setLoading(true);
  try {
    const branch = localStorage.getItem('selectedBranch') || '';
      const payload = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        amount: Number(values.amount),
        branch, // Pass branch from localStorage
      };
    if (!payload.date || isNaN(payload.amount)) {
      setError('Date and amount are required.');
      setLoading(false);
      return;
    }
    if (editingId) {
      await axiosInstance.put(`/revenue/${editingId}`, payload);
      setSuccess('Revenue updated!');
    } else {
      await axiosInstance.post('/revenue', payload);
      setSuccess('Revenue added!');
    }
    form.resetFields();
    setEditingId(null);
    // Reset today's date after reset
    form.setFieldsValue({ date: dayjs() });
    fetchRevenues();
  } catch {
    setError('Failed to save revenue');
  }
  setLoading(false);
};

  const handleEdit = (revenue: Revenue) => {
    form.setFieldsValue({
      date: revenue.date ? dayjs(revenue.date) : null,
      amount: revenue.amount,
      comment: revenue.comment || '',
      branch: revenue.branch,
    });
    setEditingId(revenue._id || null);
    setError('');
    setSuccess('');
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this revenue?')) return;
    try {
      await axiosInstance.delete(`/revenue/${id}`);
      fetchRevenues();
      message.success('Revenue deleted!');
    } catch {
      setError('Failed to delete revenue');
    }
  };

 

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axiosInstance.post('/expences/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Bulk upload successful!');
      fetchRevenues();
    } catch {
      setError('Bulk upload failed');
    }
    e.target.value = '';
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => date?.slice(0, 10),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount}`,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Revenue) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this revenue?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button  
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as Breakpoint[],
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '10px auto', width: '100%', paddingBottom:20 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card>
            <Title level={5} style={{ marginBottom: 15, marginTop: 10 }}>
              {editingId ? 'Edit Revenue' : 'Add Revenue'}
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ amount: null, date: dayjs() }}
            >
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  { required: true, message: 'Please enter amount' },
                  { type: 'number', min: 1, message: 'Amount must be positive', transform: Number }
                ]}
              >
                <Input
                  type="number"
                  placeholder="Amount"
                  ref={input => {
                    // AntD Input passes the component instance, but we want the native input
                    if (input) {
                      amountInputRef.current = input.input;
                    }
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                  >
                    {editingId ? 'Update' : 'Add'} Revenue
                  </Button>
                  {editingId && (
                    <Button
                      block
                      onClick={() => {
                        form.resetFields();
                        setEditingId(null);
                        form.setFieldsValue({ date: dayjs() });
                        setTimeout(() => amountInputRef.current?.focus(), 100);
                      }}
                      style={{ marginTop: 0 }}
                    >
                      Cancel
                    </Button>
                  )}
                  {/* <Button
                    block
                    icon={<UploadOutlined />}
                    style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4 }}
                    onClick={handleBulkUploadClick}
                  >
                    Bulk Upload (Excel)
                  </Button> */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    style={{ display: 'none' }}
                    onChange={handleBulkFileChange}
                  />
                </Space>
              </Form.Item>
              {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
              {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card>
            <Title level={5} style={{ marginBottom: 10, marginTop:10 }}>Revenue List</Title>
            <Table
              columns={columns}
              dataSource={revenues}
              rowKey={record => record._id || record.date + record.amount}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              size="middle"
              scroll={{ x: true }}
              bordered
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddRevenue;