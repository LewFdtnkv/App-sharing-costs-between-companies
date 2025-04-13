import { Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function MainPage({ setMode, mode, email, setEmail, language }) {
  const [password, setPassword] = useState('');

  return (
    <div className="auth-container">
      <h1 className="app-logo">SplitTheBill</h1>
      
      <div className="auth-tabs">
        <Button
          type={mode === 'login' ? 'primary' : 'text'}
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          {language === 'English' ?'Sign in': 'Вход'}
        </Button>
        <Button
          type={mode === 'register' ? 'primary' : 'text'}
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => setMode('register')}
        >
          {language === 'English' ?'Register': 'Регистрация'}
          
        </Button>
      </div>
      
      <div className="auth-form">
        <div className="input-group">
          <label className="input-label">{language === 'English' ?'Email address': 'Адрес электронной почты'}</label>
          <Input
            size="large"
            placeholder={language === 'English' ?'Your Email': 'Твоя почта'}
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">{language === 'English' ?'Password': 'Пароль'}</label>
          <Input.Password
            size="large"
            placeholder={language === 'English' ?'Password': 'Пароль'}
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {mode === 'register' && (
          <div className="input-group">
            <label className="input-label">{language === 'English' ?'Confirm Password': 'Подтвердить пароль'}</label>
            <Input.Password
              size="large"
              placeholder="Password"
              prefix={<LockOutlined />}
            />
          </div>
        )}
      </div>
      
      <div className="auth-footer">
        <div className="forgot-password"onClick={()=>setMode('rstpswrd')}>{language === 'English' ?'Forgot password?': 'Забыл пароль?'}</div>
        <Button type="primary" block size="large" className="submit-btn" onClick={()=>email && password && setMode('menuApp')}>
          {mode === 'login' ? language == 'English'? 'Sign in': 'Войти' : language == 'English'? 'Register': 'Зарегистрироваться'}
        </Button>
        <Divider>{language === 'English' ? 'Other sign in options': 'Другие варианты входа'}</Divider>
        
        <div className="social-auth">
          <Button icon={<GoogleOutlined />} block size="large" className="social-btn">
          {language== 'English' ? 'Continue with': 'Продолжить с'} Google
          </Button>
          <Button icon={<FacebookOutlined />} block size="large" className="social-btn">
            {language== 'English' ? 'Continue with': 'Продолжить с'} Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}