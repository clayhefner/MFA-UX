import { useEffect, useState } from 'react';
import { Layout, Menu, Card, Button, Space, Typography, Tag, Avatar, Dropdown, Row, Col, Statistic, message } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Column, Line, Pie } from '@ant-design/charts';
import { authService } from '../services/authService';
import type { User } from '../types/auth';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  // Sample data for charts
  const columnData = [
    { month: 'Jan', value: 3500 },
    { month: 'Feb', value: 4200 },
    { month: 'Mar', value: 3800 },
    { month: 'Apr', value: 5100 },
    { month: 'May', value: 4900 },
    { month: 'Jun', value: 6200 },
  ];

  const lineData = [
    { date: 'Week 1', users: 120 },
    { date: 'Week 2', users: 145 },
    { date: 'Week 3', users: 132 },
    { date: 'Week 4', users: 168 },
    { date: 'Week 5', users: 190 },
    { date: 'Week 6', users: 215 },
  ];

  const pieData = [
    { type: 'Desktop', value: 45 },
    { type: 'Mobile', value: 35 },
    { type: 'Tablet', value: 20 },
  ];

  const columnConfig = {
    data: columnData,
    xField: 'month',
    yField: 'value',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      month: {
        alias: 'Month',
      },
      value: {
        alias: 'Revenue',
      },
    },
  };

  const lineConfig = {
    data: lineData,
    xField: 'date',
    yField: 'users',
    smooth: true,
    point: {
      size: 5,
      shape: 'circle',
    },
    meta: {
      date: {
        alias: 'Date',
      },
      users: {
        alias: 'Active Users',
      },
    },
  };

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold'
        }}>
          {!collapsed ? 'MFA Demo' : 'MD'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: '2',
              icon: <BarChartOutlined />,
              label: 'Analytics',
            },
            {
              key: '3',
              icon: <TeamOutlined />,
              label: 'Users',
            },
            {
              key: '4',
              icon: <FileTextOutlined />,
              label: 'Reports',
            },
            {
              key: '5',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
          </div>
          <Space size="large">
            <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text>{user.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          {!user.mfaEnabled && (
            <Card
              style={{
                marginBottom: 24,
                borderLeft: '4px solid #faad14'
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <SafetyOutlined style={{ fontSize: 20, color: '#faad14' }} />
                  <Title level={5} style={{ margin: 0 }}>Secure Your Account</Title>
                </Space>
                <Text type="secondary">
                  Two-factor authentication is not enabled. Enable it now to add an extra layer of security.
                </Text>
                <Button type="primary" icon={<SafetyOutlined />} onClick={() => navigate('/mfa-setup')}>
                  Enable MFA
                </Button>
              </Space>
            </Card>
          )}

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={27520}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                  suffix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Active Users"
                  value={215}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Conversion Rate"
                  value={9.3}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<FallOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="MFA Status"
                  value={user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  valueStyle={{ color: user.mfaEnabled ? '#3f8600' : '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Monthly Revenue" bordered={false}>
                <Column {...columnConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Active Users Trend" bordered={false}>
                <Line {...lineConfig} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="Device Distribution" bordered={false}>
                <Pie {...pieConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Account Information" bordered={false}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">User ID</Text>
                    <div><Text strong>{user.id}</Text></div>
                  </div>
                  <div>
                    <Text type="secondary">Username</Text>
                    <div><Text strong>{user.username}</Text></div>
                  </div>
                  <div>
                    <Text type="secondary">Email</Text>
                    <div><Text strong>{user.email}</Text></div>
                  </div>
                  <div>
                    <Text type="secondary">MFA Status</Text>
                    <div>
                      {user.mfaEnabled ? (
                        <Tag color="success" icon={<SafetyOutlined />}>Enabled</Tag>
                      ) : (
                        <Tag color="warning">Disabled</Tag>
                      )}
                    </div>
                  </div>
                  {user.mfaEnabled && (() => {
                    const trustTokenKey = `mfa_trust_token_${user.id}`;
                    const trustExpiryKey = `mfa_trust_expiry_${user.id}`;
                    const trustToken = localStorage.getItem(trustTokenKey);
                    const trustExpiry = localStorage.getItem(trustExpiryKey);
                    if (trustToken && trustExpiry) {
                      const expiryDate = new Date(trustExpiry);
                      const now = new Date();
                      if (expiryDate > now) {
                        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div>
                            <Text type="secondary">Trusted Device</Text>
                            <div>
                              <Tag color="blue">Active ({daysRemaining} days remaining)</Tag>
                              <Button
                                size="small"
                                type="link"
                                danger
                                style={{ padding: 0, height: 'auto' }}
                                onClick={() => {
                                  localStorage.removeItem(trustTokenKey);
                                  localStorage.removeItem(trustExpiryKey);
                                  message.success('Device trust removed');
                                  window.location.reload();
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
