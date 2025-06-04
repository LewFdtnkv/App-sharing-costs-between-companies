import React, { useState, useEffect } from 'react';
import { Input, Divider, Button, message, ConfigProvider, DatePicker } from 'antd';
import { BarChartOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, LeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import ru_RU from 'antd/es/locale/ru_RU';
import Options from './Options';

async function sendBillToServer(bill) {
  console.log(bill)
  try {
    const API_BASE = 'http://localhost:8080';

    const eventPayload = {
      name: bill.name,
      created_by: bill.participants[0]?.id || 0,
    };

    const eventRes = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    if (!eventRes.ok) throw new Error('Failed to create event');

    const eventData = await eventRes.json();
    const eventId = eventData.id;

    for (const participant of bill.participants) {
      const participantPayload = { user_id: participant.id };
      const participantRes = await fetch(`${API_BASE}/events/${eventId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantPayload),
      });
      if (!participantRes.ok) throw new Error(`Failed to add participant ${participant.name}`);
    }

    for (const card of bill.cards) {
      const amount = Number(card.amount) || 0;
      const paidByUsers = bill.participants.filter(p => p.difference > 0);

      if (paidByUsers.length === 0) continue;

      const perPayerAmount = amount / paidByUsers.length;

      for (const payer of paidByUsers) {
        const expensePayload = {
          title: card.name || 'Expense',
          amount: perPayerAmount,
          paid_by: payer.id,
          paid_at: new Date(card.date || bill.date).toISOString(),
        };

        const expenseRes = await fetch(`${API_BASE}/events/${eventId}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expensePayload),
        });

        if (!expenseRes.ok) throw new Error(`Failed to add expense ${expensePayload.title}`);
      }
    }

    const paymentPayload = bill.cards.flatMap(card => 
      card.participants.map(participant => ({
        name: participant.name,
        shouldPay: participant.shouldPay,
        actuallyPaid: participant.actuallyPaid,
        difference: participant.difference,
      }))
    );

    const paymentRes = await fetch(`${API_BASE}/events/${eventId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentRes.ok) throw new Error('Failed to create payments');

    return { success: true, eventId };

  } catch (err) {
    console.error('Error in sendBillToServer:', err);
    throw err;
  }
}



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
      setParticipants(currentBill.participants || [{ name: language === 'Русский' ? 'Я' : 'Me', amount: '0,00' }]);
      setDate(currentBill.date || moment().format('D MMMM YYYY'));
    } else {
      setBillName('');
      setParticipants([{ name: language === 'Русский' ? 'Я' : 'Me', amount: '0,00' }]);
      setDate(moment().format('D MMMM YYYY'));
    }
  }, [currentBill, language, setBillName, setParticipants, setDate]);

  const handleDateChange = (dateMoment, dateString) => {
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
      name: '',
      amount: '0,00',
    };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (index, value) => {
    const newParticipants = [...participants];
    newParticipants[index].name = value;
    setParticipants(newParticipants);
  };

  const handleCreateBill = async () => {
    if (!billName.trim()) {
      message.warning(language === 'Русский' ? 'Введите название счета' : 'Please enter bill name');
      return;
    }

    if (participants.length < 2) {
      message.warning(language === 'Русский' ? 'Добавьте хотя бы одного участника' : 'Add at least one more participant');
      return;
    }

    const billId = Math.floor(1000000000000 + Math.random() * 9000000000000);

    const participantsWithIds = participants.map((p, index) => ({
      ...p,
      id: Number(`${billId}${index + 1}`),
    }));

    const newBill = {
      id: billId,
      name: billName.trim(),
      participants: participantsWithIds,
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY'),
    };

    const tempBills = [
      ...bills.filter(b => b.name !== newBill.name),
      newBill,
    ];

    const cleanedBills = removeGlobalDuplicateCards(tempBills);
    setBills(cleanedBills);

    const updatedNewBill = tempBills.find(b => b.name === newBill.name) || newBill;
    setCurrentBill(updatedNewBill);

    try {
      await sendBillToServer(updatedNewBill);
      message.success(language === 'Русский' ? 'Счет успешно создан!' : 'Bill created successfully!');
      setMode('menuApp');
    } catch (err) {
      message.error(language === 'Русский' ? 'Ошибка при отправке на сервер' : 'Error sending data to server');
    }
  };

  const handleGoToCard = () => {
    if (!billName.trim() || participants.length < 2) {
      message.warning(language === 'Русский' ? 'Заполните название счета и добавьте участников' : 'Please fill bill name and add participants first');
      return;
    }

    const tempBill = {
      name: billName.trim(),
      participants: [...participants],
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY'),
    };

    setCurrentBill(tempBill);
    setMode('card');
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '0 auto',
      padding: 20,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex' }}>
        <LeftOutlined
          style={{ border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() => {
            setMode('menuApp');
            if (bills.length > 1 && (!currentBill?.cards || currentBill.cards.length === 0)) {
              setBills(bills.filter(bill => bill.name !== currentBill.name && bills.length !== 1));
            }
          }}
        />
      </div>

      <h1 style={{ marginBottom: 24 }}>SplitTheBill</h1>

      <h2 style={{ display: 'flex', marginBottom: 8 }}>{language === 'English' ? 'Bill Name' : 'Мой счет'}</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <BarChartOutlined
          style={{ marginRight: 8, cursor: 'pointer' }}
          onClick={handleGoToCard}
        />
        <Input
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          placeholder={language === 'English' ? "Example: trip, cafe" : 'Например: путешествие, кафе'}
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
        <h2 style={{ display: 'flex', marginBottom: 8 }}>{language === "English" ? "Participants" : 'Участники'}</h2>
        {participants.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
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
        onClick={() => {
          setMode('menuApp');
          handleCreateBill();
        }}       
        disabled={!billName.trim() || participants.length < 2}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {language === 'English' ? "Create Bill" : 'Создать счет'}
      </Button>

      <Divider />

      <Options
        setMode={setMode}
        setParticipants={setParticipants}
        participants={participants}
        setCurrentBill={setCurrentBill}
        currentBill={currentBill}
        setBills={setBills}
        bills={bills}
        language={language}
      />
    </div>
  );
}
