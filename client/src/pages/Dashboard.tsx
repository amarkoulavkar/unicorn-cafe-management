// @ts-nocheck

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import {
  Layout,
  Card,
  Select,
  DatePicker,
  Table,
  Tabs,
  Statistic,
  Row,
  Col,
  Typography,
  Input,
  Space,
  Grid,
  Descriptions
} from 'antd';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import axiosInstance from '../api/axiosInstance';
import './Dashboard.css';

Chart.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const branchOptions = [
  { label: 'Rankala', value: 'Rankala' },
  { label: 'Dhyanchand Hockey Stadium', value: 'Dhyanchand Hockey Stadium' }
];

const getYearOptions = (range = 10) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: range }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  // Toggle between 'day' and 'month' mode
  const [mode, setMode] = useState<'day' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(5, 7);
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const today = new Date();
    return today.getFullYear().toString();
  });

  // Tabs for sales summary
  const [salesTab, setSalesTab] = useState<'revenue' | 'expense'>('revenue');

  // Expenses and Revenue state
  const [expenses, setExpenses] = useState<{ reason: string; amount: number; date: string }[]>([]);
  const [revenues, setRevenues] = useState<{ amount: number; date: string }[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeBranches, setActiveBranches] = useState(0);

  const [summary, setSummary] = useState<{ users?: number; branches?: number; grandTotalExpenses?: number; grandTotalProfit?: number } | null>(null);

  // Branch selection for admin
  const role = localStorage.getItem('role');
  const [selectedBranch, setSelectedBranch] = useState<string>(() => localStorage.getItem('selectedBranch') || branchOptions[0].value);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    localStorage.setItem('selectedBranch', value);
  };

  // Fetch summary stats (including active branches) from API
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get('/stats/summary');
        setSummary(res.data);
        setActiveBranches(res.data.branches || 0);
      } catch {
        setSummary(null);
        setActiveBranches(0);
      }
    };
    fetchSummary();
  }, []);

  // Fetch both expenses and revenues using their respective /by-date APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        let params: any = {};
        if (mode === 'day') {
          const dateObj = new Date(selectedDate);
          params.day = String(dateObj.getDate()).padStart(2, '0');
          params.month = String(dateObj.getMonth() + 1).padStart(2, '0');
          params.year = String(dateObj.getFullYear());
        } else {
          params.month = selectedMonth;
          params.year = selectedYear;
        }
        // Always pass selectedBranch from localStorage
        params.branch = localStorage.getItem('selectedBranch') || selectedBranch;

        // Expenses by date
        const expRes = await axiosInstance.get('/expenses/by-date', { params });
        const expList = (expRes.data.expenses || expRes.data).filter((exp: any) => exp.amount > 0);
        setExpenses(
          expList.map((exp: any) => ({
            reason: exp.reason,
            amount: exp.amount,
            date: exp.date,
          }))
        );
        setTotalExpenses(expList.reduce((sum: number, exp: any) => sum + exp.amount, 0));

        // Revenues by date
        const revRes = await axiosInstance.get('/revenue/by-date', { params });
        const revList = (revRes.data.revenues || revRes.data).filter((rev: any) => rev.amount > 0);
        setRevenues(
          revList.map((rev: any) => ({
            amount: rev.amount,
            date: rev.date,
          }))
        );
        setTotalRevenue(revRes.data.totalAmount || revList.reduce((sum: number, rev: any) => sum + (rev.amount || 0), 0));
      } catch {
        setExpenses([]);
        setRevenues([]);
        setTotalExpenses(0);
        setTotalRevenue(0);
      }
    };
    fetchData();
  }, [selectedDate, selectedMonth, selectedYear, mode, selectedBranch]);

  // Dummy: Set active branches (replace with API if needed)
  useEffect(() => {
    setActiveBranches(4);
  }, []);

  const yearOptions = getYearOptions(10);

  return (
    <Layout.Content
      style={{
        padding: '15px 0',
        background: '#f5f6fa'
      }}
    >
      <div
        style={{
          margin: '0 auto',
          padding: '0 10px'
        }}
      >
        <Row align="middle" justify="space-between" gutter={8} style={{ marginBottom: 0 }}>
         
        </Row>

        <Row gutter={[12, 12]}>
          {/* Daily Sales Summary */}
          <Col xs={24} md={12}>
            <Card
              bodyStyle={{ padding: 14 }}
              title={
                <div>
                  Daily Sales Summary
                  {/* On mobile, controls will be rendered below */}
                </div>
              }
              extra={
                screens.md ? (
                  <Space>
                    <Select
                      value={mode}
                      onChange={value => setMode(value)}
                      style={{ width: 90 }}
                      size="small"
                    >
                      <Option value="day">Day</Option>
                      <Option value="month">Month</Option>
                    </Select>
                    {mode === 'day' ? (
                      <DatePicker
                        value={dayjs(selectedDate)}
                        onChange={date => setSelectedDate(date?.format('YYYY-MM-DD') || '')}
                        style={{ width: 130 }}
                        size="small"
                      />
                    ) : (
                      <Space>
                        <Select
                          value={selectedMonth}
                          onChange={setSelectedMonth}
                          style={{ width: 110 }}
                          size="small"
                        >
                          {months.map(m => (
                            <Option key={m.value} value={m.value}>
                              {m.label}
                            </Option>
                          ))}
                        </Select>
                        <Select
                          value={selectedYear}
                          onChange={setSelectedYear}
                          style={{ width: 90 }}
                          size="small"
                          options={yearOptions}
                        />
                      </Space>
                    )}
                  </Space>
                ) : null
              }
            >
              {/* On mobile, show controls here */}
              {!screens.md && (
                <div style={{ marginBottom: 12 }}>
                  <Row gutter={8} wrap align="middle">
                    <Col span={24}>
                      <Select
                        value={mode}
                        onChange={value => setMode(value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        <Option value="day">Day</Option>
                        <Option value="month">Month</Option>
                      </Select>
                    </Col>
                    <Col span={24} style={{ marginTop: 8 }}>
                      <Row gutter={8}>
                        {mode === 'day' ? (
                          <>
                            <Col span={12}>
                              <DatePicker
                                value={dayjs(selectedDate)}
                                onChange={date => setSelectedDate(date?.format('YYYY-MM-DD') || '')}
                                style={{ width: '100%' }}
                                size="small"
                              />
                            </Col>
                            <Col span={12}></Col>
                          </>
                        ) : (
                          <>
                            <Col span={12}>
                              <Select
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                style={{ width: '100%' }}
                                size="small"
                              >
                                {months.map(m => (
                                  <Option key={m.value} value={m.value}>
                                    {m.label}
                                  </Option>
                                ))}
                              </Select>
                            </Col>
                            <Col span={12}>
                              <Select
                                value={selectedYear}
                                onChange={setSelectedYear}
                                style={{ width: '100%' }}
                                size="small"
                                options={yearOptions}
                              />
                            </Col>
                          </>
                        )}
                      </Row>
                    </Col>
                  </Row>
                </div>
              )}

              <Tabs
                activeKey={salesTab}
                onChange={key => setSalesTab(key as 'revenue' | 'expense')}
                items={[
                  {
                    key: 'revenue',
                    label: 'Revenue',
                    children: (
                      <>
                        <Statistic
                          title="Total Revenue"
                          value={totalRevenue}
                          prefix="₹"
                          valueStyle={{ color: '#388e3c' }}
                        />
                        <Table
                          dataSource={revenues}
                          columns={[
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              key: 'date',
                              render: date => date?.slice(0, 10)
                            },
                            {
                              title: 'Amount',
                              dataIndex: 'amount',
                              key: 'amount',
                              render: amount => `₹${amount}`
                            }
                          ]}
                          pagination={false}
                          size="small"
                          style={{ marginTop: 12 }}
                          rowKey={r => r.date + r.amount}
                        />
                      </>
                    )
                  },
                  {
                    key: 'expense',
                    label: 'Expenses',
                    children: (
                      <>
                        <Statistic
                          title="Total Expenses"
                          value={totalExpenses}
                          prefix="₹"
                          valueStyle={{ color: '#d32f2f' }}
                        />
                        <Table
                          dataSource={expenses}
                          columns={[
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              key: 'date',
                              render: date => date?.slice(0, 10)
                            },
                            {
                              title: 'Amount',
                              dataIndex: 'amount',
                              key: 'amount',
                              render: amount => `₹${amount}`
                            },
                            {
                              title: 'Reason',
                              dataIndex: 'reason',
                              key: 'reason'
                            }
                          ]}
                          pagination={false}
                          size="small"
                          style={{ marginTop: 12 }}
                          rowKey={r => r.date + r.amount + r.reason}
                        />
                      </>
                    )
                  }
                ]}
              />
              <Statistic
                title="Total (Revenue - Expenses)"
                value={totalRevenue - totalExpenses}
                prefix="₹"
                valueStyle={{ color: '#1976d2' }}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>

          {/* Revenue vs Expenses Pie Chart */}
          <Col xs={24} md={12}>
            <Card
              bodyStyle={{ padding: 14 }}
              title="Revenue vs Expenses"
            >
              <div style={{ height: 180, margin: '5px 0' }}>
                <Pie
                  data={{
                    labels: ['Revenue', 'Expenses'],
                    datasets: [
                      {
                        data: [totalRevenue, totalExpenses],
                        backgroundColor: ['#388e3c', '#d32f2f'],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom' as const
                      }
                    },
                    cutout: '60%',
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
              <Row justify="center" gutter={16}>
                <Col>
                  <Statistic
                    title="Revenue"
                    value={totalRevenue}
                    prefix="₹"
                    valueStyle={{ color: '#388e3c' }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="Expenses"
                    value={totalExpenses}
                    prefix="₹"
                    valueStyle={{ color: '#d32f2f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* System Summary */}
          <Col xs={24} md={12}>
            <Card style={{ height: '100%' }} bodyStyle={{ padding: 10 }} title="System Summary">
              {summary ? (
                <Descriptions
                  column={1}
                  size="small"
                  bordered
                  labelStyle={{ fontWeight: 600, width: 160 }}
                  contentStyle={{ textAlign: 'right' }}
                >
                  <Descriptions.Item label="Users">{summary.users ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Branches">{summary.branches ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Total Expenses">
                    <span style={{ color: '#d32f2f', fontWeight: 500 }}>
                      ₹{summary.grandTotalExpenses ?? '-'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Grand Total Profit">
                    <span style={{ color: '#388e3c', fontWeight: 500 }}>
                      ₹{summary.grandTotalProfit ?? '-'}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <Statistic title="Loading..." value={0} />
                </div>
              )}
            </Card>
          </Col>

          {/* Other */}
          <Col xs={24} md={12}>
            <Card style={{ height: '100%' }} bodyStyle={{ padding: 10 }} title="Other">
              <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>
                Add your custom info here
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout.Content>
  );
};

export default Dashboard;