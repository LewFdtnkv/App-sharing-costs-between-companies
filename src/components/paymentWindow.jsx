import Options from "./Options";
import { LeftOutlined } from '@ant-design/icons';
import { Button, Divider } from "antd";

export default function PaymentWindow({ 
  mode, 
  setMode, 
  bills, 
  setBills, 
  setBillName, 
  currentBill, 
  language, 
  setborrowers, 
  billIndex 
}) {
  const getMyBalance = () => {
    if (!currentBill.cards) return 0;
    return currentBill.cards.reduce((balance, card) => {
      const myTransaction = card.participants?.find(p => p.name === 'Me');
      return balance + (myTransaction?.difference || 0);
    }, 0);
  };

  const formatCurrency = (value, currency) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)} ${currency}`;
  };

  const t = (en, ru) => language === 'English' ? en : ru;

  const myBalance = getMyBalance();
  const currency = currentBill.cards?.[0]?.currency || '';

  function handleSubmitBill() {
    const updatedCards = currentBill.cards.map(card => {
      const myParticipation = card.participants?.find(p => p.name === 'Me');
      
      if (myParticipation?.difference < 0) {
        const myDebt = Math.abs(myParticipation.difference);
        let remainingDebt = myDebt;

        return {
          ...card,
          participants: card.participants?.map(p => {
            if (p.name === 'Me') {
              return {
                ...p,
                difference: 0,
                actuallyPaid: p.shouldPay
              };
            }
            
            if (p.difference > 0 && remainingDebt > 0) {
              const coveredAmount = Math.min(p.difference, remainingDebt);
              remainingDebt -= coveredAmount;
              
              return {
                ...p,
                difference: p.difference - coveredAmount,
                actuallyPaid: p.actuallyPaid - coveredAmount
              };
            }
            
            return p;
          })
        };
      }
      
      return card;
    });

    const updatedBill = { ...currentBill, cards: updatedCards };

    setBills(prevBills => {
      const newBills = [...prevBills];
      newBills[billIndex] = updatedBill;
      return newBills;
    });
  }

  const getCreditors = (totals) => {
    return Object.entries(totals)
      .filter(([name, amount]) => name !== "Me" && amount > 0)
      .map(([name]) => name);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <LeftOutlined
            className="back-button"
            style={{ border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px', marginRight: '10px' }}
            onClick={() => { setMode('menuApp') }}
          />
          <h1 className="bill-title" style={{ margin: 0 }}>{currentBill.name}</h1>
        </div>

        <div className="balance-container" style={{ marginBottom: '20px' }}>
          <div className="balance-label">{t("My Bill", "Мой счет")}</div>
          <div className={`balance-amount ${myBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(myBalance, currency)}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '#f0f0f0 1px solid', borderRadius: '8px', marginBottom: 20 }}>
            {currentBill.cards?.map((card, i) => (
              <div key={`card-${i}`}>
                {i !== 0 && <Divider style={{ color: '#f0f0f0', margin: 0 }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 40px' }}>
                  <div className="card-header" style={{ fontWeight: 'bold', margin: 0, display: "flex", flexDirection: 'column' }}>
                    {card.name}
                    {card.paidBy?.length > 0 && (
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {t('Paid by', 'Оплатил')} {card.paidBy.join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {card.amount} {currency}
                  </div>
                </div>

                {/* {card.participants?.map((participant, i) => (
                  <div key={i} style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>{participant.name}</span>
                      <span>{formatCurrency(participant.shouldPay, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t("Paid", "Оплачено")}: {formatCurrency(participant.actuallyPaid, currency)}</span>
                      <span>{t("Difference", "Разница")}: {formatCurrency(participant.difference, currency)}</span>
                    </div>
                  </div>
                ))} */}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {(() => {
              const participantTotals = {};

              currentBill.cards?.forEach(card => {
                card.participants?.forEach(participant => {
                  participantTotals[participant.name] = (participantTotals[participant.name] || 0) + participant.difference;
                });
              });

              return (
                <div>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 10
                  }}>
                    {Object.entries(participantTotals).map(([name, total], i) => (
                      <li
                        key={`total-${i}`}
                        style={{
                          padding: 0,
                          fontWeight: 'bold',
                          marginBottom: 5,
                          width: '100%',
                          maxWidth: '300px',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        {total >= 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{name}</span>
                            <span style={{
                              color: 'green',
                              backgroundColor: '#B4D9C1',
                              borderRadius: 8,
                              padding: '3px 8px',
                              marginLeft: '5px'
                            }}>
                              {formatCurrency(total, currency).split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{
                              color: '#ff0000',
                              backgroundColor: '#EB43354D',
                              borderRadius: 8,
                              padding: '3px 8px',
                              marginRight: '5px'
                            }}>
                              {formatCurrency(total, currency).split(' ')[0]}
                            </span>
                            <span>{name}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {participantTotals.Me !== undefined && participantTotals.Me < 0 && (
                    <div style={{
                      display: 'flex',
                      textAlign: 'center',
                      marginTop: '10px',
                      flexDirection: 'column',
                      backgroundColor: '#f0f0f0',
                      padding: 20,
                      borderRadius: 8
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {t('I owe', 'Я должен/на')}
                        <div style={{ marginLeft: 8, color: "#1890ff" }}>
                          {formatCurrency(participantTotals.Me, currency).split('-')[1].split(' ')[0]}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {Object.entries(participantTotals)
                          .filter(([name, amount]) => name !== "Me" && amount > 0)
                          .map(([name, amount], i) => (
                            <div key={i} style={{ display: 'flex' }}>
                              {i !== 0 ? ', ' : ''}{name}
                            </div>
                          ))}
                        <Button
                          onClick={() => {
                            setMode('confirm');
                            setborrowers(getCreditors(participantTotals));
                            handleSubmitBill();
                          }}
                          style={{
                            marginLeft: '8px',
                            border: '#1890ff 1px solid',
                            color: "#1890ff",
                            padding: '10px 20px',
                            fontSize: 20,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minWidth: '100px',
                            transition: 'all 0.3s',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {t('Pay', 'Оплата')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <Options mode={mode} setMode={setMode} language={language} />
      </div>
    </div>
  );
}