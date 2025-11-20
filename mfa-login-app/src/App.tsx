import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import LoginPage from './pages/LoginPage';
import MFAVerifyPage from './pages/MFAVerifyPage';
import MFASetupPage from './pages/MFASetupPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4013BE',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/mfa-verify" element={<MFAVerifyPage />} />
          <Route path="/mfa-setup" element={<MFASetupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
