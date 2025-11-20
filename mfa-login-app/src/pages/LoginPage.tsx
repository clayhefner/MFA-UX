import { useState } from 'react';
import { Form, Input, Button, Card, Divider, Space, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginCredentials, SSOProvider } from '../types/auth';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<SSOProvider | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(values);

      if (response.success) {
        if (response.requiresMFA) {
          message.info(response.message);
          navigate('/mfa-verify');
        } else if (response.requiresMFASetup) {
          // Redirect to MFA setup page
          if (response.isWithinGracePeriod === false) {
            message.warning(response.message || 'MFA setup is required');
          } else {
            message.info(response.message || 'Please set up MFA');
          }
          navigate('/mfa-setup', {
            state: { isWithinGracePeriod: response.isWithinGracePeriod ?? true }
          });
        } else {
          message.success('Login successful!');
          navigate('/dashboard');
        }
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error) {
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: SSOProvider) => {
    setSsoLoading(provider);
    try {
      const response = await authService.loginWithSSO(provider);

      if (response.success) {
        message.success(`Successfully logged in with ${provider}!`);
        navigate('/dashboard');
      } else {
        message.error(response.message || `${provider} login failed`);
      }
    } catch (error) {
      message.error(`An error occurred during ${provider} login`);
    } finally {
      setSsoLoading(null);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    form.setFieldsValue({
      username: email,
      password: password
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Card
          style={{
            width: 400,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
        <Alert
          message="MFA Required January 1, 2026"
          description="Multi-factor authentication will be mandatory for all accounts. Set up MFA now to ensure uninterrupted access."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Sign in to your account</h1>
        </div>

        <Form
          name="login"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={() => message.info('Password reset link would be sent to your email')}
            >
              Forgot your password?
            </Button>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Or continue with</Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 48 48"
                style={{ marginRight: 8 }}
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            }
            size="large"
            block
            loading={ssoLoading === 'google'}
            onClick={() => handleSSOLogin('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Sign in with Google
          </Button>

          <Button
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 23 23"
                fill="currentColor"
                style={{ marginRight: 8 }}
              >
                <path d="M0 0h11v11H0z" fill="#f25022"/>
                <path d="M12 0h11v11H12z" fill="#00a4ef"/>
                <path d="M0 12h11v11H0z" fill="#7fba00"/>
                <path d="M12 12h11v11H12z" fill="#ffb900"/>
              </svg>
            }
            size="large"
            block
            loading={ssoLoading === 'microsoft'}
            onClick={() => handleSSOLogin('microsoft')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Sign in with Microsoft
          </Button>
        </Space>
        </Card>
      </div>

      <div style={{ paddingBottom: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', maxWidth: 500 }}>
        <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>Quick fill demo credentials:</p>
        <Space direction="horizontal" size="small" wrap style={{ justifyContent: 'center' }}>
          <Button
            size="small"
            onClick={() => fillCredentials('demo@example.com', 'password123')}
            style={{ fontSize: 11 }}
          >
            Demo (no MFA)
          </Button>
          <Button
            size="small"
            onClick={() => fillCredentials('admin@example.com', 'admin123')}
            style={{ fontSize: 11 }}
          >
            Admin (with MFA)
          </Button>
          <Button
            size="small"
            onClick={() => fillCredentials('locked@example.com', 'locked123')}
            style={{ fontSize: 11 }}
          >
            Locked (MFA fails)
          </Button>
          <Button
            size="small"
            onClick={() => fillCredentials('nograce@example.com', 'nograce123')}
            style={{ fontSize: 11 }}
          >
            No Grace (MFA required)
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default LoginPage;
