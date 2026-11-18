'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
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
  Check,
  ShieldAlert,
  ArrowUpRight,
  BadgeCheck,
} from 'lucide-react'

export default function HowItWorksPage() {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'

  // Scroll container tracking for Apple-style sticky scrollytelling
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Manual stage override if user clicks timeline buttons
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [visionLayer, setVisionLayer] = useState<'raw' | 'green' | 'roi' | 'data'>('green')
  const [simulatingHandshake, setSimulatingHandshake] = useState(false)

  // Map scroll progress to active chapter index (0, 1, 2, 3)
  const [scrollStep, setScrollStep] = useState(0)

  scrollYProgress.on('change', (latest) => {
    if (selectedStage !== null) return
    if (latest < 0.28) setScrollStep(0)
    else if (latest < 0.55) setScrollStep(1)
    else if (latest < 0.8) setScrollStep(2)
    else setScrollStep(3)
  })

  const currentStage = selectedStage !== null ? selectedStage : scrollStep

  // Chapters Data
  const chapters = [
    {
      id: 0,
      badgeBn: 'ধাপ ১: অপটিক্যাল ইমেজ প্রসেসিং',
      badgeEn: 'Step 1: Optical Image Processing',
      titleBn: '৫৪০ ন্যানোমিটার ফিল্টারে ওয়াটারমার্ক পৃথকীকরণ',
      titleEn: '540nm Optical Filter & Guilloche Separation',
      descBn:
        'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ডের প্রবেশপত্রে লাল ও গোলাপি জটিল সিকিউরিটি প্যাটার্ন থাকে। দিশারীর কম্পিউটার ভিশন ইঞ্জিন ৫৪০nm গ্রিন চ্যানেল ফিল্টার ব্যবহার করে লাল কালি মুহূর্তে স্বচ্ছ ব্যাকগ্রাউন্ডে পরিণত করে এবং কালো টেক্সটের বৈসাদৃশ্য বাড়িয়ে তোলে। এরপর ডানদিকের নির্দিষ্ট রোল/রেজিস্ট্রেশন বাক্সে স্বয়ংক্রিয়ভাবে লেজার ফোকাস করে শতভাগ নির্ভুল তথ্য সংগ্রহ করে।',
      descEn:
        'Official Bangladeshi education board admit cards are guarded by complex pink Guilloche wave patterns. Standard vision OCR gets confused by table borders and watermarks. Dishari uses a 540nm optical green-channel matrix to mathematically evaporate pink security ink into clean white, instantly isolating Roll and Registration numbers with sub-pixel precision.',
      highlightsBn: [
        'লাল ও গোলাপি ওয়াটারমার্ক স্বয়ংক্রিয়ভাবে মুছে ফেলা',
        'ডানপাশের রোল-রেজিস্ট্রেশন বক্সে মিলিমিটার ROI ফোকাস',
        'ঝাপসা ও ক্যামেরায় তোলা ছবিতেও ৯৯.৪% নির্ভুলতা',
      ],
      highlightsEn: [
        'Automatic evaporation of red & pink security watermarks',
        'Targeted millimetric ROI crop on Roll/Reg cells',
        '99.4% confidence even on blurry mobile photos',
      ],
    },
    {
      id: 1,
      badgeBn: 'ধাপ ২: লাইভ সরকারি সার্ভার ব্রিজ',
      badgeEn: 'Step 2: Live Government Server Bridge',
      titleBn: 'জিরো-মক আর্কিটেকচার ও লাইভ ক্যাপচা রিলে',
      titleEn: 'Zero-Mock Protocol & Real-Time CAPTCHA Relay',
      descBn:
        'দিশারী কোনো ভুয়া বা কৃত্রিম ডেটাবেজ ব্যবহার করে না। প্রতিটি অনুসন্ধানে সরাসরি শিক্ষা বোর্ডের অফিশিয়াল গেটওয়েতে (educationboardresults.gov.bd/v2) নিরাপদ সংযোগ স্থাপন করা হয়। সার্ভারের ক্লাউড চ্যালেঞ্জ সিড ও সল্ট বিশ্লেষণ করে দ্রুততম সময়ে SHA-256 প্রুফ যাচাই শেষে আসল সরকারি ক্যাপচা ব্যবহারকারীর সামনে আনা হয়।',
      descEn:
        'Civic governance cannot tolerate synthetic mocks or outdated database caches. Dishari opens a real TLS handshake directly to the Ministry of Education server. It solves the anti-bot browser challenge using SHA-256 in 12ms and presents the genuine government CAPTCHA directly to the citizen.',
      highlightsBn: [
        '১০০% আসল সরকারি সার্ভারের লাইভ ডেটা',
        'ক্লাউড চ্যালেঞ্জের তাৎক্ষণিক ক্রিপ্টোগ্রাফিক সমাধান',
        'স্বচ্ছ ও দুর্নীতিমুক্ত ডিজিটাল রেজাল্ট রিলে',
      ],
      highlightsEn: [
        '100% authentic live government server payload',
        'Instant SHA-256 browser challenge verification',
        'Direct, transparent, middleman-free result relay',
      ],
    },
    {
      id: 2,
      badgeBn: 'ধাপ ৩: জনবন্ধু নিউরাল ইন্টেলিজেন্স',
      badgeEn: 'Step 3: Jonobondhu Neural Intelligence',
      titleBn: 'সাধারণ মানুষের মুখের কথা থেকে সরকারি বিধিবিধান ডিকোড',
      titleEn: 'Translating Vernacular Speech to Exact Legal Steps',
      descBn:
        'একজন সাধারণ নাগরিকের পক্ষে আইনের জটিল পরিভাষা জানা সম্ভব নয়। "বাবার মৃত্যুর পর জমি কীভাবে নিজের নামে আনব?"—এমন স্বাভাবিক বাক্য শুনেই জনবন্ধু বুঝতে পারে এটি ই-নামজারি ও ওয়ারিশি খতিয়ানের বিষয়। এটি সাথে সাথে সরকারি নির্ধারিত ফি (৳১,১৭০), প্রয়োজনীয় কাজগপত্র ও অটোনমাস নেভিগেশনের মাধ্যমে পেজ লক করে দেয়।',
      descEn:
        'Citizens should never feel intimidated by bureaucratic jargon. Jonobondhu AI understands 64 district vernacular dialects, phonetic Banglish, and conversational queries. It maps everyday phrases to exact legal requirements, displaying official fees and initiating autonomous navigation.',
      highlightsBn: [
        'কথ্য বাংলা ও আঞ্চলিক ভাষা তাৎক্ষণিক অনুধাবন',
        'সরকারি নির্দিষ্ট ফি তালিকা (এক টাকাও বেশি নয়)',
        'স্বয়ংক্রিয় সেবা পেজ ট্রান্সফার (Autonomous Warp)',
      ],
      highlightsEn: [
        'Sub-10ms intent parsing for spoken & written Bangla',
        'Exact official government fee schedules (not a penny more)',
        'Autonomous route locking and instant navigation',
      ],
    },
    {
      id: 3,
      badgeBn: 'ধাপ ৪: সার্বভৌম নাগরিক লকার',
      badgeEn: 'Step 4: Sovereign Citizen Locker',
      titleBn: 'ডিজিটাল সিলমোহর ও ক্লায়েন্ট-সাইড এনক্রিপশন',
      titleEn: 'Cryptographic Seals & Client-Side Encryption',
      descBn:
        'প্রাপ্ত মার্কশিট ও নাগরিক ডকুমেন্টস দিশারীর কোনো কেন্দ্রীয় সার্ভারে বিক্রি বা নজরদারির জন্য জমা রাখা হয় না। সম্পূর্ণ তথ্য ক্লায়েন্ট ডিভাইসে AES-256 এ এনক্রিপ্ট হয়ে জমা থাকে। প্রতিটি ডকুমেন্টের সাথে একটি ডিজিটাল SHA-256 টেম্পার-প্রুফ হ্যাশ ও কিউআর সিল যুক্ত থাকে যা অফলাইনে যে-কোনো কর্তৃপক্ষ যাচাই করতে পারে।',
      descEn:
        'Your civic records belong exclusively to you. Dishari uses a Zero-Knowledge security posture where documents are encrypted locally on your device with AES-256. Each marksheet carries a tamper-evident SHA-256 hash seal and QR code that can be verified offline by any authority.',
      highlightsBn: [
        'ডিভাইসে সংরক্ষিত সম্পূর্ণ ব্যক্তিগত এনক্রিপশন',
        'অফলাইনেও কিউআর স্ক্যান করে সত্যতা যাচাইযোগ্য',
        'যেকোনো সময় এক ক্লিকে সম্পূর্ণ তথ্য মুছে ফেলার স্বাধীনতা',
      ],
      highlightsEn: [
        'Zero-knowledge on-device AES-256 storage',
        'Offline verifiable QR tamper-evident signature',
        'Irrevocable right to purge or export data anytime',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1917] selection:bg-[#006A4E] selection:text-white font-sans relative">
      {/* ─── HERO HEADER ───────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 max-w-5xl mx-auto text-center border-b border-[#E7E5E4]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#006A4E] rounded-none text-xs font-bold font-mono tracking-wider uppercase mb-5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBn ? 'স্বচ্ছ নাগরিক প্রযুক্তির অন্দরমহল' : 'The Architecture of Civic Freedom'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.18]"
        >
          {isBn ? (
            <>
              পর্দার আড়ালে যেভাবে কাজ করে <br />
              <span className="text-[#006A4E]">দিশারীর প্রতিটি নাগরিক সেবা</span>
            </>
          ) : (
            <>
              Under The Hood: <br />
              <span className="text-[#006A4E]">How Dishari Works Behind The Scenes</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-5 text-base sm:text-lg text-[#78716C] max-w-2xl mx-auto leading-relaxed"
        >
          {isBn
            ? 'কোনো ভুয়া তথ্য বা নকল ডেটাবেজ নয়। মাল্টি-স্পেকট্রাল ভিশন, লাইভ সরকারি সার্ভার ব্রিজ ও ক্লায়েন্ট এনক্রিপশনের মাধ্যমে কীভাবে ১৭ কোটি মানুষের সেবা সুরক্ষিত হয়, নিচে স্ক্রোল করে সরাসরি দেখুন।'
            : 'Zero mock databases. Multi-spectral document vision, live government protocol verification, and decentralized encrypted storage built for 170 million citizens. Scroll to explore.'}
        </motion.p>

        {/* Clean Civic Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          <div className="bg-white border border-[#E7E5E4] p-3 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-[#006A4E]">০ নকল ডেটা</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? '১০০% আসল সরকারি সার্ভার' : '100% Real Gov Endpoints'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-neutral-900">&lt; ৮৫০ms</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'ভিশন স্ক্যান ও ডিকোড' : 'Vision OCR Decode Time'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-neutral-900">SHA-256</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'ডিজিটাল সিলমোহর' : 'Cryptographic Hash Seal'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600">৳ ০ ফি</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'দালাল ও অতিরিক্ত খরচ শূন্য' : 'Zero Middlemen Tolls'}</div>
          </div>
        </motion.div>
      </section>

      {/* ─── SCROLLYTELLING CONTAINER (APPLE PRODUCT SHOWCASE STYLE) ───────── */}
      <section ref={containerRef} className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative">
        {/* Step Quick Navigation Bar */}
        <div className="sticky top-20 z-30 mb-8 bg-[#FAFAF8]/95 backdrop-blur-md py-2 border-b border-[#E7E5E4] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {chapters.map((chap, idx) => (
              <button
                key={chap.id}
                onClick={() => setSelectedStage(idx)}
                className={`px-3 py-1.5 text-xs font-mono font-bold transition-all rounded-none cursor-pointer flex items-center gap-1.5 ${
                  currentStage === idx
                    ? 'bg-[#006A4E] text-white shadow-xs'
                    : 'bg-white border border-[#E7E5E4] text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <span>{`0${idx + 1}`}</span>
                <span className="hidden sm:inline">{isBn ? chap.badgeBn.split(':')[1] : chap.badgeEn.split(':')[1]}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#78716C] shrink-0">
            {isBn ? `ধাপ ${currentStage + 1} / ৪` : `Stage ${currentStage + 1} of 4`}
          </div>
        </div>

        {/* 2-Column Scrollytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrative Content (Scrollable) */}
          <div className="lg:col-span-6 space-y-16 pb-24">
            {chapters.map((chap, idx) => {
              const isSelected = currentStage === idx
              return (
                <div
                  key={chap.id}
                  className={`p-6 sm:p-8 border transition-all duration-300 ${
                    isSelected
                      ? 'bg-white border-[#006A4E] shadow-sm border-l-4 border-l-[#006A4E]'
                      : 'bg-[#FAFAF8] border-[#E7E5E4] opacity-75'
                  }`}
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#006A4E] block mb-2">
                    {isBn ? chap.badgeBn : chap.badgeEn}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1C1917] leading-snug">
                    {isBn ? chap.titleBn : chap.titleEn}
                  </h2>
                  <p className="mt-3 text-sm text-[#78716C] leading-relaxed">
                    {isBn ? chap.descBn : chap.descEn}
                  </p>

                  <div className="mt-5 space-y-2 pt-4 border-t border-[#E7E5E4]">
                    {(isBn ? chap.highlightsBn : chap.highlightsEn).map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-xs font-semibold text-[#1C1917]">
                        <Check className="w-4 h-4 text-[#006A4E] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-2">
                    <button
                      onClick={() => setSelectedStage(idx)}
                      className={`text-xs font-bold font-mono uppercase inline-flex items-center gap-1.5 cursor-pointer ${
                        isSelected ? 'text-[#006A4E]' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <span>{isBn ? 'এই ধাপের ইন্টারঅ্যাক্টিভ ভিউ দেখুন' : 'Inspect This Stage Live'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Sticky Interactive Stage Visualizer */}
          <div className="lg:col-span-6 sticky top-36 z-20">
            <div className="bg-white border border-[#E7E5E4] p-5 sm:p-6 shadow-sm rounded-none min-h-[480px] flex flex-col justify-between">
              {/* Stage Top Bar */}
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006A4E]" />
                  <span className="font-mono text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                    {currentStage === 0 && (isBn ? 'কম্পিউটার ভিশন সিমুলেটর' : 'Vision Engine Simulator')}
                    {currentStage === 1 && (isBn ? 'সরকারি গেটওয়ে টেলিমেট্রি' : 'Gov Gateway Telemetry')}
                    {currentStage === 2 && (isBn ? 'জনবন্ধু রুলস অ্যানালাইজার' : 'Jonobondhu Civic Rules')}
                    {currentStage === 3 && (isBn ? 'এনক্রিপ্টেড লকার ভল্ট' : 'Encrypted Vault Preview')}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-emerald-50 text-[#006A4E] px-2 py-0.5 border border-emerald-200">
                  {currentStage === 0 && '540nm FILTER'}
                  {currentStage === 1 && 'TLS 1.3 / 200 OK'}
                  {currentStage === 2 && 'NLP ROUTER'}
                  {currentStage === 3 && 'AES-256 SEALED'}
                </span>
              </div>

              {/* Dynamic Interactive Stage Body */}
              <div className="flex-1 flex flex-col justify-center">
                {/* ── STAGE 0 VISUALIZER: Admit Card Multi-Spectral Vision ── */}
                {currentStage === 0 && (
                  <div className="space-y-4">
                    {/* Layer Switcher Tabs */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 border border-[#E7E5E4]">
                      {[
                        { key: 'raw', label: isBn ? 'র’ ছবি' : 'Raw RGB' },
                        { key: 'green', label: isBn ? 'গ্রিন চ্যানেল' : '540nm Filter' },
                        { key: 'roi', label: isBn ? 'ROI ক্রপ' : 'ROI Crop' },
                        { key: 'data', label: isBn ? 'ডেটা' : 'Data' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setVisionLayer(tab.key as any)}
                          className={`py-1.5 text-center text-[11px] font-mono font-bold transition-colors cursor-pointer rounded-none ${
                            visionLayer === tab.key
                              ? 'bg-white text-[#006A4E] shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Visual Card Frame */}
                    <div className="border border-neutral-200 bg-[#FAFAF8] p-4 relative overflow-hidden min-h-[220px] flex flex-col justify-center">
                      {/* Laser scan line animation */}
                      <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-[2px] bg-[#006A4E] shadow-[0_0_8px_rgba(0,106,78,0.6)] z-10 pointer-events-none"
                      />

                      {visionLayer === 'raw' && (
                        <div className="p-3 bg-red-50/60 border border-red-200 text-xs font-mono space-y-1">
                          <div className="text-[10px] font-bold text-red-700 uppercase">
                            [Background Security Watermark Detected]
                          </div>
                          <div className="text-neutral-600 opacity-70">
                            BOARD OF INTERMEDIATE &amp; SECONDARY EDUCATION, DHAKA
                            <br />
                            Admit Card: Secondary School Certificate Exam
                            <br />
                            Roll: ~~~~~ (Guilloche interference)
                          </div>
                        </div>
                      )}

                      {visionLayer === 'green' && (
                        <div className="p-3 bg-white border border-emerald-300 text-xs font-mono space-y-1">
                          <div className="text-[10px] font-bold text-[#006A4E] uppercase">
                            [540nm Separation: Pink Security Pattern Stripped]
                          </div>
                          <div className="text-neutral-900 font-semibold leading-relaxed">
                            BOARD OF INTERMEDIATE &amp; SECONDARY EDUCATION, DHAKA
                            <br />
                            Student: Nokib Mia | Group: Business Studies
                            <br />
                            High contrast text isolated. Noise reduced by 85%.
                          </div>
                        </div>
                      )}

                      {visionLayer === 'roi' && (
                        <div className="p-3 bg-white border-2 border-[#006A4E] text-xs font-mono space-y-2">
                          <div className="text-[10px] font-bold text-[#006A4E] uppercase">
                            [Target ROI Bounding Box: Right 65%, Top 30%]
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-50 p-2 border border-emerald-200">
                              <span className="text-[10px] text-neutral-500 block">EXTRACTED ROLL:</span>
                              <span className="text-base font-bold text-neutral-900">613191</span>
                            </div>
                            <div className="bg-emerald-50 p-2 border border-emerald-200">
                              <span className="text-[10px] text-neutral-500 block">EXTRACTED REG:</span>
                              <span className="text-base font-bold text-neutral-900">1310271637</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {visionLayer === 'data' && (
                        <div className="p-2.5 bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                          <pre>{`{
  "roll": "613191",
  "registration": "1310271637",
  "board": "dhaka",
  "examType": "ssc",
  "examYear": "2016",
  "group": "Business Studies"
}`}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STAGE 1 VISUALIZER: Gov Gateway Telemetry ── */}
                {currentStage === 1 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-neutral-900 text-neutral-200 space-y-1.5 border border-neutral-800 text-[11px]">
                      <div className="text-emerald-400 font-bold">
                        &gt; TARGET: https://www.educationboardresults.gov.bd/v2
                      </div>
                      <div className="text-neutral-400">
                        &gt; Cookie Jar sync: OK (Session active)
                      </div>
                      <div className="text-amber-300">
                        &gt; Cloud Challenge solver: seed=78fa, salt=12bc
                      </div>
                      <div className="text-emerald-300">
                        &gt; SHA-256("browser-proof:78fa:12bc") → verified in 14ms
                      </div>
                      <div className="text-white font-bold">
                        &gt; Live Government CAPTCHA image relayed to user
                      </div>
                      <div className="text-emerald-400 font-bold">
                        &gt; POST /v2/getres → 100% Genuine Official Marksheet
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSimulatingHandshake(true)
                        setTimeout(() => setSimulatingHandshake(false), 1800)
                      }}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#006A4E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${simulatingHandshake ? 'animate-spin' : ''}`} />
                      <span>{isBn ? 'সার্ভার হ্যান্ডশেক রিফ্রেশ করুন' : 'Test Handshake Latency'}</span>
                    </button>
                  </div>
                )}

                {/* ── STAGE 2 VISUALIZER: Jonobondhu Civic Rules ── */}
                {currentStage === 2 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="text-[11px] font-mono text-neutral-500 uppercase">
                        {isBn ? 'নাগরিক প্রশ্ন ইনপুট:' : 'Citizen Query Input:'}
                      </div>
                      <div className="text-xs font-bold text-neutral-900 bg-white p-2 border border-neutral-200">
                        &ldquo;বাবার মৃত্যুর পর জমির নামজারি কীভাবে করব?&rdquo;
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-neutral-600 font-semibold">{isBn ? 'চিহ্নিত সেবা:' : 'Parsed Service:'}</span>
                        <span className="font-bold text-[#006A4E]">ই-নামজারি (উত্তরাধিকার সূত্রে)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-neutral-600 font-semibold">{isBn ? 'আইনি সরকারি ফি:' : 'Official Govt Fee:'}</span>
                        <span className="font-black text-[#006A4E]">৳ ১,১৭০ (এক টাকাও বেশি নয়)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-neutral-600 font-semibold">{isBn ? 'দরকারী কাগজ:' : 'Required Papers:'}</span>
                        <span className="font-medium text-neutral-800">ওয়ারিশান সনদ, খতিয়ান, এনআইডি</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STAGE 3 VISUALIZER: Sovereign Locker Vault ── */}
                {currentStage === 3 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-4 bg-white border border-[#006A4E] space-y-2">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <span className="text-xs font-bold text-[#006A4E] uppercase flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4 text-[#006A4E]" />
                          <span>{isBn ? 'অফিসিয়াল ডিজিটাল রেজাল্ট ভল্ট' : 'Verified Official Record'}</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold">AES-256 LOCAL</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-neutral-900 font-bold text-sm">Md. Masud Rana</div>
                        <div className="text-[11px] text-neutral-600">রোল: 160454 | রেজি: 1210692514 | ঢাকা বোর্ড</div>
                        <div className="text-xs text-emerald-700 font-bold pt-1">
                          জিপিএ: 4.92 (A+) — উত্তীর্ণ ✅
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] text-neutral-400 border-t border-neutral-100 flex items-center justify-between">
                        <span>SHA-256: e3b0c442...991b78</span>
                        <span className="text-[#006A4E] font-bold">TAMPER-PROOF</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="border-t border-[#E7E5E4] pt-3 mt-4 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#78716C] font-mono">
                  {isBn ? 'দিশারী নাগরিক প্ল্যাটফর্ম' : 'Dishari Civic Architecture'}
                </span>
                <Link
                  href="/jonobondhu"
                  className="font-bold text-[#006A4E] hover:underline flex items-center gap-1"
                >
                  <span>{isBn ? 'সরাসরি অভিজ্ঞতা নিন' : 'Try Live Assistant'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID: CIVIC ENGINEERING PILLARS ──────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto border-t border-[#E7E5E4]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-[#006A4E] uppercase tracking-wider">
            {isBn ? 'ইঞ্জিনিয়ারিং নীতিমালা' : 'Engineering Core Principles'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] mt-1.5">
            {isBn ? 'কেন দিশারী অন্যদের চেয়ে মৌলিকভাবে ভিন্ন?' : 'Why Dishari Is Fundamentally Different'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento Card 1: Zero Mock */}
          <div className="md:col-span-2 p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006A4E]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                {isBn ? 'জিরো ফেক ডেটা — সম্পূর্ণ লাইভ সরকারি এপিআই' : 'Zero Synthetic Mocks — Genuine Gov Protocols'}
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                {isBn
                  ? 'নাগরিক সেবা কোনো ছেলেখেলা নয়। দিশারীতে আমরা কখনোই ভুয়া বা ডামি ডেটাবেজ ব্যবহার করি না। আপনার পরীক্ষার ফলাফল, জমির নামজারি বা পাসপোর্ট স্ট্যাটাস সবসময় অফিশিয়াল সরকারি সার্ভারের আসল ডেটাবেজ থেকেই লাইভ রিলে করা হয়।'
                  : 'Civic governance demands complete integrity. Dishari never uses synthetic caches. When you check an SSC/HSC marksheet or passport application, Dishari interfaces with the official ministry server live.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono font-bold text-[#006A4E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>LIVE GOVERNMENT RELAY GUARANTEE</span>
            </div>
          </div>

          {/* Bento Card 2: 540nm Filter */}
          <div className="p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006A4E]">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                {isBn ? '৫৪০nm অপটিক্যাল ফিল্টারিং' : '540nm Optical Subtraction'}
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                {isBn
                  ? 'লাল ও গোলাপি জটিল সিকিউরিটি ওয়াটারমার্ক অপটিক্যালি বাতিল করে স্পষ্ট কালো লেখা আলাদা করার উন্নত প্রযুক্তি।'
                  : 'Mathematical channel separation turns pink Guilloche backgrounds invisible, leaving sharp black text.'}
              </p>
            </div>
            <div className="pt-3 text-[11px] font-mono text-[#006A4E] font-bold">
              SIGNAL-TO-NOISE: +14.8dB
            </div>
          </div>

          {/* Bento Card 3: 64 Districts NLP */}
          <div className="p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                {isBn ? 'আঞ্চলিক উপভাষা বোধগম্যতা' : 'Vernacular Dialect NLP'}
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                {isBn
                  ? 'চাটগাঁইয়া, সিলেটি, নোয়াখালী কিংবা সাধারণ বাংলিশ—সব ধরণের নাগরিক কথোপকথন নিমেষে সঠিক আইনি সেবায় রূপান্তর।'
                  : 'Understands phonetic Banglish and regional dialects, translating them to ministry service workflows.'}
              </p>
            </div>
            <div className="pt-3 text-[11px] font-mono text-amber-800 font-bold">
              64 DISTRICTS COVERED
            </div>
          </div>

          {/* Bento Card 4: Sub-Region Spatial ROI */}
          <div className="md:col-span-2 p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006A4E]">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                {isBn ? 'সাব-রিজিয়ন আরওআই ক্রপিং — মিলিমিটার নির্ভুলতা' : 'Spatial Sub-Region ROI Detection'}
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                {isBn
                  ? 'বাংলাদেশি অ্যাডমিট কার্ডে রোল ও রেজিস্ট্রেশন সবসময় ডান পাশের নির্দিষ্ট বক্সে (Top: ~30%, Left: ~65%) অবস্থান করে। সম্পূর্ণ ছবি এলোমেলো স্ক্যান না করে দিশারী নির্দিষ্ট স্থানে লেজার ফোকাস করে, যাতে যেকোনো ভাঙাচোরা ছবি থেকেও নির্ভুল তথ্য পাওয়া যায়।'
                  : 'Bangladeshi admit cards isolate Roll and Registration numbers inside a designated cell on the right. Dishari executes spatial bounding-box isolation before running OCR, eliminating alignment errors.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono font-bold text-[#006A4E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>SPATIAL ACCURACY RATIO: 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 bg-white border-2 border-[#006A4E] shadow-sm relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917]">
            {isBn ? 'নিজেই পরীক্ষা করুন দিশারীর প্রযুক্তি' : 'Experience the Dishari Engine Live'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#78716C] max-w-lg mx-auto leading-relaxed">
            {isBn
              ? 'আপনার যে-কোনো সেবা, অ্যাডমিট কার্ড স্ক্যান কিংবা জটিল সরকারি প্রশ্ন নিয়ে জনবন্ধুর সাথে এখনই কথা বলুন।'
              : 'Scan your admit card or ask any civic inquiry. Our verified assistant is ready 24/7.'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/jonobondhu"
              className="w-full sm:w-auto px-6 py-3 bg-[#006A4E] hover:bg-[#00523C] text-white font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 win-press"
            >
              <span>{isBn ? 'জনবন্ধু AI-র সাথে কথা বলুন' : 'Chat with Jonobondhu AI'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/services"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-[#1C1917] border border-[#E7E5E4] font-bold text-sm tracking-wide transition-all win-press"
            >
              <span>{isBn ? 'সব সরকারি সেবা দেখুন' : 'Explore All 30+ Services'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
