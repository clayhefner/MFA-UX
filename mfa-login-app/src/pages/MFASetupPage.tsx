import { useState, useEffect } from 'react';
import { Button, Card, Typography, Steps, Space, message, Spin, Alert } from 'antd';
import { SafetyOutlined, QrcodeOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { authService } from '../services/authService';
import OtpInput from '../components/OtpInput';

const { Title, Paragraph, Text } = Typography;

const MFASetupPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isWithinGracePeriod = location.state?.isWithinGracePeriod ?? true;

  useEffect(() => {
    loadMFASetup();
  }, []);

  const loadMFASetup = async () => {
    try {
      const response = await authService.setupMFA();
      if (response.success && response.mfaSetup) {
        setQrCodeUrl(response.mfaSetup.qrCode);
        setSecret(response.mfaSetup.secret);
      } else {
        message.error('Failed to setup MFA');
        navigate('/dashboard');
      }
    } catch (error) {
      message.error('An error occurred while setting up MFA');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      message.warning('Please enter a 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      const response = await authService.enableMFA(code);

      if (response.success) {
        message.success('MFA enabled successfully!');
        setCurrentStep(3);
      } else {
        message.error(response.message || 'Verification failed');
        setCode('');
      }
    } catch (error) {
      message.error('An error occurred during verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleSkip = () => {
    message.info('You can set up MFA later from your dashboard');
    navigate('/dashboard');
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const steps = [
    {
      title: 'Get Started',
      icon: <SafetyOutlined />
    },
    {
      title: 'Scan QR Code',
      icon: <QrcodeOutlined />
    },
    {
      title: 'Verify',
      icon: <CheckCircleOutlined />
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

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
            width: 500,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
        {!isWithinGracePeriod && (
          <Alert
            message="MFA Setup Required"
            description="Multi-factor authentication is mandatory for your account. You must complete the setup to access your dashboard."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {currentStep === 0 && (
          <div>
            <Title level={3}>Enable Two-Factor Authentication</Title>
            <Paragraph>
              Two-factor authentication adds an extra layer of security to your account.
              You'll need to enter a code from your authenticator app each time you sign in.
            </Paragraph>
            <Paragraph>
              <Text strong>You will need:</Text>
            </Paragraph>
            <ul>
              <li>An authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
              <li>Your phone or device with the app installed</li>
            </ul>
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
              {isWithinGracePeriod && (
                <Button onClick={handleSkip}>Skip for Now</Button>
              )}
              <Button type="primary" onClick={handleNext}>
                Get Started
              </Button>
            </Space>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Title level={3}>Scan QR Code</Title>
            <Paragraph>
              Open your authenticator app and scan this QR code:
            </Paragraph>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px',
              background: '#f5f5f5',
              borderRadius: 8,
              marginBottom: 16
            }}>
              <QRCodeSVG value={qrCodeUrl} size={200} />
            </div>

            <Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
              Can't scan? Enter this code manually:
            </Paragraph>
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2,
              marginBottom: 24
            }}>
              {secret}
            </div>

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Space>
                {isWithinGracePeriod && (
                  <Button onClick={handleSkip}>Skip for Now</Button>
                )}
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              </Space>
            </Space>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <Title level={3}>Verify Setup</Title>
            <Paragraph>
              Enter the 6-digit code from your authenticator app to complete setup:
            </Paragraph>

            <div style={{ marginTop: 32, marginBottom: 32 }}>
              <OtpInput
                value={code}
                onChange={setCode}
                numInputs={6}
                autoFocus
              />
            </div>

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Space>
                {isWithinGracePeriod && (
                  <Button onClick={handleSkip}>Skip for Now</Button>
                )}
                <Button
                  type="primary"
                  loading={verifying}
                  onClick={handleVerify}
                  disabled={code.length !== 6}
                >
                  Verify & Enable
                </Button>
              </Space>
            </Space>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>All Set!</Title>
            <Paragraph>
              Two-factor authentication has been enabled on your account.
              You'll need to enter a code from your authenticator app the next time you sign in.
            </Paragraph>
            <Button type="primary" size="large" onClick={handleFinish} style={{ marginTop: 16 }}>
              Go to Dashboard
            </Button>
          </div>
        )}
        </Card>
      </div>

      {currentStep === 2 && (
        <div style={{ paddingBottom: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
          <p style={{ margin: 0 }}>Demo: Enter any 6-digit code (e.g., 123456)</p>
        </div>
      )}
    </div>
  );
};

export default MFASetupPage;
