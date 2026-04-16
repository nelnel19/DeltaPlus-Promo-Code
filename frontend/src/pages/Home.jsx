import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../services/api";
import "../styles/home.css";

function Home() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showModal, setShowModal] = useState(false);

  const discountOptions = [10, 20, 30, 40, 50, 60];

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  }, []);

  const fetchPromoCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/promo`);
      const activeCodes = response.data.filter(code => !code.isUsed);
      setPromoCodes(activeCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      showNotification("Failed to load promo codes", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/promo/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
    fetchUsers();
  }, [fetchPromoCodes, fetchUsers]);

  const getUserIdentifier = (promoCode) => {
    if (promoCode.User?.email) return promoCode.User.email;
    if (promoCode.User?.username) return promoCode.User.username;
    const user = users.find(u => u.id === promoCode.userId);
    return user?.email || user?.username || "Unassigned";
  };

  // MODIFIED: This function now shows email status
  const handleGeneratePromo = async () => {
    if (!selectedUserId) {
      showNotification("Please select a user", "error");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.post(`${BASE_URL}/promo/generate-for-user`, {
        userId: selectedUserId,
        discount: selectedDiscount
      });
      
      // Show email delivery status
      if (response.data.emailSent) {
        showNotification(`✅ Promo code sent to ${response.data.user.email}! Check their inbox.`, "success");
      } else {
        showNotification(`⚠️ Code generated but email failed to send to ${response.data.user.email}. Error: ${response.data.emailError || 'Unknown error'}`, "error");
      }
      
      fetchPromoCodes();
      
      setTimeout(() => {
        setShowModal(false);
        resetModalForm();
      }, 2000);
    } catch (error) {
      showNotification(error.response?.data?.error || "Failed to generate promo code", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetModalForm = () => {
    setSelectedUserId("");
    setSelectedDiscount(10);
    setNotification({ message: "", type: "" });
  };

  const getStatusBadge = (isUsed) => (
    <span className={`status-badge status-badge--${isUsed ? 'inactive' : 'active'}`}>
      {isUsed ? 'Used' : 'Active'}
    </span>
  );

  const filteredCodes = promoCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !code.isUsed) ||
      (statusFilter === "used" && code.isUsed);
    return matchesSearch && matchesStatus;
  });

  const statistics = {
    total: promoCodes.length,
    active: promoCodes.filter(c => !c.isUsed).length,
    used: promoCodes.filter(c => c.isUsed).length
  };

  return (
    <div className="home-app">
      {/* Top Navigation Bar */}
      <nav className="home-navbar">
        <div className="home-navbar__container">
          <div className="home-navbar__brand">
            <img src="/deltaplus.png" alt="DeltaPlus" className="home-navbar__logo" />
            <span className="home-navbar__title">DeltaPlus Admin</span>
          </div>
          <div className="home-navbar__actions">
            <button onClick={() => setShowModal(true)} className="home-btn home-btn--primary">
              <svg className="home-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Code
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        <div className="home-container">
          {/* Page Header */}
          <div className="home-page-header">
            <div className="home-page-header__content">
              <h1 className="home-page-header__title">Promo Code Management</h1>
              <p className="home-page-header__subtitle">Create, track and manage promotional codes</p>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="home-dashboard-stats">
            <div className="home-stat-card">
              <div className="home-stat-card__icon home-stat-card__icon--total">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="home-stat-card__info">
                <div className="home-stat-card__value">{statistics.total}</div>
                <div className="home-stat-card__label">Total Codes</div>
              </div>
            </div>
            <div className="home-stat-card">
              <div className="home-stat-card__icon home-stat-card__icon--active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="home-stat-card__info">
                <div className="home-stat-card__value">{statistics.active}</div>
                <div className="home-stat-card__label">Active</div>
              </div>
            </div>
            <div className="home-stat-card">
              <div className="home-stat-card__icon home-stat-card__icon--used">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="home-stat-card__info">
                <div className="home-stat-card__value">{statistics.used}</div>
                <div className="home-stat-card__label">Used</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="home-filters-bar">
            <div className="home-filters-bar__search">
              <svg className="home-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search promo codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-search-input"
              />
            </div>
            <div className="home-filters-bar__tabs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`home-filter-tab ${statusFilter === "all" ? "home-filter-tab--active" : ""}`}
              >
                All Codes
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`home-filter-tab ${statusFilter === "active" ? "home-filter-tab--active" : ""}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("used")}
                className={`home-filter-tab ${statusFilter === "used" ? "home-filter-tab--active" : ""}`}
              >
                Used
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="home-data-table">
            {isLoading ? (
              <div className="home-loading-state">
                <div className="home-loading-state__spinner"></div>
                <p>Loading promo codes...</p>
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="home-empty-state">
                <svg className="home-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>No promo codes found</p>
                <span>Try adjusting your search or filter criteria</span>
              </div>
            ) : (
              <table className="home-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id}>
                      <td className="home-table__code">{code.code}</td>
                      <td className="home-table__discount">{code.discount}%</td>
                      <td className="home-table__user">{getUserIdentifier(code)}</td>
                      <td>{getStatusBadge(code.isUsed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Generate Modal */}
      {showModal && (
        <div className="home-modal-overlay" onClick={() => !isGenerating && setShowModal(false)}>
          <div className="home-modal" onClick={(e) => e.stopPropagation()}>
            <div className="home-modal__header">
              <h2 className="home-modal__title">Generate New Promo Code</h2>
              <button 
                className="home-modal__close" 
                onClick={() => !isGenerating && setShowModal(false)}
                disabled={isGenerating}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="home-modal__body">
              <div className="home-form-field">
                <label className="home-form-field__label">Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="home-select"
                  disabled={isGenerating}
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email || user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="home-form-field">
                <label className="home-form-field__label">Discount Percentage</label>
                <div className="home-discount-grid">
                  {discountOptions.map((discount) => (
                    <button
                      key={discount}
                      type="button"
                      onClick={() => setSelectedDiscount(discount)}
                      className={`home-discount-btn ${selectedDiscount === discount ? "home-discount-btn--active" : ""}`}
                      disabled={isGenerating}
                    >
                      {discount}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGeneratePromo}
                className="home-btn home-btn--primary home-btn--full"
                disabled={isGenerating || !selectedUserId}
              >
                {isGenerating ? (
                  <>
                    <span className="home-btn__spinner"></span>
                    Generating & Sending Email...
                  </>
                ) : (
                  'Generate & Send to Email'
                )}
              </button>

              {notification.message && (
                <div className={`home-alert home-alert--${notification.type}`}>
                  <svg className="home-alert__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {notification.type === 'success' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <span>{notification.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;