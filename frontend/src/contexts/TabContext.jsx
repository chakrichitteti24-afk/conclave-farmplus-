/**
 * TabContext — manages which bottom-nav tab is active
 */
import React, { createContext, useContext, useState } from 'react'

export const TABS = {
  FIELDS:      'fields',
  CROP_STRESS: 'crop_stress',
  ALERTS:      'alerts',
  JUDGE:       'judge',
}

const TabContext = createContext(null)

export function TabProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS.FIELDS)
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, TABS }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTab must be used within TabProvider')
  return ctx
}
