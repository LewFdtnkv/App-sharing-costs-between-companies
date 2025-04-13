import React, { useState, useEffect } from 'react';
import { Calendar, theme, Input, ConfigProvider } from 'antd';
import ru_RU from 'antd/lib/locale/ru_RU'; 
import dayjs from 'dayjs';
import { CalendarOutlined, DownOutlined } from '@ant-design/icons';

dayjs.locale('ru');

export default function MultiDateCalendar({
  setMode, 
  setSelectedDates, 
  selectedDates, 
  selectedRests, 
  setSelectedRests,  
  breaken
}) {
  const { token } = theme.useToken();

  const formatDate = (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) {
      return 'Нет выбранных дат';
    }
    return dates.map(date => dayjs(date).format('DD.MM.YYYY')).join(', ');
  };

  useEffect(() => {
    if (setSelectedDates) {
      setSelectedDates(selectedDates);
    }
  }, [selectedDates, setSelectedDates]);

  const wrapperStyle = {
    width: 320,
    padding: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    backgroundColor: '#f5f5f5',
  };

  const dateFullCellRender = (value) => {
    const isSelected = !breaken 
      ? selectedDates.some(date => value.isSame(date, 'day')) 
      : selectedRests.some(date => value.isSame(date, 'day'));

    const isToday = value.isSame(dayjs(), 'day');

    const style = {
      backgroundColor: isSelected ? '#FF7F50' : isToday ? '#FFE4B5' : '',
      color: isSelected ? '#fff' : isToday ? '#000' : '',
      borderRadius: '8px',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    };

    return (
      <div
        style={style}
        onClick={() => (breaken ? handleRestChange(value) : handleDateChange(value))}
      >
        {value.date()}
      </div>
    );
  };

  const handleDateChange = (date) => {
    const exists = selectedDates.some(d => d.isSame(date, 'day'));
    if (exists) {
      setSelectedDates(selectedDates.filter(d => !d.isSame(date, 'day')));
    } else {
      const updatedDates = [...selectedDates, date].sort((a, b) => a - b);
      setSelectedDates(updatedDates);
    }
  };

  const handleRestChange = (date) => {
    const exist = selectedRests.some(d => d.isSame(date, 'day'));
    if (exist) {
      setSelectedRests(selectedRests.filter(d => !d.isSame(date, 'day')));
    } else {
      const updatedDates = [...selectedRests, date].sort((a, b) => a - b);
      setSelectedRests(updatedDates);
    }
  };

  return (
    <div style={wrapperStyle}>
      <ConfigProvider locale={ru_RU}>
        <Input
          style={{ marginBottom: 16, borderRadius: 8 }}
          value={formatDate(breaken ? selectedRests : selectedDates)} 
          placeholder="Введите даты"
          readOnly
          suffix={
            !breaken ? (
              <CalendarOutlined onClick={() => { setMode('editGraph'); }} />
            ) : (
              <DownOutlined onClick={() => { setMode('addBreak'); }} />
            )
          }
        />
        <Calendar
          fullscreen={false}
          fullCellRender={dateFullCellRender}
          onSelect={breaken ? handleRestChange : handleDateChange} 
          headerRender={() => null} 
        />
      </ConfigProvider>
    </div>
  );
}