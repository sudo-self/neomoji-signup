import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import '@google/model-viewer';
import { supabase } from './lib/supabase';

// Type declaration for model-viewer element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        ar?: boolean;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'skybox-image'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

export default function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eligibleForRewards, setEligibleForRewards] = useState(false);

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Store email in Supabase database
      const { error: supabaseError } = await supabase
        .from('email_signups')
        .insert([{ email }]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Continue with Formspree even if Supabase fails
      }

      // Send to Formspree for email collection
      const response = await fetch("https://formspree.io/f/xvgpyrpp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Everyone gets rewards now!
      const isEligible = true;
      
      setSubmitted(true);
      setEmail("");
      launchConfetti();
      setEligibleForRewards(isEligible);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("There was an issue submitting your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/matrix.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "50vh",
          marginBottom: "1rem",
          borderRadius: "20px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <model-viewer
          src="/NeoMoji.glb"
          ar
          auto-rotate
          camera-controls
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1.5rem",
              color: "#10b981",
              textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
            }}
          >
            🎉 🎁
          </div>
        </model-viewer>
      </div>

      {eligibleForRewards && (
        <div
          style={{
            marginTop: "-1rem",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            color: "#fff",
            padding: "0.4rem 1rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(251, 191, 36, 0.3)",
          }}
        >
          🎁 FREE REWARDS UNLOCKED!
        </div>
      )}
          
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "2rem",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.25)",
          color: "#f8fafc",
        }}
      >
        {submitted ? (
          <div style={{ color: "#10b981", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "#10b981" }}>🎉 Thank You!</h3>
            <p style={{ color: "#e2e8f0" }}>You now have early access to the NeoMoji App</p>
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.9rem",
                marginTop: "0.5rem",
                color: "#cbd5e1",
              }}
            >
              In a few minutes check your email for an Official Playstore Link!
            </p>

            {eligibleForRewards && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 500, marginBottom: "0.5rem", color: "#fbbf24" }}>
                  🎁 FREE REWARDS UNLOCKED 🎁
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/rewards/WhyGetUp.mp3';
                    link.download = 'WhyGetUp.mp3';
                    link.click();
                  }}
                  style={{ 
                    display: "block", 
                    marginBottom: "0.5rem", 
                    color: "#fbbf24",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "1rem",
                    textShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
                    fontWeight: "600"
                  }}
                >
                  📥 Android NeoMoji Ringtone!
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/rewards/NeoMoji.glb';
                    link.download = 'NeoMoji.glb';
                    link.click();
                  }}
                  style={{ 
                    display: "block", 
                    color: "#fbbf24",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "1rem",
                    textShadow: "0 0 12px rgba(251, 191, 36, 0.6)",
                    fontWeight: "600"
                  }}
                >
                  📥 Limited NeoMoji 3D Model!
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2
              style={{
                marginBottom: "1.25rem",
                textAlign: "center",
                fontSize: "1.4rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NeoMoji Playstore Beta!
            </h2>

            <p
              style={{
                fontStyle: "italic",
                color: "#60a5fa",
                marginBottom: "1rem",
                textAlign: "center",
                textShadow: "0 0 10px rgba(96, 165, 250, 0.3)",
              }}
            >
              Sign up now to unlock immediate rewards!
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    textAlign: "center",
                    color: "#ffffff",
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  official playstore link sent to your email
                </label>
                <input
                  type="email"
                  id="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="awesome@gmail.com"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#ffffff",
                    backdropFilter: "blur(10px)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    color: "#ef4444",
                    marginBottom: "1rem",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: loading 
                    ? "rgba(156, 163, 175, 0.5)" 
                    : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  boxShadow: loading 
                    ? "none" 
                    : "0 4px 15px rgba(59, 130, 246, 0.3)",
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    Sending...
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        display: "inline-block",
                        width: "1rem",
                        height: "1rem",
                        border: "2px solid white",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                        verticalAlign: "middle",
                      }}
                    />
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <img
        src="/PreRegisterOnGooglePlay.png"
        alt="Pre-register on Google Play"
        style={{
          marginTop: "1.5rem",
          width: "180px",
          height: "auto",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onClick={() =>
          window.open(
            "https://play.google.com/store/apps/details?id=app.vercel.neomoji.twa",
            "_blank"
          )
        }
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.filter = "brightness(1)";
        }}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: rgba(203, 213, 225, 0.9) !important;
        }
        
        input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: rgba(15, 23, 42, 0.95) !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}