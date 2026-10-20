import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '480px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '3rem 2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9',
      }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1 }}>🧁</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.75rem',
          letterSpacing: '-0.025em',
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Oops! The treat or page you are looking for has either been enjoyed, moved, or never existed in our bakery.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              backgroundColor: '#d97706',
              color: '#ffffff',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b45309')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
          >
            Return to Home
          </Link>

          <Link
            to="/products"
            style={{
              display: 'inline-block',
              backgroundColor: '#f8fafc',
              color: '#475569',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid #e2e8f0',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          >
            Browse Our Artisanal Cakes
          </Link>
        </div>
      </div>
    </div>
  );
};
