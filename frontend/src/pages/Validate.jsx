import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../services/api";
import "../styles/validate.css";

function Validate() {
  const [promoCode, setPromoCode] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isValidating, setIsValidating] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [user, setUser] = useState(null);
  const [userPromos, setUserPromos] = useState([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const loggedInUser = JSON.parse(userData);
      setUser(loggedInUser);
      fetchUserPromos(loggedInUser.id);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchUserPromos = async (userId) => {
    setIsLoadingPromos(true);
    try {
      const response = await axios.get(`${BASE_URL}/promo/user/${userId}`);
      const activePromos = response.data.filter(promo => !promo.isUsed);
      setUserPromos(activePromos);
    } catch (error) {
      console.error("Error fetching user promos:", error);
    } finally {
      setIsLoadingPromos(false);
    }
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleValidate = async () => {
    if (!promoCode.trim()) {
      showNotification("Please enter a promo code", "error");
      return;
    }

    setIsValidating(true);
    setDiscount(null);

    try {
      const response = await axios.post(`${BASE_URL}/promo/validate`, {
        code: promoCode.trim(),
        userId: user?.id
      });

      if (response.data.discount) {
        showNotification("Promo code validated successfully!", "success");
        setDiscount(response.data.discount);
        await fetchUserPromos(user.id);
        setPromoCode("");
        
        setTimeout(() => setDiscount(null), 5000);
      } else {
        showNotification(response.data.message || "Invalid promo code", "error");
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to validate promo code", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setPromoCode("");
    setNotification({ message: "", type: "" });
    setDiscount(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleUsePromo = (code) => {
    setPromoCode(code);
  };

  const getStatusBadge = (isUsed) => (
    <span className={`validate-status-badge validate-status-badge--${isUsed ? 'inactive' : 'active'}`}>
      {isUsed ? 'Used' : 'Active'}
    </span>
  );

  return (
    <div className="validate-app">
      {/* Top Navigation Bar */}
      <nav className="validate-navbar">
        <div className="validate-navbar__container">
          <div className="validate-navbar__brand">
            <img src="/deltaplus.png" alt="DeltaPlus" className="validate-navbar__logo" />
            <span className="validate-navbar__title">DeltaPlus</span>
          </div>
          <div className="validate-navbar__user">
            {user && (
              <>
                <div className="validate-navbar__email">
                  <svg className="validate-navbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{user.email}</span>
                </div>
                <button onClick={handleLogout} className="validate-btn validate-btn--ghost">
                  <svg className="validate-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="validate-main">
        <div className="validate-container">
          {/* Page Header */}
          <div className="validate-page-header">
            <div className="validate-page-header__content">
              <h1 className="validate-page-header__title">Promo Code Management</h1>
              <p className="validate-page-header__subtitle">Validate and track your discount codes</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="validate-dashboard">
            {/* Left Column - My Promos */}
            <div className="validate-dashboard__column">
              <div className="validate-card validate-card--full">
                <div className="validate-card__header">
                  <div className="validate-card__title-section">
                    <h2 className="validate-card__title">My Promo Codes</h2>
                    <p className="validate-card__subtitle">Active codes assigned to your account</p>
                  </div>
                  <div className="validate-card__badge">
                    <span className="validate-stat">{userPromos.length}</span>
                    <span className="validate-stat-label">Total</span>
                  </div>
                </div>
                
                <div className="validate-card__body">
                  {isLoadingPromos ? (
                    <div className="validate-loading-state">
                      <div className="validate-loading-state__spinner"></div>
                      <p>Loading codes...</p>
                    </div>
                  ) : userPromos.length === 0 ? (
                    <div className="validate-empty-state">
                      <svg className="validate-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>No promo codes available</p>
                      <span>New codes will appear here</span>
                    </div>
                  ) : (
                    <div className="validate-promos-list">
                      {userPromos.map((promo) => (
                        <div key={promo.id} className="validate-promo-item">
                          <div className="validate-promo-item__content">
                            <div className="validate-promo-item__info">
                              <div className="validate-promo-item__code">{promo.code}</div>
                              <div className="validate-promo-item__discount">{promo.discount}% OFF</div>
                            </div>
                            <div className="validate-promo-item__actions">
                              {getStatusBadge(promo.isUsed)}
                              {!promo.isUsed && (
                                <button 
                                  onClick={() => handleUsePromo(promo.code)}
                                  className="validate-btn validate-btn--small"
                                >
                                  Apply
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Validate Section */}
            <div className="validate-dashboard__column">
              <div className="validate-card validate-card--full">
                <div className="validate-card__header">
                  <div className="validate-card__title-section">
                    <h2 className="validate-card__title">Validate Promo Code</h2>
                    <p className="validate-card__subtitle">Enter your code to check validity</p>
                  </div>
                </div>
                
                <div className="validate-card__body">
                  <div className="validate-form">
                    <div className="validate-form-field">
                      <label className="validate-form-field__label">Promo Code</label>
                      <div className="validate-input-group">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === "Enter" && handleValidate()}
                          placeholder="Enter your promo code"
                          className={`validate-input ${notification.type === 'success' ? 'validate-input--success' : ''} ${notification.type === 'error' ? 'validate-input--error' : ''}`}
                          disabled={isValidating}
                          autoComplete="off"
                        />
                        {promoCode && !isValidating && (
                          <button onClick={handleClear} className="validate-input__clear">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleValidate}
                      className="validate-btn validate-btn--primary validate-btn--full"
                      disabled={isValidating || !promoCode.trim()}
                    >
                      {isValidating ? (
                        <>
                          <span className="validate-btn__spinner"></span>
                          Validating...
                        </>
                      ) : (
                        'Validate Code'
                      )}
                    </button>

                    {notification.message && (
                      <div className={`validate-alert validate-alert--${notification.type}`}>
                        <svg className="validate-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {notification.type === 'success' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        <span>{notification.message}</span>
                      </div>
                    )}

                    {discount && (
                      <div className="validate-success-card">
                        <div className="validate-success-card__content">
                          <div className="validate-success-card__icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="validate-success-card__info">
                            <span className="validate-success-card__label">Discount Applied</span>
                            <span className="validate-success-card__value">{discount}% OFF</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="validate-info-card">
                <div className="validate-info-card__content">
                  <svg className="validate-info-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="validate-info-card__text">
                    <h4>How to use promo codes</h4>
                    <p>Enter your code above and click validate. Active codes will apply a discount to your purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Validate;