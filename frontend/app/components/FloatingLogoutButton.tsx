'use client'

import { useAuth } from '../contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function FloatingLogoutButton() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Hide on auth pages
  if (!user || pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.button
        key="floating-logout"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={handleLogout}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/40 backdrop-blur hover:bg-slate-900 hover:shadow-xl transition-all"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </motion.button>
    </AnimatePresence>
  )
}


