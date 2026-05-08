import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { UserLocationProvider } from './contexts/UserLocationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <UserLocationProvider>
        <App />
      </UserLocationProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
