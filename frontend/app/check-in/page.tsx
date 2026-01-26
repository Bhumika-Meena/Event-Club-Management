'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, CheckCircle, XCircle, Camera, ArrowLeft, User, Calendar, MapPin, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Html5Qrcode } from 'html5-qrcode'
import { format } from 'date-fns'
import Link from 'next/link'

interface CheckInResult {
  message: string
  booking: {
    id: string
    status: string
    checkedInAt: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    event: {
      id: string
      title: string
      date: string
      venue: string
      club: {
        name: string
      }
    }
  }
  checkedInAt: string
}

export default function CheckInPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [scanStatus, setScanStatus] = useState<string>('Ready to scan')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user has permission (CLUB or ADMIN)
    if (!authLoading && user && user.role !== 'CLUB' && user.role !== 'ADMIN') {
      toast.error('Only Club organizers and Admins can access check-in')
      router.push('/events')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setResult(null)
      setScanning(true)

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      console.log('Starting QR scanner...')

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText, decodedResult) => {
          // QR code scanned successfully
          console.log('QR Code detected:', decodedText.substring(0, 50) + '...')
          setScanStatus('QR Code detected! Verifying...')
          handleQRCodeScanned(decodedText)
        },
        (errorMessage) => {
          // Log errors for debugging (but don't show to user as they're frequent)
          // Only log if it's not a "not found" error (which is normal)
          if (!errorMessage.includes('NotFoundException')) {
            console.log('Scanning...', errorMessage)
          }
          // Update status to show we're actively scanning
          setScanStatus('Scanning... Position QR code in frame')
        }
      )
      console.log('Scanner started successfully')
      setScanStatus('Scanner active - Position QR code in frame')
      toast.success('Scanner started! Position QR code in frame')
    } catch (err: any) {
      console.error('Error starting scanner:', err)
      setError('Failed to start camera. Please check permissions.')
      setScanning(false)
      toast.error('Camera access denied or not available')
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      }
      setScanning(false)
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }

  const handleQRCodeScanned = async (qrCode: string) => {
    try {
      console.log('Processing QR code:', qrCode.substring(0, 50) + '...')
      
      // Stop scanning
      await stopScanning()

      // Show loading state
      toast.loading('Verifying QR code...', { id: 'verifying' })

      // Verify QR code with backend
      const response = await axios.post<CheckInResult>('/bookings/verify-qr', {
        qrCode: qrCode.trim()
      })

      console.log('Check-in successful:', response.data)
      toast.success('Check-in successful!', { id: 'verifying' })
      setResult(response.data)
    } catch (err: any) {
      console.error('Check-in error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 'Failed to verify QR code'
      setError(errorMessage)
      toast.error(errorMessage, { id: 'verifying' })
      
      // Restart scanning after error (unless it's a timing issue)
      if (!errorMessage.includes('not available yet')) {
        setTimeout(() => {
          setError(null)
          startScanning()
        }, 3000)
      }
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) {
      toast.error('Please enter a QR code')
      return
    }
    await handleQRCodeScanned(manualCode.trim())
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setManualCode('')
    setShowManualInput(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (user && user.role !== 'CLUB' && user.role !== 'ADMIN') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={user?.role === 'ADMIN' ? '/admin' : '/club'} className="text-slate-600 hover:text-primary-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold title-gradient flex items-center gap-2">
                  <QrCode className="w-8 h-8" />
                  Event Check-In
                </h1>
                <p className="text-slate-600">Scan QR codes to check in attendees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="glass-card p-6 border-2 border-green-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-600 mb-2">Check-in Successful!</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-5 h-5" />
                        <span className="font-semibold">
                          {result.booking.user.firstName} {result.booking.user.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-5 h-5" />
                        <span>{result.booking.event.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-5 h-5" />
                        <span>{result.booking.event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="w-5 h-5" />
                        <span>{result.booking.event.club.name}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          Checked in at: {format(new Date(result.checkedInAt), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="mt-4 btn-primary"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="glass-card p-6 border-2 border-red-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-600 mb-2">Check-in Failed</h3>
                    <p className="text-slate-700">{error}</p>
                    {error.includes('not available yet') && (
                      <p className="text-sm text-slate-600 mt-2">
                        💡 Check-in opens 30 minutes before the event starts. Please wait until then.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner Section */}
        {!result && (
          <div className="space-y-6">
            {/* Scanner Container */}
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold title-gradient mb-2">QR Code Scanner</h2>
                <p className="text-slate-600">Position the QR code within the frame</p>
              </div>

              {/* QR Code Reader */}
              <div className="relative">
                <div
                  id="qr-reader"
                  className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-slate-900"
                  style={{ minHeight: '300px' }}
                />
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">Camera Ready</p>
                      <p className="text-sm opacity-75">Click "Start Scanner" to begin</p>
                    </div>
                  </div>
                )}
                {scanning && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    {scanStatus}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                {!scanning ? (
                  <button
                    onClick={startScanning}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start Scanner
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    Stop Scanner
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowManualInput(!showManualInput)
                    if (scanning) stopScanning()
                  }}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {showManualInput ? 'Hide' : 'Enter'} Manual Code
                </button>
              </div>
            </div>

            {/* Manual Input */}
            {showManualInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-bold title-gradient mb-4">Enter QR Code Manually</h3>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      QR Code (JWT Token)
                    </label>
                    <textarea
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Paste the QR code token here..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Verify QR Code
                  </button>
                </form>
              </motion.div>
            )}

            {/* Instructions */}
            <div className="glass-card p-6 bg-primary-50/50">
              <h3 className="text-lg font-bold title-gradient mb-3">How to Use</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
                <li>Click "Start Scanner" to activate your camera</li>
                <li>Position the attendee's QR code within the frame</li>
                <li>The system will automatically verify and check them in</li>
                <li>If scanning fails, use "Enter Manual Code" to paste the token</li>
                <li>Check-in opens 30 minutes before the event starts</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> If QR code is on a phone screen, make sure:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>Screen brightness is at maximum</li>
                  <li>QR code is clearly visible and not blurry</li>
                  <li>Hold the phone steady within the scanning frame</li>
                  <li>Ensure good lighting around the QR code</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
