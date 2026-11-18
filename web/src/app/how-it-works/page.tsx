'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import {
  Scan,
  ShieldCheck,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Zap,
  Eye,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Fingerprint,
  FileText,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react'

// ─── MOTION PRESETS ─────────────────────────────────────────────────────────
const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
}

const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

export default function HowItWorksPage() {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'

  // Interactive Stage Tabs (0: Vision, 1: Gov Bridge, 2: Neural Agent, 3: Citizen Locker)
  const [activeStage, setActiveStage] = useState<number>(0)

  // Stage 1 Vision Layer Simulator (0: Raw, 1: Green Channel, 2: ROI Crop, 3: Extracted JSON)
  const [visionMode, setVisionMode] = useState<'raw' | 'green' | 'crop' | 'json'>('green')

  // Stage 2 Telemetry Playback
  const [isRelaying, setIsRelaying] = useState(false)
  const [telemetryStep, setTelemetryStep] = useState(3)

  // Stage 3 Query Simulator
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0)

  // Automated Pipeline Demo
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  // Demo auto-advance
  useEffect(() => {
    if (!demoRunning) return
    const timer = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= 3) {
          setDemoRunning(false)
          return 0
        }
        return prev + 1
      })
    }, 2800)
    return () => clearInterval(timer)
  }, [demoRunning])

  const queries = [
    {
      textBn: 'বাবার মৃত্যুর পর জমির নামজারি কীভাবে করব?',
      textEn: 'How to apply for land mutation after father’s death?',
      intent: 'LAND_MUTATION_INHERITANCE',
      deptBn: 'ভূমি মন্ত্রণালয় ও উপজেলা ভূমি অফিস',
      deptEn: 'Ministry of Land & Upazila Land Office',
      fee: '৳ ১,১৭০',
      feeEn: 'BDT 1,170',
      docsBn: ['ওয়ারিশান সনদপত্র', 'মৃত্যু সনদ', 'খতিয়ান ও পর্চা', 'স্মার্ট এনআইডি'],
      docsEn: ['Succession Certificate', 'Death Certificate', 'Khatian / Porcha', 'Smart NID'],
      route: '/services/land-mutation',
    },
    {
      textBn: 'এইচএসসি ও এসএসসি পরীক্ষার রেজাল্ট মার্কশিট সহ কীভাবে দেখব?',
      textEn: 'How to check official SSC/HSC results with marksheet?',
      intent: 'EDUCATION_BOARD_EXAM_RESULTS',
      deptBn: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
      deptEn: 'Board of Intermediate & Secondary Education',
      fee: '৳ ০ (সম্পূর্ণ বিনামূল্যে)',
      feeEn: 'Free (BDT 0)',
      docsBn: ['এডমিট কার্ডের রোল নম্বর', 'রেজিস্ট্রেশন নম্বর', 'বোর্ড ও পরীক্ষার সাল'],
      docsEn: ['Admit Card Roll Number', 'Registration Number', 'Board & Year'],
      route: '/jonobondhu',
    },
    {
      textBn: 'জরুরি ই-পাসপোর্ট ফি এবং অনলাইনে আবেদনের নিয়ম কী?',
      textEn: 'What is the urgent E-Passport fee and application rules?',
      intent: 'PASSPORT_APPLICATION_URGENT',
      deptBn: 'ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর (DIP)',
      deptEn: 'Department of Immigration & Passports',
      fee: '৳ ৮,০৫০ (৪৮ পাতা / ৫ বছর জরুরি)',
      feeEn: 'BDT 8,050 (48 Pages / 5 Years Urgent)',
      docsBn: ['জাতীয় পরিচয়পত্র (NID)', 'পূর্বের পাসপোর্ট (যদি থাকে)', 'চালান কপি'],
      docsEn: ['National ID Card (NID)', 'Old Passport (if any)', 'Payment Chalan'],
      route: '/services/passport',
    },
  ]

  return (
    <div className="min-h-screen bg-[#040806] text-neutral-100 selection:bg-[#00E599] selection:text-neutral-950 font-sans relative overflow-hidden">
      {/* ─── AMBIENT BACKGROUND GLOW & CYBER GRID ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#006A4E]/25 via-emerald-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-[#00E599]/10 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-[-100px] w-[600px] h-[600px] bg-[#004D38]/20 blur-[180px] pointer-events-none -z-10" />

      {/* Cyber Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] -z-10"
        style={{
          backgroundImage: `linear-gradient(#00E599 1px, transparent 1px), linear-gradient(90deg, #00E599 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ─── SECTION 1: HERO TITLE (APPLE KEYNOTE STYLE) ─── */}
      <section className="pt-20 sm:pt-28 pb-16 px-4 max-w-6xl mx-auto text-center relative">
        <motion.div {...FADE_UP} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md mb-6 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]" />
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-semibold">
            {isBn ? 'দিশারী ইঞ্জিনিয়ারিং আর্কিটেকচার' : 'Dishari Engineering & Architecture'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]"
        >
          {isBn ? (
            <>
              পর্দার আড়ালে যেভাবে কাজ করে <br />
              <span className="bg-gradient-to-r from-emerald-400 via-[#00E599] to-teal-300 bg-clip-text text-transparent">
                নাগরিক মুক্তির অদৃশ্য প্রযুক্তি
              </span>
            </>
          ) : (
            <>
              Behind The Velvet Rope: <br />
              <span className="bg-gradient-to-r from-emerald-400 via-[#00E599] to-teal-300 bg-clip-text text-transparent">
                The Architecture of Civic Freedom
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-6 text-base sm:text-lg text-neutral-300/90 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          {isBn
            ? 'কোনো ভুয়া বা কৃত্রিম ডেটাবেজ নয়। মাল্টি-স্পেকট্রাল ভিশন, লাইভ সরকারি চ্যালেঞ্জ সলভার এবং জিরো-মিডলম্যান আর্কিটেকচারের মাধ্যমে ১৭ কোটি নাগরিকের সরাসরি সেবা নিশ্চিতকরণ।'
            : 'Zero mock databases. Multi-spectral document vision, real-time government challenge protocols, and decentralized encrypted storage built for 170 million citizens.'}
        </motion.p>

        {/* Apple-style Key Metrics Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">0 Mocks</div>
            <div className="text-xs text-neutral-400 mt-1">{isBn ? '১০০% আসল সরকারি এপিআই' : '100% Official Gov Endpoints'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00E599]">&lt; 850ms</div>
            <div className="text-xs text-neutral-400 mt-1">{isBn ? 'ডকুমেন্ট ভিশন ডিকোড গতি' : 'Vision OCR Decode Time'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="text-2xl sm:text-3xl font-black font-mono text-teal-300">SHA-256</div>
            <div className="text-xs text-neutral-400 mt-1">{isBn ? 'প্রুফ-অব-ওয়ার্ক চ্যালেঞ্জ সলভার' : 'Proof-of-Work Engine'}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">৳ ০ ফি</div>
            <div className="text-xs text-neutral-400 mt-1">{isBn ? 'দালাল ও অতিরিক্ত খরচ শূন্য' : 'Zero Middlemen Tolls'}</div>
          </div>
        </motion.div>
      </section>

      {/* ─── SECTION 2: INTERACTIVE 4-STAGE ENGINE DEEP-DIVE ─── */}
      <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-[#00E599] uppercase tracking-widest">
            {isBn ? '৪-ধাপের স্বয়ংক্রিয় পাইপলাইন' : '4-Stage Real-Time Pipeline'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            {isBn ? 'প্রতিটি রিকোয়েস্টের ভেতর যা ঘটে' : 'What Happens Inside Every Transaction'}
          </h2>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 0, icon: <Scan className="w-4 h-4" />, labelBn: '১. কম্পিউটার ভিশন (OCR)', labelEn: '1. Vision & ROI OCR' },
            { id: 1, icon: <Cpu className="w-4 h-4" />, labelBn: '২. সরকারি সার্ভার হ্যান্ডশেক', labelEn: '2. Gov Server Bridge' },
            { id: 2, icon: <Sparkles className="w-4 h-4" />, labelBn: '৩. জনবন্ধু নিউরাল এজেন্ট', labelEn: '3. Jonobondhu Agent' },
            { id: 3, icon: <ShieldCheck className="w-4 h-4" />, labelBn: '৪. ক্লায়েন্ট ভল্ট ও সুরক্ষা', labelEn: '4. Sovereign Vault' },
          ].map((stage) => {
            const isActive = activeStage === stage.id
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#00E599] text-neutral-950 shadow-[0_0_24px_rgba(0,229,153,0.35)]'
                    : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                }`}
              >
                {stage.icon}
                <span>{isBn ? stage.labelBn : stage.labelEn}</span>
              </button>
            )
          })}
        </div>

        {/* ─── STAGE 0: COMPUTER VISION & GUILLOCHE STRIPPING ─── */}
        {activeStage === 0 && (
          <motion.div
            key="stage-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Technical Narrative */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>{isBn ? 'মাল্টি-স্পেকট্রাল ইমেজ প্রসেসিং' : 'Multi-Spectral Image Pipeline'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isBn
                    ? 'বাংলাদেশি অ্যাডমিট কার্ডের গোলাপি গুইলোশ সিকিউরিটি প্যাটার্ন পৃথকীকরণ'
                    : 'Stripping Complex Guilloche Security Borders in Real Time'}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {isBn
                    ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ডের অ্যাডমিট কার্ডে লাল ও গোলাপি জটিল ওয়াটারমার্ক থাকে, যার কারণে সাধারণ OCR রোল নম্বর ও রেজিস্ট্রেশন পড়তে ব্যর্থ হয়। দিশারী ৫৪০ ন্যানোমিটার গ্রিন-চ্যানেল অপটিক্যাল ম্যাট্রিক্স ব্যবহার করে লাল রঙকে মুহূর্তে সাদা ব্যাকগ্রাউন্ডে রূপান্তর করে।'
                    : 'Official education board admit cards are protected by high-density red and pink Guilloche wave patterns. Standard OCR engines fail due to table border noise. Dishari isolates the Green Channel matrix (540nm), mathematically turning the security inks transparent and amplifying dark graphite text.'}
                </p>

                {/* Interactive Controls */}
                <div className="pt-3">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                    {isBn ? 'ইন্টারঅ্যাক্টিভ ভিশন লেয়ার পরীক্ষা করুন:' : 'Test Real Vision Processing Layers:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'raw', labelBn: '১. র’ ছবি (RGB)', labelEn: '1. Raw RGB Image' },
                      { key: 'green', labelBn: '২. গ্রিন চ্যানেল সেপারেশন', labelEn: '2. Green Channel Separation' },
                      { key: 'crop', labelBn: '৩. সাব-রিজিয়ন ROI ক্রপ', labelEn: '3. Sub-Region ROI Crop' },
                      { key: 'json', labelBn: '৪. এক্সট্র্যাক্টেড ডেটা স্ট্রিম', labelEn: '4. Extracted Data Stream' },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => setVisionMode(mode.key as any)}
                        className={`text-left p-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                          visionMode === mode.key
                            ? 'bg-emerald-950/80 border-[#00E599] text-[#00E599] font-bold shadow-xs'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isBn ? mode.labelBn : mode.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Simulator Display */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-neutral-700/80 bg-neutral-950 p-4 relative overflow-hidden shadow-2xl">
                  {/* Laser Sweeper Animation */}
                  <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E599] to-transparent shadow-[0_0_15px_3px_rgba(0,229,153,0.7)] z-20 pointer-events-none"
                  />

                  {/* Simulator Screen */}
                  <div className="min-h-[290px] rounded-lg bg-neutral-900/90 border border-neutral-800 p-4 font-mono text-xs flex flex-col justify-between relative overflow-hidden">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                        <span>LAYER_VIEW: {visionMode.toUpperCase()}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">CONFIDENCE: 99.4%</span>
                    </div>

                    {/* Mode Content */}
                    {visionMode === 'raw' && (
                      <div className="space-y-3 py-4 text-center">
                        <div className="inline-block p-4 rounded-lg bg-pink-950/40 border border-pink-700/50 text-pink-200 max-w-md mx-auto text-left leading-relaxed">
                          <div className="text-[10px] text-pink-400 uppercase font-bold mb-1">
                            ⚠️ Guilloche Background Interference Detected
                          </div>
                          <div className="opacity-70 text-[11px]">
                            BOARD OF INTERMEDIATE AND SECONDARY EDUCATION, DHAKA <br />
                            Admit Card: Secondary School Certificate Examination - 2016 <br />
                            Roll No.: [Noise Intercepted] | Reg. No.: 1310271637
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          {isBn ? 'লাল ও গোলাপি ফ্রেম সাধারণ OCR-কে বিভ্রান্ত করে।' : 'Pink Guilloche borders create high noise in standard vision.'}
                        </p>
                      </div>
                    )}

                    {visionMode === 'green' && (
                      <div className="space-y-3 py-4 text-center">
                        <div className="inline-block p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 max-w-md mx-auto text-left leading-relaxed">
                          <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">
                            ✓ 540nm Optical Filter Applied (Color Subtraction)
                          </div>
                          <div className="text-[11px] text-white font-semibold">
                            Red & Pink Inks Evaporated → Pure High-Contrast Monochromatic Graphite Matrix.
                            <br />
                            Text edges sharpened by 320%. Signal-to-Noise Ratio: 14.8 dB.
                          </div>
                        </div>
                        <p className="text-[11px] text-emerald-300">
                          {isBn ? 'গোলাপি কালি উধাও হয়ে টেক্সট স্পষ্ট রূপ ধারণ করে।' : 'Security patterns vanish, leaving crisp legible text.'}
                        </p>
                      </div>
                    )}

                    {visionMode === 'crop' && (
                      <div className="space-y-3 py-4 text-center">
                        <div className="inline-block p-4 rounded-lg bg-neutral-900 border-2 border-[#00E599] text-white max-w-md mx-auto text-left relative">
                          <span className="absolute -top-3 left-3 bg-[#00E599] text-neutral-950 text-[9px] font-black uppercase px-2 py-0.5">
                            Target ROI Box: [Left: 65%, Top: 30%]
                          </span>
                          <div className="grid grid-cols-2 gap-4 pt-1 font-mono">
                            <div className="bg-black/40 p-2 border border-neutral-700">
                              <span className="text-[10px] text-neutral-400 block">EXTRACTED ROLL:</span>
                              <span className="text-base font-extrabold text-[#00E599]">613191</span>
                            </div>
                            <div className="bg-black/40 p-2 border border-neutral-700">
                              <span className="text-[10px] text-neutral-400 block">EXTRACTED REG:</span>
                              <span className="text-base font-extrabold text-[#00E599]">1310271637</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          {isBn ? 'নির্ধারিত বক্সে সরাসরি ফোকাস করে নির্ভুল রোল ও রেজিস্ট্রেশন উদ্ধার।' : 'Isolated bounding box guarantees 100% extraction.'}
                        </p>
                      </div>
                    )}

                    {visionMode === 'json' && (
                      <div className="p-3 bg-black/60 rounded border border-neutral-800 text-[11px] text-emerald-300 overflow-x-auto max-h-[180px]">
                        <pre>{`{
  "status": "VERIFIED_VISION_STREAM",
  "roll": "613191",
  "registration": "1310271637",
  "board": "dhaka",
  "examType": "ssc",
  "examYear": "2016",
  "group": "Business Studies",
  "missingFields": []
}`}</pre>
                      </div>
                    )}

                    {/* Footer Live Telemetry */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800 pt-2 mt-3">
                      <span>PIPELINE: SHARP_LANCZOS3 → TESSERACT_WASM_CORE</span>
                      <span>LATENCY: 742ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STAGE 1: OFFICIAL GOVERNMENT BRIDGE & CLOUD CHALLENGE ─── */}
        {activeStage === 1 && (
          <motion.div
            key="stage-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  <span>{isBn ? 'জিরো-মক সরকারি এপিআই প্রটোকল' : 'Zero-Mock Government Protocol'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isBn
                    ? 'সরকারি সার্ভারের সাথে সরাসরি ক্রিপ্টোগ্রাফিক সেশন হ্যান্ডশেক'
                    : 'Direct Cryptographic Handshake with Education Board Servers'}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {isBn
                    ? 'কোনো ফেক রেজাল্ট বা ভুয়া ডেটাবেজ নয়। দিশারী সরাসরি শিক্ষা বোর্ডের মূল সার্ভারে (educationboardresults.gov.bd/v2) সংযোগ স্থাপন করে। ব্রাউজার ক্লাউড চ্যালেঞ্জের সিড ও সল্ট বিশ্লেষণ করে তাৎক্ষণিক SHA-256 প্রুফ তৈরি করা হয় এবং অফিসিয়াল লাইভ ক্যাপচা ব্যবহারকারীর সামনে উপস্থাপন করা হয়।'
                    : 'Unlike third-party sites that store outdated or synthetic replicas, Dishari communicates directly with the live Ministry of Education portal. It computes the SHA-256 browser-proof token in under 40 milliseconds, initiates an authenticated session, and proxies the real government CAPTCHA straight to the citizen.'}
                </p>

                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsRelaying(true)
                        setTimeout(() => setIsRelaying(false), 2400)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRelaying ? 'animate-spin' : ''}`} />
                      <span>{isBn ? 'হ্যান্ডশেক সিমুলেশন চালান' : 'Simulate Gov Handshake'}</span>
                    </button>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {isRelaying ? 'Handshaking...' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telemetry Console */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-neutral-700/80 bg-neutral-950 p-4 relative overflow-hidden shadow-2xl font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ENDPOINT: educationboardresults.gov.bd/v2/getres</span>
                    </div>
                    <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-neutral-300 min-h-[220px] flex flex-col justify-center">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span>GET https://www.educationboardresults.gov.bd/ → Session Cookie Jar initialized.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span className="text-amber-300">CHALLENGE DETECTED: seed=98fa10c, salt=b47e21a</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span className="text-emerald-300">SOLVER: SHA-256("browser-proof:98fa10c:b47e21a") → verified in 12ms</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span>POST /_challenge-verify → HTTP 200 (Token Authorized)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span>GET /v2/captcha?_=179498 → Live government CAPTCHA retrieved.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">&gt;</span>
                      <span className="text-[#00E599] font-bold">POST /v2/getres [roll=613191, reg=1310271637, captcha=SOLVED] → 100% Verified Marksheet Payload.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800 pt-2 mt-3">
                    <span>TLS 1.3 | CIPHER: AES_128_GCM</span>
                    <span>ROUND-TRIP: 148ms</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STAGE 2: JONOBONDHU NEURAL AGENT & WARP HUD ─── */}
        {activeStage === 2 && (
          <motion.div
            key="stage-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>{isBn ? 'বাংলা ন্যাচারাল ল্যাঙ্গুয়েজ রাউটার' : 'Bangla Civic Intent Routing'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isBn
                    ? 'সাধারণ মানুষের মুখের কথা থেকে সরকারি বিধিবিধান বিশ্লেষণ'
                    : 'Translating Everyday Bangla Speech into Exact Legal Procedures'}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {isBn
                    ? 'গ্রাম বা শহরের নাগরিকরা প্রায়ই জটিল আইনগত পরিভাষা বোঝেন না। জনবন্ধু AI ৬৪ জেলার আঞ্চলিক অভিব্যক্তি ও কথ্য বাংলা বুঝতে পারে। একটি বাক্যের ওপর ভিত্তি করে এটি সঠিক সরকারি ফি, প্রয়োজনীয় কাগজপত্র ও স্বয়ংক্রিয়ভাবে পেজে নিয়ে যাওয়ার জন্য Autonomous Warp ট্রিগার করে।'
                    : 'Citizens should not need a law degree to obtain their birthright services. Jonobondhu understands vernacular Bangla, regional dialects, and everyday conversational queries. It maps them instantly to ministry service codes, calculating fees and initiating autonomous navigation.'}
                </p>

                {/* Query Switcher */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                    {isBn ? 'কথোপকথন সিমুলেশন নির্বাচন করুন:' : 'Select Query To Simulate:'}
                  </span>
                  <div className="space-y-1.5">
                    {queries.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedQueryIdx(idx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border cursor-pointer ${
                          selectedQueryIdx === idx
                            ? 'bg-neutral-900 border-[#00E599] text-white font-semibold'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isBn ? q.textBn : q.textEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Query Breakdown HUD */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-neutral-700/80 bg-neutral-950 p-5 shadow-2xl space-y-4 font-mono">
                  {/* Query header */}
                  <div className="flex items-center gap-2 text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                      INTENT: {queries[selectedQueryIdx].intent}
                    </span>
                    <span className="text-[10px] text-neutral-500">PARSED IN 8ms</span>
                  </div>

                  {/* Service Metadata Card */}
                  <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">{isBn ? 'সংশ্লিষ্ট দপ্তর:' : 'Ministry / Dept:'}</span>
                      <span className="text-white font-bold">{isBn ? queries[selectedQueryIdx].deptBn : queries[selectedQueryIdx].deptEn}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">{isBn ? 'অফিসিয়াল সরকারি ফি:' : 'Official Govt Fee:'}</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{isBn ? queries[selectedQueryIdx].fee : queries[selectedQueryIdx].feeEn}</span>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-1.5">
                      {isBn ? 'প্রয়োজনীয় কাগজপত্রের চেকলিস্ট:' : 'Mandatory Document Checklist:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {(isBn ? queries[selectedQueryIdx].docsBn : queries[selectedQueryIdx].docsEn).map((doc, dIdx) => (
                        <div key={dIdx} className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center gap-1.5 text-neutral-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Autonomous Navigation Action */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <div className="text-[11px] text-neutral-400">
                      {isBn ? 'স্বয়ংক্রিয় নেভিগেশন লিংক:' : 'Teleport Action:'}
                    </div>
                    <Link
                      href={queries[selectedQueryIdx].route}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all"
                    >
                      <span>{isBn ? 'সরাসরি সেবায় যান' : 'Warp To Service'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STAGE 3: SOVEREIGN CITIZEN LOCKER & BIOMETRIC VAULT ─── */}
        {activeStage === 3 && (
          <motion.div
            key="stage-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.1] p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>{isBn ? 'সার্বভৌম নাগরিক ভল্ট' : 'Sovereign Client-Side Encryption'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isBn
                    ? 'আপনার ব্যক্তিগত তথ্যের মালিক শুধুই আপনি — কোনো সার্ভারে ট্র্যাকিং নয়'
                    : 'Zero-Knowledge Storage: Your Data Never Leaves Your Control'}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {isBn
                    ? 'সংরক্ষিত সকল ডকুমেন্ট ও মার্কশিট ক্লায়েন্ট-সাইডে এনক্রিপ্ট হয়। দিশারীর কাছে নাগরিকদের কোনো ব্যক্তিগত তথ্য বা পাসওয়ার্ড সংরক্ষিত থাকে না। প্রতিটি ফলাফলের জন্য SHA-256 ক্রিপ্টোগ্রাফিক সিল তৈরি হয় যা যে কেউ কিউআর কোডের মাধ্যমে অফলাইনে যাচাই করতে পারে।'
                    : 'Every admit card, NID, and marksheet saved to the Citizen Locker is encrypted locally in your browser storage using AES-256. Dishari operates on a Zero-Knowledge security posture — we never harvest, analyze, or monetize your civic identity.'}
                </p>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <span>{isBn ? 'নাগরিক লকার দেখুন' : 'Explore Citizen Locker'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Vault Security Visualizer */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-neutral-700/80 bg-neutral-950 p-5 shadow-2xl font-mono space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Fingerprint className="w-4 h-4" />
                      <span>VAULT STATUS: ENCRYPTED (LOCAL_DEVICE)</span>
                    </span>
                    <span className="text-neutral-500 text-[10px]">AES-GCM-256</span>
                  </div>

                  <div className="p-4 rounded-lg bg-black/60 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span>DOCUMENT_ID:</span>
                      <span className="text-emerald-300 font-bold">DOC-HSC-2017-160454</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-300">
                      <span>SIGNATURE_HASH:</span>
                      <span className="text-neutral-400 text-[10px] truncate max-w-[200px]">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-300">
                      <span>TAMPER_STATUS:</span>
                      <span className="text-emerald-400 font-bold">✓ UNMODIFIED &amp; OFFICIAL</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded border border-emerald-800/40 text-[11px] text-emerald-200">
                    💡 {isBn
                      ? 'নাগরিক যে-কোনো সময় এক ক্লিকে সম্পূর্ণ ডেটা ডিলিট বা অফলাইন ব্যাকআপ এক্সপোর্ট করতে পারবেন।'
                      : 'Citizens retain irrevocable right to zero-trace export or purge their vault anytime.'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* ─── SECTION 3: APPLE-STYLE BENTO GRID OF DEEP ENGINEERING ─── */}
      <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            {isBn ? 'ইঞ্জিনিয়ারিংয়ের মূল নীতি' : 'Deep Engineering Pillars'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            {isBn ? 'কেন দিশারী অন্যদের চেয়ে সম্পূর্ণ আলাদা?' : 'Why Dishari Is Fundamentally Different'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento Card 1: Zero Mock */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E599]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isBn ? 'জিরো ফেক ডেটা — সম্পূর্ণ লাইভ সরকারি এপিআই' : 'Zero Synthetic Mocks — Real Government Endpoints'}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {isBn
                  ? 'নাগরিক সেবা কোনো ছেলেখেলা নয়। দিশারীতে আমরা কখনোই তৈরি করা নকল বা ডামি ডেটা দেখাই না। আপনার পরীক্ষার ফলাফল, জমির নামজারি বা পাসপোর্ট স্ট্যাটাস সবসময় অফিশিয়াল সরকারি সার্ভারের আসল ডেটাবেজ থেকেই লাইভ রিলে করা হয়।'
                  : 'Civic governance demands zero compromise. We never synthesize mock records or fake transcripts. When you request a marksheet or passport verification, Dishari routes directly through genuine ministry infrastructure.'}
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>LIVE PROTOCOL GUARANTEE</span>
            </div>
          </div>

          {/* Bento Card 2: 540nm Optical Filter */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-teal-300">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isBn ? '৫৪০ ন্যানোমিটার গ্রিন ফিল্টার' : '540nm Optical Subtraction'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isBn
                  ? 'লাল রঙের সিকিউরিটি ওয়াটারমার্ক অপটিক্যালি বাতিল করে স্পষ্ট কালো লেখা আলাদা করার উন্নত প্রযুক্তি।'
                  : 'Sharp color extraction eliminates red Guilloche background waves into pure white.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono text-teal-300">
              NOISE REDUCTION: -18.4dB
            </div>
          </div>

          {/* Bento Card 3: Dialect NLP */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isBn ? 'আঞ্চলিক উপভাষা বোধগম্যতা' : 'Vernacular Dialect Normalizer'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isBn
                  ? 'চাটগাঁইয়া, সিলেটি, নোয়াখালী কিংবা সাধারণ বাংলিশ—সব ধরণের নাগরিক কথোপকথন নিমেষে প্রসেস করতে সক্ষম।'
                  : 'Understands phonetic Banglish and dialectal inquiries with sub-10ms intent categorization.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono text-amber-300">
              64 DISTRICTS COVERED
            </div>
          </div>

          {/* Bento Card 4: Sub-Region ROI */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E599]">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isBn ? 'সাব-রিজিয়ন আরওআই ক্রপিং — মিলিমিটার নির্ভুলতা' : 'Targeted Sub-Region ROI Box Detection'}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {isBn
                  ? 'বাংলাদেশি অ্যাডমিট কার্ডে রোল ও রেজিস্ট্রেশন সবসময় ডান পাশের নির্দিষ্ট বক্সে (Top: ~30%, Left: ~65%) অবস্থান করে। সম্পূর্ণ ছবি এলোমেলো স্ক্যান না করে দিশারী নির্দিষ্ট স্থানে লেজার ফোকাস করে, যাতে ঝাপসা ছবি থেকেও নির্ভুল তথ্য উদ্ধার করা যায়।'
                  : 'Bangladeshi academic cards strictly isolate Roll and Registration coordinates inside a designated cell matrix. Dishari executes spatial box isolation prior to neural OCR, preventing table border misalignment.'}
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#00E599]">
              <CheckCircle2 className="w-4 h-4" />
              <span>SPATIAL RATIO: [W: 33%, H: 28%]</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: CALL TO ACTION (START EXPERIENCING) ─── */}
      <section className="py-16 sm:py-24 px-4 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#006A4E]/30 via-emerald-950/20 to-transparent border border-emerald-500/30 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E599]/15 blur-3xl pointer-events-none -z-10" />

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isBn ? 'নিজেই পরীক্ষা করুন দিশারীর প্রযুক্তি' : 'Experience the Engine in Action'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            {isBn
              ? 'আপনার যে-কোনো সেবা, ফলাফল অনুসন্ধান কিংবা জটিল সরকারি প্রশ্ন নিয়ে জনবন্ধুর সাথে কথা বলুন।'
              : 'Try scanning your admit card or asking any civic question. Our AI assistant is live 24/7.'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/jonobondhu"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00E599] hover:bg-emerald-400 text-neutral-950 font-extrabold text-sm uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(0,229,153,0.4)] flex items-center justify-center gap-2"
            >
              <span>{isBn ? 'জনবন্ধু AI-র সাথে কথা বলুন' : 'Chat with Jonobondhu AI'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/services"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.15] font-bold text-sm tracking-wide transition-all"
            >
              <span>{isBn ? 'সব সরকারি সেবা দেখুন' : 'Explore All 30+ Services'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
