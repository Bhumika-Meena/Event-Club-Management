'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, GraduationCap, Users } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  price: number
  venue: string
  date: string
  club: {
    name: string
  }
}

interface BookingFormProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onBookingSuccess: () => void
}

export function BookingForm({ event, isOpen, onClose, onBookingSuccess }: BookingFormProps) {
  const [userType, setUserType] = useState<'STUDENT' | 'FACULTY' | null>(null)
  const [loading, setLoading] = useState(false)

  // Student fields
  const [name, setName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')

  // Faculty fields
  const [facultyId, setFacultyId] = useState('')
  const [attendingWith, setAttendingWith] = useState<'ALONE' | 'WITH_FAMILY'>('ALONE')
  const [numberOfPeople, setNumberOfPeople] = useState(1)

  const resetForm = () => {
    setUserType(null)
    setName('')
    setRollNo('')
    setDepartment('')
    setSemester('')
    setFacultyId('')
    setAttendingWith('ALONE')
    setNumberOfPeople(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleConfirm = async () => {
    // Validate based on user type
    if (!userType) {
      toast.error('Please select if you are a Student or Employee')
      return
    }

    if (userType === 'STUDENT') {
      if (!name.trim() || !rollNo.trim() || !department.trim() || !semester.trim()) {
        toast.error('Please fill in all student fields')
        return
      }
    } else {
      if (!name.trim() || !facultyId.trim()) {
        toast.error('Please fill in all employee fields')
        return
      }
      if (attendingWith === 'WITH_FAMILY' && numberOfPeople < 2) {
        toast.error('Number of people must be at least 2 when attending with family')
        return
      }
    }

    setLoading(true)

    try {
      // Prepare booking data
      const bookingData: any = {
        eventId: event.id,
        userType,
        attendingWith,
        numberOfPeople: attendingWith === 'ALONE' ? 1 : numberOfPeople
      }

      if (userType === 'STUDENT') {
        bookingData.rollNo = rollNo.trim()
        bookingData.department = department.trim()
        bookingData.semester = semester.trim()
      } else {
        bookingData.facultyId = facultyId.trim()
      }

      // Check if event is paid or free
      if (event.price > 0) {
        // Paid event - create payment order
        const orderResponse = await axios.post('/payments/create-order', {
          eventId: event.id
        })

        const { orderId, amount, currency, keyId } = orderResponse.data

        // Initialize Razorpay
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'Event & Club Management',
          description: `Booking for ${event.title}`,
          order_id: orderId,
          handler: async (response: any) => {
            try {
              // Payment successful, now create booking
              await axios.post('/events/book', bookingData)
              toast.success('Payment and booking confirmed! Check your email for details.')
              handleClose()
              onBookingSuccess()
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Booking failed after payment')
            }
          },
          prefill: {
            name: name.trim()
          },
          theme: {
            color: '#8b5cf6'
          },
          modal: {
            ondismiss: () => {
              toast('Payment cancelled')
              setLoading(false)
            }
          }
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
        setLoading(false)
      } else {
        // Free event - directly create booking
        await axios.post('/events/book', bookingData)
        toast.success('Booking confirmed! Check your email for details.')
        handleClose()
        onBookingSuccess()
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to complete booking')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold title-gradient mb-2">Book Event</h2>
            <p className="text-slate-600">{event.title}</p>
            <p className="text-sm text-slate-500 mt-1">
              {event.price > 0 ? `Price: ₹${event.price}` : 'Free Event'}
            </p>
          </div>

          {/* User Type Selection */}
          {!userType && (
            <div className="space-y-4">
              <p className="text-slate-700 font-medium">Are you a Student or Employee?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('STUDENT')}
                  className="card-hover p-6 text-center border-2 border-transparent hover:border-primary-300 transition-colors"
                >
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                  <h3 className="font-semibold text-slate-900">Student</h3>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('FACULTY')}
                  className="card-hover p-6 text-center border-2 border-transparent hover:border-primary-300 transition-colors"
                >
                  <User className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                  <h3 className="font-semibold text-slate-900">Employee</h3>
                </button>
              </div>
            </div>
          )}

          {/* Student Form */}
          {userType === 'STUDENT' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="text-sm text-primary-600 hover:text-primary-700 mb-4"
                disabled={loading}
              >
                ← Back to selection
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Enrollment No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="input-field"
                  placeholder="Enter your Enrollment number"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field"
                  placeholder="Enter your department"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input-field"
                  placeholder="Enter your semester"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Faculty Form */}
          {userType === 'FACULTY' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setUserType(null)}
                className="text-sm text-primary-600 hover:text-primary-700 mb-4"
                disabled={loading}
              >
                ← Back to selection
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="input-field"
                  placeholder="Enter your employee ID"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Attending <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="attendingWith"
                      value="ALONE"
                      checked={attendingWith === 'ALONE'}
                      onChange={(e) => {
                        setAttendingWith(e.target.value as 'ALONE' | 'WITH_FAMILY')
                        setNumberOfPeople(1)
                      }}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span className="text-slate-700">Alone</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="attendingWith"
                      value="WITH_FAMILY"
                      checked={attendingWith === 'WITH_FAMILY'}
                      onChange={(e) => {
                        setAttendingWith(e.target.value as 'ALONE' | 'WITH_FAMILY')
                        if (numberOfPeople < 2) setNumberOfPeople(2)
                      }}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span className="text-slate-700">With Family</span>
                  </label>
                </div>
              </div>

              {attendingWith === 'WITH_FAMILY' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 2)}
                    className="input-field"
                    disabled={loading}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {userType && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  event.price > 0 ? 'Proceed to Payment' : 'Confirm Booking'
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
