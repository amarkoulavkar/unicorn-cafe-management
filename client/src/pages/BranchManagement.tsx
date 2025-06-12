/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import BranchList from '../components/BranchList';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Checkbox,
  message,
  Typography,
  Space,Row, Col
} from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export type Branch = {
  _id?: string;
  name: string;
  location: string;
  owner: string;
  address: string;
  openingDate: string;
  isActive: boolean;
  comment: string;
  email: string;
};
const emptyBranch: Branch = {
  name: '',
  location: '',
  owner: '',
  address: '',
  openingDate: '',
  isActive: true,
  comment: '',
  email: '',
};

const BranchManagement = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const token = localStorage.getItem('token');

  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get('https://unicorn-cafe-management-hgka.vercel.app//api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
    } catch {
      setError('Failed to fetch branches');
    }
  };

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line
  }, []);

  const handleFinish = async (values: any) => {
    setError('');
    try {
      let response;
      const payload = {
        ...values,
        openingDate: values.openingDate ? values.openingDate.format('YYYY-MM-DD') : '',
      };
      if (editingId) {
        response = await axiosInstance.put(
          `https://unicorn-cafe-management-hgka.vercel.app//api/branches/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCredentials(null); // Don't show credentials on edit
      } else {
        response = await axiosInstance.post(
          'https://unicorn-cafe-management-hgka.vercel.app//api/branches',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && response.data.credentials) {
          setCredentials(response.data.credentials);
        } else {
          setCredentials(null);
        }
      }
      form.resetFields();
      setEditingId(null);
      fetchBranches();
      message.success(editingId ? 'Branch updated!' : 'Branch added!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save branch');
    }
  };

  const handleEdit = (branch: Branch) => {
    form.setFieldsValue({
      ...branch,
      openingDate: branch.openingDate ? dayjs(branch.openingDate) : null,
    });
    setEditingId(branch._id || null);
    setCredentials(null); // Hide credentials card on edit
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this branch?')) return;
    try {
      await axiosInstance.delete(`https://unicorn-cafe-management-hgka.vercel.app//api/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBranches();
      message.success('Branch deleted!');
    } catch {
      setError('Failed to delete branch');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingId(null);
    setError('');
    setCredentials(null); // Hide credentials card on cancel
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0px auto', width: '100%', paddingBottom: 90 }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16, marginTop: 0 }}>
          {editingId ? 'Edit Branch' : 'Add Branch'}
        </Title>
     <Form
  form={form}
  layout="vertical"
  initialValues={{ ...emptyBranch, isActive: true }}
  onFinish={handleFinish}
>
  <Row gutter={16}>
    <Col xs={24} md={8}>
      <Form.Item
        label="Branch Name"
        name="name"
        rules={[{ required: true, message: 'Please enter branch name' }]}
      >
        <Input placeholder="Branch Name" />
      </Form.Item>
    </Col>
    <Col xs={24} md={8}>
      <Form.Item
        label="Location"
        name="location"
        rules={[{ required: true, message: 'Please enter location' }]}
      >
        <Input placeholder="Location" />
      </Form.Item>
    </Col>
    <Col xs={24} md={8}>
      <Form.Item
        label="Owner"
        name="owner"
        rules={[{ required: true, message: 'Please enter owner' }]}
      >
        <Input placeholder="Owner" />
      </Form.Item>
    </Col>
  </Row>
  <Row gutter={16}>
    <Col xs={24} md={8}>
      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: 'Please enter address' }]}
      >
        <Input placeholder="Address" />
      </Form.Item>
    </Col>
    <Col xs={24} md={8}>
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>
    </Col>
    <Col xs={24} md={8}>
      <Form.Item
        label="Comment"
        name="comment"
      >
        <Input.TextArea placeholder="Comment" rows={1} />
      </Form.Item>
    </Col>
  </Row>
 <Row gutter={16}>
  <Col xs={24} md={8}>
    <Form.Item
      label="Opening Date"
      name="openingDate"
      rules={[{ required: true, message: 'Please select opening date' }]}
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
  </Col>
  <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'center' }}>
    <Form.Item
      name="isActive"
      valuePropName="checked"
      style={{ width: '100%', marginBottom: 0 }}
    >
      <Checkbox>Active</Checkbox>
    </Form.Item>
  </Col>
  <Col xs={24} md={8} />
</Row>
  <Form.Item>
    <Space>
      <Button type="primary" htmlType="submit" style={{ marginTop: 20 }}>
        {editingId ? 'Update' : 'Add'} Branch
      </Button>
      {editingId && (
        <Button  style={{ marginTop: 20 }} onClick={handleCancel}>Cancel</Button>
      )}
    </Space>
  </Form.Item>
  {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
</Form>

        {credentials && (
          <Card
            size="small"
            style={{
              border: '2px solid #4caf50',
              borderRadius: 8,
              margin: '16px 0',
              background: '#f6fff6'
            }}
            title="Branch Credentials"
          >
            <div><b>Username:</b> {credentials.username}</div>
            <div><b>Password:</b> {credentials.password}</div>
          </Card>
        )}
      </Card>
      <Card>
        <BranchList branches={branches} onEdit={handleEdit} onDelete={handleDelete} />
      </Card>
    </div>
  );
};

export default BranchManagement;