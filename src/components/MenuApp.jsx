import { useEffect, useState } from "react";
import Options from "../components/Options";
import { RightOutlined } from '@ant-design/icons';
import moment from 'moment';

export default function MenuApp({
  bills,
  setBills,
  setParticipants,
  participants,
  mode,
  setMode,
  balance,
  setBalance,
  categories,
  setCategories,
  transactions,
  setTransactions,
  myTransactions,
  setMyTransactions,
  setBillName,
  setDate,
  setCurrentBill,
  setBillIndex,
  language
}) {
  const calculateTotalBalance = () => {
    let totalOwedToMe = 0;
    let totalIOwe = 0;

    bills.forEach(bill => {
      if (!bill.cards) return;

      bill.cards.forEach(card => {
        const myPart = card.participants?.find(p => p.name === 'Me');
        if (!myPart) return;

        if (myPart.difference > 0) {
          totalOwedToMe += myPart.difference;
        } else {
          totalIOwe += Math.abs(myPart.difference);
        }
      });
    });

    // Округляем до 2 знаков после запятой, чтобы избежать ошибок округления
    totalOwedToMe = parseFloat(totalOwedToMe.toFixed(2));
    totalIOwe = parseFloat(totalIOwe.toFixed(2));
    
    return {
      owed: totalOwedToMe,
      owe: totalIOwe,
      total: parseFloat((totalOwedToMe - totalIOwe).toFixed(2))
    };
  };

  const { owed, owe, total } = calculateTotalBalance();

  const getBillData = (bill) => {
    if (!bill.cards || bill.cards.length === 0) return {
      totalAmount: 0,
      myBalance: 0,
      currency: ''
    };

    const totalAmount = parseFloat(bill.cards.reduce((sum, card) => sum + card.amount, 0).toFixed(2));
    const myBalance = parseFloat(bill.cards.reduce((sum, card) => {
      const myPart = card.participants?.find(p => p.name === 'Me');
      return sum + (myPart?.difference || 0);
    }, 0).toFixed(2));
    
    const currency = bill.cards[0]?.currency || '';

    return { totalAmount, myBalance, currency };
  };

  const formatAmount = (amount, showPlus = false) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';
    
    return (showPlus && num > 0 ? '+' : '') + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const t = (en, ru) => language === 'English' ? en : ru;

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="app-content">
          <h1 className="app-title">SplitTheBill</h1>

          <div className="balance-section">
            <div className="balance-row">
              <div className="balance-item">
                <div className="balance-label">{t("You are owed", 'Вам должны')}</div>
                <div className="balance-value positive">
                  {formatAmount(owed)}
                </div>
              </div>
              <div className="balance-item">
                <div className="balance-label">{t("You owe", 'Вы должны')}</div>
                <div className="balance-value negative">
                  {formatAmount(owe)}
                </div>
              </div>
            </div>

            <div className="total-balance">
              <div className="total-label">
                {t("My Total Balance", 'Мой общий баланс')}
              </div>
              <div className={`total-value ${total >= 0 ? 'positive' : 'negative'}`}>
                {formatAmount(total, true)}
              </div>
            </div>
          </div>

          <div className="transactions-list">
            {bills.length === 0 ? (
              ""
            ) : (
              bills.map((bill, index) => {
                const { totalAmount, myBalance, currency } = getBillData(bill);
                const billDate = bill.date ? new Date(bill.date) : new Date();

                return (
                  <div key={index} className="transaction-card">
                    <div className="transaction-header">
                      <span className="transaction-name">
                        {bill.name || t("Unnamed bill", "Безымянный счет")}
                        <span className="transaction-total">
                          {formatAmount(totalAmount)} {currency}
                        </span>
                      </span>
                      <span className="transaction-date">
                        {billDate.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="my-participation">
                      <span>{t('My balance: ', 'Мой баланс: ')}</span>
                      <span className={`amount ${myBalance >= 0 ? 'positive' : 'negative'}`}>
                        {formatAmount(myBalance, true)} {currency}
                      </span>
                    </div>

                    <div className="other-participants">
                      <div className="participants-label">
                        {t("Participants:", 'Участники:')}
                        <RightOutlined
                          onClick={() => {
                            setMode('payment');
                            setCurrentBill(bills[index]);
                            setBillIndex(index);
                            setParticipants(bill.participants || []);
                          }}
                          style={{color: "white", border: '1px solid white', padding: 8, borderRadius: 5}}
                        />
                      </div>
                      {bill.participants
                        ?.filter(p => p.name !== 'Me')
                        .map((p, i) => (
                          <div key={i} className="participant-row">
                            <span className="participant-name">{p.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Options
          setMode={setMode}
          setCurrentBill={setCurrentBill}
          language={language}
          mode={mode}
          onClickPlus={() => {
            const newBill = {
              name: '',
              date: moment().format('D MMMM YYYY'),
              participants: [{ name: 'Me', amount: '0.00' }],
              cards: []
            };
            setCurrentBill(newBill);
            setBillName('');
            setDate(moment().format('D MMMM YYYY'));
            setParticipants([{ name: 'Me', amount: '0.00' }]);
          }}
        />
      </div>
    </div>
  );
}