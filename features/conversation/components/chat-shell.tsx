import React from 'react'
import { AppSidebar } from '@/features/conversation/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'


function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ChatShell;