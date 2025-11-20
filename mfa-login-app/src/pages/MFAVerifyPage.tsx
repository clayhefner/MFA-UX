import { useState } from 'react';
import { Form, Button, Card, message, Typography, Alert, Checkbox } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import OtpInput from '../components/OtpInput';

const { Title, Paragraph } = Typography;

const MFAVerifyPage = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (code.length !== 6) {
      message.warning('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Clear any previous errors
    try {
      const response = await authService.verifyMFA(code);

      if (response.success) {
        if (rememberDevice && response.user) {
          // Store user-specific device trust token in localStorage
          const trustToken = `trust_${Date.now()}`;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem(`mfa_trust_token_${response.user.id}`, trustToken);
          localStorage.setItem(`mfa_trust_expiry_${response.user.id}`, expiryDate.toISOString());
          message.success('MFA verification successful! This device will be remembered for 30 days.');
        } else {
          message.success('MFA verification successful!');
        }
        navigate('/dashboard');
      } else {
        // Check if account is locked (requiresMFA will be false)
        if (!response.requiresMFA) {
          setErrorMessage(response.message || 'Account locked');
          // Redirect back to login after showing error
          setTimeout(() => {
            navigate('/');
          }, 8000);
        } else {
          setErrorMessage(response.message || 'Verification failed');
          setCode(''); // Clear the code on failure
        }
      }
    } catch (error) {
      setErrorMessage('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    authService.logout();
    navigate('/');
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#4013BE', marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0 }}>Two-Factor Authentication</Title>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            Enter the 6-digit code from your authenticator app
          </Paragraph>
        </div>

        <Form layout="vertical">
          {errorMessage && (
            <Alert
              message="Verification Failed"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item style={{ marginBottom: 24 }}>
            <OtpInput
              value={code}
              onChange={setCode}
              numInputs={6}
              autoFocus
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Checkbox
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            >
              Remember this device for 30 days
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              size="large"
              loading={loading}
              onClick={handleVerify}
              disabled={code.length !== 6}
            >
              Verify
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              block
              size="large"
              onClick={handleBack}
            >
              Back to Login
            </Button>
          </Form.Item>
        </Form>
        </Card>
      </div>

      <div style={{ paddingBottom: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
        <p style={{ margin: 0 }}>Demo: Enter any 6-digit code (e.g., 123456)</p>
      </div>
    </div>
  );
};

export default MFAVerifyPage;
