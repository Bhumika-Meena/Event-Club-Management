import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { FloatingLogoutButton } from './components/FloatingLogoutButton'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Event & Club Management Portal',
  description: 'A comprehensive platform for managing events and clubs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-primary-50 via-white to-primary-100 text-slate-800 antialiased`}
      >
        <AuthProvider>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
          <div className="min-h-screen relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,78,205,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.12),_transparent_50%)]"></div>
            <div className="relative z-10">
              {children}
              <FloatingLogoutButton />
            </div>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
