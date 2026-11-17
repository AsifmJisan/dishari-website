'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FolderLock,
  ClipboardList,
  BellRing,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Download,
  Calendar,
  AlertTriangle,
  Layers,
  FileCheck2,
  Printer,
  ChevronRight,
  FileText,
  UserCheck,
  Building2,
  CheckCircle,
  HelpCircle,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { t } from '@/lib/translations'
import { cn, CATEGORY_META } from '@/lib/utils'
import {
  fetchDocuments,
  fetchApplications,
  fetchDeadlines,
  fetchAllServices,
  type UserProfile
} from '@/lib/api'
import type { CitizenDocument, CitizenApplication, CitizenDeadline, Service } from '@/types'
import { CategoryGrid } from './CategoryGrid'
import { FeaturedServices } from './FeaturedServices'

interface PersonalizedFeedProps {
  user: UserProfile
}

export function PersonalizedFeed({ user }: PersonalizedFeedProps) {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'

  const [activeView, setActiveView] = useState<'feed' | 'catalog'>('feed')
  const [documents, setDocuments] = useState<CitizenDocument[]>([])
  const [applications, setApplications] = useState<CitizenApplication[]>([])
  const [deadlines, setDeadlines] = useState<CitizenDeadline[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize and load personalized citizen data
  useEffect(() => {
    // 1. Immediately hydrate from persistent local caches for zero-latency load
    try {
      const cachedDocs = localStorage.getItem('dishari_cached_docs')
      if (cachedDocs) {
        const parsed = JSON.parse(cachedDocs)
        if (Array.isArray(parsed) && parsed.length > 0) setDocuments(parsed)
      }

      const cachedApps = localStorage.getItem('dishari_cached_apps')
      if (cachedApps) {
        const parsed = JSON.parse(cachedApps)
        if (Array.isArray(parsed) && parsed.length > 0) setApplications(parsed)
      }
    } catch (e) {
      console.warn('Cache hydration note:', e)
    }

    // 2. Fetch fresh live data from API / server
    let isMounted = true
    async function loadData() {
      try {
        const [docsRes, appsRes, deadlinesRes, servicesRes] = await Promise.all([
          fetchDocuments(user.id),
          fetchApplications(user.id),
          fetchDeadlines(),
          fetchAllServices()
        ])

        if (isMounted) {
          if (docsRes && docsRes.length > 0) setDocuments(docsRes)
          if (appsRes && appsRes.length > 0) setApplications(appsRes)
          setDeadlines(deadlinesRes || [])
          setServices(servicesRes || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading personalized feed data:', err)
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [user.id])

  // Core Document Readiness Checklist
  const essentialDocTypes = useMemo(() => {
    return [
      {
        type: 'nid_front',
        labelBn: 'জাতীয় পরিচয়পত্র (NID)',
        labelEn: 'National ID Card (NID)',
        descBn: 'ভোটার আইডি / স্মার্ট কার্ডের মূল কপি',
        descEn: 'Smart Card or Regular NID'
      },
      {
        type: 'birth_certificate',
        labelBn: 'জন্ম নিবন্ধন সনদ',
        labelEn: 'Digital Birth Certificate',
        descBn: 'BDRIS ডিজিটাল ১৭ ডিজিট অনলাইন সনদ',
        descEn: '17-digit digital verified certificate'
      },
      {
        type: 'photo',
        labelBn: 'পাসপোর্ট সাইজ ছবি',
        labelEn: 'Passport Size Photo',
        descBn: 'সাদা ব্যাকগ্রাউন্ডযুক্ত সাম্প্রতিক রঙিন ছবি',
        descEn: 'Recent color photo with white background'
      },
      {
        type: 'tin_certificate',
        labelBn: 'ই-টিআইএন সনদ (TIN)',
        labelEn: 'e-TIN Tax Certificate',
        descBn: 'জাতীয় রাজস্ব বোর্ডের ১২ ডিজিট টিআইএন',
        descEn: '12-digit NBR tax certificate'
      }
    ]
  }, [])

  // Calculate vault completeness percentage
  const uploadedDocTypeSet = useMemo(() => {
    return new Set(documents.map((d) => d.doc_type))
  }, [documents])

  const readinessPercent = useMemo(() => {
    const matchedCount = essentialDocTypes.filter((d) => uploadedDocTypeSet.has(d.type as any)).length
    return Math.round((matchedCount / essentialDocTypes.length) * 100)
  }, [essentialDocTypes, uploadedDocTypeSet])

  // Generate .ics calendar download
  const handleDownloadCalendar = (d: CitizenDeadline) => {
    const title = isBn ? d.title_bn : d.title_en
    const desc = isBn ? d.description_bn : d.description_en
    const cleanDate = d.deadline.replace(/[^0-9]/g, '')
    const startDate = cleanDate.length === 8 ? cleanDate : '20261130'

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dishari Civic Assistant//Feed//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title} [দিশারী সরকারি ডেডলাইন]`,
      `DESCRIPTION:${desc} \\nঅফিসিয়াল পোর্টাল: ${d.official_link || 'https://dishari.gov.bd'}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${startDate}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${title} এর সরকারি সময়সীমা ঘনিয়ে আসছে!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `dishari-deadline-${d.id}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Print application docket
  const handlePrintDocket = (app: CitizenApplication) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const dateFormatted = new Date(app.submitted_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')
    const applicant = app.applicant_data || {}
    const attachedDocs = app.documents_attached || ['জাতীয় পরিচয়পত্র', 'পাসপোর্ট সাইজ ছবি']

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}">
        <head>
          <meta charset="utf-8">
          <title>${app.docket_id} - ${isBn ? app.service_name_bn : app.service_name_en}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Times New Roman', serif; color: #18181b; padding: 15px; }
            .header { border-bottom: 2px solid #006A4E; padding-bottom: 10px; margin-bottom: 15px; text-align: center; }
            .title { font-size: 20px; font-weight: bold; color: #006A4E; text-transform: uppercase; }
            .docket { font-family: monospace; font-size: 14px; margin-top: 5px; }
            .section { margin-top: 15px; border-top: 1px solid #e4e4e7; padding-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #d4d4d8; padding: 6px 10px; font-size: 13px; text-align: left; }
            th { background: #f4f4f5; font-weight: bold; width: 35%; }
            .footer { margin-top: 25px; font-size: 11px; text-align: center; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">গণপ্রজাতন্ত্রী বাংলাদেশ — নাগরিক সেবা আবেদন স্লিপ</div>
            <div class="docket">ডকেট আইডি: <strong>${app.docket_id}</strong> | তারিখ: ${dateFormatted}</div>
          </div>
          <div class="section">
            <h3>আবেদন সংক্রান্ত তথ্য</h3>
            <table>
              <tr><th>সেবার নাম</th><td>${isBn ? app.service_name_bn : app.service_name_en}</td></tr>
              <tr><th>আবেদনকারীর নাম</th><td>${applicant.fullName || user.full_name}</td></tr>
              <tr><th>মোবাইল নম্বর</th><td>${applicant.phone || user.phone}</td></tr>
              <tr><th>স্ট্যাটাস</th><td>${app.status.toUpperCase()}</td></tr>
              <tr><th>সংযুক্ত নথি</th><td>${attachedDocs.join(', ')}</td></tr>
            </table>
          </div>
          <div class="footer">
            দিশারী নাগরিক ডিজিটাল সহকারী প্ল্যাটফর্ম থেকে সরাসরি মুদ্রিত। ট্র্যাকিং ওয়েবসাইট: https://dishari.gov.bd
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Recommended Priority Services for Citizens
  const priorityServices = useMemo(() => {
    if (!services || services.length === 0) return []
    // Preferred services based on common citizen administrative milestones
    const prioritySlugs = [
      'e-passport',
      'nid-correction',
      'birth-registration',
      'driving-license',
      'tin-certificate',
      'trade-license'
    ]
    const matched = services.filter((s) => prioritySlugs.includes(s.slug))
    return matched.length > 0 ? matched : services.slice(0, 6)
  }, [services])

  return (
    <section className="bg-[#F5F6F8] border-t-2 border-neutral-300 py-10 lg:py-14 px-4 transition-all">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── 1. Feed Header & Citizen Identity Broadside ───────────────────── */}
        <div className="bg-white border border-neutral-200 p-5 sm:p-7 rounded-none shadow-xs border-l-4 border-l-[#006A4E] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-[11px] font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none uppercase tracking-wider">
                {isBn ? 'ব্যক্তিগত নাগরিক ফিড' : 'Personalized Citizen Feed'}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-none">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006A4E]" />
                <span>{isBn ? 'সক্রিয় ডিজিটাল সেশন' : 'Active Session'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight">
              {isBn ? 'স্বাগতম' : 'Welcome'}, {user.full_name || (isBn ? 'নাগরিক' : 'Citizen')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
              {isBn
                ? 'আপনার সংরক্ষিত নথিপত্র, চলমান আবেদন এবং অগ্রাধিকারমূলক নাগরিক সেবার রিয়েলটাইম আপডেট।'
                : 'Real-time updates on your stored documents, active dockets, and personalized civic services.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* View Mode Toggle: Personalized Feed vs Full Catalog */}
            <div className="inline-flex border border-neutral-300 bg-neutral-100 p-0.5 rounded-none">
              <button
                type="button"
                onClick={() => setActiveView('feed')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none win-press',
                  activeView === 'feed'
                    ? 'bg-[#006A4E] text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
                )}
              >
                {isBn ? 'ব্যক্তিগত ফিড' : 'Personal Feed'}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('catalog')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none win-press',
                  activeView === 'catalog'
                    ? 'bg-[#006A4E] text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60'
                )}
              >
                {isBn ? 'সকল সেবা ক্যাটালগ' : 'All Services'}
              </button>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-neutral-800 bg-neutral-900 hover:bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors win-press"
            >
              <span>{isBn ? 'সম্পূর্ণ ড্যাশবোর্ড' : 'Full Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ─── If User Toggled to "All Catalog" View ────────────────────────── */}
        {activeView === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border border-neutral-200 bg-white p-4 rounded-none flex items-center justify-between">
              <div className="text-xs text-neutral-600 font-mono">
                {isBn
                  ? 'দিশারী প্ল্যাটফর্মের সকল ক্যাটাগরি ও নাগরিক সেবাসমূহ প্রদর্শিত হচ্ছে।'
                  : 'Displaying complete category directory and government services catalog.'}
              </div>
              <button
                onClick={() => setActiveView('feed')}
                className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isBn ? '← আবার ব্যক্তিগত ফিডে ফিরুন' : '← Return to Personal Feed'}</span>
              </button>
            </div>
            <CategoryGrid />
            <FeaturedServices />
          </div>
        )}

        {/* ─── Main Personalized Feed View ─────────────────────────────────── */}
        {activeView === 'feed' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* ─── 2. Citizen Quick Command Deck (4 Action Tiles) ─────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tile 1: Document Vault */}
              <Link
                href="/dashboard?tab=locker"
                className="bg-white border border-neutral-200 p-4 rounded-none shadow-xs border-t-3 border-t-[#006A4E] hover:border-neutral-400 transition-all flex flex-col justify-between group win-press"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                      {isBn ? 'ডিজিটাল লকার' : 'Document Vault'}
                    </span>
                    <FolderLock className="w-4 h-4 text-[#006A4E] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 font-mono">
                    {documents.length}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      {isBn ? 'টি নথি সংরক্ষিত' : 'files stored'}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] text-neutral-600 mb-1 font-mono">
                      <span>{isBn ? 'প্রস্তুতি সূচক:' : 'Readiness:'}</span>
                      <strong className="text-[#006A4E]">{readinessPercent}%</strong>
                    </div>
                    <div className="w-full bg-neutral-200 h-1.5 rounded-none overflow-hidden">
                      <div
                        className="bg-[#006A4E] h-full transition-all duration-500"
                        style={{ width: `${readinessPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#006A4E]">
                  <span>{isBn ? 'নথি দেখুন ও আপলোড করুন' : 'Manage Vault'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Tile 2: Active Applications */}
              <Link
                href="/dashboard?tab=applications"
                className="bg-white border border-neutral-200 p-4 rounded-none shadow-xs border-t-3 border-t-purple-600 hover:border-neutral-400 transition-all flex flex-col justify-between group win-press"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                      {isBn ? 'চলমান আবেদন' : 'Active Dockets'}
                    </span>
                    <ClipboardList className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 font-mono">
                    {applications.length}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      {isBn ? 'টি কার্যপত্র' : 'active dockets'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {applications.length > 0
                      ? isBn
                        ? 'আপনার সরকারি পোর্টাল আবেদনগুলো ট্র্যাকিং করুন।'
                        : 'Track submissions and check verification milestones.'
                      : isBn
                      ? 'এখনও কোনো আবেদন জমা দেওয়া হয়নি।'
                      : 'No active applications in queue.'}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>{isBn ? 'আবেদন তালিকা দেখুন' : 'View Dockets'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Tile 3: Impending Deadlines */}
              <Link
                href="/dashboard?tab=deadlines"
                className="bg-white border border-neutral-200 p-4 rounded-none shadow-xs border-t-3 border-t-amber-500 hover:border-neutral-400 transition-all flex flex-col justify-between group win-press"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                      {isBn ? 'সরকারি ডেডলাইন' : 'Civic Deadlines'}
                    </span>
                    <BellRing className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 font-mono">
                    {deadlines.filter((d) => d.urgency === 'high').length > 0 ? (
                      <span className="text-amber-700 font-bold">
                        {deadlines.filter((d) => d.urgency === 'high').length}{' '}
                        <span className="text-xs font-normal text-neutral-500">
                          {isBn ? 'জরুরি সময়সীমা' : 'urgent alerts'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-neutral-800">
                        {deadlines.length}{' '}
                        <span className="text-xs font-normal text-neutral-500">
                          {isBn ? 'টি নোটিফিকেশন' : 'notifications'}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed truncate">
                    {deadlines[0]
                      ? isBn
                        ? deadlines[0].title_bn
                        : deadlines[0].title_en
                      : isBn
                      ? 'আয়কর রিটার্ন ৩০ নভেম্বর'
                      : 'Tax return Nov 30'}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>{isBn ? 'ক্যালেন্ডার ও সময়সীমা' : 'Check Dates'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Tile 4: Opportunities & Subsidies */}
              <Link
                href="/opportunities"
                className="bg-white border border-neutral-200 p-4 rounded-none shadow-xs border-t-3 border-t-emerald-600 hover:border-neutral-400 transition-all flex flex-col justify-between group win-press"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                      {isBn ? 'সরকারি সুযোগ' : 'Civic Grants'}
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 font-mono">
                    ৪+{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      {isBn ? 'অনুমোদিত সহায়তা' : 'subsidies & grants'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {isBn
                      ? 'কৃষি প্রণোদনা, যুব কর্মসংস্থান ও শিক্ষার্থী উপবৃত্তি।'
                      : 'Agricultural support, youth micro-credit & stipends.'}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>{isBn ? 'সুযোগ এক্সপ্লোর করুন' : 'Find Opportunities'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>

            {/* ─── 3. Active Applications Radar (চলমান আবেদন ডকেট ট্র্যাকার) ───── */}
            <div className="bg-white border border-neutral-200 p-5 sm:p-6 rounded-none shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-neutral-200 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-purple-50 border border-purple-200 flex items-center justify-center rounded-none text-purple-700">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-neutral-900">
                      {isBn ? 'আমার চলমান সরকারি আবেদনসমূহ' : 'My Active Government Applications'}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {isBn
                        ? 'আপনার তৈরি করা আবেদন ডকেট এবং অফিশিয়াল পোর্টাল জমা স্ট্যাটাস'
                        : 'Your prepared application dockets and official portal submission progress'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard?tab=applications"
                  className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1 self-start sm:self-auto win-press"
                >
                  <span>{isBn ? 'সকল আবেদন দেখুন' : 'View All Dockets'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-neutral-300 bg-neutral-50 p-6">
                  <ClipboardList className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-neutral-800">
                    {isBn ? 'কোনো আবেদন চলমান নেই' : 'No Active Applications'}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                    {isBn
                      ? 'নিচে আপনার জন্য প্রস্তাবিত সেবা থেকে পছন্দ করে ডিজিটাল লকারের সাহায্যে ১-ক্লিকে আবেদন শুরু করুন।'
                      : 'Choose a service from the recommended list below to prepare your docket in one click.'}
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#004D38] transition-colors win-press"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নতুন আবেদন শুরু করুন' : 'Start an Application'}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => {
                    const statusBadgeClass =
                      app.status === 'ready'
                        ? 'bg-emerald-50 text-[#006A4E] border-emerald-300'
                        : app.status === 'processing'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : app.status === 'approved'
                        ? 'bg-green-100 text-green-900 border-green-300'
                        : 'bg-blue-50 text-blue-800 border-blue-300'

                    const statusLabel =
                      app.status === 'ready'
                        ? isBn
                          ? 'প্রস্তুত (জমা দিতে পারেন)'
                          : 'Ready for Portal'
                        : app.status === 'processing'
                        ? isBn
                          ? 'যাচাই প্রক্রিয়াধীন'
                          : 'In Verification'
                        : app.status === 'approved'
                        ? isBn
                          ? 'অনুমোদিত'
                          : 'Approved'
                        : isBn
                        ? 'জমা দেওয়া হয়েছে'
                        : 'Submitted'

                    return (
                      <div
                        key={app.id || app.docket_id}
                        className="border border-neutral-200 bg-white p-4 rounded-none hover:border-neutral-400 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 win-press"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                              {app.docket_id}
                            </span>
                            <span
                              className={cn(
                                'text-[11px] font-bold px-2 py-0.5 border uppercase tracking-wider',
                                statusBadgeClass
                              )}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm sm:text-base text-neutral-900 truncate">
                            {isBn ? app.service_name_bn : app.service_name_en}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                            <span>
                              {isBn ? 'তারিখ:' : 'Date:'}{' '}
                              {new Date(app.submitted_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                            </span>
                            <span>•</span>
                            <span>
                              {isBn ? 'সংযুক্ত নথি:' : 'Attached:'}{' '}
                              {app.documents_attached ? app.documents_attached.length : 2}{' '}
                              {isBn ? 'টি' : 'files'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handlePrintDocket(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-none cursor-pointer win-press"
                          >
                            <Printer className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{isBn ? 'প্রিন্ট স্লিপ' : 'Print Slip'}</span>
                          </button>

                          {app.official_portal_url ? (
                            <a
                              href={app.official_portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#006A4E] bg-[#006A4E] hover:bg-[#004D38] text-white text-xs font-bold rounded-none cursor-pointer win-press"
                            >
                              <span>{isBn ? 'অফিসিয়াল পোর্টাল' : 'Official Portal'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <Link
                              href={`/services/${app.service_slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#006A4E] bg-[#006A4E] hover:bg-[#004D38] text-white text-xs font-bold rounded-none cursor-pointer win-press"
                            >
                              <span>{isBn ? 'সেবা বিস্তারিত' : 'Service Info'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ─── 4. Document Vault Readiness Shelf (লকার নথি প্রস্তুতি মিটার) ─ */}
            <div className="bg-white border border-neutral-200 p-5 sm:p-6 rounded-none shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-neutral-200 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-emerald-50 border border-emerald-200 flex items-center justify-center rounded-none text-[#006A4E]">
                    <FolderLock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-neutral-900">
                      {isBn ? 'ডিজিটাল লকার নথি প্রস্তুতি মিটার' : 'Digital Vault Readiness Meter'}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {isBn
                        ? 'যেকোনো সরকারি সেবায় ১-ক্লিক অটো-ফিল ও ব্যাগ চেকার ব্যবহারের জন্য প্রয়োজনীয় নথি'
                        : 'Essential citizen documents required for instant 1-click service applications'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="font-mono text-xs font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                    {readinessPercent}% {isBn ? 'প্রস্তুত' : 'Ready'}
                  </span>
                  <Link
                    href="/dashboard?tab=locker"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#004D38] win-press"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isBn ? 'নথি যোগ করুন' : 'Add Document'}</span>
                  </Link>
                </div>
              </div>

              {/* 4 Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {essentialDocTypes.map((item) => {
                  const isUploaded = uploadedDocTypeSet.has(item.type as any)

                  return (
                    <div
                      key={item.type}
                      className={cn(
                        'border p-3.5 rounded-none transition-colors flex flex-col justify-between',
                        isUploaded
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-neutral-200 bg-neutral-50/60'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                            {item.type}
                          </span>
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006A4E]">
                              <CheckCircle2 className="w-4 h-4 text-[#006A4E]" />
                              <span>{isBn ? 'সংরক্ষিত' : 'Saved'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700">
                              {isBn ? 'প্রয়োজন' : 'Missing'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                          {isBn ? item.labelBn : item.labelEn}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                          {isBn ? item.descBn : item.descEn}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-200/60">
                        {isUploaded ? (
                          <Link
                            href="/dashboard?tab=locker"
                            className="text-xs font-bold text-[#006A4E] hover:underline flex items-center justify-between"
                          >
                            <span>{isBn ? 'লকারে দেখুন' : 'View in Vault'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard?tab=locker"
                            className="text-xs font-bold text-amber-800 hover:underline flex items-center justify-between"
                          >
                            <span>{isBn ? '+ আপলোড করুন' : '+ Upload Now'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ─── 5. Personalized Recommended Citizen Services ───────────────── */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-neutral-300 gap-2">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight">
                    {isBn ? 'আপনার জন্য প্রস্তাবিত নাগরিক সেবা' : 'Recommended Civic Services for You'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    {isBn
                      ? 'লকারের সংরক্ষিত নথির ভিত্তিতে দ্রুত আবেদন ও তথ্য চেকলিস্ট'
                      : 'High-priority administrative services with 1-click checklist and requirements'}
                  </p>
                </div>

                <Link
                  href="/services"
                  className="text-xs font-bold text-[#006A4E] hover:underline flex items-center gap-1 self-start sm:self-auto win-press"
                >
                  <span>{isBn ? 'সকল ৩০টি সেবা দেখুন' : 'Explore All 30 Services'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priorityServices.map((service) => {
                  const catMeta = CATEGORY_META[service.category]

                  // Check if citizen has the required documents for this service
                  const hasNid = uploadedDocTypeSet.has('nid_front')
                  const hasBirth = uploadedDocTypeSet.has('birth_certificate')
                  const hasPhoto = uploadedDocTypeSet.has('photo')

                  const isPassport = service.slug.includes('passport')
                  const isNid = service.slug.includes('nid')
                  const isBirth = service.slug.includes('birth')

                  let matchBadge = isBn ? 'সকল নথি যাচাইযোগ্য' : 'Standard Checklist'
                  let matchColor = 'bg-neutral-100 text-neutral-700 border-neutral-200'

                  if (isNid && hasNid) {
                    matchBadge = isBn ? 'লকারে NID প্রস্তুত আছে' : 'NID ready in locker'
                    matchColor = 'bg-emerald-50 text-[#006A4E] border-emerald-300'
                  } else if (isBirth && hasBirth) {
                    matchBadge = isBn ? 'জন্ম সনদ প্রস্তুত' : 'Birth Cert ready'
                    matchColor = 'bg-emerald-50 text-[#006A4E] border-emerald-300'
                  } else if (isPassport && hasNid && hasPhoto) {
                    matchBadge = isBn ? 'পাসপোর্টের প্রয়োজনীয় নথি প্রস্তুত' : 'Passport docs ready'
                    matchColor = 'bg-emerald-50 text-[#006A4E] border-emerald-300'
                  }

                  return (
                    <div
                      key={service.slug}
                      className="bg-white border border-neutral-200 p-5 rounded-none shadow-xs hover:border-[#006A4E] transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 border rounded-none uppercase tracking-wider',
                              catMeta?.badgeBg || 'bg-neutral-100 text-neutral-800'
                            )}
                          >
                            {isBn ? catMeta?.name_bn : catMeta?.name_en}
                          </span>

                          <span className={cn('text-[10px] font-mono font-bold px-2 py-0.5 border', matchColor)}>
                            {matchBadge}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-neutral-900 group-hover:text-[#006A4E] transition-colors leading-snug">
                            {isBn ? service.name_bn : service.name_en}
                          </h4>
                          <p className="font-mono text-xs text-neutral-500 mt-1 truncate">
                            {isBn ? service.department_bn : service.department_en}
                          </p>
                        </div>

                        {/* Fee and processing time */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs font-mono">
                          <div className="bg-neutral-50 p-2 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block">
                              {isBn ? 'সরকারি ফি:' : 'Official Fee:'}
                            </span>
                            <strong className="text-neutral-900">{service.fee}</strong>
                          </div>
                          <div className="bg-neutral-50 p-2 border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 block">
                              {isBn ? 'সময়কাল:' : 'Time:'}
                            </span>
                            <strong className="text-neutral-900 truncate block">
                              {service.processing_time_bn}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/services/${service.slug}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-[#006A4E] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors win-press"
                        >
                          <span>{isBn ? 'আবেদন নির্দেশিকা ও চেকলিস্ট' : 'Start / Checklist'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ─── 6. Urgent Civic Deadlines & Reminders ──────────────────────── */}
            <div className="border border-amber-300 bg-amber-50/50 p-5 sm:p-6 rounded-none shadow-xs border-l-4 border-l-amber-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-amber-200/80 gap-2">
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-neutral-900">
                      {isBn ? 'আসন্ন আয়কর ও সরকারি সময়সীমা' : 'Impending Civic Deadlines & Radar'}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {isBn
                        ? 'সময়মতো আবেদন জমা দিয়ে বিলম্ব ফি ও জরিমানা এড়িয়ে চলুন'
                        : 'Submit on time to avoid penalties and administrative delays'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard?tab=deadlines"
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 self-start sm:self-auto win-press"
                >
                  <span>{isBn ? 'সব ডেডলাইন দেখুন' : 'View Full Schedule'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deadlines.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-amber-200 p-4 rounded-none shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
                          {isBn ? 'সময়সীমা:' : 'Deadline:'} {item.deadline}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 uppercase">
                          {item.urgency === 'high' ? (isBn ? 'জরুরি' : 'Urgent') : (isBn ? 'গুরুত্বপূর্ণ' : 'Important')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                        {isBn ? item.title_bn : item.title_en}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {isBn ? item.description_bn : item.description_en}
                      </p>

                      <div className="mt-3 text-[11px] text-neutral-500 font-mono">
                        <span>{isBn ? 'প্রয়োজনীয় নথি:' : 'Required:'} </span>
                        <strong>{item.required_docs.join(', ')}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleDownloadCalendar(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#006A4E] hover:underline cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ক্যালেন্ডারে যোগ করুন' : 'Add to Calendar'}</span>
                      </button>

                      {item.official_link && (
                        <a
                          href={item.official_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-neutral-900"
                        >
                          <span>{isBn ? 'অফিসিয়াল পোর্টাল' : 'Portal'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
