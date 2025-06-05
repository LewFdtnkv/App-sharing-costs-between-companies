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

  async function sendBillToServer(bill, token = null, email, setCurrentBill = () => {}) {
    try {
      if (!token) throw new Error("No token provided");

      const API_BASE = 'http://localhost:8080';
      const decodedToken = jwtDecode(token);

      const eventPayload = {
        name: bill.name,
        created_by: decodedToken.uid,
      };

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

      for (const participant of bill.participants) {
        let emailToUse = participant.name === 'Me' || participant.name === 'Я' ? email : participant.name;
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
        participant.id = participantData.ID;
      }

      for (const card of bill.cards) {
        const totalAmount = Number(card.amount) || 0;
        if (!card.participants?.length || totalAmount === 0) continue;

        const payer = card.participants.find(p => Number(p.actuallyPaid) > 0) || bill.participants[0];

        const shares = card.participants.map(p => ({
          user_id: p.id,
          share_amount: Number(p.shouldPay) || 0
        }));

        const expensePayload = {
          title: card.name || 'Expense',
          amount: totalAmount,
          paid_by: payer.id,
          paid_at: new Date(card.date || bill.date).toISOString(),
          shares
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

      bill.eventId = eventId;
      setCurrentBill(bill);
      return { eventId };
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

    const participantsWithIds = participants.map((p, index) => ({
      ...p,
      id: Number(p.id) || index + 1
    }));

    const newBill = {
      name: billName.trim(),
      participants: participantsWithIds,
      cards: currentBill?.cards || [],
      date,
      createdAt: moment().format('D MMMM YYYY'),
    };

    const tempBills = [...bills.filter(b => b.name !== newBill.name), newBill];
    setBills(tempBills);

    const updatedBill = tempBills.find(b => b.name === newBill.name) || newBill;
    setCurrentBill(updatedBill);

    try {
      const result = await sendBillToServer(updatedBill, token, email);
      if (result?.eventId) {
        const updatedBillWithId = { ...updatedBill, eventId: result.eventId };
        setBills([...bills.filter(b => b.name !== updatedBill.name), updatedBillWithId]);
        setCurrentBill(updatedBillWithId);
      }
      message.success(language === 'Русский' ? 'Счет успешно создан!' : 'Bill created successfully!');
      setMode('menuApp');
    } catch {
      message.error(language === 'Русский' ? 'Ошибка при отправке на сервер' : 'Error sending data to server');
    }
  };

  const handleGoToCard = async () => {
    if (!currentBill) return;
    let bill = currentBill;
    setMode('card')
    console.log(currentBill, bill)
    if (!bill?.eventId) {
      const tempBill = {
        name: billName.trim(),
        participants: participants.map((p, i) => ({
          ...p,
          id: p.id || i + 1,
        })),
        cards: bill.cards || [],
        date,
        createdAt: moment().format('D MMMM YYYY'),
      };

      try {
        const result = await sendBillToServer(tempBill, token, email);
        if (result?.eventId) {
          bill = { ...tempBill, eventId: result.eventId };
          setCurrentBill(bill);
        } else {
          return message.error(language === 'Русский' ? 'Не удалось создать событие' : 'Failed to create event');
        }
      } catch {
        return message.error(language === 'Русский' ? 'Ошибка при создании события' : 'Error creating event');
      }
    }

    // setStep('card');
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
