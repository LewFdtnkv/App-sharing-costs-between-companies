import React, { useState, useEffect } from 'react';
import { Input, Divider, Button, message, ConfigProvider, DatePicker } from 'antd';
import { BarChartOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined,LeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import ru_RU from 'antd/es/locale/ru_RU';
import Options from './Options';

export default function FormWindow({
  setMode,
  setParticipants,
  participants,
  setCurrentBill,
  currentBill,
  setBills,
  bills, 
  billName, 
  setBillName, 
  date,
  setDate,
  language
}) {

    useEffect(() => {
        if (currentBill) {
          setBillName(currentBill.name);
          setParticipants(currentBill.participants || [{ name: 'Me', amount: '0,00' }]);
          setDate(currentBill.date || moment().format('D MMMM YYYY'));
        } else {
          setBillName('');
          setParticipants([{ name: language === 'Русский' ? 'Я' : 'Me', amount: '0,00' }]);
          setDate(moment().format('D MMMM YYYY'));
        }
      }, [currentBill]); 

  const handleDateChange = (date, dateString) => {
    setDate(dateString);
  };

  function removeGlobalDuplicateCards(arr) {
    const seenNames = new Set();
  
    return arr.map(item => {
      const uniqueCards = item.cards.filter(card => {
        if (seenNames.has(card.name)) return false;
        seenNames.add(card.name);
        return true;
      });
  
      return { ...item, cards: uniqueCards };
    });
  }
  
  

  const addParticipant = () => {
    const newParticipant = {
      name: ``,
      amount: '0,00'
    };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (index, value) => {
    const newParticipants = [...participants];
    newParticipants[index].name = value;
    setParticipants(newParticipants);
  };

  const handleCreateBill = () => {
    // console.log(object)
    if (!billName.trim()) {
      message.warning('Please enter bill name');
      return;
    }
  
    if (participants.length < 2) {
      message.warning('Add at least one more participant');
      return;
    }
  
    const newBill = {
      name: billName.trim(),
      participants: [...participants],
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY')
    };
  
    const tempBills = [
      ...bills.filter(b => b.name !== newBill.name),
      newBill
    ];
  
    const cleanedBills = removeGlobalDuplicateCards(tempBills);
    setBills(cleanedBills);


    const updatedNewBill = tempBills.find(b => b.name === newBill.name) || newBill;

    // setBills(tempBills);
    setCurrentBill(updatedNewBill);
    // console.log(tempBills);
    console.log(bills)
    setMode('menuApp');
    message.success('Bill created successfully!');
  };
  

  const handleGoToCard = () => {
    if (!billName.trim() || participants.length < 2) {
      message.warning('Please fill bill name and add participants first');
      return;
    }
    
    const tempBill = {
      name: billName.trim(),
      participants: [...participants],
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY')
    };
    
    setCurrentBill(tempBill);
    setMode('card');
  };

  return (
    <div style={{ 
      maxWidth: 500, 
      margin: '0 auto', 
      padding: 20,
    //   paddingBottom: 0,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{display: 'flex'}}>
        <LeftOutlined  style={{   border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}}onClick={() => {setMode('menuApp');bills.length > 1 && currentBill.cards == [] && setBills(bills.filter((bill)=>bill.name !== currentBill.name && bills.length != 1))}}/>
      </div>
        

      <h1 style={{ marginBottom: 24 }}>SplitTheBill</h1>
      
      <h2 style={{display: 'flex', marginBottom: 8 }}>{language === 'English'? 'Bill Name': 'Мой счет'}</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <BarChartOutlined 
          style={{ 
            marginRight: 8,
            cursor: 'pointer',
            // color: billName.trim() && participants.length >= 2 ? '#1890ff' : '#ccc'
          }}
          onClick={handleGoToCard}
        />
        <Input
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          placeholder={language === 'English' ? "Example: trip, cafe": 'Например: путешествие, кафе'}
          style={{ background: '#f0f0f0', flex: 1 }}
        />
      </div>
      
      <ConfigProvider locale={ru_RU}>
        <DatePicker
          style={{ 
            background: '#f0f0f0', 
            width: '100%', 
            marginBottom: 24,
            borderRadius: 8
          }}
          format="D MMMM YYYY"
          suffixIcon={<CalendarOutlined />}
          value={moment(date, 'D MMMM YYYY')}
          onChange={handleDateChange}
        />
      </ConfigProvider>
      
      <div style={{ marginBottom: 24 }}>
        <h2 style={{display: 'flex', marginBottom: 8 }}>{language === "English" ? "Participants": 'Участники'}</h2>
        {participants.map((p, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 8 
          }}>
           <Input
            value={i === 0 
              ? (language === 'Русский' ? 'Я' : 'Me') 
              : (participants[i].name || '')}
            onChange={(e) => updateParticipant(i, e.target.value)}
            placeholder={i === 0 
              ? (language === 'Русский' ? 'Я' : 'Me') 
              : `Participant ${i + 1}`}
            style={{
              flex: 1,
              background: '#f0f0f0',
              marginRight: i > 0 ? 8 : 0,
              color: i === 0 ? '#888' : undefined
            }}
            disabled={i === 0}
          />
            {i > 0 && (
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newParticipants = [...participants];
                  newParticipants.splice(i, 1);
                  setParticipants(newParticipants);
                }}
              />
            )}
          </div>
        ))}
        
        <Button 
          type="dashed" 
          icon={<PlusOutlined />}
          onClick={addParticipant}
          style={{ width: '100%' }}
        >
          {language === 'English' ? 'Add new participant' : 'Добавить новых участников'}
        </Button>
      </div>
      
      <Button 
        type="primary"
        onClick={handleCreateBill}
        disabled={!billName.trim() || participants.length < 2}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {language === 'English' ? "Create Bill" : 'Создать счет'}
        
      </Button>
      
      <Divider />
      
      <Options 
        setMode={setMode} 
        mode="form"
        isSaveDisabled={!billName.trim() || participants.length < 2}
        language={language}
      />
    </div>
  );
}