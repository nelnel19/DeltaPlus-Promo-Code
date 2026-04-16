import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../services/api";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showNotification("Please enter both email and password", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      localStorage.setItem("user", JSON.stringify(response.data.user));
      showNotification(`Welcome back, ${response.data.user.username}!`, "success");
      
      setTimeout(() => {
        window.location.href = "/validate";
      }, 1500);
      
    } catch (error) {
      showNotification(error.response?.data?.error || "Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__card">
          {/* Brand Section with Logo */}
          <div className="login__brand">
            <div className="login__logo">
              <img src="/deltaplus.png" alt="DeltaPlus" className="login__logo-img" />
            </div>
            <p className="login__subtitle">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="login__form">
            <div className="login__form-group">
              <label className="login__form-label">Email</label>
              <div className="login__input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  className="login__input"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login__form-group">
              <label className="login__form-label">Password</label>
              <div className="login__input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="login__input"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login__toggle"
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
            </div>

            <button
              onClick={handleLogin}
              className="login__button"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <span className="login__button-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="login__footer">
              <p>
                Don't have an account?{' '}
                <a href="/register" className="login__link">
                  Create account
                </a>
              </p>
            </div>

            {notification.message && (
              <div className={`login__notification login__notification--${notification.type}`}>
                <svg className="login__notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

export default Login;