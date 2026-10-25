/**
 * App Shell — orchestrates TopLanguageBar + content area + BottomNavBar
 */
import React, { useState } from 'react'
import TopLanguageBar  from '@/components/layout/TopLanguageBar'
import BottomNavBar    from '@/components/layout/BottomNavBar'
import FieldsTab       from '@/components/tabs/FieldsTab'
import CropStressTab   from '@/components/tabs/CropStressTab'
import AlertsTab       from '@/components/tabs/AlertsTab'
import JudgeTab        from '@/components/tabs/JudgeTab'
import { useTab }      from '@/contexts/TabContext'
import { clsx }        from 'clsx'

// Subtle animated background blobs
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-mint/20 blur-3xl animate-pulse-soft" />
      <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-emerald-mid/15 blur-3xl animate-pulse-soft [animation-delay:1s]" />
      <div className="absolute bottom-32 left-1/4 w-48 h-48 rounded-full bg-mint-pale/30 blur-3xl animate-pulse-soft [animation-delay:2s]" />
    </div>
  )
}

const TAB_COMPONENTS = {
  fields:      FieldsTab,
  crop_stress: CropStressTab,
  alerts:      AlertsTab,
  judge:       JudgeTab,
}

export default function App() {
  const { activeTab } = useTab()
  const [unreadAlerts, setUnreadAlerts] = useState(0)

  const TabComponent = TAB_COMPONENTS[activeTab] ?? FieldsTab

  return (
    <div className="min-h-screen bg-alabaster font-sans antialiased text-gray-800 selection:bg-mint selection:text-emerald-deep">
      <BackgroundOrbs />

      {/* Fixed top bar with responsive brand, tablet/desktop nav, and language switcher */}
      <TopLanguageBar unreadCount={unreadAlerts} />

      {/* Scrollable content area: responsive fluid container */}
      <main
        className={clsx(
          'relative z-10 w-full max-w-7xl mx-auto min-h-screen',
          'pt-[68px] sm:pt-[76px]',
          'pb-[100px] md:pb-12',    // safe space for mobile floating nav; compact for desktop
          'px-3.5 sm:px-6 lg:px-8',
          'gpu-accelerated'
        )}
      >
        {activeTab === 'alerts' ? (
          <AlertsTab onUnreadChange={setUnreadAlerts} />
        ) : (
          <TabComponent />
        )}
      </main>

      {/* Floating bottom nav for mobile devices */}
      <BottomNavBar unreadCount={unreadAlerts} />
    </div>
  )
}
