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
  Clock,
  Compass,
  AlertTriangle,
  Building2,
  Award,
  Bell,
  CheckCheck,
  HeartHandshake,
  Bot,
  QrCode,
} from 'lucide-react'

export default function HowItWorksPage() {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'

  // Scroll tracking for Apple-style sticky scrollytelling
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Manual stage override if user clicks timeline buttons
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [scrollStep, setScrollStep] = useState(0)

  // Stage 1: Jonobondhu Query Simulator State
  const [activeQueryIdx, setActiveQueryIdx] = useState(0)

  // Stage 2: Service Fee Breakdown State
  const [activeServiceIdx, setActiveServiceIdx] = useState(0)

  // Stage 3: Vision Document Type State
  const [visionDocType, setVisionDocType] = useState<'admit' | 'nid' | 'birth'>('admit')
  const [visionLayer, setVisionLayer] = useState<'raw' | 'processed' | 'extracted'>('processed')

  // Stage 4: Opportunity Filter State
  const [activeOppIdx, setActiveOppIdx] = useState(0)

  // Scroll step listener
  scrollYProgress.on('change', (latest) => {
    if (selectedStage !== null) return
    if (latest < 0.2) setScrollStep(0)
    else if (latest < 0.4) setScrollStep(1)
    else if (latest < 0.6) setScrollStep(2)
    else if (latest < 0.8) setScrollStep(3)
    else setScrollStep(4)
  })

  const currentStage = selectedStage !== null ? selectedStage : scrollStep

  // ─── DATA FOR STAGE 1: JONOBONDHU QUERY SIMULATOR ───
  const queryDemos = [
    {
      queryBn: 'বাবার মৃত্যুর পর জমির নামজারি কীভাবে করব?',
      queryEn: 'How to apply for land mutation after father’s death?',
      intent: 'LAND_MUTATION_INHERITANCE',
      serviceNameBn: 'ই-নামজারি (ওয়ারিশি স্বত্ব)',
      serviceNameEn: 'E-Namjari (Inheritance Land Mutation)',
      deptBn: 'ভূমি মন্ত্রণালয় ও সহকারী কমিশনার (ভূমি)',
      deptEn: 'Ministry of Land & AC Land Office',
      officialFee: '৳ ১,১৭০',
      brokerDemand: '৳ ৮,০০০ - ১৫,০০০ (সম্পূর্ণ বেআইনি)',
      savedMoney: '৳ ৬,৮৩০+ সাশ্রয়',
      papersBn: ['ওয়ারিশান সনদপত্র', 'মৃত্যু সনদ', 'খতিয়ান ও পর্চা', 'জাতীয় পরিচয়পত্র'],
      route: '/services/land-mutation',
    },
    {
      queryBn: 'নতুন ই-পাসপোর্ট করতে কত টাকা ফি লাগে এবং কী কী কাগজ লাগবে?',
      queryEn: 'What is the official E-Passport fee and required papers?',
      intent: 'PASSPORT_APPLICATION_REGULAR',
      serviceNameBn: 'ই-পাসপোর্ট আবেদন (৪৮ পাতা, ৫ বছর)',
      serviceNameEn: 'E-Passport Application (48 Pages, 5 Years)',
      deptBn: 'ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর (DIP)',
      deptEn: 'Department of Immigration & Passports',
      officialFee: '৳ ৪,০২৫',
      brokerDemand: '৳ ৮,০০০ - ১২,০০০ (অযৌক্তিক দালাল ফি)',
      savedMoney: '৳ ৪,০০০+ সাশ্রয়',
      papersBn: ['অনলাইন আবেদনপত্রের সামারি', 'স্মার্ট এনআইডি কার্ড', 'ব্যাংক চালান বা পেমেন্ট রসিদ'],
      route: '/services/passport',
    },
    {
      queryBn: 'এসএসসি বা এইচএসসি পরীক্ষার ফলাফল মার্কশিট সহ কীভাবে দেখা যায়?',
      queryEn: 'How to retrieve official SSC/HSC result marksheet?',
      intent: 'EDUCATION_BOARD_RESULT_VERIFICATION',
      serviceNameBn: 'শিক্ষা বোর্ড ডিজিটাল ফলাফল অনুসন্ধান',
      serviceNameEn: 'Official Board Result & Marksheet Ingestion',
      deptBn: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
      deptEn: 'Board of Intermediate & Secondary Education',
      officialFee: '৳ ০ (সম্পূর্ণ বিনামূল্যে)',
      brokerDemand: '৳ ২০০ - ৫০০ (দোকানের অপ্রয়োজনীয় খরচ)',
      savedMoney: '১০০% ফ্রি',
      papersBn: ['প্রবেশপত্রের রোল নম্বর', 'রেজিস্ট্রেশন নম্বর', 'পরীক্ষার সাল ও বোর্ড'],
      route: '/jonobondhu',
    },
  ]

  // ─── DATA FOR STAGE 2: SERVICE DIRECTORY & ANTI-BROKER FEE ───
  const serviceDemos = [
    {
      nameBn: 'ই-পাসপোর্ট আবেদন',
      nameEn: 'E-Passport Application',
      categoryBn: 'নাগরিক পরিচয়',
      officialFee: '৳ ৪,০২৫',
      feeBreakdown: 'আবেদন ফি ৳ ৩,৫০০ + ১৫% ভ্যাট ৳ ৫২৫',
      timeBn: '২১ কার্যদিবস (সাধারণ)',
      antiBrokerTip: 'পাসপোর্ট অফিসে কোনো ফর্ম কেনা বা দালালের হাতে টাকা দেওয়ার নিয়ম নেই। অনলাইনে চালান জমা দিলে অতিরিক্ত এক টাকাও লাগে না।',
      link: '/services/passport',
    },
    {
      nameBn: 'জমির ই-নামজারি ও জমাভাগ',
      nameEn: 'Land Mutation (E-Namjari)',
      categoryBn: 'ভূমি সেবা',
      officialFee: '৳ ১,১৭০',
      feeBreakdown: 'আবেদন ফি ৳ ৭০ + নোটিশ ৳ ৫০ + রেকর্ড সংশোধন ৳ ১,০০০ + ডিসিআর ৳ ৫০',
      timeBn: '২৮ কার্যদিবস',
      antiBrokerTip: 'নামজারি সরকারিভাবে ১,১৭০ টাকায় নির্ধারিত। ইউনিয়ন বা তহশিল অফিসে কোনো বাড়তি দালাল ফি আইনত দণ্ডনীয়।',
      link: '/services/land-mutation',
    },
    {
      nameBn: 'স্মার্ট এনআইডি সংশোধন',
      nameEn: 'Smart NID Correction',
      categoryBn: 'পরিচয়পত্র',
      officialFee: '৳ ২৩০',
      feeBreakdown: 'প্রথমবার সংশোধন ফি ৳ ২০০ + ১৫% ভ্যাট ৳ ৩০',
      timeBn: '১৫-৩০ কার্যদিবস',
      antiBrokerTip: 'নির্বাচন কমিশনের পোর্টালে সরাসরি ফি পরিশোধ করুন। কোনো মধ্যস্বত্বভোগীর প্রয়োজন নেই।',
      link: '/services/nid-correction',
    },
  ]

  // ─── DATA FOR STAGE 4: OPPORTUNITY & WELFARE RADAR ───
  const opportunityDemos = [
    {
      titleBn: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট উপবৃত্তি আবেদন',
      deptBn: 'শিক্ষা মন্ত্রণালয়',
      deadline: '৩১ ডিসেম্বর, ২০২৬',
      urgency: 'জরুরি',
      benefit: 'বার্ষিক ৳ ৫,০০০ - ১০,০০০ আর্থিক অনুদান',
      eligibility: 'মাধ্যমিক ও উচ্চ মাধ্যমিক অসচ্ছল মেধাবী শিক্ষার্থী',
    },
    {
      titleBn: 'সমাজসেবা অধিদপ্তর বিধবা ও স্বামী নিগৃহীতা ভাতা',
      deptBn: 'সমাজকল্যাণ মন্ত্রণালয়',
      deadline: '৩১ ডিসেম্বর, ২০২৬',
      urgency: 'স্বাভাবিক',
      benefit: 'মাসিক ৳ ৫৫০ সরকারি সরাসরি ভাতা',
      eligibility: 'স্থানীয় স্থায়ী বাসিন্দা ও অসচ্ছল বিধবা নারী',
    },
    {
      titleBn: 'পৌরসভা ও ইউনিয়ন ই-ট্রেড লাইসেন্স বার্ষিক নবায়ন',
      deptBn: 'স্থানীয় সরকার বিভাগ',
      deadline: '৩১ ডিসেম্বর, ২০২৬',
      urgency: 'স্বাভাবিক',
      benefit: 'বিলম্ব ফি ও অতিরিক্ত সারচার্জ এড়ানোর সুযোগ',
      eligibility: 'সকল নিবন্ধিত ক্ষুদ্র ও মাঝারি ব্যবসা প্রতিষ্ঠান',
    },
  ]

  // ─── CHAPTERS DATA FOR THE SCROLL TIMELINE ───
  const chapters = [
    {
      id: 0,
      badgeBn: 'স্তম্ভ ১: জনবন্ধু এআই ও অটোনমাস নেভিগেশন',
      badgeEn: 'Pillar 1: Jonobondhu AI & Autonomous Warp',
      titleBn: 'মুখের কথা শুনলেই সঠিক সরকারি পথ ও দালাল-মুক্ত হিসাব',
      titleEn: 'Natural Language Civic Routing & Anti-Broker Logic',
      descBn:
        'আইনের জটিল পরিভাষা সাধারণ মানুষের বোঝার কথা নয়। জনবন্ধু এআই বাংলাদেশের ৬৪ জেলার আঞ্চলিক কথ্য ভাষা ও বাংলিশ প্রশ্ন বুঝতে পারে। যেকোনো স্বাভাবিক বাক্য শুনলেই এটি তাৎক্ষণিক সঠিক সরকারি দপ্তর, আইনের নির্ধারিত ফি (এক টাকাও বেশি নয়) এবং প্রয়োজনীয় কাগজের তালিকা তৈরি করে। এরপর Autonomous Warp HUD-এর মাধ্যমে নাগরিককে সরাসরি নির্ধারিত সেবার পাতায় নিয়ে যায়।',
      descEn:
        'Citizens should never be baffled by government bureaucracy. Jonobondhu AI processes vernacular spoken and written Bangla across 64 regional dialects. With sub-10ms precision, it analyzes the inquiry, reveals the statutory fee, compiles a required document checklist, and initiates Autonomous Warp to route the citizen directly to the destination.',
      highlightsBn: [
        'কথ্য বাংলা ও আঞ্চলিক উপভাষা অনুধাবন',
        'দালাল প্রতিরোধে সরকারি নির্ধারিত ফি ডিসপ্লে',
        'এক ক্লিকে অটোনমাস সার্ভিস রুট লকিং (Warp)',
      ],
      highlightsEn: [
        'Sub-10ms intent parsing for vernacular Bangla',
        'Transparent official statutory fee calculator',
        'Autonomous route teleportation to official forms',
      ],
    },
    {
      id: 1,
      badgeBn: 'স্তম্ভ ২: ৩০+ নাগরিক সেবার ইন্টেলিজেন্ট ডিরেক্টরি',
      badgeEn: 'Pillar 2: 30+ Official Ministry Services',
      titleBn: '১২টি মন্ত্রণালয়ের সেবা এখন এক প্ল্যাটফর্মে, দালাল ছাড়া',
      titleEn: 'Unified Civic Directory Across 12 Ministries',
      descBn:
        'ই-পাসপোর্ট, জমির ই-নামজারি, ড্রাইভিং লাইসেন্স, এনআইডি সংশোধন থেকে শুরু করে ট্রেড লাইসেন্স—১২টির বেশি সরকারি মন্ত্রণালয় ও অধিদপ্তরের সেবাকে দিশারী একক সিস্টেমে একীভূত করেছে। প্রতিটি সেবায় রয়েছে ধাপে ধাপে আবেদনের গাইড, প্রয়োজনীয় দলিলের ধরন (মূল/ফটোকপি) এবং দালালদের অযৌক্তিক দাবি ঠেকানোর সতর্কবার্তা।',
      descEn:
        'From E-Passports and Land Mutation to Smart NID reissue and Trade Licenses, Dishari consolidates 30+ essential services across 12 ministries into one cohesive platform. Every service provides step-by-step submission checklists, exact fee formulas, and anti-corruption advisory notes.',
      highlightsBn: [
        '৩০টির বেশি অফিসিয়াল সরকারি সেবার পূর্ণাঙ্গ গাইড',
        'আইনি ফি ব্রেকডাউন (দালাল ফি থেকে ১০০% মুক্তি)',
        'অনলাইন ও হাইব্রিড আবেদনের সরাসরি সরকারি পোর্টাল লিংক',
      ],
      highlightsEn: [
        'Complete guides for 30+ official government services',
        'Exact fee breakdowns preventing middleman overcharging',
        'Direct verified links to official ministry portals',
      ],
    },
    {
      id: 2,
      badgeBn: 'স্তম্ভ ৩: মাল্টি-ডকুমেন্ট স্মার্ট ভিশন (OCR)',
      badgeEn: 'Pillar 3: Universal Multi-Document Vision',
      titleBn: 'প্রবেশপত্র, এনআইডি ও সনদের নির্ভুল তথ্য উদ্ধার',
      titleEn: 'Optical Preprocessing & Multi-Document Extraction',
      descBn:
        'শুধু প্রবেশপত্র নয়—স্মার্ট এনআইডি, জন্ম নিবন্ধন সনদ, ট্রেড লাইসেন্স কিংবা পরীক্ষার এডমিট কার্ড—দিশারীর কম্পিউটার ভিশন ইঞ্জিন যেকোনো বাংলাদেশি নথি তাৎক্ষণিক স্ক্যান করতে পারে। ৫৪০nm অপটিক্যাল ফিল্টারের মাধ্যমে সিকিউরিটি প্যাটার্ন মুছে ফেলা হয় এবং নির্ধারিত ROI বাক্সে লেজার ফোকাস করে ফরম পূরণের তথ্য স্বয়ংক্রিয়ভাবে প্রস্তুত করা হয়।',
      descEn:
        'Dishari handles more than just academic cards. Its specialized computer vision engine accurately parses National IDs, Birth Certificates, Trade Licenses, and Examination Transcripts. Using 540nm optical subtraction, it eliminates security guilloche waves and isolates identity fields with 99%+ accuracy.',
      highlightsBn: [
        'এনআইডি, জন্ম সনদ, ট্রেড লাইসেন্স ও প্রবেশপত্র সাপোর্ট',
        '৫৪০ ন্যানোমিটার অপটিক্যাল ফিল্টারে ওয়াটারমার্ক মুছে ফেলা',
        'বাংলা ও ইংরেজি সংখ্যাস্বয়ংক্রিয় কনভার্সন ও ফরম ফিলিং',
      ],
      highlightsEn: [
        'Universal support: NID, Birth Certificates, Admit Cards',
        '540nm optical color subtraction eliminating background noise',
        'Automatic Bengali digit normalization and form autofill',
      ],
    },
    {
      id: 3,
      badgeBn: 'স্তম্ভ ৪: সরকারি সুযোগ ও ভাতা রাডার',
      badgeEn: 'Pillar 4: Opportunities & Welfare Radar',
      titleBn: 'ভাতা, উপবৃত্তি ও প্রণোদনার সময়সীমা কখনোই মিস হবে না',
      titleEn: 'Proactive Welfare, Allowance & Deadline Radar',
      descBn:
        'প্রতি বছর তথ্য না জানার কারণে লাখো অসচ্ছল শিক্ষার্থী ও নাগরিক তাদের প্রাপ্য সরকারি উপবৃত্তি, বয়স্ক ভাতা, বিধবা ভাতা বা প্রণোদনা থেকে বঞ্চিত হন। দিশারীর সুযোগ রাডার সরকারি সার্কুলার পর্যবেক্ষণ করে নাগরিকের বয়স ও যোগ্যতার সাথে মিলিয়ে আবেদনের সময়সীমা শেষ হওয়ার আগেই সতর্ক করে দেয়।',
      descEn:
        'Millions of deserving citizens miss out on education stipends, widow allowances, and agricultural subsidies simply because deadlines pass unnoticed. Dishari’s Opportunities Radar proactively matches your citizen profile with active government welfare programs before applications close.',
      highlightsBn: [
        'শিক্ষা সহায়তা, বয়স্ক ও বিধবা ভাতার সক্রিয় ট্র্যাকিং',
        'সময়সীমা শেষ হওয়ার আগে কাউন্টডাউন সতর্কতা',
        'কোনো মধ্যস্বত্বভোগী ছাড়া সরাসরি সরকারি অনুদান প্রাপ্তি',
      ],
      highlightsEn: [
        'Active tracking for stipends, allowances, and youth grants',
        'Urgent deadline countdown and eligibility matching',
        'Direct beneficiary delivery with zero middleman friction',
      ],
    },
    {
      id: 4,
      badgeBn: 'স্তম্ভ ৫: সার্বভৌম নাগরিক লকার ও ভল্ট',
      badgeEn: 'Pillar 5: Sovereign Citizen Locker & Vault',
      titleBn: 'আপনার ব্যক্তিগত তথ্যের মালিক শুধুই আপনি — সম্পূর্ণ এনক্রিপ্টেড',
      titleEn: 'Client-Side AES-256 Encryption & Tamper Proofing',
      descBn:
        'নাগরিকের কোনো পরিচয়পত্র বা পরীক্ষার তথ্য দিশারীর সেন্ট্রাল সার্ভারে বিজ্ঞাপন বা ট্র্যাকিংয়ের জন্য রাখা হয় না। সম্পূর্ণ তথ্য আপনার নিজের ব্রাউজারে AES-256 প্রযুক্তিতে এনক্রিপ্ট হয়ে সংরক্ষিত থাকে। প্রতিটি ডকুমেন্টের সাথে একটি ডিজিটাল SHA-256 টেম্পার-প্রুফ হ্যাশ ও কিউআর সিল যুক্ত থাকে যা অফলাইনেও যেকোনো কর্তৃপক্ষ যাচাই করতে পারে।',
      descEn:
        'Dishari maintains a strict Zero-Knowledge posture. Your sensitive identity records and exam marks are never sold or tracked. Data is encrypted locally on your device with AES-256. Verified marksheets carry an offline-verifiable SHA-256 cryptographic seal that guarantees data integrity.',
      highlightsBn: [
        'সম্পূর্ণ লোকাল ডিভাইস এনক্রিপশন (Zero Server Tracking)',
        'অফলাইনেও কিউআর স্ক্যান করে সত্যতা যাচাইযোগ্য',
        'যেকোনো সময় এক ক্লিকে সম্পূর্ণ তথ্য মুছে ফেলার স্বাধীনতা',
      ],
      highlightsEn: [
        '100% on-device AES-256 encryption with zero server logging',
        'Offline verifiable QR code and tamper-evident signatures',
        'Complete citizen data sovereignty: export or purge anytime',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1917] selection:bg-[#006A4E] selection:text-white font-sans relative">
      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 max-w-5xl mx-auto text-center border-b border-[#E7E5E4]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#006A4E] rounded-none text-xs font-bold font-mono tracking-wider uppercase mb-5"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{isBn ? 'দিশারী প্ল্যাটফর্ম আর্কিটেকচার' : 'The Dishari Platform Ecosystem'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.18]"
        >
          {isBn ? (
            <>
              ১৭ কোটি নাগরিকের ডিজিটাল মুক্তি — <br />
              <span className="text-[#006A4E]">এক নজরে দিশারী যেভাবে কাজ করে</span>
            </>
          ) : (
            <>
              Civic Freedom For 170M Citizens — <br />
              <span className="text-[#006A4E]">The Complete Platform Architecture</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-5 text-base sm:text-lg text-[#78716C] max-w-3xl mx-auto leading-relaxed"
        >
          {isBn
            ? 'মুখের কথায় জটিল আইনগত সমাধান, ৩০+ নাগরিক সেবার দালাল-মুক্ত হিসাব, বহুমুখী ডকুমেন্ট ভিশন স্ক্যানার, সরকারি সুযোগ রাডার এবং সার্বভৌম এনক্রিপ্টেড লকার—সব মিলিয়ে একটি সমন্বিত নাগরিক প্ল্যাটফর্ম।'
            : 'From conversational vernacular AI and 30+ broker-free government services to multi-document vision OCR, welfare radars, and encrypted client vaults — explore how the entire Dishari ecosystem operates.'}
        </motion.p>

        {/* 4 Core Pillars Counter */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          <div className="bg-white border border-[#E7E5E4] p-3.5 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-[#006A4E]">৩০+ সেবা</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? '১২টি সরকারি মন্ত্রণালয় একীভূত' : '30+ Services Across 12 Ministries'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3.5 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-neutral-900">৬৪ জেলা</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'আঞ্চলিক বাংলা উপভাষা সাপোর্ট' : '64 Vernacular Dialects Supported'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3.5 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-neutral-900">১০০% আসল</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'জিরো-মক লাইভ সরকারি এপিআই' : 'Zero Synthetic Mocks Guarantee'}</div>
          </div>
          <div className="bg-white border border-[#E7E5E4] p-3.5 text-left shadow-2xs">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600">৳ ০ দালাল ফি</div>
            <div className="text-[11px] text-[#78716C] mt-0.5">{isBn ? 'মধ্যস্বত্বভোগী দুর্নীতি প্রতিরোধ' : 'Zero Extortion / Anti-Corruption'}</div>
          </div>
        </motion.div>
      </section>

      {/* ─── SCROLLYTELLING SHOWCASE (5 ECOSYSTEM PILLARS) ────────────────── */}
      <section ref={containerRef} className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative">
        {/* Sticky Stage Navigation Bar */}
        <div className="sticky top-20 z-30 mb-8 bg-[#FAFAF8]/95 backdrop-blur-md py-2 border-b border-[#E7E5E4] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
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
                <span className="hidden md:inline">{isBn ? chap.badgeBn.split(':')[1]?.trim() : chap.badgeEn.split(':')[1]?.trim()}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#78716C] shrink-0">
            {isBn ? `স্তম্ভ ${currentStage + 1} / ৫` : `Pillar ${currentStage + 1} of 5`}
          </div>
        </div>

        {/* 2-Column Split: Left = Narrative Chapters, Right = Sticky Live Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Narrative Chapters (Scrollable) */}
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
                      <span>{isBn ? 'এই ফিচারের লাইভ সিমুলেটর দেখুন' : 'Explore Feature Simulator'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Sticky Interactive Stage Visualizer */}
          <div className="lg:col-span-6 sticky top-36 z-20">
            <div className="bg-white border border-[#E7E5E4] p-5 sm:p-6 shadow-sm rounded-none min-h-[500px] flex flex-col justify-between">
              {/* Stage Top Header */}
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006A4E]" />
                  <span className="font-mono text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                    {currentStage === 0 && (isBn ? 'জনবন্ধু এআই ও নেভিগেশন সিমুলেটর' : 'Jonobondhu Intent Simulator')}
                    {currentStage === 1 && (isBn ? 'দালাল-মুক্ত ফি স্বচ্ছতা ইঞ্জিন' : 'Anti-Broker Fee Engine')}
                    {currentStage === 2 && (isBn ? 'মাল্টি-ডকুমেন্ট ভিশন ডিকোডার' : 'Universal Document Vision')}
                    {currentStage === 3 && (isBn ? 'সরকারি সুযোগ ও ভাতা রাডার' : 'Civic Opportunities Radar')}
                    {currentStage === 4 && (isBn ? 'সার্বভৌম এনক্রিপ্টেড লকার' : 'Sovereign Encrypted Locker')}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-emerald-50 text-[#006A4E] px-2 py-0.5 border border-emerald-200">
                  {currentStage === 0 && 'NLP ENGINE'}
                  {currentStage === 1 && 'ANTI-CORRUPTION'}
                  {currentStage === 2 && '540nm OCR'}
                  {currentStage === 3 && 'ACTIVE RADAR'}
                  {currentStage === 4 && 'AES-256 VAULT'}
                </span>
              </div>

              {/* Dynamic Interactive Stage Body */}
              <div className="flex-1 flex flex-col justify-center">
                {/* ── PILLAR 0: JONOBONDHU QUERY SIMULATOR ── */}
                {currentStage === 0 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase block">
                      {isBn ? 'নাগরিক প্রশ্ন নির্বাচন করুন:' : 'Select Citizen Inquiry To Simulate:'}
                    </span>

                    <div className="space-y-1.5">
                      {queryDemos.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => setActiveQueryIdx(qIdx)}
                          className={`w-full text-left p-2.5 text-xs font-medium transition-all border cursor-pointer ${
                            activeQueryIdx === qIdx
                              ? 'bg-emerald-50/80 border-[#006A4E] text-[#1C1917] font-bold shadow-2xs'
                              : 'bg-white border-[#E7E5E4] text-[#78716C] hover:text-[#1C1917]'
                          }`}
                        >
                          &ldquo;{isBn ? q.queryBn : q.queryEn}&rdquo;
                        </button>
                      ))}
                    </div>

                    {/* Result breakdown card */}
                    <div className="p-3.5 bg-[#FAFAF8] border border-[#E7E5E4] space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">{isBn ? 'চিহ্নিত সেবা:' : 'Matched Service:'}</span>
                        <span className="font-bold text-[#006A4E]">{isBn ? queryDemos[activeQueryIdx].serviceNameBn : queryDemos[activeQueryIdx].serviceNameEn}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">{isBn ? 'আইনি সরকারি ফি:' : 'Official Govt Fee:'}</span>
                        <span className="font-black text-neutral-900">{queryDemos[activeQueryIdx].officialFee}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-red-50 p-1.5 border border-red-200">
                        <span className="text-red-700 font-bold">{isBn ? 'দালাল চক্রের দাবি:' : 'Broker Demand:'}</span>
                        <span className="text-red-800 font-extrabold line-through">{queryDemos[activeQueryIdx].brokerDemand}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold pt-0.5 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isBn ? `নাগরিকের সরাসরি ${queryDemos[activeQueryIdx].savedMoney}` : `Citizen Saves ${queryDemos[activeQueryIdx].savedMoney}`}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PILLAR 1: SERVICE DIRECTORY & ANTI-BROKER FEE ── */}
                {currentStage === 1 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase block">
                      {isBn ? 'সেবার স্বচ্ছতা ও আইনি ফি যাচাই:' : 'Verify Official Fees & Procedures:'}
                    </span>

                    <div className="grid grid-cols-3 gap-1.5">
                      {serviceDemos.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveServiceIdx(sIdx)}
                          className={`p-2 text-center text-xs font-bold transition-all border cursor-pointer ${
                            activeServiceIdx === sIdx
                              ? 'bg-[#006A4E] text-white border-[#006A4E]'
                              : 'bg-white border-[#E7E5E4] text-[#78716C] hover:text-[#1C1917]'
                          }`}
                        >
                          <span className="block truncate">{isBn ? s.nameBn : s.nameEn}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-white border border-[#E7E5E4] space-y-2.5 text-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                        <span className="font-mono text-neutral-500">{isBn ? 'নির্ধারিত আইনি ফি:' : 'Official Fee:'}</span>
                        <span className="text-lg font-black text-[#006A4E]">{serviceDemos[activeServiceIdx].officialFee}</span>
                      </div>
                      <div className="text-[11px] text-neutral-600 font-mono">
                        <strong>{isBn ? 'ফি হিসাব:' : 'Fee Formula:'}</strong> {serviceDemos[activeServiceIdx].feeBreakdown}
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>{isBn ? 'দালাল প্রতিরোধ সতর্কতা: ' : 'Anti-Broker Advisory: '}</strong>
                          {serviceDemos[activeServiceIdx].antiBrokerTip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PILLAR 2: UNIVERSAL DOCUMENT VISION ── */}
                {currentStage === 2 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 border border-[#E7E5E4]">
                      {[
                        { key: 'admit', label: isBn ? 'প্রবেশপত্র' : 'Admit Card' },
                        { key: 'nid', label: isBn ? 'স্মার্ট এনআইডি' : 'Smart NID' },
                        { key: 'birth', label: isBn ? 'জন্ম সনদ' : 'Birth Certificate' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setVisionDocType(tab.key as any)}
                          className={`py-1.5 text-center text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                            visionDocType === tab.key
                              ? 'bg-white text-[#006A4E] shadow-2xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="border border-neutral-200 bg-[#FAFAF8] p-4 relative overflow-hidden min-h-[200px] flex flex-col justify-center font-mono text-xs">
                      <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-[2px] bg-[#006A4E] shadow-[0_0_8px_rgba(0,106,78,0.6)] z-10 pointer-events-none"
                      />

                      {visionDocType === 'admit' && (
                        <div className="p-3 bg-white border border-emerald-300 space-y-1">
                          <div className="text-[10px] font-bold text-[#006A4E] uppercase">
                            [ADMIT_CARD_VISION: 540nm Optical Filter Active]
                          </div>
                          <div className="text-neutral-900 font-semibold">
                            নমুনা শিক্ষার্থী (Sample Candidate)
                          </div>
                          <div className="text-neutral-600 text-[11px]">
                            রোল: 102345 | রেজি: 1510987654 | ঢাকা বোর্ড
                          </div>
                        </div>
                      )}

                      {visionDocType === 'nid' && (
                        <div className="p-3 bg-white border border-blue-300 space-y-1">
                          <div className="text-[10px] font-bold text-blue-700 uppercase">
                            [SMART_NID_VISION: 10/17-Digit Extraction]
                          </div>
                          <div className="text-neutral-900 font-semibold">
                            মোঃ আব্দুর রহমান (Mohammad Abdur Rahman)
                          </div>
                          <div className="text-neutral-600 text-[11px]">
                            NID: 19852691234567890 | জন্ম: 12 Jan 1985
                          </div>
                        </div>
                      )}

                      {visionDocType === 'birth' && (
                        <div className="p-3 bg-white border border-amber-300 space-y-1">
                          <div className="text-[10px] font-bold text-amber-700 uppercase">
                            [BIRTH_CERTIFICATE_VISION: 17-Digit BDRIS Registry]
                          </div>
                          <div className="text-neutral-900 font-semibold">
                            তানিয়া আক্তার (Tania Akter)
                          </div>
                          <div className="text-neutral-600 text-[11px]">
                            BR Number: 20022692019012345 | নিবন্ধিত অফিস: ঢাকা উত্তর
                          </div>
                        </div>
                      )}

                      <div className="pt-2 text-[10px] text-neutral-500 flex justify-between">
                        <span>CONFIDENCE: 99.4%</span>
                        <span className="text-emerald-700 font-bold">READY TO AUTO-FILL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PILLAR 3: OPPORTUNITIES & WELFARE RADAR ── */}
                {currentStage === 3 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-neutral-500 uppercase block">
                      {isBn ? 'সক্রিয় সরকারি সুযোগ ও ভাতার রাডার:' : 'Live Opportunities & Subsidies Radar:'}
                    </span>

                    <div className="space-y-2">
                      {opportunityDemos.map((opp, oIdx) => (
                        <div
                          key={oIdx}
                          onClick={() => setActiveOppIdx(oIdx)}
                          className={`p-3 border transition-all cursor-pointer ${
                            activeOppIdx === oIdx
                              ? 'bg-emerald-50/60 border-[#006A4E] shadow-2xs'
                              : 'bg-white border-[#E7E5E4] hover:border-neutral-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                            <span className="text-[#006A4E] font-bold">{opp.deptBn}</span>
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-800 font-bold text-[10px]">
                              শেষ সময়: {opp.deadline}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900">{opp.titleBn}</h4>
                          <p className="text-[11px] text-neutral-600 mt-1 font-mono">{opp.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PILLAR 4: SOVEREIGN ENCRYPTED LOCKER ── */}
                {currentStage === 4 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-4 bg-white border border-[#006A4E] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <span className="text-xs font-bold text-[#006A4E] uppercase flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4 text-[#006A4E]" />
                          <span>{isBn ? 'সার্বভৌম ডিজিটাল ভল্ট' : 'Sovereign Encrypted Locker'}</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5">
                          AES-256 LOCAL
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">এনক্রিপশন স্ট্যাটাস:</span>
                          <span className="text-emerald-700 font-bold">✓ ডিভাইস মেমরিতে সুরক্ষিত</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">ডিজিটাল সিল:</span>
                          <span className="text-neutral-800 text-[10px] truncate max-w-[160px]">
                            SHA-256: d8f3a1...99bc42
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">অফলাইন যাচাইযোগ্যতা:</span>
                          <span className="text-[#006A4E] font-bold">কিউআর সিলমোহর সক্রিয়</span>
                        </div>
                      </div>

                      <div className="p-2 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed font-sans">
                        💡 {isBn
                          ? 'নাগরিক যেকোনো মুহূর্তে সম্পূর্ণ অফলাইনে তার সংরক্ষিত কাগজপত্র দেখতে পারবেন এবং এক ক্লিকে সম্পূর্ণ ডেটা ডিলিট করতে পারবেন।'
                          : 'You retain full ownership. Export certified copies or purge your local storage with one click.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="border-t border-[#E7E5E4] pt-3 mt-4 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#78716C] font-mono">
                  {isBn ? 'দিশারী নাগরিক ইকোসিস্টেম' : 'Dishari Civic Platform'}
                </span>
                <Link
                  href="/jonobondhu"
                  className="font-bold text-[#006A4E] hover:underline flex items-center gap-1"
                >
                  <span>{isBn ? 'জনবন্ধু এআই-তে পরীক্ষা করুন' : 'Test With Jonobondhu AI'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENTO GRID: THE 6 FOUNDATIONS OF DISHARI ─────────────────────── */}
      <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto border-t border-[#E7E5E4]">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-[#006A4E] uppercase tracking-wider">
            {isBn ? 'প্ল্যাটফর্মের মূল শক্তি' : 'Platform Engineering Pillars'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] mt-1.5">
            {isBn ? 'যে ৬টি নীতিতে দিশারী পরিচালিত হয়' : 'The 6 Foundations Powering Dishari'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento Card 1: Anti-Broker Transparency */}
          <div className="md:col-span-2 p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006A4E]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                {isBn ? 'দালাল ও মধ্যস্বত্বভোগী প্রতিরোধ — ১০০% আইনি ফি স্বচ্ছতা' : 'Anti-Corruption & Statutory Fee Transparency'}
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                {isBn
                  ? 'বাংলাদেশে বেশিরভাগ মানুষ অতিরিক্ত টাকা হারান কারণ তারা জানেন না আসল সরকারি ফি কত। দিশারীর প্রতিটি সেবায় সরকারি গেজেটের ফি পরিষ্কারভাবে উল্লেখ থাকে (যেমন: ই-নামজারি ১,১৭০ টাকা, পাসপোর্ট ৪,০২৫ টাকা), যাতে কোনো দালাল অতিরিক্ত টাকা দাবি করতে না পারে।'
                  : 'Citizens lose billions annually simply because legal fees are kept opaque. Dishari publishes exact gazette fee schedules for every service, clearly flagging broker extortion and empowering citizens.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono font-bold text-[#006A4E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>ANTI-BROKER CIVIC SHIELD</span>
            </div>
          </div>

          {/* Bento Card 2: Dialect NLP */}
          <div className="p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                {isBn ? '৬৪ জেলার উপভাষা ও মুখের কথা' : 'Vernacular Dialect NLP'}
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                {isBn
                  ? 'চাটগাঁইয়া, সিলেটি, নোয়াখালী কিংবা সাধারণ বাংলিশ—সব ধরণের আঞ্চলিক কথ্য ভাষা ও ভয়েস ইনপুট নিমিষে সঠিক সরকারি সেবায় রূপান্তর।'
                  : 'Understands phonetic Banglish and regional dialects, translating everyday questions into official legal workflows.'}
              </p>
            </div>
            <div className="pt-3 text-[11px] font-mono text-amber-800 font-bold">
              64 DISTRICTS COVERED
            </div>
          </div>

          {/* Bento Card 3: Multi-Document Vision */}
          <div className="p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006A4E]">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">
                {isBn ? 'মাল্টি-ডকুমেন্ট অপটিক্যাল ভিশন' : 'Universal Document Vision'}
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                {isBn
                  ? 'প্রবেশপত্র, এনআইডি, জন্ম সনদ কিংবা ট্রেড লাইসেন্স—যেকোনো নথির ঝাপসা ছবি থেকেও নির্ভুল তথ্য উদ্ধার ও স্বয়ংক্রিয় ফরম পূরণ।'
                  : '540nm optical channel filtering eliminates red/pink Guilloche patterns, isolating citizen identity fields.'}
              </p>
            </div>
            <div className="pt-3 text-[11px] font-mono text-[#006A4E] font-bold">
              99.4% EXTRACT ACCURACY
            </div>
          </div>

          {/* Bento Card 4: Proactive Welfare Radar */}
          <div className="md:col-span-2 p-6 bg-white border border-[#E7E5E4] shadow-2xs hover:border-[#006A4E] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1917]">
                {isBn ? 'সরকারি সুযোগ ও ভাতা রাডার — প্রাপ্য অধিকার কখনোই মিস হবে না' : 'Proactive Opportunities Radar & Allowance Alerts'}
              </h3>
              <p className="text-sm text-[#78716C] leading-relaxed">
                {isBn
                  ? 'প্রতি বছর হাজারো অসচ্ছল শিক্ষার্থী ও সুবিধাবঞ্চিত নাগরিক সময়মতো তথ্য না জানার কারণে উপবৃত্তি বা ভাতা থেকে বঞ্চিত হন। দিশারীর রাডার সক্রিয় সরকারি সুযোগগুলোকে ট্র্যাক করে আবেদনের সময়সীমা শেষ হওয়ার আগেই নাগরিককে সতর্ক করে।'
                  : 'Citizens frequently miss out on government stipends, social safety nets, and agricultural subsidies. Dishari tracks active circulars, calculating deadlines and matching eligible citizens proactively.'}
              </p>
            </div>
            <div className="pt-4 text-xs font-mono font-bold text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>PROACTIVE CITIZEN RADAR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 bg-white border-2 border-[#006A4E] shadow-sm relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917]">
            {isBn ? 'আজই দিশারীর পূর্ণাঙ্গ নাগরিক সেবা গ্রহণ করুন' : 'Experience the Dishari Civic Platform Today'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#78716C] max-w-lg mx-auto leading-relaxed">
            {isBn
              ? 'যেকোনো সেবা, আবেদন প্রস্তুতি, সুযোগ অনুসন্ধান কিংবা সরকারি জটিল প্রশ্ন নিয়ে জনবন্ধুর সাথে কথা বলুন।'
              : 'Ask any civic question, explore 30+ official services, or verify your documents with our 24/7 assistant.'}
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
              <span>{isBn ? 'সব ৩০+ সরকারি সেবা দেখুন' : 'Explore All 30+ Services'}</span>
            </Link>

            <Link
              href="/opportunities"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-[#1C1917] border border-[#E7E5E4] font-bold text-sm tracking-wide transition-all win-press"
            >
              <span>{isBn ? 'সরকারি সুযোগ রাডার' : 'Opportunities Radar'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
