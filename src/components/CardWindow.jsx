import React, { useState, useEffect } from 'react';
import { Input, Divider, ConfigProvider, Select, Button, message } from 'antd';
import { BarChartOutlined, PlusOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import ru_RU from 'antd/es/locale/ru_RU';
import moment from 'moment';
import Options from './Options';

const { Option } = Select;

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function CardWindow({
  currentBill,
  setCurrentBill,
  setParticipants,
  participants,
  setBalance,
  balance,
  categories,
  setCategories,
  setMode,
  setTransactions,
  setMyTransactions,
  setBills,
  language
}) {
  const [transaction, setTransaction] = useState('');
  const [amount, setAmount] = useState('0,00');
  const [paidBy, setPaidBy] = useState([]);
  const [currency, setCurrency] = useState(CURRENCIES[3]);
  const [isManualAmountEdit, setIsManualAmountEdit] = useState(false);

  const formatMoney = (value) => {
    const num = parseFloat(value.toString().replace(/\s+/g, '').replace(',', '.'));
    return isNaN(num) ? '0,00' : num.toFixed(2).replace('.', ',');
  };

  useEffect(() => {
    if (isManualAmountEdit) {
      const total = parseFloat(amount.replace(',', '.')) || 0;
      const share = formatMoney(total / participants.length);
      setParticipants(prev => prev.map(p => ({ ...p, amount: share })));
    }
  }, [amount, isManualAmountEdit]);

  useEffect(() => {
    if (!isManualAmountEdit) {
      const total = participants.reduce((sum, p) => {
        return sum + parseFloat(p.amount.replace(',', '.')) || 0;
      }, 0);
      setAmount(formatMoney(total));
    }
  }, [participants, isManualAmountEdit]);

  const addParticipant = () => {
    const newParticipant = {
      name: `Participant ${participants.length + 1}`,
      amount: formatMoney(parseFloat(amount.replace(',', '.')) / (participants.length + 1))
    };
    setParticipants([...participants, newParticipant]);
    setIsManualAmountEdit(false);
  };

  const removeParticipant = (index) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    setPaidBy(prev => prev.filter(name => newParticipants.some(p => p.name === name)));
    setIsManualAmountEdit(false);
  };

  const updateParticipant = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
    setIsManualAmountEdit(false);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setIsManualAmountEdit(true);
  };

  const handleCurrencyChange = (value) => {
    setCurrency(CURRENCIES.find(c => c.code === value));
  };

  const handleSaveCard = () => {
    if (!transaction.trim()) {
      message.warning(language === 'English' ? 'Please enter transaction name' : 'Введите название транзакции');
      return;
    }
  
    if (paidBy.length === 0) {
      message.warning(language === 'English' ? 'Select who paid for this transaction' : 'Выберите плательщиков');
      return;
    }
  
    const totalAmount = parseFloat(amount.replace(',', '.')) || 0;
    const newCategory = transaction || 'New Transaction';
  
    const numPaid = paidBy.length;
    const numTotal = participants.length;
    const totalSharePerPerson = totalAmount / numTotal;
  
    // Сумма, которую должны были заплатить неплательщики
    const unpaidTotal = participants
      .filter(p => !paidBy.includes(p.name))
      .reduce((sum, _) => sum + totalSharePerPerson, 0);
  
    // Сколько каждый плательщик дополнительно вносит
    const extraPerPayer = unpaidTotal / numPaid;
  
    const newCard = {
      name: newCategory,
      date: currentBill.date || moment().format('D MMMM YYYY'),
      amount: totalAmount,
      currency: currency.code,
      paidBy: [...paidBy],
      participants: participants.map(p => {
        const shouldPay = parseFloat(p.amount.replace(',', '.'));
        const isPayer = paidBy.includes(p.name);
        const actuallyPaid = isPayer ? shouldPay + extraPerPayer : 0;
        const difference = actuallyPaid - shouldPay;
  
        return {
          name: p.name,
          shouldPay,
          actuallyPaid,
          difference
        };
      })
    };
  
    setCurrentBill(prev => ({
      ...prev,
      cards: [...(prev.cards || []), newCard]
    }));
  
    const newTransaction = {
      name: newCategory,
      date: currentBill.date || moment().format('D MMMM YYYY'),
      amount: totalAmount,
      currency: currency.code,
      participants: participants.map(p => {
        const amountValue = parseFloat(p.amount.replace(',', '.'));
        return {
          name: p.name,
          amount: paidBy.includes(p.name)
            ? amountValue + extraPerPayer
            : -amountValue
        };
      })
    };
  
    setTransactions(prev => [...prev, newTransaction]);
  
    // Обновление MyTransactions и Баланса
    if (participants.some(p => p.name === 'Me')) {
      const myShouldPay = parseFloat(participants.find(p => p.name === 'Me')?.amount.replace(',', '.') || '0');
      const isMePaying = paidBy.includes('Me');
      const myExtra = isMePaying ? extraPerPayer : 0;
      const myPaid = isMePaying ? myShouldPay + myExtra : 0;
  
      const myTransaction = {
        name: newCategory,
        date: currentBill.date || moment().format('D MMMM YYYY'),
        amount: isMePaying
          ? -(totalAmount - myPaid)
          : myShouldPay,
        currency: currency.code,
        participants: participants
          .filter(p => p.name !== 'Me')
          .map(p => {
            const amountValue = parseFloat(p.amount.replace(',', '.'));
            return {
              name: p.name,
              amount: isMePaying
                ? amountValue + (paidBy.includes(p.name) ? extraPerPayer : 0)
                : -amountValue
            };
          })
      };
      setMyTransactions(prev => [...prev, myTransaction]);
  
      const myBalance = isMePaying ? -(totalAmount - myPaid) : myShouldPay;
      setBalance([...balance, myBalance]);
    }
  
    setCategories([...categories, newCategory]);
    resetForm();
    message.success(language === 'English' ? 'Card added successfully!' : 'Транзакция добавлена!');
  };
  

  const resetForm = () => {
    setTransaction('');
    setAmount('0,00');
    setPaidBy([]);
  };

  const handleBackToForm = () => {
    const updatedBill = {
      ...currentBill,
      participants: [...participants]
    };
    setCurrentBill(updatedBill);

    setBills(prev => {
      const others = prev.filter(b => b.name !== updatedBill.name);
      return [...others, updatedBill];
    });

    setMode('form');
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{display: 'flex'}}>
          <LeftOutlined style={{border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}} onClick={handleBackToForm}/>
        </div>

        <h1 style={{ textAlign: 'center', margin: 0,padding: '0 auto' }}>{currentBill?.name || 'New Bill'}</h1>

        <h4 style={{ marginBottom: 8, display: 'flex', marginTop: 0}}>{language === 'English' ? 'Transaction': 'Транзакция'}</h4>
        <div style={{display: 'flex', marginBottom: 16 }}>
          <BarChartOutlined onClick={handleBackToForm} />
          <Input
            value={transaction}
            onChange={e => setTransaction(e.target.value)}
            placeholder={language === 'English' ? "Enter transaction name": 'Введите название транзакции'}
            style={{ background: '#f0f0f0' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex',justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h4 style={{ textAlign: 'left', marginBottom: 16}}>{language === 'English' ? "Total Amount": 'Общая сумма'}</h4>
            <Select
              defaultValue={currency.code}
              style={{ width: 120 }}
              onChange={handleCurrencyChange}
              options={CURRENCIES.map(c => ({
                value: c.code,
                label: `${c.code} (${c.symbol})`
              }))}
            />
          </div>
          <Input
            value={amount}
            onChange={handleAmountChange}
            style={{ background: '#f0f0f0' }}
            suffix={currency.symbol}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 8, display: 'flex'}}>{language === 'English' ? "Paid by": 'Оплачено'}</h4>
          <Select
            mode="multiple"
            style={{ width: '100%', background: '#f0f0f0' }}
            placeholder={language === 'English' ? "Select who paid": 'Выберите тех, кто заплатил'}
            value={paidBy}
            onChange={setPaidBy}
            optionLabelProp="label"
          >
            {participants.map(p => (
              <Option key={p.name} value={p.name} label={p.name}>
                {p.name} ({language === 'English' ? 'paid:': "оплатил:"} {p.amount}{currency.symbol})
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ marginBottom: 8 }}>{language === 'English' ? 'Participants': "Участники"}</h4>
          </div>
          <div className='divider_card_input'>
            {participants.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <Input
                  value={p.name}
                  onChange={e => updateParticipant(i, 'name', e.target.value)}
                  style={{ flex: 1, background: '#f0f0f0' }}
                  placeholder="Name"
                />
                <Input
                  value={p.amount}
                  onChange={e => updateParticipant(i, 'amount', e.target.value)}
                  style={{ width: 100, background: '#f0f0f0' }}
                  placeholder="Amount"
                  suffix={currency.symbol}
                />
                {i > 0 && (
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => removeParticipant(i)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Options 
          onSave={handleSaveCard}
          setMode={setMode} 
          mode="card"
          language={language}
        />
      </div>
    </div>
  );
}