import { div } from 'three/tsl';
import Options from './Options'
import { BarChartOutlined, CheckOutlined, DeleteOutlined, LeftOutlined } from '@ant-design/icons';

export default function ConfirmWindow({setMode, bills, borrowers, language}) {
  return (
    <div className="app-wrapper">
      <div className="app_container__option">
        
      <div style={{display: 'flex'}}>
            <LeftOutlined  style={{   border: '#f0f0f0 1px solid', padding: '5px', borderRadius: '5px'}}onClick={()=>setMode('menuApp')}/>
        </div>
           <div style={{display:'flex',justifyContent: 'center', alignItems: 'center',marginBottom:'20px' }}> 
            <CheckOutlined 
                onClick={()=>setMode('menuApp')}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '80px',
                    fontSize: '50px',
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#1890ff',
                    border: '1px solid #1890ff', 
                    borderRadius: '50%', 
                    padding: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer', 
                    boxSizing: 'border-box' 
                }}
                />
                
           </div>
           <span style={{ fontSize: '20px' }}>
            {language == 'English' ? 'Your bill with ' : 'Ваш счет с '}
            <strong>
              {borrowers.map((borrower, index) => (
                <span key={index} style={{ display: 'inline-block' }}>
                  {borrower}
                  {index < borrowers.length - 1 ? ', ' : ''}
                </span>
              ))}
            </strong>
          </span>
           <span style={{fontSize: '20px'}}>{language =='English' ?'has been settled up' : 'был оплачен'}</span>
           <Options language={language}/>
      </div>
    </div>
  )
}
