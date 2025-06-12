import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Form, Input, Button, Card, Typography, message, Row, Col, Grid } from 'antd';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      // Redirect based on role
      if (res.data.role === 'manager') {
        navigate('/dashboard');
      } else if (res.data.role === 'staff') {
        navigate('/dashboard'); // or another route for staff
      } else {
        navigate('/dashboard');
      }
    } catch {
      message.error('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Row style={{ width: '100%', height: '100vh' }} align="middle" justify="center">
        {screens.md && (
          <Col
            md={17}
            style={{
              background: '#e9c920',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              height: '100vh',
              padding: 0,
              margin: 0,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
              alt="Cafe Banner"
              style={{
                width: '100%',
                height: '100vh',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 0,
                boxShadow: 'none',
                marginBottom: 0,
                border: 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 40,
              left: 0,
              width: '100%',
              textAlign: 'center',
              zIndex: 2,
              pointerEvents: 'none'
            }}>
              <Title level={2} style={{ color: '#fff', textShadow: '0 2px 8px #b89d0c', fontWeight: 700 }}>
                Welcome to Unicorn Cafe
              </Title>
            </div>
          </Col>
        )}
        <Col xs={24} md={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Card style={{ width: '100%', maxWidth: 350, borderRadius: 8, margin: '0 auto' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Login</Title>
            <Form
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ fontWeight: 600 }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;