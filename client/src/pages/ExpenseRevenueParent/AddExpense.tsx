/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ViewExpenses from '../../components/ViewExpenses';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Card,
  Space,
  Typography,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

type Expense = {
  _id?: string;
  date: string;
  amount?: number;
  reason?: string;
};

const ITEM_NAMES = [
  "milk",
  "butterkg",
  "rohit salary",
  "sakhr",
  "bun",
  "sbun",
  "sahil salary",
  "chakali-bhakarvadi",
  "chakali",
  "cake",
  "kokam",
  "ebill",
  "disposal material",
  "bhakarvadi",
  "bailley",
  "lemon cup",
  "gas",
  "jaam",
  "osmania",
  "shree biscuit",
  "butter"
];

const AddExpense = () => {
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

   const fetchExpenses = async () => {
    try {
      const branch = localStorage.getItem('selectedBranch') || '';
      const res = await axiosInstance.get('/expenses', {
        params: { branch }
      });
      setExpenses(res.data);
    } catch {
      message.error('Failed to fetch expenses');
    }
  };


  useEffect(() => {
    fetchExpenses();
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

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
        const branch = localStorage.getItem('selectedBranch') || '';
      const payload = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : '',
        amount: Number(values.amount),
        branch, // Pass branch from localStorage
      };
      if (editingId) {
        await axiosInstance.put(`/expenses/${editingId}`, payload);
        message.success('Expense updated!');
      } else {
        await axiosInstance.post('/expenses', payload);
        message.success('Expense added!');
      }
      form.resetFields();
      setEditingId(null);
      // Reset today's date after reset
      form.setFieldsValue({ date: dayjs() });
    fetchExpenses();
    } catch {
      message.error('Failed to save expense');
    }
    setLoading(false);
  };

  const handleEdit = (expense: Expense) => {
    form.setFieldsValue({
      date: expense.date ? dayjs(expense.date) : null,
      amount: expense.amount,
      reason: expense.reason || '',
    });
    setEditingId(expense._id || null);
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    
    try {
      await axiosInstance.delete(`/expenses/${id}`);
      fetchExpenses();
      message.success('Expense deleted!');
    } catch {
      message.error('Failed to delete expense');
    }
  };

  // Bulk upload handlers
  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axiosInstance.post('/expenses/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Bulk upload successful!');
      fetchExpenses();
    } catch {
      message.error('Bulk upload failed!');
    }
    e.target.value = '';
  };

  return (
    <div style={{ maxWidth: 1200, margin: '10px auto', width: '100%', paddingBottom: 20 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card>
            <Title level={5} style={{ marginBottom: 15, marginTop: 10 }}>
              {editingId ? 'Edit Expense' : 'Add Expense'}
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ amount: null, reason: '', date: dayjs() }}
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
                    if (input) {
                      amountInputRef.current = input.input;
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Reason for Expenses"
                name="reason"
                rules={[{ required: true, message: 'Please select reason' }]}
              >
                <Select placeholder="Select Reason" showSearch optionFilterProp="children">
                  {ITEM_NAMES.map(item => (
                    <Option key={item} value={item}>{item}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                  >
                    {editingId ? 'Update' : 'Add'} Expense
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
                      style={{ marginTop: 20 }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    block
                    style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 4 }}
                    onClick={handleBulkUploadClick}
                  >
                    Bulk Upload (Excel)
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    style={{ display: 'none' }}
                    onChange={handleBulkFileChange}
                  />
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      <Col xs={24} md={14}>
  <Card bordered={false}>
    <Title level={5} style={{ marginBottom: 15, marginTop: 10 }}>Expenses List</Title>
    <ViewExpenses
      expenses={expenses}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  </Card>
</Col>
      </Row>
    </div>
  );
};

export default AddExpense;