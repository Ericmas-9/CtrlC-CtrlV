import React from 'react';

const PlaceholderScreen = ({ title }) => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      textAlign: 'center',
      color: 'var(--color-gray-500)'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-gray-100)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        fontSize: '32px'
      }}>
        🚧
      </div>
      <h2 style={{ color: 'var(--color-gray-900)', marginBottom: '8px' }}>{title}</h2>
      <p style={{ fontSize: '14px' }}>This screen is under construction for the next phase of the MVP.</p>
    </div>
  );
};

export default PlaceholderScreen;
