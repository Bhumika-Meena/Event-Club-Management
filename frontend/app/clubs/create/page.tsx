'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Save, Globe, Instagram, Facebook, Twitter } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CreateClub() {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: ''
  })
  
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        facebook: formData.facebook.trim() || undefined,
        twitter: formData.twitter.trim() || undefined
      }

      await axios.post('/clubs', payload)
      toast.success('Club created successfully!')
      router.push('/club')
    } catch (error: any) {
      console.error('Club creation error:', error.response?.data)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to create club'
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

  if (user?.role !== 'CLUB') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">Only club accounts can create clubs.</p>
          <Link href="/" className="btn-primary">
            Go Home
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
            <Link href="/club" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold title-gradient">Create Your Club</h1>
              <p className="text-slate-600">Set up your club profile to start managing events</p>
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Club Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your club name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
              <p className="mt-1 text-sm text-slate-500">This will be your club's public name</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="input-field"
                placeholder="Tell people about your club, its mission, and activities..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="input-field pl-10"
                  placeholder="https://yourclub.com"
                  value={formData.website}
                  onChange={handleChange}
                />
                <Globe className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    className="input-field pl-10"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                  <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 mb-2">
                  Facebook
                </label>
                <div className="relative">
                  <input
                    id="facebook"
                    name="facebook"
                    type="text"
                    className="input-field pl-10"
                    placeholder="Page name"
                    value={formData.facebook}
                    onChange={handleChange}
                  />
                  <Facebook className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-slate-700 mb-2">
                  Twitter
                </label>
                <div className="relative">
                  <input
                    id="twitter"
                    name="twitter"
                    type="text"
                    className="input-field pl-10"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                  <Twitter className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> Only the club name is required. You can add other details later by editing your club profile.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/club" className="btn-secondary">
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
                Create Club
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
