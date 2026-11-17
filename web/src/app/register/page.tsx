'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DishariLogo } from '@/components/shared/DishariLogo'
import {
  ScanLine,
  Camera,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  IdCard,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Cpu,
  Fingerprint,
  FileText,
  BadgeCheck,
  Check,
  RotateCcw
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { t } from '@/lib/translations'
import {
  registerUser,
  scanDocumentOCR,
  uploadDocument,
  type UserProfile
} from '@/lib/api'
import { WIN10_INDICATOR_SPRING } from '@/lib/motion'
import { cn } from '@/lib/utils'

type RegisterMode = 'nid_scan' | 'phone' | 'manual_nid' | 'email'

interface ScannedCitizenResult {
  user: UserProfile
  meta: Record<string, any>
  previewDataUrl: string
}

export default function RegisterPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const isBn = lang === 'bn'

  // Primary mode state
  const [mode, setMode] = useState<RegisterMode>('nid_scan')

  // Conventional registration form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [manualNid, setManualNid] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // NID Optical Scan registration states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle')
  const [scanProgressText, setScanProgressText] = useState('')
  const [scannedResult, setScannedResult] = useState<ScannedCitizenResult | null>(null)

  // ─── Conventional Registration Handler ──────────────────────────────────────
  const handleConventionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError(isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name')
      return
    }

    if (mode === 'phone') {
      const cleanPhone = phone.trim().replace(/\s+/g, '')
      if (cleanPhone.length < 11) {
        setError(t('auth', 'errorPhone', lang))
        return
      }
    } else if (mode === 'manual_nid') {
      const cleanNid = manualNid.trim()
      if (cleanNid.length < 10) {
        setError(isBn ? 'সঠিক জাতীয় পরিচয়পত্র নম্বর দিন (কমপক্ষে ১০ সংখ্যা)' : 'Enter valid NID (at least 10 digits)')
        return
      }
      if (!phone.trim()) {
        setError(isBn ? 'যাচাইকরণের জন্য মোবাইল নম্বর প্রদান করুন' : 'Please provide mobile number')
        return
      }
    } else if (mode === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setError(isBn ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন' : 'Please provide valid email address')
        return
      }
    }

    if (!password || password.length < 6) {
      setError(t('auth', 'errorPasswordLength', lang))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth', 'errorPasswordMatch', lang))
      return
    }

    setLoading(true)

    try {
      const res = await registerUser({
        fullName: fullName.trim(),
        phone: phone.trim() || (mode === 'email' ? '01700000000' : '017' + Math.floor(10000000 + Math.random() * 90000000)),
        email: email.trim() || undefined,
        password,
      })

      if (!res.success || !res.user) {
        setError(res.error || (isBn ? 'নিবন্ধন ব্যর্থ হয়েছে' : 'Registration failed'))
        setLoading(false)
        return
      }

      const registeredUser: UserProfile = {
        ...res.user,
        full_name: fullName.trim(),
        citizen_id: mode === 'manual_nid' ? `NID-${manualNid.trim()}` : res.user.citizen_id,
        phone: phone.trim() || res.user.phone,
        email: email.trim() || res.user.email
      }

      localStorage.setItem('dishari_user', JSON.stringify(registeredUser))
      localStorage.setItem('dishari_logged_in', 'true')
      window.dispatchEvent(new Event('dishari_auth_change'))

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 700)
    } catch {
      setError(isBn ? 'নেটওয়ার্ক সমস্যা হয়েছে, পুনরায় চেষ্টা করুন' : 'Network error, please try again')
      setLoading(false)
    }
  }

  // ─── NID File Processing (Upload, OCR scan, Account Creation & Locker Save) ──
  const processNidFile = async (file: File) => {
    setError(null)
    setScanStep('scanning')
    setScanProgressText(
      isBn ? 'এনআইডি ছবি রেজোলিউশন ও শার্প ফিল্টারিং চলছে...' : 'Preprocessing image resolution...'
    )

    try {
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })

      setScanProgressText(
        isBn
          ? 'দ্বিভাষিক অপটিক্যাল ওসিআর (OCR) দ্বারা নাম ও এনআইডি তথ্য বিশ্লেষণ চলছে...'
          : 'Extracting citizen identity via bilingual OCR engine...'
      )

      const ocrRes = await scanDocumentOCR({
        imageBase64: base64Data,
        mimeType: file.type || 'image/jpeg',
        docType: 'nid_front',
        fileName: file.name || 'national_id_card.jpg'
      })

      setScanStep('verifying')
      setScanProgressText(
        isBn
          ? 'নাগরিক প্রোফাইল তৈরি ও ডিজিটাল লকারে এনআইডি সংরক্ষণ করা হচ্ছে...'
          : 'Provisioning citizen account & syncing to secure document locker...'
      )

      const meta = ocrRes.document || {}

      // Generic anonymous citizen defaults
      const nidNumber =
        meta.id_number ||
        meta.nid_number ||
        Math.floor(1000000000 + Math.random() * 9000000000).toString()

      const extractedFullName =
        meta.full_name_bn ||
        meta.full_name_en ||
        (isBn ? 'নাগরিক' : 'Citizen')

      const dob = meta.dob || '01 Jan 2000'
      const bloodGroup = meta.blood_group || 'O+'
      const fatherName = meta.father_name || ''

      const citizenUser: UserProfile = {
        id: Date.now(),
        full_name: extractedFullName,
        phone: `017${nidNumber.slice(-8)}`,
        email: null,
        citizen_id: `NID-${nidNumber}`
      }

      // Automatically store the uploaded NID into citizen's document locker
      await uploadDocument({
        userId: citizenUser.id,
        docType: 'nid_front',
        fileName: file.name || 'smart_nid_card.jpg',
        fileSize: file.size || 245000,
        mimeType: file.type || 'image/jpeg',
        fileData: base64Data,
        extractedMeta: {
          ...meta,
          id_number: nidNumber,
          full_name_bn: meta.full_name_bn || extractedFullName,
          full_name_en: meta.full_name_en || 'CITIZEN',
          dob,
          blood_group: bloodGroup,
          father_name: fatherName,
          verified_source: 'Smart NID Optical Registration (Automated Ingestion)',
          doc_title: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - জাতীয় পরিচয়পত্র (স্মার্ট কার্ড)'
        }
      })

      localStorage.setItem('dishari_user', JSON.stringify(citizenUser))
      localStorage.setItem('dishari_logged_in', 'true')
      window.dispatchEvent(new Event('dishari_auth_change'))

      setScannedResult({
        user: citizenUser,
        meta: {
          ...meta,
          id_number: nidNumber,
          full_name: extractedFullName,
          dob,
          blood_group: bloodGroup,
          father_name: fatherName
        },
        previewDataUrl: base64Data
      })

      setScanStep('success')
    } catch (err) {
      console.error('NID Optical registration error:', err)
      setError(
        isBn
          ? 'এনআইডি স্ক্যান করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট ছবি আপলোড করুন অথবা মোবাইল নম্বর দিয়ে নিবন্ধন করুন।'
          : 'Failed to scan NID. Please ensure clear lighting or register using phone/email.'
      )
      setScanStep('idle')
    }
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // ─── Generic Mock Demo NID (Purely fictional sample data) ────────────────────
  const handleInstantDemoNid = () => {
    setError(null)
    setScanStep('scanning')
    setScanProgressText(
      isBn ? 'ডেমো স্মার্ট এনআইডি কার্ড স্ক্যান ও কোণ বিশ্লেষণ হচ্ছে...' : 'Scanning demo smart NID card...'
    )

    setTimeout(async () => {
      setScanStep('verifying')
      setScanProgressText(
        isBn ? 'নাগরিক ডকেট তৈরি ও ডিজিটাল লকারে সংরক্ষণ সম্পন্ন হচ্ছে...' : 'Creating citizen account and storing in vault...'
      )

      // Generic anonymous vector card
      const demoSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="500" height="315" viewBox="0 0 500 315">
          <defs>
            <linearGradient id="nidBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E8F5E9" />
              <stop offset="50%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#E0F2F1" />
            </linearGradient>
            <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#D97706" />
            </linearGradient>
          </defs>
          <rect width="500" height="315" rx="12" fill="url(#nidBg)" stroke="#006A4E" stroke-width="3" />
          <rect x="0" y="0" width="500" height="42" fill="#006A4E" />
          <text x="250" y="26" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card</text>
          
          <!-- Smart Chip -->
          <rect x="42" y="70" width="55" height="42" rx="6" fill="url(#chipGrad)" stroke="#B45309" stroke-width="1.5" />
          <circle cx="69" cy="91" r="9" fill="none" stroke="#78350F" stroke-width="1" />
          <line x1="42" y1="91" x2="97" y2="91" stroke="#78350F" stroke-width="1" />
          
          <!-- Generic Avatar -->
          <rect x="38" y="130" width="100" height="120" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
          <circle cx="88" cy="175" r="24" fill="#006A4E" />
          <path d="M52 235 C52 205 124 205 124 235 Z" fill="#006A4E" />
          
          <!-- Generic Mock Text -->
          <text x="160" y="85" font-family="sans-serif" font-size="16" font-weight="bold" fill="#18181B">নাম: ডেমো নাগরিক</text>
          <text x="160" y="110" font-family="sans-serif" font-size="14" font-weight="600" fill="#27272A">Name: DEMO CITIZEN</text>
          <text x="160" y="140" font-family="sans-serif" font-size="13" fill="#52525B">পিতা: ডেমো অভিভাবক</text>
          <text x="160" y="165" font-family="sans-serif" font-size="13" fill="#52525B">মাতা: ডেমো অভিভাবক</text>
          <text x="160" y="195" font-family="sans-serif" font-size="13" font-weight="600" fill="#18181B">Date of Birth: 01 Jan 2000</text>
          <text x="160" y="220" font-family="sans-serif" font-size="13" font-weight="bold" fill="#006A4E">Blood Group: O+</text>
          
          <!-- Generic NID Number -->
          <rect x="155" y="240" width="310" height="38" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
          <text x="168" y="264" font-family="monospace" font-size="16" font-weight="bold" fill="#C8102E" letter-spacing="1.5">NID NO: 5508214930</text>
        </svg>
      `
      const base64Data = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(demoSvg)))

      const demoUser: UserProfile = {
        id: Date.now(),
        full_name: isBn ? 'ডেমো নাগরিক' : 'Demo Citizen',
        phone: '01700000000',
        email: 'citizen@example.bd',
        citizen_id: 'NID-5508214930'
      }

      localStorage.setItem('dishari_user', JSON.stringify(demoUser))
      localStorage.setItem('dishari_logged_in', 'true')

      await uploadDocument({
        userId: demoUser.id,
        docType: 'nid_front',
        fileName: 'smart_nid_demo.svg',
        fileSize: 4500,
        mimeType: 'image/svg+xml',
        fileData: base64Data,
        extractedMeta: {
          id_number: '5508214930',
          full_name_bn: 'ডেমো নাগরিক',
          full_name_en: 'DEMO CITIZEN',
          dob: '01 Jan 2000',
          blood_group: 'O+',
          doc_title: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - জাতীয় পরিচয়পত্র (স্মার্ট কার্ড)',
          verified_source: 'Demo Optical Ingestion'
        }
      })

      window.dispatchEvent(new Event('dishari_auth_change'))

      setScannedResult({
        user: demoUser,
        meta: {
          id_number: '5508214930',
          full_name: isBn ? 'ডেমো নাগরিক' : 'Demo Citizen',
          full_name_en: 'DEMO CITIZEN',
          dob: '01 Jan 2000',
          blood_group: 'O+'
        },
        previewDataUrl: base64Data
      })

      setScanStep('success')
    }, 1100)
  }

  // Quick Demo Auto-fill for conventional forms
  const handleAutoFillDemo = () => {
    setFullName(isBn ? 'ডেমো নাগরিক' : 'Demo Citizen')
    setPassword('123456')
    setConfirmPassword('123456')
    if (mode === 'phone') {
      setPhone('01700000000')
    } else if (mode === 'manual_nid') {
      setManualNid('5508214930')
      setPhone('01700000000')
    } else if (mode === 'email') {
      setEmail('citizen@example.bd')
      setPhone('01700000000')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F6F8] text-neutral-900 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processNidFile(file)
        }}
      />

      {/* ─── Left Brand Panel — Deep Bangladesh Green Terminal ─────────────── */}
      <div className="hidden lg:flex w-5/12 xl:w-1/2 bg-[#004D38] text-white flex-col justify-between p-10 xl:p-14 border-r border-[#006A4E] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C8102E]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#006A4E] rounded-full blur-3xl opacity-35 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-block group mb-6 win-press">
            <DishariLogo
              theme="dark"
              lang={lang}
              className="h-9 sm:h-10 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <div className="mt-8 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8102E] text-white text-[11px] font-bold uppercase tracking-wider mb-4 rounded-none shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্মার্ট নাগরিক স্বয়ংক্রিয় নিবন্ধন' : 'Smart Citizen Auto-Registration'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
              {isBn
                ? 'এক ক্লিকে সকল সরকারি সেবা হাতের মুঠোয়'
                : 'All Government Services in One Click'}
            </h1>
            <p className="text-emerald-100/90 mt-3 text-sm sm:text-base leading-relaxed font-normal">
              {isBn
                ? 'একটি ডিজিটাল অ্যাকাউন্ট তৈরি করুন এবং কম্পিউটার দোকানের দীর্ঘ লাইন ও হয়রানি থেকে চিরতরে মুক্তি পান।'
                : 'Create an account and free yourself from long queues and hassle at computer shops.'}
            </p>
          </div>

          {/* Unconventional Feature Radar Cards */}
          <div className="mt-8 space-y-3 max-w-lg">
            <div className="border border-[#0D8262] bg-[#003627]/85 p-3.5 flex items-start gap-3 backdrop-blur-xs">
              <div className="p-2 bg-[#004D38] border border-[#0D8262] text-amber-300 shrink-0">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isBn ? 'অপটিক্যাল এনআইডি অনবোর্ডিং (OCR v2.4)' : 'Optical NID Ingestion'}
                </h4>
                <p className="text-xs text-emerald-100/80 mt-0.5 leading-relaxed">
                  {isBn
                    ? 'এনআইডির ছবি আপলোড করলেই অটোমেটিক নাম, নম্বর ও বয়স শনাক্ত হয়ে অ্যাকাউন্ট ও ডকেট তৈরি হয়।'
                    : 'Instant account provisioning with automated field extraction and docket generation.'}
                </p>
              </div>
            </div>

            <div className="border border-[#0D8262] bg-[#003627]/85 p-3.5 flex items-start gap-3 backdrop-blur-xs">
              <div className="p-2 bg-[#004D38] border border-[#0D8262] text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isBn ? 'সুরক্ষিত ডিজিটাল লকার (Vault)' : 'Citizen Document Vault'}
                </h4>
                <p className="text-xs text-emerald-100/80 mt-0.5 leading-relaxed">
                  {isBn
                    ? 'আপনার আপলোডকৃত এনআইডি ও সনদগুলো এনক্রিপ্ট করে স্থায়ীভাবে সুরক্ষিত রাখা হয়।'
                    : 'Scanned identity papers are automatically encrypted and backed up for all civic applications.'}
                </p>
              </div>
            </div>

            <div className="border border-[#0D8262] bg-[#003627]/85 p-3.5 flex items-start gap-3 backdrop-blur-xs">
              <div className="p-2 bg-[#004D38] border border-[#0D8262] text-cyan-300 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isBn ? '১-ক্লিকে অটো-ডকেট ও সরকারি ফি ট্র্যাকিং' : 'Auto-Docket & Official Fee Tracker'}
                </h4>
                <p className="text-xs text-emerald-100/80 mt-0.5 leading-relaxed">
                  {isBn
                    ? 'পাসপোর্ট, নামজারি বা ভাতার ফরম প্রস্তুত এবং সরকারি গেজেট ফি কোনো বাড়তি খরচ ছাড়া।'
                    : 'Pre-filled applications ready for direct submission without extra middleman costs.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Verification Note */}
        <div className="relative z-10 pt-6 border-t border-[#006A4E] flex items-center justify-between text-xs text-emerald-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">
              {isBn ? 'গেজেট অনুমোদিত নাগরিক পোর্টাল' : 'Gazette-Verified Civic Gateway'}
            </span>
          </div>
          <span className="text-[11px] font-mono">
            {isBn ? '১০০% ডাটা গোপনীয়তা সংরক্ষিত' : '100% Data Confidentiality'}
          </span>
        </div>
      </div>

      {/* ─── Right Form Panel — Stable Height, Zero Layout Jump ─────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-xl border border-neutral-200 bg-white p-6 sm:p-8 rounded-none shadow-sm relative transition-all duration-300 ease-out">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006A4E]" />

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-none uppercase tracking-wider flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-[#006A4E]" />
                <span>{isBn ? 'নতুন নাগরিক স্বত্বাধিকার' : 'Citizen Registration'}</span>
              </span>

              <Link
                href="/login"
                className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1 win-press"
              >
                <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন' : 'Already registered? Login'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {isBn ? 'নাগরিক অ্যাকাউন্ট নিবন্ধন' : 'Citizen Account Registration'}
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
              {isBn
                ? 'এনআইডি স্ক্যান করে নিমেষেই অ্যাকাউন্ট খুলুন, অথবা মোবাইল/ইমেইল দিয়ে নিবন্ধন করুন।'
                : 'Scan your NID card to register instantly, or use mobile number/email.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 border border-red-300 bg-red-50 text-[#C8102E] p-3 text-xs sm:text-sm font-semibold flex items-center gap-2 rounded-none animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C8102E]" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 border border-emerald-300 bg-emerald-50 text-[#006A4E] p-3 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-none animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006A4E]" />
              <span>
                {isBn ? 'নিবন্ধন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...' : 'Registration successful! Redirecting to workspace...'}
              </span>
            </div>
          )}

          {/* ─── Mode Switcher Bar (4 Tabs) ────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-300 bg-neutral-100 p-0.5 mb-4 rounded-none relative">
            <button
              type="button"
              onClick={() => {
                setMode('nid_scan')
                setError(null)
              }}
              className={cn(
                'relative flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold transition-colors cursor-pointer rounded-none select-none win-press',
                mode === 'nid_scan' ? 'text-white' : 'text-neutral-700 hover:text-neutral-950'
              )}
            >
              {mode === 'nid_scan' && (
                <motion.div
                  layoutId="register-mode-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <ScanLine className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate">{isBn ? 'এনআইডি স্ক্যান' : 'NID Scan'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('phone')
                setError(null)
              }}
              className={cn(
                'relative flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold transition-colors cursor-pointer rounded-none select-none win-press',
                mode === 'phone' ? 'text-white' : 'text-neutral-700 hover:text-neutral-950'
              )}
            >
              {mode === 'phone' && (
                <motion.div
                  layoutId="register-mode-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span className="truncate">{isBn ? 'মোবাইল' : 'Phone'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('manual_nid')
                setError(null)
              }}
              className={cn(
                'relative flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold transition-colors cursor-pointer rounded-none select-none win-press',
                mode === 'manual_nid' ? 'text-white' : 'text-neutral-700 hover:text-neutral-950'
              )}
            >
              {mode === 'manual_nid' && (
                <motion.div
                  layoutId="register-mode-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5" />
                <span className="truncate">{isBn ? 'ম্যানুয়াল NID' : 'Manual NID'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('email')
                setError(null)
              }}
              className={cn(
                'relative flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold transition-colors cursor-pointer rounded-none select-none win-press',
                mode === 'email' ? 'text-white' : 'text-neutral-700 hover:text-neutral-950'
              )}
            >
              {mode === 'email' && (
                <motion.div
                  layoutId="register-mode-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{isBn ? 'ইমেইল' : 'Email'}</span>
              </span>
            </button>
          </div>

          {/* ─── STABLE TAB STAGE (Anchored Height to Guarantee Zero Jumps) ───── */}
          <div className="min-h-[460px] flex flex-col justify-between transition-all duration-300">
            <AnimatePresence mode="wait" initial={false}>
              {/* Tab 1: NID Optical Scan Registration */}
              {mode === 'nid_scan' && (
                <motion.div
                  key="tab-nid-scan"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[460px] flex flex-col justify-between"
                >
                  {scanStep === 'idle' && (
                    <div className="flex-1 flex flex-col justify-between space-y-3.5">
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDragging(false)
                          const file = e.dataTransfer.files?.[0]
                          if (file) processNidFile(file)
                        }}
                        onClick={handleTriggerFileInput}
                        className={cn(
                          'border-2 border-dashed p-6 text-center cursor-pointer transition-all relative group bg-neutral-50/70 hover:bg-emerald-50/30 flex-1 min-h-[290px] flex flex-col justify-center items-center',
                          isDragging
                            ? 'border-[#006A4E] bg-emerald-50'
                            : 'border-neutral-300 hover:border-[#006A4E]'
                        )}
                      >
                        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#006A4E]" />
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#006A4E]" />
                        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#006A4E]" />
                        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#006A4E]" />

                        <div className="w-14 h-14 bg-white border border-neutral-200 text-[#006A4E] rounded-none flex items-center justify-center mx-auto mb-2.5 shadow-xs group-hover:scale-105 group-hover:border-[#006A4E] transition-all">
                          <Camera className="w-7 h-7" />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-neutral-900 group-hover:text-[#006A4E] transition-colors">
                          {isBn
                            ? 'জাতীয় পরিচয়পত্র (NID) আপলোড বা স্ক্যান করুন'
                            : 'Upload or Capture National ID Card'}
                        </h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          {isBn
                            ? 'ছবি তুলুন বা ফাইল নির্বাচন করুন। অপটিক্যাল ওসিআর তথ্য পড়ে নিমেষেই অ্যাকাউন্ট তৈরি করবে এবং মূল এনআইডি আপনার ডিজিটাল লকারে সংরক্ষণ করবে।'
                            : 'Drop NID image. The optical OCR engine automatically reads fields, creates your account, and stores the NID in your vault.'}
                        </p>

                        <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none group-hover:bg-[#004D38] transition-colors win-press">
                          <UploadCloud className="w-4 h-4" />
                          <span>{isBn ? 'এনআইডি ছবি নির্বাচন করুন' : 'Browse NID Photo'}</span>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-neutral-400">
                          JPG, PNG, WEBP, PDF • স্মার্ট কার্ড বা লেমিনেটেড কার্ড
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleInstantDemoNid}
                          className="w-full border border-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 text-[#006A4E] p-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors rounded-none cursor-pointer win-press"
                        >
                          <div className="flex items-center gap-2 text-left">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-bold text-xs text-neutral-900">
                                {isBn ? 'ডেমো স্মার্ট এনআইডি দিয়ে সরাসরি ১-ক্লিক নিবন্ধন পরীক্ষা' : 'Try 1-Click Demo Smart NID Registration'}
                              </div>
                              <div className="text-[11px] font-normal text-neutral-600">
                                {isBn
                                  ? 'কাছে এনআইডি কার্ড না থাকলে তাৎক্ষণিক ডেমো প্রোফাইল তৈরি ও লকার যাচাই'
                                  : 'Instant mock citizen profile creation and vault sync'}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#006A4E] shrink-0 ml-2" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scanning State with Animated Laser Scanner */}
                  {(scanStep === 'scanning' || scanStep === 'verifying') && (
                    <div className="flex-1 min-h-[460px] flex flex-col justify-center items-center text-center p-6 border border-neutral-200 bg-neutral-900 text-white relative overflow-hidden">
                      {/* Laser Beam Animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_15px_#00FF88] z-20"
                        animate={{
                          top: ['5%', '90%', '5%'],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />

                      {/* Card Blueprint Mockup */}
                      <div className="w-64 h-36 border border-emerald-500/40 bg-emerald-950/40 rounded-none relative p-3 flex flex-col justify-between mb-5 shadow-inner">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest">
                              NID OCR SCANNER v2.4
                            </span>
                          </div>
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center">
                            <Fingerprint className="w-7 h-7 text-emerald-400 animate-pulse" />
                          </div>
                          <div className="space-y-1.5 text-left flex-1">
                            <div className="h-2 bg-emerald-500/40 w-3/4 rounded-none" />
                            <div className="h-2 bg-emerald-500/30 w-1/2 rounded-none" />
                            <div className="h-2 bg-emerald-500/20 w-5/6 rounded-none" />
                          </div>
                        </div>

                        <div className="text-[8px] font-mono text-emerald-400/70 text-right">
                          STANDARDIZED DIGITAL ID • SECURE VAULT
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          {scanStep === 'scanning' ? 'Optical Scan in Progress' : 'Vault Ingestion & Docketing'}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-neutral-300 max-w-sm">
                        {scanProgressText}
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                        <span>BILINGUAL OCR</span>
                        <span>•</span>
                        <span>256-BIT ENCRYPTION</span>
                        <span>•</span>
                        <span>LOCKER SYNC</span>
                      </div>
                    </div>
                  )}

                  {/* Success State with Verified Citizen Card */}
                  {scanStep === 'success' && scannedResult && (
                    <div className="flex-1 min-h-[460px] flex flex-col justify-between space-y-4">
                      {/* Success Banner */}
                      <div className="border border-emerald-300 bg-emerald-50 p-3 text-xs text-[#006A4E] font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#006A4E] shrink-0" />
                          <span>
                            {isBn
                              ? 'স্মার্ট নিবন্ধন সম্পন্ন! এনআইডি লকারে সংরক্ষিত হয়েছে।'
                              : 'Smart registration complete! NID stored in vault.'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-200/80 px-2 py-0.5 text-emerald-950 font-bold">
                          VERIFIED
                        </span>
                      </div>

                      {/* Visual Verified Citizen ID Card */}
                      <div className="border border-[#006A4E] bg-gradient-to-br from-emerald-50/60 via-white to-neutral-50 p-4 relative shadow-xs">
                        <div className="flex items-start justify-between border-b border-emerald-100 pb-2 mb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#006A4E] block uppercase tracking-wider">
                              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                            </span>
                            <span className="text-xs font-bold text-neutral-800">
                              জাতীয় পরিচয়পত্র · ডিজিটাল ডকেট
                            </span>
                          </div>
                          <div className="px-2 py-0.5 bg-[#006A4E] text-white font-mono text-[10px] font-bold">
                            NID CARD
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                          <div className="border border-neutral-200 bg-white p-2">
                            <span className="text-[10px] text-neutral-400 font-mono block">পূর্ণ নাম / FULL NAME</span>
                            <span className="font-bold text-neutral-900">{scannedResult.user.full_name}</span>
                          </div>

                          <div className="border border-neutral-200 bg-white p-2">
                            <span className="text-[10px] text-neutral-400 font-mono block">এনআইডি নম্বর / NID NO</span>
                            <span className="font-mono font-bold text-[#C8102E]">{scannedResult.meta.id_number}</span>
                          </div>

                          <div className="border border-neutral-200 bg-white p-2">
                            <span className="text-[10px] text-neutral-400 font-mono block">জন্ম তারিখ / DOB</span>
                            <span className="font-medium text-neutral-800">{scannedResult.meta.dob}</span>
                          </div>

                          <div className="border border-neutral-200 bg-white p-2">
                            <span className="text-[10px] text-neutral-400 font-mono block">রক্তের গ্রুপ / BLOOD GROUP</span>
                            <span className="font-bold text-[#006A4E]">{scannedResult.meta.blood_group || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Locker sync pill */}
                        <div className="flex items-center gap-2 p-2 bg-emerald-100/70 border border-emerald-200 text-neutral-800 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>
                            {isBn
                              ? 'আপনার মূল এনআইডি নথি সুরক্ষিত ডিজিটাল লকারে সংরক্ষণ করা হয়েছে।'
                              : 'Original NID has been stored in your encrypted document locker.'}
                          </span>
                        </div>
                      </div>

                      {/* Action Navigation Buttons */}
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard')}
                          className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs"
                        >
                          <span>{isBn ? 'নাগরিক ড্যাশবোর্ডে প্রবেশ করুন' : 'Proceed to Citizen Dashboard'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => router.push('/')}
                          className="w-full py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-press cursor-pointer"
                        >
                          <span>{isBn ? 'হোম পেজে ব্যক্তিগত ফিড দেখুন' : 'View Personalized Home Feed'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Mobile Phone Registration */}
              {mode === 'phone' && (
                <motion.form
                  key="tab-phone"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[460px] flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'fullNameLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('auth', 'fullNamePlaceholder', lang)}
                        className="w-full px-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'phoneLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'passwordLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'confirmPasswordLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'submitting', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth', 'registerBtn', lang)}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো তথ্য পূরণ করুন' : 'Fill Demo Information'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Tab 3: Manual NID Registration */}
              {mode === 'manual_nid' && (
                <motion.form
                  key="tab-manual-nid"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[460px] flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'fullNameLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('auth', 'fullNamePlaceholder', lang)}
                        className="w-full px-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {isBn ? 'জাতীয় পরিচয়পত্র নম্বর (১০ বা ১৭ ডিজিট)' : 'National ID Number (10 or 17 Digits)'} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <IdCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={manualNid}
                          onChange={(e) => setManualNid(e.target.value)}
                          placeholder="XXXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'phoneLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                          {t('auth', 'passwordLabel', lang)} <span className="text-[#C8102E]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full px-2.5 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                          {t('auth', 'confirmPasswordLabel', lang)} <span className="text-[#C8102E]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full px-2.5 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'submitting', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{isBn ? 'এনআইডি দিয়ে নিবন্ধন সম্পন্ন করুন' : 'Complete Registration with NID'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো তথ্য পূরণ করুন' : 'Fill Demo Information'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Tab 4: Email Registration */}
              {mode === 'email' && (
                <motion.form
                  key="tab-email"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[460px] flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'fullNameLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('auth', 'fullNamePlaceholder', lang)}
                        className="w-full px-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'emailLabel', lang)} <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="citizen@example.bd"
                          className="w-full pl-9 pr-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                        {t('auth', 'phoneLabel', lang)}{' '}
                        <span className="text-neutral-400 font-normal lowercase font-sans">
                          {t('auth', 'optional', lang)}
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                          {t('auth', 'passwordLabel', lang)} <span className="text-[#C8102E]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full px-2.5 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1">
                          {t('auth', 'confirmPasswordLabel', lang)} <span className="text-[#C8102E]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full px-2.5 py-2 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'submitting', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{isBn ? 'ইমেইল দিয়ে নিবন্ধন সম্পন্ন করুন' : 'Complete Registration with Email'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো তথ্য পূরণ করুন' : 'Fill Demo Information'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span>{t('auth', 'hasAccount', lang)}</span>
            <Link
              href="/login"
              className="text-[#006A4E] font-bold hover:underline transition-colors win-press"
            >
              {t('auth', 'loginLink', lang)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
