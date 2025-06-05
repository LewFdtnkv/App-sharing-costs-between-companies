import { useEffect } from 'react';
import { Input, Divider, Button, message, ConfigProvider, DatePicker } from 'antd';
import { BarChartOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, LeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import ru_RU from 'antd/es/locale/ru_RU';
import Options from './Options';
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('bearerToken');

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
  language,
  email,
  setStep
}) {
  let bill = currentBill
 async function sendBillToServer(bill, token, email) {
  try {
    if (!token) throw new Error("No token provided");

    const API_BASE = 'http://localhost:8080';
    const decodedToken = jwtDecode(token);

    const eventPayload = {
      name: bill.name,
      created_by: decodedToken.uid,
    };

    // Создаём событие (event)
    const eventRes = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(eventPayload),
    });

    if (!eventRes.ok) throw new Error('Failed to create event');
    const eventData = await eventRes.json();
    const eventId = eventData.ID;

    // Получаем и обновляем id участников (user_id)
    const updatedParticipants = [];
    for (const participant of bill.participants) {
      let emailToUse = participant.name === 'Me' || participant.name === 'Я' ? email : participant.name;

      // Получаем участника по email
      const participantRes = await fetch(`${API_BASE}/user?email=${emailToUse}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
      });

      if (!participantRes.ok) {
        throw new Error(`Failed to get participant ${emailToUse}`);
      }

      const participantData = await participantRes.json();

      // Записываем id участника в новый объект (чтобы не мутировать оригинал)
      updatedParticipants.push({
        ...participant,
        id: participantData.ID,
      });
    }

    // Отправляем участников в событие
    for (const participant of updatedParticipants) {
      const participantResPost = await fetch(`${API_BASE}/events/${eventId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: participant.name === 'Me' || participant.name === 'Я' ? email : participant.name }),
      });

      if (!participantResPost.ok) {
        throw new Error(`Failed to add participant ${participant.name} to event`);
      }
    } 

    // Отправляем расходы (карточки)
    for (const card of bill.cards) {
      const totalAmount = Number(card.amount) || 0;
      if (!card.participants?.length || totalAmount === 0) continue;

      const payerEmail = card.paidBy?.[0]; // из карточки, где указана почта плательщика
      const payer = updatedParticipants.find(p => p.name === payerEmail);   

      const shares = card.participants.map(p => ({
        user_id: p.id,
        share_amount: Number(p.shouldPay) || 0
      }));

      const expensePayload = {
        title: card.name || 'Expense',
        amount: totalAmount,
        paid_by: payer.id,
        paid_at: new Date(card.date || bill.date).toISOString(),
        shares: shares
      };

      const expenseRes = await fetch(`${API_BASE}/events/${eventId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(expensePayload),
      });

      if (!expenseRes.ok)
        throw new Error(`Failed to add expense ${expensePayload.title}`);
    }

    // Возвращаем обновлённый bill с eventId и обновлёнными участниками
    return {
      ...bill,
      eventId,
      participants: updatedParticipants
    };

  } catch (err) {
    console.error('Ошибка в sendBillToServer:', err);
    throw err;
  }
}


  useEffect(() => {
    const defaultParticipant = [{ name: language === 'Русский' ? 'Я' : 'Me', amount: '0,00' }];
    if (currentBill) {
      setBillName(currentBill.name);
      setParticipants(currentBill.participants || defaultParticipant);
      setDate(currentBill.date || moment().format('D MMMM YYYY'));
    } else {
      setBillName('');
      setParticipants(defaultParticipant);
      setDate(moment().format('D MMMM YYYY'));
    }
  }, [currentBill, language, setBillName, setParticipants, setDate]);

  const handleDateChange = (_, dateString) => setDate(dateString);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', amount: '0,00' }]);
  };

  const updateParticipant = (index, value, isEmail = false) => {
    const newParticipants = [...participants];
    isEmail ? newParticipants[index].email = value : newParticipants[index].name = value;
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

  // Создаём новый bill
  const newBill = {
    name: billName.trim(),
    participants,  // participants с id будут обновлены в sendBillToServer
    cards: currentBill?.cards || [],
    date,
    createdAt: moment().format('D MMMM YYYY'),
  };

  // Добавляем/обновляем bill в списке
  const tempBills = [...bills.filter(b => b.name !== newBill.name), newBill];
  setBills(tempBills);

  // Устанавливаем currentBill локально (пока без eventId)
  setCurrentBill(newBill);

  try {
    // Отправляем bill на сервер и получаем обновлённый bill с eventId и id участников
    const updatedBillFromServer = await sendBillToServer(newBill, token, email);

    // Обновляем bills и currentBill уже с eventId и правильными participant.id
    setBills([...bills.filter(b => b.name !== updatedBillFromServer.name), updatedBillFromServer]);
    setCurrentBill(updatedBillFromServer);

    message.success(language === 'Русский' ? 'Счет успешно создан!' : 'Bill created successfully!');
    setMode('menuApp');
  } catch {
    message.error(language === 'Русский' ? 'Ошибка при отправке на сервер' : 'Error sending data to server');
  }
};


  const handleGoToCard = () => {
    if (!billName.trim() || participants.length < 2) {
      message.warning('Please fill bill name and add participants first');
      message.warning(language === 'Русский' ? 'Заполните название счета и добавьте участников' : 'Please fill bill name and add participants first');
      return;
    }
    console.log(billName, bills)

    const tempBill = {
      name: billName.trim(),
      participants: [...participants],
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY')
    };
    

    setCurrentBill(tempBill);
    setMode('card');
  };;



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
