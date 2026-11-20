// frontend/src/pages/MyLoansPage.jsx

import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loans';
import '../styles/MyLoans.css' 

const MyLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await loanService.getMyLoans();
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    if (!window.confirm("Confirmer le retour de ce livre ?")) return;
    try {
      await loanService.returnBook(loanId);
      setMsg({ type: 'success', text: "Livre retourné avec succès !" });
      loadLoans();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  if (loading) return <div className="loading-container">Chargement de vos emprunts...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-hero small-header">
        <h1>Mes Emprunts</h1>
        <p>Gérez vos livres en cours et vos retours.</p>
      </div>

      {msg.text && <div className={`msg-popup ${msg.type}`}>{msg.text}</div>}

      <div className="dashboard-content">
        {loans.length === 0 ? (
          <div className="empty-state">Vous n'avez aucun emprunt en cours.</div>
        ) : (
          <div className="loans-list">
            {loans.map((loan) => (
              <div key={loan.loan_id} className={`loan-card ${loan.return_date ? 'returned' : 'active'}`}>
                
                <img 
                  src={loan.books?.cover_url || 'https://via.placeholder.com/100'} 
                  alt="Cover" 
                  className="loan-cover"
                />
                
                <div className="loan-info">
                  <h3>{loan.books?.title}</h3>
                  <p>Emprunté le : {new Date(loan.loan_date).toLocaleDateString()}</p>
                  <p>À rendre avant le : <strong>{new Date(loan.due_date).toLocaleDateString()}</strong></p>
                  
                  {loan.return_date ? (
                    <span className="status-badge returned">Retourné le {new Date(loan.return_date).toLocaleDateString()}</span>
                  ) : (
                    <span className="status-badge active">En cours</span>
                  )}
                </div>

                {!loan.return_date && (
                  <button className="return-btn" onClick={() => handleReturn(loan.loan_id)}>
                    Retourner
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoansPage;