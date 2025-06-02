import { BarChartOutlined, PlusOutlined, DeleteOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons';
import Options from "./Options";
import { Input, Upload, Avatar, message } from 'antd';
import { useState } from 'react';

export default function Profile({ setMode, language }) {
  const [nickName, setNickName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Можно загружать только изображения!');
      return false;
    }
    return true;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      const url = URL.createObjectURL(info.file.originFileObj);
      setAvatarUrl(url);
      message.success('Аватар успешно загружен!');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <LeftOutlined 
            style={{ border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px' }} 
            onClick={() => setMode('menuApp')} 
          />
          
          
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column'}}><h3>Введите имя пользователя</h3>
        <Input 
          onChange={(e) => setNickName(e.target.value)} 
          value={nickName} 
          placeholder="Введите ваше имя"
          style={{ marginBottom: '20px' }}
        /></div>
          
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleAvatarChange}
            accept="image/*"
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => onSuccess('ok'), 0);
            }}
          >
            <Avatar
              size={64}
              icon={avatarUrl ? null : <UserOutlined />}
              src={avatarUrl}
              style={{ cursor: 'pointer' }}
            />
          </Upload></div>
        

        <Options setMode={setMode} mode="profile" language={language} />
      </div>
    </div>
  )
}