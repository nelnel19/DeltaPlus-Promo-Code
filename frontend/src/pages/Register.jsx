import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../services/api";
import "../styles/register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleRegister = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    if (username.length < 3) {
      showNotification("Username must be at least 3 characters long", "error");
      return;
    }

    if (username.includes(" ")) {
      showNotification("Username cannot contain spaces", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, { 
        username: username.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      // MODIFIED: Show email-specific message
      showNotification(
        "✅ Account created! Check your Gmail inbox for your welcome promo code (check spam folder too!). Redirecting to login...", 
        "success"
      );
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 4000);
      
    } catch (error) {
      if (error.response?.data?.error) {
        showNotification(error.response.data.error, "error");
      } else {
        showNotification("Registration failed. Please try again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__card">
          {/* Brand Section with Logo */}
          <div className="register__brand">
            <div className="register__logo">
              <img src="/deltaplus.png" alt="DeltaPlus" className="register__logo-img" />
            </div>
            <p className="register__subtitle">Sign up to get started</p>
          </div>

          {/* Register Form */}
          <div className="register__form">
            <div className="register__form-group">
              <label className="register__form-label">Username</label>
              <div className="register__input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Choose a username"
                  className="register__input"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="register__form-group">
              <label className="register__form-label">Email</label>
              <div className="register__input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your Gmail address"
                  className="register__input"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <p className="register__hint">We'll send promo codes to this email address</p>
            </div>

            <div className="register__form-group">
              <label className="register__form-label">Password</label>
              <div className="register__input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Create a password"
                  className="register__input"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="register__hint">Password must be at least 6 characters</p>
            </div>

            <div className="register__form-group">
              <label className="register__form-label">Confirm Password</label>
              <div className="register__input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
                  className="register__input"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register__toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="register__button"
              disabled={isLoading || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            >
              {isLoading ? (
                <>
                  <span className="register__button-spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account & Get Promo Code'
              )}
            </button>

            <div className="register__footer">
              <p>
                Already have an account?{' '}
                <a href="/login" className="register__link">
                  Sign in
                </a>
              </p>
            </div>

            {notification.message && (
              <div className={`register__notification register__notification--${notification.type}`}>
                <svg className="register__notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
    </div>
  );
}

export default Register;