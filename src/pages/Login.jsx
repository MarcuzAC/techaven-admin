import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Laptop, Headphones } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setIsAuthenticated, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    // Load Poppins font and set body styles
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    document.body.style.margin = '0';
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';
    document.body.style.backgroundColor = '#fff';
    document.body.style.fontFamily = "'Poppins', sans-serif";

    return () => {
      document.head.removeChild(link);
      document.body.style = {};
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login({
        email: credentials.email,
        password: credentials.password,
      });

      if (data?.access_token && data?.user_type === 'admin') {
        localStorage.setItem('admin_token', data.access_token);
        setIsAuthenticated(true);
        navigate('/', { replace: true }); // ✅ redirect to main dashboard
      } else {
        setError('Access denied. Admin privileges required.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        fontFamily: "'Poppins', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Left side - Login form */}
      <div
        style={{
          width: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          padding: '2rem',
          zIndex: 2,
          boxShadow: '4px 0 15px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '350px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              Techaven Admin
            </h1>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', fontWeight: '400' }}>
              Sign in to your admin account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
            }}
          >
            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                {error}
              </div>
            )}

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.3rem',
                }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                placeholder="admin@techhaven.com"
                style={{
                  width: '100%',
                  height: '45px',
                  padding: '0 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.3rem',
                }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  height: '45px',
                  padding: '0 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '45px',
                backgroundColor: loading ? '#60A5FA' : '#2563EB',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                transition: 'background-color 0.2s ease',
                fontSize: '0.9rem',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Blue background */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
          padding: '2rem',
          color: '#fff',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginBottom: '3rem',
            }}
          >
            <Smartphone style={{ width: '80px', height: '80px', opacity: 0.8 }} />
            <Laptop style={{ width: '80px', height: '80px', opacity: 0.8 }} />
            <Headphones style={{ width: '80px', height: '80px', opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            Techaven
          </h2>
          <p
            style={{
              fontSize: '1.4rem',
              opacity: 0.9,
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}
          >
            Electronics Marketplace
          </p>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: '400' }}>
            Admin Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
