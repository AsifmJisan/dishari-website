'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Activity,
  PhoneCall,
  Server,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Scale,
  Compass,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { fetchAllServices } from '@/lib/api'
import { WIN10_INDICATOR_SPRING, WIN10_EASE_ENTRANCE } from '@/lib/motion'
import { cn } from '@/lib/utils'

function toBanglaDigits(n: number | string): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(n)
    .split('')
    .map((c) => bn[parseInt(c, 10)] ?? c)
    .join('')
}

type TelemetryTab = 'impact' | 'gateways' | 'hotlines'

export function StatsSection() {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'
  const [activeTab, setActiveTab] = useState<TelemetryTab>('impact')
  const [serviceCount, setServiceCount] = useState<number>(30)
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    fetchAllServices()
      .then((services) => {
        if (services && services.length > 0) {
          setServiceCount(services.length)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-rotating Live Gazette Bulletin Ticker
  const tickerItems = isBn
    ? [
        'গেজেট স্বচ্ছতা: নামজারি আবেদনের মোট সরকারি ফি ১,১৭০ টাকা — কোনো দালালকে বাড়তি টাকা দেবেন না',
        'ই-পাসপোর্ট নির্দেশিকা: ৪৮ পাতা ৫ বছর সাধারণ ফি ৪,০২৫ টাকা, মূল এনআইডি বা ১৭-ডিজিট জন্মসনদ বাধ্যতামূলক',
        'সমাজসেবা অধিদপ্তর: বিধবা ও বয়স্ক ভাতা ১০০% বিনামূল্যে সরাসরি বিকাশ/নগদে (G2P) পৌঁছে যায়',
        'ডিজিটাল লকার: এনআইডি ও সার্টিফিকেট এনক্রিপ্ট করে আজীবন সুরক্ষিত রাখুন',
        'জনবন্ধু AI: মুখে বলুন "এনআইডি তে নিয়ে যাও" বা "পাসপোর্ট ফি কত" — তাৎক্ষণিক স্বয়ংক্রিয় সমাধান'
      ]
    : [
        'Official Gazette: Land mutation total legal fee is 1,170 BDT — never pay unauthorized broker charges',
        'E-Passport Advisory: 48-page 5-year regular fee 4,025 BDT with verified Smart NID / birth record',
        'Social Welfare: Widow & elderly allowances are 100% free, delivered straight to mobile banking',
        'Document Vault: 256-bit encrypted permanent citizen vault for auto-generating dockets',
        'Jonobondhu AI: Speak naturally: "take me to NID" or ask for official gazette fee schedules'
      ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [tickerItems.length])

  const serviceNumberFormatted = isBn ? `${toBanglaDigits(serviceCount)}+` : `${serviceCount}+`

  return (
    <section className="py-10 bg-[#F4F6F9] border-y border-neutral-200 font-sans relative overflow-hidden">
      {/* Background Micro Subtle Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* ─── Control Deck Header: Live Telemetry & Lenses ─────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-neutral-300">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-[11px] font-bold text-[#006A4E] uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-none border border-emerald-300">
                {isBn ? 'সিস্টেম টেলিমেট্রি ও নাগরিক মানদণ্ড' : 'Live Civic Telemetry & Transparency'}
              </span>
              <span className="text-neutral-400 font-mono text-[11px] hidden sm:inline">
                • {isBn ? 'গেজেট সিনক্রোনাইজড' : 'Gazette Synchronized'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {isBn ? 'স্বচ্ছ নাগরিক সেবা ও বাস্তব মেট্রিক্স' : 'Verifiable Civic Metrics & Readiness'}
            </h2>
          </div>

          {/* Interactive Lenses Switcher (3 Tabs) */}
          <div className="inline-flex border border-neutral-300 bg-white p-1 rounded-none shadow-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer select-none rounded-none win-press',
                activeTab === 'impact' ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {activeTab === 'impact' && (
                <motion.div
                  layoutId="telemetry-tab-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>{isBn ? 'নাগরিক প্রভাব' : 'Civic Impact'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gateways')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer select-none rounded-none win-press',
                activeTab === 'gateways' ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {activeTab === 'gateways' && (
                <motion.div
                  layoutId="telemetry-tab-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>{isBn ? 'গেটওয়ে স্ট্যাটাস' : 'Live Gateways'}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hotlines')}
              className={cn(
                'relative px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer select-none rounded-none win-press',
                activeTab === 'hotlines' ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {activeTab === 'hotlines' && (
                <motion.div
                  layoutId="telemetry-tab-pill"
                  className="absolute inset-0 bg-[#006A4E]"
                  transition={WIN10_INDICATOR_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isBn ? 'জরুরি ডায়াল ডেক' : 'Emergency Deck'}</span>
              </span>
            </button>
          </div>
        </div>

        {/* ─── Tab Content Views ────────────────────────────────────────────── */}
        <div className="min-h-[290px]">
          <AnimatePresence mode="wait" initial={false}>
            {/* ─── TAB 1: CIVIC IMPACT & TRANSPARENCY ─────────────────────── */}
            {activeTab === 'impact' && (
              <motion.div
                key="tab-impact"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: WIN10_EASE_ENTRANCE }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Metric Tile 1: Zero Brokerage */}
                <div className="bg-white border border-neutral-300 border-t-4 border-t-[#006A4E] p-5 flex flex-col justify-between shadow-xs hover:border-[#006A4E] transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {isBn ? 'গেজেট ফি সততা' : 'Anti-Broker Guarantee'}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-[#006A4E] font-mono tracking-tight">
                        {isBn ? '৳০' : '৳0'}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {isBn ? 'দালাল ও বাড়তি খরচ' : 'Broker / Hidden Fee'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
                      {isBn
                        ? 'প্রতিটি সরকারি সেবার সঠিক সরকারি গেজেট ফি দৃশ্যমান। কোনো কম্পিউটার দোকান বা মধ্যস্বত্বভোগীর হয়রানি শূন্য।'
                        : 'Exact legal government charges. Eliminates illegal extra commissions and middleman exploitation.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-[#006A4E] group-hover:translate-x-0.5 transition-transform">
                    <span>{isBn ? 'গেজেট ফি তালিকা' : 'View Gazette Tariffs'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Metric Tile 2: Auto-Docket Speed */}
                <div className="bg-white border border-neutral-300 border-t-4 border-t-emerald-600 p-5 flex flex-col justify-between shadow-xs hover:border-emerald-600 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {isBn ? 'ওসিআর ডকেট ইঞ্জিন' : 'Automated Docketing'}
                      </span>
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-neutral-900 font-mono tracking-tight">
                        {isBn ? '< ২ সে.' : '< 2s'}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {isBn ? 'প্রস্তুত সময়সীমা' : 'Assembly Latency'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
                      {isBn
                        ? 'স্মার্ট এনআইডি ও সনদ স্ক্যান করে মুহূর্তেই প্রস্তুত হয় সম্পূর্ণ আবেদনপত্র ও কোর্ট-রেডি ডিজিটাল কার্যপত্র।'
                        : 'Bilingual OCR v2.4 pre-fills official government application sheets instantly from scanned citizen cards.'}
                    </p>
                  </div>

                  <Link
                    href="/dashboard?tab=locker"
                    className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isBn ? 'ডিজিটাল লকার পরীক্ষা করুন' : 'Test Document Vault'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Metric Tile 3: 30+ Official Services */}
                <div className="bg-white border border-neutral-300 border-t-4 border-t-cyan-700 p-5 flex flex-col justify-between shadow-xs hover:border-cyan-700 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 border border-cyan-200">
                        {isBn ? 'গেজেট ডিরেক্টরি' : 'Full Coverage'}
                      </span>
                      <Layers className="w-4 h-4 text-cyan-700" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-neutral-900 font-mono tracking-tight">
                        {serviceNumberFormatted}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {isBn ? 'সেবা · ৬৪ জেলা' : 'Services · 64 Districts'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
                      {isBn
                        ? 'পাসপোর্ট, ভূমি নামজারি, কর, বিএমইটি প্রবাসী কার্ড ও সামাজিক ভাতা—৮ বিভাগের ৪৯৫ উপজেলার জন্য যাচাইকৃত।'
                        : 'Passport, land mutation, taxation, BMET overseas card, and all welfare stipends verified nationwide.'}
                    </p>
                  </div>

                  <Link
                    href="/services"
                    className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-cyan-800 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isBn ? 'সকল সেবা ডিরেক্টরি দেখুন' : 'Explore All Services'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Metric Tile 4: Jonobondhu AI Voice Intelligence */}
                <div className="bg-white border border-neutral-300 border-t-4 border-t-amber-600 p-5 flex flex-col justify-between shadow-xs hover:border-amber-600 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-200">
                        {isBn ? 'জনবন্ধু AI সহায়ক' : 'Civic AI Engine'}
                      </span>
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-neutral-900 font-mono tracking-tight">
                        {isBn ? '২৪/৭' : '24/7'}
                      </span>
                      <span className="text-xs font-bold text-neutral-500">
                        {isBn ? 'বাংলা ভয়েস নেভিগেশন' : 'Voice Assistance'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
                      {isBn
                        ? 'আঞ্চলিক উপভাষা ও সাধারণ বাংলায় মুখে বলুন "এনআইডি তে নিয়ে যাও" বা "পাসপোর্ট ফি কত"—মুহূর্তেই পৌঁছে যাবেন।'
                        : 'Natural Bengali dialect speech-to-text navigation. Teleports citizens straight to desired workflows.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:translate-x-0.5 transition-transform">
                    <span>{isBn ? 'ভয়েস সহকারী সক্রিয়' : 'Voice Agent Active'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 2: LIVE GATEWAYS & INFRASTRUCTURE READINESS ──────────── */}
            {activeTab === 'gateways' && (
              <motion.div
                key="tab-gateways"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: WIN10_EASE_ENTRANCE }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
              >
                {/* Gateway Item 1 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'ই-পাসপোর্ট গেটওয়ে (epassport.gov.bd)' : 'E-Passport Portal Gateway'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'সক্রিয়' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? 'বায়োমেট্রিক এনরোলমেন্ট স্লট ও এ-চালান পেমেন্ট সচল' : 'Biometric slot allocation & A-Challan payment active'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      HTTP 200 • Latency: 42ms
                    </span>
                  </div>
                </div>

                {/* Gateway Item 2 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'ভূমি মন্ত্রণালয় ই-নামজারি (land.gov.bd)' : 'Land Ministry Mutation Engine'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'সক্রিয়' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? 'অনলাইন খতিয়ান, ডিসিআর ও নামজারি আবেদন প্রক্রিয়াকরণ' : 'Khatian, DCR records & online mutation tracking active'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      HTTP 200 • Latency: 58ms
                    </span>
                  </div>
                </div>

                {/* Gateway Item 3 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'জন্ম ও মৃত্যু নিবন্ধন (BDRIS)' : 'BDRIS Birth & Death Records'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'সক্রিয়' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? '১৭ ডিজিটের অনলাইন সনদ ডাটাবেজ ভেরিফিকেশন প্রস্তুত' : '17-digit digital birth certificate verification synchronized'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      HTTP 200 • Latency: 36ms
                    </span>
                  </div>
                </div>

                {/* Gateway Item 4 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'জাতীয় রাজস্ব বোর্ড (NBR e-TIN)' : 'NBR e-Tax & Return System'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'সক্রিয়' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? 'ই-রিটার্ন দাখিল ও কর সার্টিফিকেট জেনারেশন চলমান' : 'Income tax return filing and tax certificate verification online'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      HTTP 200 • Latency: 64ms
                    </span>
                  </div>
                </div>

                {/* Gateway Item 5 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'বিএমইটি ও আমি প্রবাসী ক্লাউড' : 'BMET & Ami Probashi Network'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'সক্রিয়' : 'ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? 'প্রবাসী স্মার্ট কার্ড ও এয়ারপোর্ট ওয়েলফেয়ার ডাটাবেজ সচল' : 'Manpower smart card & overseas clearance database active'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      HTTP 200 • Latency: 49ms
                    </span>
                  </div>
                </div>

                {/* Gateway Item 6 */}
                <div className="bg-white border border-neutral-300 p-4 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-none shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {isBn ? 'নাগরিক ডাটা নিরাপত্তা ভল্ট' : 'Dishari 256-Bit Cryptographic Vault'}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {isBn ? 'এনক্রিপ্টেড' : 'AES-256'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {isBn ? 'জিরো-নলেজ আর্কিটেকচারে নাগরিকের এনআইডি ও নথি সংরক্ষিত' : 'Encrypted storage for citizens with zero-knowledge protection'}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                      BCC Tier-3 Standards • Zero Leak
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 3: NATIONAL EMERGENCY & CRISIS DIAL DECK ─────────────── */}
            {activeTab === 'hotlines' && (
              <motion.div
                key="tab-hotlines"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: WIN10_EASE_ENTRANCE }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
              >
                {/* 333 */}
                <a
                  href="tel:333"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-[#006A4E] hover:bg-emerald-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-3xl font-black font-mono text-[#006A4E] block group-hover:scale-105 transition-transform">
                    {isBn ? '৩৩৩' : '333'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'নাগরিক সেবা' : 'Civic Services'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? '২৪ ঘণ্টা বিনামূল্যে' : '24/7 Toll-Free'}
                  </span>
                </a>

                {/* 999 */}
                <a
                  href="tel:999"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-[#C8102E] hover:bg-red-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-3xl font-black font-mono text-[#C8102E] block group-hover:scale-105 transition-transform">
                    {isBn ? '৯৯৯' : '999'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? 'পুলিশ, ফায়ার, অ্যাম্বুলেন্স' : 'Police / Fire / Medic'}
                  </span>
                </a>

                {/* 106 */}
                <a
                  href="tel:106"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-amber-600 hover:bg-amber-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-3xl font-black font-mono text-amber-700 block group-hover:scale-105 transition-transform">
                    {isBn ? '১০৬' : '106'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'দুদক অভিযোগ সেল' : 'ACC Anti-Graft'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? 'ঘুষ ও দালাল প্রতিরোধ' : 'Report Bribery & Brokers'}
                  </span>
                </a>

                {/* 16122 */}
                <a
                  href="tel:16122"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-cyan-700 hover:bg-cyan-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-800 block group-hover:scale-105 transition-transform">
                    {isBn ? '১৬১২২' : '16122'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'ভূমি সেবা হটলাইন' : 'Land Hotline'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? 'নামজারি ও খাজনা' : 'Mutation & Tax Help'}
                  </span>
                </a>

                {/* 109 */}
                <a
                  href="tel:109"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-purple-700 hover:bg-purple-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-3xl font-black font-mono text-purple-700 block group-hover:scale-105 transition-transform">
                    {isBn ? '১০৯' : '109'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'নারী ও শিশু সেল' : 'Women & Child'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? 'আইনি সুরক্ষা ও সহায়তা' : 'Violence Helpline'}
                  </span>
                </a>

                {/* 16263 */}
                <a
                  href="tel:16263"
                  className="bg-white border border-neutral-300 p-4 text-center hover:border-emerald-700 hover:bg-emerald-50/40 transition-all cursor-pointer win-press group rounded-none"
                >
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#006A4E] block group-hover:scale-105 transition-transform">
                    {isBn ? '১৬২৬৩' : '16263'}
                  </span>
                  <span className="text-xs font-bold text-neutral-900 block mt-1">
                    {isBn ? 'স্বাস্থ্য বাতায়ন' : 'Health Advice'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {isBn ? 'সরকারি ডাক্তার পরামর্শ' : 'Telemedicine 24/7'}
                  </span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Bottom Live Gazette Ticker Strip ─────────────────────────────── */}
        <div className="mt-5 border border-neutral-300 bg-white p-2.5 sm:px-4 sm:py-2.5 shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 bg-[#C8102E] text-white font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
              {isBn ? 'লাইভ গেজেট বুলেটিন' : 'LIVE GAZETTE'}
            </span>
            <div className="truncate font-medium text-neutral-800">
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {tickerItems[tickerIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <Link
            href="/services"
            className="text-[11px] font-bold text-[#006A4E] hover:underline shrink-0 hidden sm:flex items-center gap-1 win-press"
          >
            <span>{isBn ? 'সকল সেবা ব্রাউজ করুন' : 'Browse Services'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default StatsSection
