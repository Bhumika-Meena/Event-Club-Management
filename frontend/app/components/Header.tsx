'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Settings, Building2, User, LogOut, Menu, X } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    router.replace('/')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-lg font-semibold text-slate-900 tracking-tight">
            EventPortal
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link 
                  href="/events" 
                  className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Events
                </Link>
                
                {user.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                
                {user.role === 'CLUB' && (
                  <Link 
                    href="/club" 
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                
                <Link 
                  href="/profile" 
                  className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <div className="w-px h-5 bg-slate-200 mx-2" />
                
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/events" 
                  className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Events
                </Link>
                <Link 
                  href="/login" 
                  className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  <Link 
                    href="/events" 
                    onClick={closeMobileMenu}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                  >
                    Events
                  </Link>
                  
                  {user.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      onClick={closeMobileMenu}
                      className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'CLUB' && (
                    <Link 
                      href="/club" 
                      onClick={closeMobileMenu}
                      className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      Club Dashboard
                    </Link>
                  )}
                  
                  <Link 
                    href="/profile" 
                    onClick={closeMobileMenu}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  <div className="h-px bg-slate-100 my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/events" 
                    onClick={closeMobileMenu}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                  >
                    Events
                  </Link>
                  <Link 
                    href="/login" 
                    onClick={closeMobileMenu}
                    className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={closeMobileMenu}
                    className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors text-center mt-2"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
