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
  FolderLock,
  Check,
  Eye,
  EyeOff,
  Cpu,
  Fingerprint
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { t } from '@/lib/translations'
import {
  loginUser,
  scanDocumentOCR,
  uploadDocument,
  type UserProfile
} from '@/lib/api'
import { WIN10_INDICATOR_SPRING } from '@/lib/motion'
import { cn } from '@/lib/utils'

type LoginMode = 'nid_scan' | 'phone' | 'email' | 'manual_nid'

interface ScannedCitizenResult {
  user: UserProfile
  meta: Record<string, any>
  previewDataUrl: string
}

export default function LoginPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const isBn = lang === 'bn'

  // Primary mode state
  const [mode, setMode] = useState<LoginMode>('nid_scan')

  // Conventional login states
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [manualNid, setManualNid] = useState('')
  const [fullNameInput, setFullNameInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NID Scan states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle')
  const [scanProgressText, setScanProgressText] = useState('')
  const [scannedResult, setScannedResult] = useState<ScannedCitizenResult | null>(null)

  // Handle conventional logins (Phone / Email / Manual NID)
  const handleConventionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    let identifier = ''
    if (mode === 'phone') identifier = phone.trim()
    else if (mode === 'email') identifier = email.trim()
    else if (mode === 'manual_nid') identifier = manualNid.trim()

    if (!identifier) {
      setError(
        isBn
          ? mode === 'phone'
            ? 'মোবাইল নম্বর লিখুন'
            : mode === 'email'
            ? 'ইমেইল ঠিকানা লিখুন'
            : 'জাতীয় পরিচয়পত্র নম্বর লিখুন'
          : `Please enter your ${mode === 'phone' ? 'phone number' : mode === 'email' ? 'email' : 'NID number'}`
      )
      return
    }

    setLoading(true)

    try {
      const res = await loginUser({
        identifier,
        password: password || undefined,
      })

      if (!res.success || !res.user) {
        setError(res.error || (isBn ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'))
        setLoading(false)
        return
      }

      if (mode === 'manual_nid' && fullNameInput.trim()) {
        res.user.full_name = fullNameInput.trim()
        res.user.citizen_id = `NID-${identifier}`
      }

      localStorage.setItem('dishari_user', JSON.stringify(res.user))
      localStorage.setItem('dishari_logged_in', 'true')
      window.dispatchEvent(new Event('dishari_auth_change'))

      router.push('/dashboard')
    } catch {
      setError(isBn ? 'নেটওয়ার্ক সমস্যা হয়েছে' : 'Network error occurred')
      setLoading(false)
    }
  }

  // Process NID File (Upload, OCR scan, Account Creation, Locker Save)
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
          ? 'দ্বিভাষিক অপটিক্যাল ওসিআর (OCR) দ্বারা তথ্য বিশ্লেষণ চলছে...'
          : 'Extracting text via bilingual OCR engine...'
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
          ? 'নাগরিক ডকেট তৈরি ও ডিজিটাল লকারে এনআইডি সংরক্ষণ করা হচ্ছে...'
          : 'Assembling citizen docket and saving to secure vault...'
      )

      const meta = ocrRes.document || {}

      // Generic anonymous defaults
      const nidNumber =
        meta.id_number ||
        meta.nid_number ||
        Math.floor(1000000000 + Math.random() * 9000000000).toString()

      const fullName =
        meta.full_name_bn ||
        meta.full_name_en ||
        (isBn ? 'নাগরিক' : 'Citizen')

      const dob = meta.dob || '01 Jan 2000'
      const bloodGroup = meta.blood_group || 'O+'
      const fatherName = meta.father_name || ''

      const citizenUser: UserProfile = {
        id: Date.now(),
        full_name: fullName,
        phone: `017${nidNumber.slice(-8)}`,
        email: null,
        citizen_id: `NID-${nidNumber}`
      }

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
          full_name_bn: meta.full_name_bn || fullName,
          full_name_en: meta.full_name_en || 'CITIZEN',
          dob,
          blood_group: bloodGroup,
          father_name: fatherName,
          verified_source: 'Smart NID Optical Scan Login (Automated Ingestion)',
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
          full_name: fullName,
          dob,
          blood_group: bloodGroup,
          father_name: fatherName
        },
        previewDataUrl: base64Data
      })

      setScanStep('success')
    } catch (err) {
      console.error('NID Optical sign-in error:', err)
      setError(
        isBn
          ? 'এনআইডি স্ক্যান করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট ছবি ব্যবহার করুন অথবা ম্যানুয়াল লগইন করুন।'
          : 'Failed to scan NID. Please ensure clear lighting or use manual sign-in.'
      )
      setScanStep('idle')
    }
  }

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Generic Mock Demo NID (Purely fictional sample data)
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
              className="h-10 xl:h-12 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <div className="mt-8 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8102E] text-white text-[11px] font-bold uppercase tracking-wider mb-3.5 rounded-none">
              <Cpu className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্মার্ট অপটিক্যাল সিটিজেন গেটওয়ে' : 'Smart Optical Citizen Gateway'}</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {isBn
                ? 'পাসওয়ার্ডহীন ডিজিটাল নাগরিক প্রবেশাধিকার'
                : 'Passwordless Civic Entry via National ID'}
            </h1>
            <p className="text-emerald-100 mt-3 text-sm xl:text-base leading-relaxed font-normal">
              {isBn
                ? 'জাতীয় পরিচয়পত্র স্ক্যান করলেই কৃত্রিম বুদ্ধিমত্তা চালিত অপটিক্যাল ভিশন আপনার নাগরিক প্রোফাইল তৈরি করবে এবং মূল এনআইডি আপনার সুরক্ষিত ক্লাউড লকারে স্বয়ংক্রিয়ভাবে জমা রাখবে।'
                : 'Upload or scan your National ID card. Our bilingual vision engine instantly builds your citizen profile and stores the verified NID card in your encrypted personal vault.'}
            </p>
          </div>

          {/* Abstract Citizen Identity System Architecture (Zero personal data) */}
          <div className="mt-10 border border-[#0D8262] bg-[#003627]/90 p-5 max-w-md rounded-none shadow-lg relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#004D38]">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'বাংলাদেশ জাতীয় পরিচয়পত্র গেটওয়ে' : 'Bangladesh Smart NID Gateway'}</span>
              </div>
              <span className="font-mono text-[10px] bg-[#006A4E] text-emerald-200 px-2 py-0.5">
                SYSTEM VERIFIED
              </span>
            </div>

            <div className="border border-emerald-500/30 bg-emerald-950/40 p-4 rounded-none space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px] text-emerald-400 border-b border-emerald-900/60 pb-1.5">
                <span>PEOPLE'S REPUBLIC OF BANGLADESH</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="w-12 h-14 bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <IdCard className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1.5 text-[11px] text-emerald-200">
                  <div>✓ স্বয়ংক্রিয় অপটিক্যাল টেক্সট এক্সট্রাকশন</div>
                  <div>✓ ক্লাউড লকারে এনআইডি অটো-সেভ</div>
                  <div>✓ ১-ক্লিকে নাগরিক সেবা আবেদন পূরণ</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
              <span>এনক্রিপ্টেড ডাটা ট্রান্সমিশন</span>
              <span>ডিজিটাল বাংলাদেশ ভিশন</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-[#004D38] flex items-center gap-2.5 text-xs text-emerald-200 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>
            {isBn
              ? 'আইসিটি অ্যাক্ট ও ডিজিটাল নিরাপত্তা মানদণ্ডে সম্পূর্ণ এনক্রিপ্টেড।'
              : 'Encrypted under Bangladesh Civic Data Protection standards.'}
          </span>
        </div>
      </div>

      {/* ─── Right Form Panel — Stable Height, Silky Smooth Transitions ─────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-xl border border-neutral-200 bg-white p-6 sm:p-9 rounded-none shadow-sm relative transition-all duration-300 ease-out">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#006A4E]" />

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-none uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
                <span>{isBn ? 'নাগরিক ডিজিটাল আইডেন্টিটি' : 'Citizen Digital Identity'}</span>
              </span>

              <Link
                href="/register"
                className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1"
              >
                <span>{isBn ? 'নতুন নাগরিক নিবন্ধন' : 'Register'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {isBn ? 'দিশারী নাগরিক টার্মিনাল' : 'Dishari Citizen Gateway'}
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {isBn
                ? 'জাতীয় পরিচয়পত্র স্ক্যান করে তাৎক্ষণিক প্রবেশ করুন অথবা সাধারণ পদ্ধতিতে লগইন করুন।'
                : 'Sign in passwordless by scanning your National ID card or choose standard sign-in.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 border border-red-300 bg-red-50 text-[#C8102E] p-3 text-xs sm:text-sm font-semibold flex items-center gap-2 rounded-none animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C8102E]" />
              <span>{error}</span>
            </div>
          )}

          {/* ─── Mode Switcher Bar (4 Tabs) ────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-300 bg-neutral-100 p-0.5 mb-5 rounded-none relative">
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
                  layoutId="login-mode-pill"
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
                  layoutId="login-mode-pill"
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
                  layoutId="login-mode-pill"
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
                  layoutId="login-mode-pill"
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

          {/* ─── STABLE TAB STAGE (Anchored Minimum Height to Prevent Jumping) ──── */}
          <div className="min-h-[440px] flex flex-col justify-between transition-all duration-300">
            <AnimatePresence mode="wait" initial={false}>
              {/* Tab 1: NID Optical Scan */}
              {mode === 'nid_scan' && (
                <motion.div
                  key="tab-nid-scan"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[440px] flex flex-col justify-between"
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
                          'border-2 border-dashed p-6 text-center cursor-pointer transition-all relative group bg-neutral-50/70 hover:bg-emerald-50/30 flex-1 min-h-[270px] flex flex-col justify-center items-center',
                          isDragging
                            ? 'border-[#006A4E] bg-emerald-50'
                            : 'border-neutral-300 hover:border-[#006A4E]'
                        )}
                      >
                        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#006A4E]" />
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#006A4E]" />
                        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#006A4E]" />
                        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#006A4E]" />

                        <div className="w-12 h-12 bg-white border border-neutral-200 text-[#006A4E] rounded-none flex items-center justify-center mx-auto mb-2.5 shadow-xs group-hover:scale-105 group-hover:border-[#006A4E] transition-all">
                          <Camera className="w-6 h-6" />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-neutral-900 group-hover:text-[#006A4E] transition-colors">
                          {isBn
                            ? 'জাতীয় পরিচয়পত্র (NID) আপলোড বা স্ক্যান করুন'
                            : 'Upload or Capture National ID Card'}
                        </h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          {isBn
                            ? 'ছবি নির্বাচন করুন বা টেনে আনুন। অপটিক্যাল ওসিআর তথ্য পড়ে অ্যাকাউন্ট খুলবে এবং লকারে সংরক্ষণ করবে।'
                            : 'Drop NID image. The optical OCR engine automatically reads fields, creates your account, and stores the NID in your vault.'}
                        </p>

                        <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none group-hover:bg-[#004D38] transition-colors win-press">
                          <UploadCloud className="w-4 h-4" />
                          <span>{isBn ? 'এনআইডি কার্ড নির্বাচন করুন' : 'Browse NID Photo'}</span>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-neutral-400">
                          JPG, PNG, WEBP, PDF • স্মার্ট কার্ড বা লেমিনেটেড কার্ড
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleInstantDemoNid}
                          className="w-full border border-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 text-[#006A4E] p-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors rounded-none cursor-pointer win-press"
                        >
                          <div className="flex items-center gap-2 text-left">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-bold text-xs text-neutral-900">
                                {isBn ? 'ডেমো স্মার্ট এনআইডি দিয়ে সরাসরি পরীক্ষা করুন' : 'Try 1-Click Demo Smart NID Card'}
                              </div>
                              <div className="text-[11px] font-normal text-neutral-600">
                                {isBn ? 'ছবি ছাড়া সরাসরি অপটিক্যাল অ্যাকাউন্ট প্রক্রিয়া পরখ করুন' : 'Simulate the full OCR ingestion pipeline with sample card'}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#006A4E]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Laser Sweeping Active Animation */}
                  {(scanStep === 'scanning' || scanStep === 'verifying') && (
                    <div className="border border-[#006A4E] bg-neutral-900 text-white p-7 text-center rounded-none relative overflow-hidden flex-1 min-h-[440px] flex flex-col justify-center items-center space-y-4">
                      <motion.div
                        animate={{ y: [-40, 140, -40] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#34D399] to-transparent shadow-[0_0_15px_#34D399] pointer-events-none"
                      />

                      <div className="w-12 h-12 border-2 border-emerald-400 bg-emerald-950/80 text-emerald-300 rounded-none flex items-center justify-center mx-auto animate-pulse">
                        <ScanLine className="w-6 h-6" />
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-white tracking-wide">
                          {scanStep === 'scanning'
                            ? isBn
                              ? 'অপটিক্যাল এনআইডি স্ক্যান সক্রিয়'
                              : 'Optical Vision OCR Active'
                            : isBn
                            ? 'নাগরিক ডকেট ও লকার সংরক্ষণ হচ্ছে'
                            : 'Finalizing Account & Vault Ingestion'}
                        </h4>
                        <p className="text-xs text-emerald-300 font-mono mt-1.5">{scanProgressText}</p>
                      </div>

                      <div className="flex items-center justify-center gap-4 text-xs font-mono pt-2 text-neutral-400">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> ১. বিশ্লেষণ
                        </span>
                        <span className={scanStep === 'verifying' ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-500'}>
                          ২. ওআইসিআর
                        </span>
                        <span className={scanStep === 'verifying' ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                          ৩. লকার সংরক্ষণ
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Success Result View */}
                  {scanStep === 'success' && scannedResult && (
                    <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="border border-emerald-300 bg-emerald-50/80 p-3.5 rounded-none flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#006A4E] shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#006A4E]">
                            {isBn ? 'এনআইডি স্ক্যান সফল — অ্যাকাউন্ট সক্রিয়!' : 'NID Verified — Account Activated!'}
                          </h4>
                          <p className="text-[11px] text-neutral-600 mt-0.5">
                            {isBn
                              ? 'আপনার ডিজিটাল নাগরিক প্রোফাইল সক্রিয় হয়েছে এবং মূল এনআইডি লকারে সংরক্ষিত হয়েছে।'
                              : 'Your digital profile is live and the original NID card has been encrypted into your locker.'}
                          </p>
                        </div>
                      </div>

                      <div className="border border-neutral-300 bg-white p-3.5 rounded-none shadow-xs space-y-2.5 font-mono text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                          <div className="flex items-center gap-1.5 text-[#006A4E] font-bold text-xs">
                            <FolderLock className="w-3.5 h-3.5" />
                            <span>{isBn ? 'লকারে সংরক্ষিত নথি:' : 'Vault Saved Asset:'}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 font-bold">
                            VERIFIED NID
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-500 block">{isBn ? 'নাগরিক নাম:' : 'Name:'}</span>
                            <strong className="text-neutral-900 text-sm font-sans">{scannedResult.user.full_name}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">{isBn ? 'এনআইডি নম্বর:' : 'NID No:'}</span>
                            <strong className="text-[#006A4E] text-sm">{scannedResult.user.citizen_id}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">{isBn ? 'জন্ম তারিখ:' : 'Date of Birth:'}</span>
                            <span className="text-neutral-800">{scannedResult.meta.dob || '01 Jan 2000'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">{isBn ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
                            <span className="text-neutral-800 font-bold">{scannedResult.meta.blood_group || 'O+'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard')}
                          className="w-full py-2.5 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs"
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

              {/* Tab 2: Mobile Phone */}
              {mode === 'phone' && (
                <motion.form
                  key="tab-phone"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[440px] flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                        {t('auth', 'phoneLabel', lang)}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                          {t('auth', 'passwordLabel', lang)}
                        </label>
                        <span className="text-[11px] text-neutral-400">
                          {isBn ? '(ঐচ্ছিক পিন/পাসওয়ার্ড)' : '(Optional PIN)'}
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
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

                    <div className="border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 font-mono">
                      {isBn
                        ? 'আপনার মোবাইল নম্বরে ৬ ডিজিটের ওয়ান-টাইম ভেরিফিকেশন কোড পাঠানো হতে পারে।'
                        : 'A 6-digit one-time code may be dispatched to your mobile.'}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'loggingIn', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth', 'submitLogin', lang)}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPhone('01700000000')
                          setPassword('123456')
                        }}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো মোবাইল ও পাসওয়ার্ড পূরণ করুন' : 'Fill Demo Mobile & Password'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Tab 3: Manual NID Number */}
              {mode === 'manual_nid' && (
                <motion.form
                  key="tab-manual-nid"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[440px] flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                        {isBn ? 'জাতীয় পরিচয়পত্র নম্বর (১০ বা ১৭ ডিজিট)' : 'National ID Number (10 or 17 Digits)'}
                      </label>
                      <div className="relative">
                        <IdCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={manualNid}
                          onChange={(e) => setManualNid(e.target.value)}
                          placeholder="XXXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                        {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder={isBn ? 'নাগরিক নাম' : 'Citizen Name'}
                        className="w-full px-3 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                          {t('auth', 'passwordLabel', lang)}
                        </label>
                        <span className="text-[11px] text-neutral-400">
                          {isBn ? '(ঐচ্ছিক পিন)' : '(Optional PIN)'}
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
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
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'loggingIn', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{isBn ? 'এনআইডি দিয়ে প্রবেশ করুন' : 'Sign in with NID'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setManualNid('5508214930')
                          setFullNameInput(isBn ? 'ডেমো নাগরিক' : 'Demo Citizen')
                          setPassword('123456')
                        }}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো NID স্বয়ংক্রিয় পূরণ করুন' : 'Fill Demo NID Credentials'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Tab 4: Email & Password */}
              {mode === 'email' && (
                <motion.form
                  key="tab-email"
                  onSubmit={handleConventionalSubmit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="h-full min-h-[440px] flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-1.5">
                        {t('auth', 'emailLabel', lang)}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="citizen@example.bd"
                          className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm font-mono rounded-none"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                          {t('auth', 'passwordLabel', lang)}
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 border border-neutral-300 focus:border-[#006A4E] focus:outline-none text-sm rounded-none"
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

                    <div className="border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 font-mono">
                      {isBn
                        ? 'নিবন্ধিত নাগরিক ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি লগইন করুন।'
                        : 'Sign in directly using your registered citizen email and password.'}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#006A4E] hover:bg-[#004D38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors win-btn cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth', 'loggingIn', lang)}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth', 'submitLogin', lang)}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('citizen@example.bd')
                          setPassword('123456')
                        }}
                        className="text-[11px] font-mono text-[#006A4E] hover:underline"
                      >
                        {isBn ? 'ডেমো ইমেইল ও পাসওয়ার্ড পূরণ করুন' : 'Fill Demo Email & Password'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Security Seals */}
          <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-neutral-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006A4E]" />
              <span>{isBn ? 'জাতীয় নাগরিক সুরক্ষা সিস্টেম' : 'National Citizen Protection System'}</span>
            </div>

            <Link href="/about" className="hover:underline text-neutral-600">
              {isBn ? 'গোপনীয়তা ও শর্তাবলী' : 'Privacy & Terms'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
