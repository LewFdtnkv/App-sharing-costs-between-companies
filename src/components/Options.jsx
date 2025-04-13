import React from 'react';
import { SettingOutlined, UserOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';

export default function Options({ onClickPlus, onSave, onFinish, mode, setMode, isSaveDisabled, hasCards, language }) {
  const handleButtonClick = () => {
    if (mode === 'menuApp') {
      onClickPlus?.();
      setMode('form');
    }else if(mode === 'payment'){
      setMode('card');
    } else if (mode === 'card') {
      hasCards ? onFinish?.() : onSave?.();
    }
  };

  return (
    <div className="bottom-panel">
      {['menuApp', 'card', 'payment'].includes(mode) && (
        <button 
          className={`add-expense-button ${
            (isSaveDisabled && mode === 'card') ? 'disabled' : ''
          } ${
            (mode === 'menuApp' || mode === 'payment') ? 'plus-button' : 'check-button'
          }`}
          onClick={handleButtonClick}
          disabled={mode === 'card' && isSaveDisabled}
        >
          {mode === 'menuApp' || mode === 'payment' ? (
            <PlusOutlined style={{ fontSize: '32px' }} />
          ) : (
            <CheckOutlined style={{ fontSize: '32px' }} />
          )}
        </button>
      )}
      
      <button className="panel-button" onClick={() => setMode('settings')}>
        <SettingOutlined style={{ fontSize: '24px' }} />
        <span>{language === 'English' ? 'Options': 'Настройки'}</span>
      </button>
      
      <button className="panel-button">
        <UserOutlined style={{ fontSize: '24px' }} />
        <span>{language === 'English' ? 'Profile': 'Профиль'}</span>
      </button>
    </div>
  );
}