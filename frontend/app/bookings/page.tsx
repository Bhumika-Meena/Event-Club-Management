'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, apiClient } from '../contexts/AuthContext'
import { Header } from '../components/Header'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Building2, Ticket, QrCode, X, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  venue: string
  date: string
  price: number
  club: {
    id: string
    name: string
    logo?: string
  }
}

interface Booking {
  id: string
  status: 'CONFIRMED' | 'CANCELLED'
  qrCode: string
  createdAt: string
  userType: string
  attendingWith: string
  numberOfPeople: number
  event: Event
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQR, setSelectedQR] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchBookings()
    }
  }, [user, authLoading])

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/bookings/my-bookings')
      setBookings(res.data.bookings)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const generateQRCodeImage = async (qrData: string) => {
    try {
      const QRCode = (await import('qrcode')).default
      return await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const handleShowQR = async (booking: Booking) => {
    const qrImage = await generateQRCodeImage(booking.qrCode)
    if (qrImage) {
      setSelectedQR(qrImage)
    } else {
      toast.error('Failed to generate QR code')
    }
  }

  const handleDownloadQR = async (booking: Booking) => {
    const qrImage = await generateQRCodeImage(booking.qrCode)
    if (qrImage) {
      const link = document.createElement('a')
      link.href = qrImage
      link.download = `ticket-${booking.event.title.replace(/\s+/g, '-')}.png`
      link.click()
      toast.success('QR code downloaded')
    } else {
      toast.error('Failed to download QR code')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View all your event bookings and tickets
            </p>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="border border-slate-200 rounded-xl p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No bookings yet</p>
              <p className="text-sm text-slate-400 mb-6">
                Browse events and book your tickets
              </p>
              <a
                href="/events"
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Browse Events
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Event Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {booking.event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(booking.event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {' at '}
                          {new Date(booking.event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {booking.event.venue}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {booking.event.club.name}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Type: {booking.userType}</span>
                        <span>•</span>
                        <span>Attending: {booking.attendingWith.replace('_', ' ')}</span>
                        {booking.numberOfPeople > 1 && (
                          <>
                            <span>•</span>
                            <span>{booking.numberOfPeople} people</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShowQR(booking)}
                          className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR
                        </button>
                        <button
                          onClick={() => handleDownloadQR(booking)}
                          className="px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQR(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Your Ticket</h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
              <img src={selectedQR} alt="QR Code" className="w-full" />
            </div>
            <p className="mt-4 text-xs text-center text-slate-500">
              Show this QR code at the event entrance
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
