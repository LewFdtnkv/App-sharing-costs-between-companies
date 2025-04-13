import { Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, LeftOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function RegistrationWindow({setMode, language}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  function handleConfirm() {
    email && password == confirmPassword && setMode('menuApp')
  }

  return (
    <div className="registration-wrapper">
      <div className="registration-container">
        <div style={{display: 'flex'}}>
            <LeftOutlined  style={{   border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}}onClick={()=>setMode('login')}/>
        </div>
        
        <h1 className="registration-title">{language === 'English' ? 'Create account' : 'Создать аккаунт'}</h1>
        
        <div className="input-field">
          <label className="input-label">{language === 'English' ? 'Email' : 'Электронная почта'}</label>
          <Input
            size="large"
            placeholder="example@gmail.com"
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input"
          />
        </div>
        
        <div className="input-field">
          <label className="input-label">{language === 'English' ? 'Create a password' : 'Создать пароль'}</label>
          <Input.Password
            size="large"
            placeholder={language === 'English' ? "must be 8 characters" : 'Должно быть 8 символов'}
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
          />
        </div>
        
        <div className="input-field">
          <label className="input-label">{language === 'English' ? 'Confirm password' : 'Подтвердите пароль'}</label>
          <Input.Password
            size="large"
            placeholder={language === 'English' ? 'Confirm password' : 'Подтвердите пароль'}
            prefix={<LockOutlined />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="custom-input"
          />
        </div>
        
        <Button type="primary" block size="large" className="register-btn" onClick={()=>handleConfirm()}>
          Register
        </Button>
        
        <Divider plain className="divider">{language === 'English' ? 'Or': 'Или'}</Divider>
        
        <div className="social-auth">
          <Button icon={<GoogleOutlined />} block size="large" className="social-btn google-btn">
          {language === 'English' ? 'Register with ': 'Зарегистрируйтесь через '}Google
          </Button>
          <Button icon={<FacebookOutlined />} block size="large" className="social-btn facebook-btn">
          {language === 'English' ? 'Register with ': 'Зарегистрируйтесь через '} Facebook
          </Button>
        </div>
        
        <div className="login-redirect">
          {language === 'English' ? 'Already have an account?': 'Уже есть аккаунт? '} 
          <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}