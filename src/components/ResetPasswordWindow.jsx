import { Input, Button, Alert, message } from 'antd';
import { LeftOutlined, LockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export default function ResetPasswordWindow({ setMode, language }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Тексты для локализации
  const t = {
    title: language === 'English' ? 'Reset password' : 'Сброс пароля',
    notification: language === 'English' 
      ? 'Please type something you\'ll remember' 
      : 'Введите пароль, который сможете запомнить',
    newPassword: language === 'English' ? 'New password' : 'Новый пароль',
    confirmPassword: language === 'English' ? 'Confirm new password' : 'Подтвердите пароль',
    placeholderPass: language === 'English' ? 'must be 8 characters' : 'минимум 8 символов',
    placeholderConfirm: language === 'English' ? 'repeat password' : 'повторите пароль',
    buttonText: language === 'English' ? 'Reset password' : 'Сбросить пароль',
    successMessage: language === 'English' 
      ? 'Password has been reset successfully!' 
      : 'Пароль успешно изменён!',
    mismatchError: language === 'English' 
      ? 'Passwords do not match' 
      : 'Пароли не совпадают',
    lengthError: language === 'English' 
      ? 'Password must be at least 8 characters' 
      : 'Пароль должен быть не менее 8 символов',
    strength: {
      weak: language === 'English' ? 'Weak' : 'Слабый',
      medium: language === 'English' ? 'Medium' : 'Средний',
      strong: language === 'English' ? 'Strong' : 'Сильный'
    }
  };

  useEffect(() => {
    // Проверка сложности пароля
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);

    // Проверка валидности формы
    const isValid = (
      password.length >= 8 && 
      password === confirmPassword && 
      passwordStrength >= 2
    );
    setIsFormValid(isValid);

    // Установка сообщений об ошибках
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(t.mismatchError);
    } else if (password && password.length < 8) {
      setPasswordError(t.lengthError);
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword, passwordStrength, language]);

  const getPasswordStrengthColor = () => {
    if (password.length === 0) return 'transparent';
    switch (passwordStrength) {
      case 0: case 1: return '#ff4d4f'; // red
      case 2: return '#faad14'; // orange
      case 3: case 4: return '#52c41a'; // green
      default: return 'transparent';
    }
  };

  const getPasswordStrengthText = () => {
    if (password.length === 0) return '';
    switch (passwordStrength) {
      case 0: case 1: return t.strength.weak;
      case 2: return t.strength.medium;
      case 3: case 4: return t.strength.strong;
      default: return '';
    }
  };

  const handleResetPassword = async () => {
    if (!isFormValid) return;
    
    setIsResetting(true);
    try {
      // Здесь должна быть реальная логика сброса пароля
      // Например: await api.resetPassword(email, password);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация запроса
      
      message.success(t.successMessage);
      setMode('login');
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="registration-wrapper">
      <div className="registration-container">
        <div style={{ display: 'flex', marginBottom: '20px' }}>
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
        
        <h1 className="reset_title">{t.title}</h1>
        <div className='div_notification'>{t.notification}</div>
      
        <div className="input-field" style={{ marginBottom: '16px' }}>
          <label className="input-label">{t.newPassword}</label>
          <Input.Password
            size="large"
            placeholder={t.placeholderPass}
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
          />
          {password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                height: '4px',
                background: getPasswordStrengthColor(),
                width: `${(passwordStrength / 4) * 100}%`,
                transition: 'all 0.3s',
                marginBottom: '4px',
                borderRadius: '2px'
              }} />
              <small style={{ 
                color: getPasswordStrengthColor(),
                fontSize: '12px'
              }}>
                {getPasswordStrengthText()}
              </small>
            </div>
          )}
        </div>
        
        <div className="input-field" style={{ marginBottom: '16px' }}>
          <label className="input-label">{t.confirmPassword}</label>
          <Input.Password
            size="large"
            placeholder={t.placeholderConfirm}
            prefix={<LockOutlined />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="custom-input"
            status={passwordError ? 'error' : ''}
          />
        </div>
        
        {passwordError && (
          <Alert 
            message={passwordError} 
            type="error" 
            showIcon 
            style={{ marginBottom: '16px' }}
          />
        )}
        
        <Button 
          type="primary" 
          block 
          size="large" 
          className="register-btn"
          onClick={handleResetPassword}
          disabled={!isFormValid}
          loading={isResetting}
        >
          {t.buttonText}
        </Button>
      </div>
    </div>
  );
}