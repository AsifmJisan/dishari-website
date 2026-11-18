'use client'

import React, { useState, useRef } from 'react'
import {
  Loader2,
  RefreshCw,
  Maximize2,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react'
import type { AdmitCardFields, HscResultData } from '@/lib/chat-session'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface CaptchaCardProps {
  captchaImage: string
  sessionId: string
  confirmedFields: AdmitCardFields
  isBn: boolean
  variant: 'compact' | 'full'
  onResolved: (result: HscResultData) => void
  onError: (msg: string) => void
  onExpandToFullPage?: () => void
}

export function CaptchaCard({
  captchaImage,
  sessionId,
  confirmedFields,
  isBn,
  variant,
  onResolved,
  onError,
  onExpandToFullPage,
}: CaptchaCardProps) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentImage, setCurrentImage] = useState(captchaImage)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Editable fields with smart defaults from OCR scan
  const [editableRoll, setEditableRoll] = useState(confirmedFields.roll || '')
  const [editableReg, setEditableReg] = useState(confirmedFields.registration || '')

  const inputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || loading) return

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/result/hsc/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          captchaAnswer: answer.trim(),
          roll: editableRoll.trim(),
          registration: editableReg.trim(),
          board: confirmedFields.board || 'dhaka',
          examYear: confirmedFields.examYear || '2017',
          examType: confirmedFields.examType || 'hsc',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || data.error) {
        // Wrong captcha or error from government server
        await refreshCaptcha()
        setErrorMsg(data.error || (isBn ? 'ভুল ক্যাপচা কোড। আবার চেষ্টা করুন।' : 'Incorrect captcha. Please try again.'))
        setAnswer('')
        inputRef.current?.focus()
      } else if (data.result) {
        onResolved(data.result)
      } else {
        throw new Error(isBn ? 'ফলাফল পাওয়া যায়নি।' : 'No result returned.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? 'সার্ভারে সংযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Connection error. Please retry.'))
      await refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const refreshCaptcha = async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/result/hsc/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...confirmedFields,
          roll: editableRoll.trim(),
          registration: editableReg.trim(),
        }),
      })
      const data = await res.json()
      if (data.sessionId && data.captchaImage) {
        setCurrentSessionId(data.sessionId)
        setCurrentImage(data.captchaImage)
        setAnswer('')
      }
    } catch {
      // Keep previous image if refresh fails
    } finally {
      setRefreshing(false)
    }
  }

  const isCompact = variant === 'compact'

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-2 w-full border border-neutral-300 bg-white p-3.5 space-y-3 shadow-xs ${
        isCompact ? '' : 'max-w-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-1.5 text-neutral-800">
          <ShieldCheck className="w-4 h-4 text-[#006A4E]" />
          <span className="text-[12px] font-bold uppercase tracking-wider">
            {isBn ? '🔒 অফিসিয়াল ক্যাপচা যাচাই' : '🔒 Official CAPTCHA Verification'}
          </span>
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          disabled={refreshing || loading}
          className="p-1 text-neutral-400 hover:text-[#006A4E] transition-colors cursor-pointer rounded-none win-press"
          title={isBn ? 'নতুন ক্যাপচা আনুন' : 'Refresh Captcha'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#006A4E]' : ''}`} />
        </button>
      </div>

      {/* Scanned Data Ribbon */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#006A4E]">
          <span>{isBn ? 'অ্যাডমিট কার্ড থেকে প্রস্তুতকৃত তথ্য:' : 'Extracted Details:'}</span>
          <span className="text-[10px] text-neutral-500 font-normal">
            {isBn ? '(প্রয়োজনে এডিট করুন)' : '(Editable)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Roll input with 1-click copy */}
          <div className="bg-white border border-neutral-200 p-1.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[11px] text-neutral-500 font-mono shrink-0">{isBn ? 'রোল:' : 'Roll:'}</span>
              <input
                type="text"
                value={editableRoll}
                onChange={(e) => setEditableRoll(e.target.value)}
                className="w-full text-xs font-bold font-mono text-neutral-900 bg-transparent outline-none focus:text-[#006A4E]"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(editableRoll, 'roll')}
              className="p-1 hover:bg-neutral-100 text-neutral-500 rounded-none cursor-pointer shrink-0 transition-colors"
              title={isBn ? 'রোল কপি করুন' : 'Copy Roll'}
            >
              {copiedField === 'roll' ? (
                <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                  <Check className="w-3 h-3" /> কপি
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Reg input with 1-click copy */}
          <div className="bg-white border border-neutral-200 p-1.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[11px] text-neutral-500 font-mono shrink-0">{isBn ? 'রেজি:' : 'Reg:'}</span>
              <input
                type="text"
                value={editableReg}
                onChange={(e) => setEditableReg(e.target.value)}
                className="w-full text-xs font-bold font-mono text-neutral-900 bg-transparent outline-none focus:text-[#006A4E]"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(editableReg, 'reg')}
              className="p-1 hover:bg-neutral-100 text-neutral-500 rounded-none cursor-pointer shrink-0 transition-colors"
              title={isBn ? 'রেজিস্ট্রেশন নম্বর কপি করুন' : 'Copy Registration'}
            >
              {copiedField === 'reg' ? (
                <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                  <Check className="w-3 h-3" /> কপি
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Exam, Board & Year badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-mono text-neutral-700">
          <span className="bg-white border border-neutral-200 px-2 py-0.5 uppercase">
            {isBn ? 'পরীক্ষা:' : 'Exam:'} <strong className="text-neutral-900">{confirmedFields.examType?.toUpperCase() || 'HSC'}</strong>
          </span>
          <span className="bg-white border border-neutral-200 px-2 py-0.5 capitalize">
            {isBn ? 'বোর্ড:' : 'Board:'} <strong className="text-neutral-900">{confirmedFields.board || 'Dhaka'}</strong>
          </span>
          <span className="bg-white border border-neutral-200 px-2 py-0.5">
            {isBn ? 'সাল:' : 'Year:'} <strong className="text-neutral-900">{confirmedFields.examYear || ''}</strong>
          </span>
          {confirmedFields.group && (
            <span className="bg-white border border-neutral-200 px-2 py-0.5 capitalize">
              {isBn ? 'শাখা:' : 'Group:'} <strong className="text-neutral-900">{confirmedFields.group}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Real Government CAPTCHA Image Container */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-600 block">
          {isBn ? 'নিচের ছবিতে প্রদর্শিত সংখ্যাগুলো টাইপ করুন:' : 'Type the digits shown in the image below:'}
        </label>

        <div className="border border-neutral-300 bg-neutral-100/60 p-2.5 flex items-center justify-center relative min-h-[60px]">
          {currentImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentImage}
              alt="Official Government Captcha"
              className="max-h-14 object-contain select-none shadow-xs border border-neutral-200 bg-white"
              draggable={false}
            />
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#006A4E]" />
              <span>{isBn ? 'ক্যাপচা লোড হচ্ছে...' : 'Loading captcha...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Captcha Input */}
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={isBn ? 'এখানে ক্যাপচা সংখ্যা লিখুন...' : 'Enter captcha digits here...'}
          className="w-full border border-neutral-300 bg-white text-sm text-neutral-900 px-3 py-2 outline-none focus:border-[#006A4E] rounded-none font-mono tracking-widest text-center"
          autoComplete="off"
          spellCheck={false}
          disabled={loading || refreshing}
          autoFocus
        />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 p-2 text-[11px] text-[#C8102E] font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className={`flex gap-2 ${isCompact ? 'flex-col' : 'flex-row'}`}>
        <button
          type="submit"
          disabled={!answer.trim() || loading || refreshing}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 win-press transition-colors rounded-none ${
            answer.trim() && !loading && !refreshing
              ? 'bg-[#006A4E] hover:bg-[#004D38] text-white cursor-pointer shadow-xs'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isBn ? 'সরকারি সার্ভার থেকে অনুসন্ধান হচ্ছে...' : 'Fetching from Govt Server...'}</span>
            </>
          ) : (
            <span>{isBn ? 'ফলাফল অনুসন্ধান করুন' : 'Fetch Official Result'}</span>
          )}
        </button>

        {isCompact && onExpandToFullPage && (
          <button
            type="button"
            onClick={onExpandToFullPage}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold border border-neutral-300 text-neutral-700 hover:border-[#006A4E] hover:text-[#006A4E] win-press transition-colors rounded-none cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isBn ? 'পূর্ণ স্ক্রিন' : 'Full Screen'}</span>
          </button>
        )}
      </div>
    </form>
  )
}
