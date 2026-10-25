/**
 * Farmplus — React entry point
 * IC26-01-01 Explainable Crop Stress Advisory
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext'
import { TabProvider }      from './contexts/TabContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <TabProvider>
        <App />
      </TabProvider>
    </LanguageProvider>
  </React.StrictMode>
)
