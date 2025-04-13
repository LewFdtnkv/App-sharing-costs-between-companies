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

    return {
      owed: totalOwedToMe,
      owe: totalIOwe,
      total: totalOwedToMe - totalIOwe
    };
  };

  const { owed, owe, total } = calculateTotalBalance();

  const getBillData = (bill) => {
    if (!bill.cards) return {
      totalAmount: 0,
      myBalance: 0,
      currency: ''
    };

    const totalAmount = bill.cards.reduce((sum, card) => sum + card.amount, 0);
    const myBalance = bill.cards.reduce((sum, card) => {
      const myPart = card.participants?.find(p => p.name === 'Me');
      return sum + (myPart?.difference || 0);
    }, 0);
    const currency = bill.cards[0]?.currency || '';

    return { totalAmount, myBalance, currency };
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="app-content">
          <h1 className="app-title">SplitTheBill</h1>

          <div className="balance-section">
            <div className="balance-row">
              <div className="balance-item">
                <div className="balance-label">{language === 'English' ? "You are owed" : 'Вам должны'}</div>
                <div className="balance-value positive">
                  {formatAmount(owed)}
                </div>
              </div>
              <div className="balance-item">
                <div className="balance-label">{language === 'English' ? "You owe" : 'Вы должны'}</div>
                <div className="balance-value negative">
                  {formatAmount(owe)}
                </div>
              </div>
            </div>

            <div className="total-balance">
              <div className="total-label">
                {language === 'English' ? "My Total Balance" : 'Мой общий баланс'}
              </div>
              <div className={`total-value ${total >= 0 ? 'positive' : 'negative'}`}>
                {total >= 0 ? '+' : ''}{formatAmount(total)}
              </div>
            </div>
          </div>

          <div className="transactions-list">
            {bills.map((bill, index) => {
              const { totalAmount, myBalance, currency } = getBillData(bill);

              return (
                <div key={index} className="transaction-card">
                  <div className="transaction-header">
                    <span className="transaction-name">
                      {bill.name}
                      <span className="transaction-total">
                        {formatAmount(totalAmount)} {currency}
                      </span>
                    </span>
                    <span className="transaction-date">
                      {new Date(bill.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="my-participation">
                    <span>{language === 'English' ? 'My balance: ' : 'Мой баланс: '}</span>
                    <span className={`amount ${myBalance >= 0 ? 'positive' : 'negative'}`}>
                      {myBalance >= 0 ? '+' : ''}{formatAmount(myBalance)} {currency}
                    </span>
                  </div>

                  <div className="other-participants">
                    <div className="participants-label">
                      {language === 'English' ? "Participants:" : 'Участники:'}
                      <RightOutlined
                        onClick={() => {
                          setMode('payment');
                          setCurrentBill(bills[index]);
                          setBillIndex(index);
                        }}
                        style={{ color: 'white', border: '#ffffff 1px solid', padding: '10px', borderRadius: '5px' }}
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
            })}
          </div>

        </div>

        <Options
          setMode={setMode}
          setCurrentBill={setCurrentBill}
          language={language}
          mode={mode}
          onClickPlus={() => {
            setCurrentBill(undefined);
            setBillName('');
            setDate(moment().format('D MMMM YYYY'));
          }}
        />
      </div>
    </div>
  );
}
