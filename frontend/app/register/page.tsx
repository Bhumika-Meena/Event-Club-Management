'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

type Step = 'email' | 'otp' | 'details'

export default function Register() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as 'STUDENT' | 'CLUB' | 'ADMIN'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [verifyingOTP, setVerifyingOTP] = useState(false)
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingOTP(true)

    try {
      const response = await axios.post('/auth/send-otp', { email })
      toast.success(response.data.message || 'OTP sent to your email!')
      setStep('otp')
    } catch (error: any) {
      console.error('Send OTP error:', error.response?.data)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          'Failed to send OTP'
      toast.error(errorMessage)
    } finally {
      setSendingOTP(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP')
      return
    }

    setVerifyingOTP(true)

    try {
      await axios.post('/auth/verify-otp', { email, otp })
      toast.success('Email verified!')
      setOtpVerified(true)
      setStep('details')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
      setOtp('')
    } finally {
      setVerifyingOTP(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpVerified) {
      toast.error('Please verify your email first')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // Check if password is alphanumeric (contains both letters and numbers)
    const alphanumericRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!alphanumericRegex.test(formData.password)) {
      toast.error('Password must contain letters, numbers and special character.)')
      return
    }

    setLoading(true)

    try {
      const newUser = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: email,
        password: formData.password,
        role: formData.role,
        otp: otp
      })
      toast.success('Registration successful!')
      if (newUser.role === 'ADMIN') {
        router.push('/admin')
      } else if (newUser.role === 'CLUB') {
        router.push('/clubs/create')
      } else {
        router.push('/events')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 card"
      >
        <div className="text-center">
          <Link href="/" className="text-3xl font-extrabold title-gradient">
            EventPortal
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center ${step === 'email' ? 'text-primary-600' : step === 'otp' || step === 'details' ? 'text-green-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'email' ? 'bg-primary-100' : 'bg-green-100'}`}>
              {step !== 'email' ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Email</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center ${step === 'otp' ? 'text-primary-600' : step === 'details' ? 'text-green-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'otp' ? 'bg-primary-100' : step === 'details' ? 'bg-green-100' : 'bg-slate-100'}`}>
              {step === 'details' ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Verify</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center ${step === 'details' ? 'text-primary-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-primary-100' : 'bg-slate-100'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Details</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Email */}
          {step === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  We'll send a verification code to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingOTP}
                className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOTP ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  className="input-field text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <p className="mt-1 text-sm text-slate-500">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={verifyingOTP || otp.length !== 6}
                  className="btn-primary flex-1 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingOTP ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-sm text-primary-600 hover:text-primary-500"
                  disabled={sendingOTP}
                >
                  {sendingOTP ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </motion.form>
          )}

          {/* Step 3: Registration Details */}
          {step === 'details' && (
            <motion.form
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-6"
            >
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">Email verified: <strong>{email}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  className="input-field"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student/Employee</option>
                  <option value="CLUB">Club</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-5 w-5 text-primary-400 hover:text-primary-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Must be at least 8 characters and contain letters, numbers and special character.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-5 w-5 text-primary-400 hover:text-primary-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="btn-secondary flex-1 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}