import { useState } from 'react';

export default function ComingSoon({ title, subtitle }) {
  const [showMsg, setShowMsg] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowMsg(true)}
        style={{
          background: '#F5F5F5',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed #CCC',
          opacity: 0.7,
          transition: 'opacity 0.3s',
          minHeight: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
      >
        <span style={{ fontSize: 36 }}>🔒</span>
        <h3 style={{ margin: 0, fontSize: 18, color: '#666' }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#999' }}>{subtitle}</p>}
        <span style={{
          background: '#FFA726',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          marginTop: 4,
        }}>Coming Soon</span>
      </div>

      {showMsg && (
        <div
          onClick={() => setShowMsg(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            maxWidth: 340,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 48 }}>🚧</span>
            <h3 style={{ margin: '12px 0 8px', color: '#333' }}>{title}</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              This module is coming soon! We're working on making it awesome.
            </p>
            <button
              onClick={() => setShowMsg(false)}
              style={{
                background: '#2E7D32',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
