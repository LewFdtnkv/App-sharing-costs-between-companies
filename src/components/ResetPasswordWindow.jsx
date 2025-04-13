import { Input, Button, Divider } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, LeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
// import './RegistrationWindow.css';

export default function ResetPasswordWindow({setMode}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="registration-wrapper">
      <div className="registration-container">
        <div style={{display: 'flex'}}>
            <LeftOutlined  style={{   border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}}onClick={()=>setMode('login')}/>
        </div>
        
        
        <h1 className="reset_title">Reset password</h1>
        <div className='div_notification'>please type something you'll remember</div>
        {/* <div className="input-field">
          <label className="input-label">Email</label>
          <Input
            size="large"
            placeholder="example@gmail.com"
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input"
          />
        </div> */}
        
        <div className="input-field">
          <label className="input-label">New password</label>
          <Input.Password
            size="large"
            placeholder="must be 8 characters"
            prefix={<LockOutlined />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="custom-input"
          />
        </div>
        
        <div className="input-field">
          <label className="input-label">Confirm new password</label>
          <Input.Password
            size="large"
            placeholder="repeat password"
            prefix={<LockOutlined />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="custom-input"
          />
        </div>
        
        <Button type="primary" block size="large" className="register-btn">
          Reset password
        </Button>
        
      </div>
    </div>
  );
}