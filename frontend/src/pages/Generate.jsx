import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../services/api";
import "../styles/generate.css";

function Generate() {
  const [discount, setDiscount] = useState(10);
  const [message, setMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setGeneratedCode("");
    
    try {
      const res = await axios.post(`${BASE_URL}/promo/generate`, {
        discount: parseInt(discount)
      });
      setGeneratedCode(res.data.code);
      setMessage("Promo code generated successfully!");
    } catch (err) {
      setError("Failed to generate promo code. Please try again.");
      console.error("Error generating promo code:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setMessage("Code copied to clipboard!");
      setTimeout(() => {
        if (message === "Code copied to clipboard!") {
          setMessage("");
        }
      }, 3000);
    }
  };

  return (
    <div className="generate-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1>Generate Promo Code</h1>
          <p className="subtitle">Create new promotional discount codes for your customers</p>
        </div>

        {/* Form Card */}
        <div className="form-card">
          <div className="form-content">
            {/* Discount Input Section */}
            <div className="input-group">
              <label htmlFor="discount" className="input-label">
                Discount Percentage
              </label>
              <div className="input-wrapper">
                <input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="discount-input"
                  disabled={loading}
                />
                <span className="input-suffix">%</span>
              </div>
              <p className="input-hint">
                Enter a value between 0 and 100
              </p>
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerate} 
              className="generate-btn"
              disabled={loading || !discount || discount < 0 || discount > 100}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating...
                </>
              ) : (
                "Generate Promo Code"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message & Generated Code */}
            {generatedCode && (
              <div className="success-section">
                <div className="success-message">
                  <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{message}</span>
                </div>
                
                <div className="code-display">
                  <div className="code-label">Generated Code</div>
                  <div className="code-value-wrapper">
                    <code className="code-value">{generatedCode}</code>
                    <button onClick={handleCopyCode} className="copy-btn" title="Copy to clipboard">
                      <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="info-content">
              <h4>About Promo Codes</h4>
              <p>Generated codes are unique and can only be used once. Make sure to share them securely with your customers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generate;