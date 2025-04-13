import { useState } from "react";
import Options from "../components/Options";
import { Input, Divider, Button, Switch, Select } from 'antd';
import { RightOutlined, DownOutlined, LeftOutlined } from '@ant-design/icons';

export default function Settings({ email, setEmail, setMode, setLanguage, language }) {
  const [name, setName] = useState(email.split('@')[0]);
  const [theme, setTheme] = useState('White');
  const [activeSetting, setActiveSetting] = useState(null); 

  function handleLogOut() {
    setName('');
    setEmail('');
    setMode('login');
  }

  const toggleSetting = (setting) => {
    setActiveSetting(activeSetting === setting ? null : setting);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div style={{display: 'flex'}}>
            <LeftOutlined  style={{   border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}}onClick={()=>setMode('menuApp')}/>
        </div>
        <h1 style={{ fontWeight: 'bold', marginTop: 0}}>{language === 'English' ? 'Options': 'Опции'}</h1>
        
        <h3 style={{ fontWeight: 'bold', marginTop: 0, display: 'flex' }}>{language === 'English' ? 'Name': 'Имя'}</h3>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ 
            background: '#f0f0f0',
            marginBottom: '20px',
            fontFamily: 'Poppins',
          }}
        />
        
        <h3 style={{ fontWeight: 'bold', marginTop: 0, display: 'flex' }}>{language === 'English' ? 'Settings': 'Настройки'}</h3>
        <ul style={{
          backgroundColor: '#ffffff',
          border: '#f0f0f0 2px solid',
          borderRadius: '8px',
          padding: 0,
          display: "flex",
          flexDirection: 'column',
          marginBottom: '30px'
        }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
            <div>{language === 'English' ? 'Notifications': 'Уведомления'}</div>
            <Switch />
          </li>
          
          <Divider style={{ margin: 0, height: '2px' }} />
          
          <li 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px',
              cursor: 'pointer'
            }}
            onClick={() => toggleSetting('language')}
          >
            <div>{language === 'English' ? 'Language': 'Язык'}</div>
            <div style={{ fontSize: '14px', color: 'gray', display: 'flex', alignItems: 'center' }}>
              {activeSetting !== 'language' && <span style={{ marginRight: 8 }}>{language}</span>}
              {activeSetting === 'language' ? <DownOutlined /> : <RightOutlined />}
            </div>
          </li>
          {activeSetting === 'language' && (
                <div >
                <Select
                    defaultValue={language}
                    style={{ width: '100%' }}
                    options={[
                    { value: 'Русский', label: 'Русский' },
                    { value: 'English', label: 'English' }
                    ]}
                    onChange={(value) => setLanguage(value)}
                />
                </div>
            )}
          <Divider style={{ margin: 0 }} />
          
          <li 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px',
              cursor: 'pointer'
            }}
            onClick={() => toggleSetting('theme')}
          >
            <div>{language === 'English' ? 'Theme': 'Тема'}</div>
            <div style={{ fontSize: '14px', color: 'gray', display: 'flex', alignItems: 'center' }}>
              {activeSetting !== 'theme' && <span style={{ marginRight: 8 }}>{theme}</span>}
              {activeSetting === 'theme' ? <DownOutlined /> : <RightOutlined />}
              
            </div>
          </li>
          {activeSetting === 'theme' && (
                <div >
                <Select
                    defaultValue={theme}
                    style={{ width: '100%' }}
                    options={[
                    { value: 'White', label: 'White' },
                    { value: 'Black', label: 'Black' }
                    ]}
                    onChange={(value) => setTheme(value)}
                />
                </div>
            )}
        </ul>
        
        <Button 
          onClick={handleLogOut}
          style={{
            color: 'red', 
            fontSize: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '48px',
            padding: '0 24px',
            lineHeight: '48px',
            minWidth: '120px',
            fontFamily: 'Poppins',
          }}
        >
          {language === 'English' ? 'Log out': 'Выйти'}
        </Button>
        
        <Options language={language}/>
      </div>
    </div>
  );
}