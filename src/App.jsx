import { useState, useEffect } from 'react';
import './App.css';
import MainPage from './components/mainPage';
import RegistrationWindow from './components/registrationWindow';
import ResetPasswordWindow from './components/ResetPasswordWindow';
import MenuApp from './components/MenuApp';
import CardWindow from './components/CardWindow';
import FormWindow from './components/FormWindow';
import PaymentWindow from './components/paymentWindow';
import ConfirmWindow from './components/ConfirmWindow';
import Settings from './components/Settings';
import moment from 'moment';

function App() {
  const [mode, setMode] = useState('login');
  const [balance, setBalance] = useState([]);
  const [categories, setCategories] = useState([]);
  const [participants, setParticipants] = useState([{ name: 'Me', amount: '0,00' }]);
  const [transactions, setTransactions] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [billName, setBillName] = useState(currentBill?.name || '');
  const [date, setDate] = useState(currentBill?.date || moment().format('D MMMM YYYY'));
  const [email, setEmail] = useState('');
  const [billIndex, setBillIndex] = useState(-1);
  const [language, setLanguage] = useState('English');
  const [borrowers, setborrowers] = useState();

  useEffect(() => {
    const initial = language === 'Русский'
      ? [{ name: 'Я', amount: '0,00' }]
      : [{ name: 'Me', amount: '0,00' }];
    setParticipants(initial);
  }, [language]);

  const resetAppState = () => {
    setBalance([]);
    setCategories([]);
    setParticipants([{ name: 'Me', amount: '0,00' }]);
    setTransactions([]);
    setMyTransactions([]);
  };

  return (
    <>
      {mode === 'login' && (
        <MainPage
          setMode={setMode}
          mode={mode}
          email={email}
          setEmail={setEmail}
          language={language}
        />
      )}

      {mode === 'register' && (
        <RegistrationWindow
          setMode={setMode}
          language={language}
        />
      )}

      {mode === 'rstpswrd' && (
        <ResetPasswordWindow
          setMode={setMode}
          language={language}
        />
      )}

      {mode === 'menuApp' && (
        <MenuApp
          bills={bills}
          setBills={setBills}
          setParticipants={setParticipants}
          participants={participants}
          mode={mode}
          setMode={setMode}
          balance={balance}
          setBalance={setBalance}
          categories={categories}
          setCategories={setCategories}
          transactions={transactions}
          setTransactions={setTransactions}
          myTransactions={myTransactions}
          setMyTransactions={setMyTransactions}
          resetAppState={resetAppState}
          setDate={setDate}
          setBillName={setBillName}
          setCurrentBill={setCurrentBill}
          setBillIndex={setBillIndex}
          language={language}
        />
      )}

      {mode === 'card' && currentBill && (
        <CardWindow
          currentBill={currentBill}
          setCurrentBill={setCurrentBill}
          setParticipants={setParticipants}
          participants={participants}
          setBalance={setBalance}
          balance={balance}
          categories={categories}
          setCategories={setCategories}
          setMode={setMode}
          setTransactions={setTransactions}
          setMyTransactions={setMyTransactions}
          setBills={setBills}
          language={language}
        />
      )}

      {mode === 'form' && (
        <FormWindow
          bills={bills}
          setCurrentBill={setCurrentBill}
          setParticipants={setParticipants}
          setMode={setMode}
          participants={participants}
          setBills={setBills}
          currentBill={currentBill}
          resetAppState={resetAppState}
          billName={billName}
          setBillName={setBillName}
          date={date}
          setDate={setDate}
          language={language}
        />
      )}

      {mode === 'confirm' && (
        <ConfirmWindow
          setMode={setMode}
          bills={bills}
          borrowers={borrowers}
          language={language}
        />
      )}

      {mode === 'settings' && (
        <Settings
          email={email}
          setEmail={setEmail}
          setMode={setMode}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {mode === 'payment' && (
        <PaymentWindow
          setMode={setMode}
          mode={mode}
          bills={bills}
          setBills={setBills}
          setBillName={setBillName}
          currentBill={currentBill}
          setborrowers={setborrowers}
          language={language}
          billIndex={billIndex}
        />
      )}
    </>
  );
}

export default App;
