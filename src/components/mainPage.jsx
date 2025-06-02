import { Input, Button, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export default function MainPage({ setMode, mode, email, setEmail, language }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);

    if (mode === 'register' && password && confirmPassword && password !== confirmPassword) {
      setPasswordError(language === 'English' ? 'Passwords do not match' : 'Пароли не совпадают');
    } else if (password && password.length < 8) {
      setPasswordError(language === 'English' ? 'Password must be at least 8 characters' : 'Пароль должен быть не менее 8 символов');
    } else {
      setPasswordError('');
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 8;
    const confirmValid = mode === 'login' || (password === confirmPassword);

    setIsFormValid(emailValid && passwordValid && confirmValid);
    setServerError('');
  }, [password, confirmPassword, email, mode, language]);

  const checkUserExists = async (emailToCheck) => {
    try {
      const response = await fetch(`http://localhost:8080/users`);
      if (!response.ok) return false;
      const users = await response.json();
      return users.some(user => user.email === emailToCheck);
    } catch (e) {
      return false;
    }
  };

  const loginUser = async (emailToCheck, pass) => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck, password: pass }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    if (mode === 'login') {
      const exists = await checkUserExists(email);
      if (!exists) {
        setServerError(language === 'English' ? 'User not found, please register.' : 'Пользователь не найден, пожалуйста зарегистрируйтесь.');
        setMode('register');
        return;
      }

      const loggedIn = await loginUser(email, password);
      if (loggedIn) {
        setMode('menuApp');
      } else {
        setServerError(language === 'English' ? 'Wrong password, please try again.' : 'Неверный пароль, попробуйте еще раз.');
      }
    } else if (mode === 'register') {
      setMode('menuApp');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'transparent';
      case 1: return '#ff4d4f';
      case 2: return '#faad14';
      case 3: return '#52c41a';
      case 4: return '#389e0d';
      default: return 'transparent';
    }
  };

  const getPasswordStrengthText = () => {
    if (!password) return '';
    const texts = language === 'English' 
      ? ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']
      : ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
    return texts[passwordStrength] || '';
  };

  return (
    <div className="auth-container">
      <h1 className="app-logo">SplitTheBill</h1>
      
      <div className="auth-tabs">
        <Button
          type={mode === 'login' ? 'primary' : 'text'}
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          {language === 'English' ? 'Sign in' : 'Вход'}
        </Button>
        <Button
          type={mode === 'register' ? 'primary' : 'text'}
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => setMode('register')}
        >
          {language === 'English' ? 'Register' : 'Регистрация'}
        </Button>
      </div>
      
      <div className="auth-form">
        <div className="input-group">
          <label className="input-label">{language === 'English' ? 'Email address' : 'Адрес электронной почты'}</label>
          <Input
            size="large"
            placeholder={language === 'English' ? 'Your Email' : 'Твоя почта'}
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">{language === 'English' ? 'Password' : 'Пароль'}</label>
          <Input.Password
            size="large"
            placeholder={language === 'English' ? 'Password' : 'Пароль'}
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                height: 4,
                background: getPasswordStrengthColor(),
                width: `${(passwordStrength / 4) * 100}%`,
                transition: 'all 0.3s',
                marginBottom: 4
              }} />
              <small style={{ color: getPasswordStrengthColor() }}>
                {getPasswordStrengthText()}
              </small>
            </div>
          )}
        </div>
        
        {mode === 'register' && (
          <div className="input-group">
            <label className="input-label">{language === 'English' ? 'Confirm Password' : 'Подтвердить пароль'}</label>
            <Input.Password
              size="large"
              placeholder={language === 'English' ? 'Confirm Password' : 'Подтвердите пароль'}
              prefix={<LockOutlined />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}
        
        {passwordError && (
          <Alert 
            message={passwordError} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}
        {serverError && (
          <Alert 
            message={serverError} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}
      </div>
      
      <div className="auth-footer">
        <div className="forgot-password" onClick={() => setMode('rstpswrd')}>
          {language === 'English' ? 'Forgot password?' : 'Забыл пароль?'}
        </div>
        <Button 
          type="primary" 
          block 
          size="large" 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          {mode === 'login' 
            ? language === 'English' ? 'Sign in' : 'Войти' 
            : language === 'English' ? 'Register' : 'Зарегистрироваться'}
        </Button>
        <Divider>{language === 'English' ? 'Other sign in options' : 'Другие варианты входа'}</Divider>
        
        <div className="social-auth">
          <Button icon={<GoogleOutlined />} block size="large" className="social-btn">
            {language === 'English' ? 'Continue with' : 'Продолжить с'} Google
          </Button>
          <Button icon={<FacebookOutlined />} block size="large" className="social-btn">
            {language === 'English' ? 'Continue with' : 'Продолжить с'} Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
