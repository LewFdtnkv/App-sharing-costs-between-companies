import { Input, Button, Divider, Alert, Progress } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, LeftOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export default function RegistrationWindow({ setMode, language }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    title: language === 'English' ? 'Create account' : 'Создать аккаунт',
    email: language === 'English' ? 'Email' : 'Электронная почта',
    createPassword: language === 'English' ? 'Create a password' : 'Создать пароль',
    confirmPassword: language === 'English' ? 'Confirm password' : 'Подтвердите пароль',
    registerBtn: language === 'English' ? 'Register' : 'Зарегистрироваться',
    or: language === 'English' ? 'Or' : 'Или',
    registerWith: language === 'English' ? 'Register with' : 'Зарегистрируйтесь через',
    haveAccount: language === 'English' ? 'Already have an account?' : 'Уже есть аккаунт?',
    login: language === 'English' ? 'Log in' : 'Войти',
    emailPlaceholder: 'example@gmail.com',
    passwordPlaceholder: language === 'English' ? 'minimum 8 characters' : 'минимум 8 символов',
    confirmPlaceholder: language === 'English' ? 'repeat password' : 'повторите пароль',
    errors: {
      email: language === 'English' ? 'Please enter a valid email' : 'Введите корректный email',
      passwordLength: language === 'English' ? 'Password must be at least 8 characters' : 'Пароль должен быть не менее 8 символов',
      passwordMatch: language === 'English' ? 'Passwords do not match' : 'Пароли не совпадают',
      passwordStrength: language === 'English' ? 'Password is too weak' : 'Пароль слишком слабый'
    },
    strength: {
      weak: language === 'English' ? 'Weak' : 'Слабый',
      medium: language === 'English' ? 'Medium' : 'Средний',
      strong: language === 'English' ? 'Strong' : 'Сильный'
    }
  };

  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = t.errors.email;
    }

    if (password.length < 8) {
      newErrors.password = t.errors.passwordLength;
    } else if (passwordStrength < 2) {
      newErrors.password = t.errors.passwordStrength;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors(prev => {
      const { server, ...rest } = prev;
      return rest;
    });

    try {
      const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to register');
      }

      setMode('menuApp');

    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, server: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0: case 1: return '#ff4d4f'
      case 2: return '#faad14'; 
      case 3: case 4: return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStrengthText = () => {
    if (password.length === 0) return '';
    switch (passwordStrength) {
      case 0: case 1: return t.strength.weak;
      case 2: return t.strength.medium;
      case 3: case 4: return t.strength.strong;
      default: return '';
    }
  };

  return (
    <div className="registration-wrapper">
      <div className="registration-container">
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <LeftOutlined
            style={{
              border: '#f0f0f0 1px solid',
              padding: '5px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => setMode('login')}
          />
        </div>

        <h1 className="registration-title">{t.title}</h1>

        <div className="input-field">
          <label className="input-label">{t.email}</label>
          <Input
            size="large"
            placeholder={t.emailPlaceholder}
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input"
            status={errors.email ? 'error' : ''}
          />
          {errors.email && <Alert message={errors.email} type="error" showIcon style={{ marginTop: 8 }} />}
        </div>

        <div className="input-field">
          <label className="input-label">{t.createPassword}</label>
          <Input.Password
            size="large"
            placeholder={t.passwordPlaceholder}
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
            status={errors.password ? 'error' : ''}
          />
          {password.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={(passwordStrength / 4) * 100}
                showInfo={false}
                strokeColor={getStrengthColor()}
              />
              <div
                style={{
                  color: getStrengthColor(),
                  fontSize: 12,
                  marginTop: 4
                }}
              >
                {getStrengthText()}
              </div>
            </div>
          )}
          {errors.password && <Alert message={errors.password} type="error" showIcon style={{ marginTop: 8 }} />}
        </div>

        <div className="input-field">
          <label className="input-label">{t.confirmPassword}</label>
          <Input.Password
            size="large"
            placeholder={t.confirmPlaceholder}
            prefix={<LockOutlined />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="custom-input"
            status={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <Alert message={errors.confirmPassword} type="error" showIcon style={{ marginTop: 8 }} />}
        </div>

        <Button
          type="primary"
          block
          size="large"
          className="register-btn"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t.registerBtn}
        </Button>

        {errors.server && (
          <Alert message={errors.server} type="error" showIcon style={{ marginTop: 16 }} />
        )}

        <Divider plain className="divider">{t.or}</Divider>

        <div className="social-auth">
          <Button
            icon={<GoogleOutlined />}
            block
            size="large"
            className="social-btn google-btn"
          >
            {t.registerWith} Google
          </Button>
          <Button
            icon={<FacebookOutlined />}
            block
            size="large"
            className="social-btn facebook-btn"
          >
            {t.registerWith} Facebook
          </Button>
        </div>

        <div className="login-redirect">
          {t.haveAccount}
          <a onClick={() => setMode('login')} style={{ cursor: 'pointer', marginLeft: 4 }}>
            {t.login}
          </a>
        </div>
      </div>
    </div>
  );
}
