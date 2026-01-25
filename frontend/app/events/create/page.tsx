'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Save } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Club {
  id: string
  name: string
}

export default function CreateEvent() {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    maxSeats: '',
    price: '0'
  })
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === 'CLUB' || user?.role === 'ADMIN') {
      fetchClub()
    } else if (user) {
      router.push('/events')
    }
  }, [user])

  const fetchClub = async () => {
    try {
      if (user?.role === 'CLUB') {
        const response = await axios.get('/clubs/my/club')
        setClub(response.data.club)
      } else if (user?.role === 'ADMIN') {
        // For admin, we'll need to select a club - for now, show a message
        toast.error('Please select a club to create an event')
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('You need to create a club first')
        router.push('/club')
      } else {
        toast.error('Failed to fetch club data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!club) {
      toast.error('Club information is required')
      return
    }

    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time}`)
    
    if (isNaN(dateTime.getTime())) {
      toast.error('Please enter a valid date and time')
      return
    }

    if (new Date(dateTime) < new Date()) {
      toast.error('Event date must be in the future')
      return
    }

    setSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        venue: formData.venue.trim(),
        date: dateTime.toISOString(),
        maxSeats: parseInt(formData.maxSeats),
        price: parseFloat(formData.price) || 0,
        clubId: club.id
      }
      
      console.log('Sending event data:', payload)
      
      const response = await axios.post('/events', payload)
      toast.success('Event created successfully! It will be reviewed by admin.')
      router.push('/club')
    } catch (error: any) {
      console.error('Event creation error:', error.response?.data)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to create event'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!club && user?.role === 'CLUB') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">No Club Found</h1>
          <p className="text-slate-600 mb-6">You need to create a club first.</p>
          <Link href="/club" className="btn-primary">
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href={user?.role === 'CLUB' ? '/club' : '/admin'} className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold title-gradient">Create Event</h1>
              <p className="text-slate-600">Add a new event for {club?.name || 'your club'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input-field"
                placeholder="Enter event title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="input-field"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-2">
                  Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Event location"
                    value={formData.venue}
                    onChange={handleChange}
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>

              <div>
                <label htmlFor="maxSeats" className="block text-sm font-medium text-slate-700 mb-2">
                  Max Seats <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="maxSeats"
                    name="maxSeats"
                    type="number"
                    required
                    min="1"
                    className="input-field pl-10"
                    placeholder="Maximum capacity"
                    value={formData.maxSeats}
                    onChange={handleChange}
                  />
                  <Users className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="input-field pl-10"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  className="input-field"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                Price (INR)
              </label>
              <div className="relative">
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field pl-10"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                />
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
              <p className="mt-1 text-sm text-slate-500">Enter 0 for free events. All prices are in INR.</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href={user?.role === 'CLUB' ? '/club' : '/admin'} className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Event
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
