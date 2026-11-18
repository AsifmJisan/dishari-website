'use client'

import React, { useState } from 'react'
import { Loader2, BookOpen, Save, ExternalLink } from 'lucide-react'
import type { HscResultData } from '@/lib/chat-session'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ResultCardProps {
  result: HscResultData
  variant: 'compact' | 'full'
  isBn: boolean
  userId?: number
  onSaveToLocker?: () => void
}

function gradeColorClass(grade: string): string {
  if (grade === 'A+') return 'bg-emerald-600 text-white'
  if (grade === 'A')  return 'bg-green-600 text-white'
  if (grade === 'A-') return 'bg-green-500 text-white'
  if (grade === 'B')  return 'bg-blue-600 text-white'
  if (grade === 'C')  return 'bg-yellow-500 text-white'
  if (grade === 'D')  return 'bg-orange-500 text-white'
  return 'bg-[#C8102E] text-white' // F
}

const BOARD_LABEL: Record<string, { bn: string; en: string }> = {
  dhaka:      { bn: 'ঢাকা',       en: 'Dhaka' },
  chittagong: { bn: 'চট্টগ্রাম',   en: 'Chittagong' },
  rajshahi:   { bn: 'রাজশাহী',    en: 'Rajshahi' },
  comilla:    { bn: 'কুমিল্লা',    en: 'Comilla' },
  barishal:   { bn: 'বরিশাল',     en: 'Barishal' },
  sylhet:     { bn: 'সিলেট',      en: 'Sylhet' },
  dinajpur:   { bn: 'দিনাজপুর',   en: 'Dinajpur' },
  mymensingh: { bn: 'ময়মনসিংহ',  en: 'Mymensingh' },
  madrasah:   { bn: 'মাদ্রাসা',   en: 'Madrasah' },
  technical:  { bn: 'কারিগরি',    en: 'Technical' },
}

function boardLabel(board: string, isBn: boolean): string {
  return isBn ? (BOARD_LABEL[board]?.bn ?? board) : (BOARD_LABEL[board]?.en ?? board)
}

export function ResultCard({ result, variant, isBn, userId, onSaveToLocker }: ResultCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const isCompact = variant === 'compact'
  const passed = result.resultStatus === 'passed'

  const handleSaveToLocker = async () => {
    if (saving || saved) return
    setSaving(true)
    setSaveError('')
    try {
      const json = JSON.stringify(result)
      const b64 = btoa(unescape(encodeURIComponent(json)))
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 1,
          docType: 'exam_result',
          fileName: `HSC_Result_${result.roll}_${result.examYear}.json`,
          fileSize: 0,
          mimeType: 'application/json',
          fileData: `data:application/json;base64,${b64}`,
          extractedMeta: result,
        }),
      })
      if (!res.ok) throw new Error('upload failed')
      setSaved(true)
      onSaveToLocker?.()
    } catch {
      setSaveError(isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Save failed. Please retry.')
    } finally {
      setSaving(false)
    }
  }

  const headerTitle = `🎓 ${result.examType?.toUpperCase() || 'HSC'} ${isBn ? 'ফলাফল' : 'Result'} — ${boardLabel(result.board, isBn)} ${result.examYear}`

  return (
    <div className={`mt-2 w-full border border-neutral-200 bg-white overflow-hidden ${isCompact ? '' : 'max-w-2xl'}`}>
      {/* Header band */}
      <div className="bg-[#006A4E] text-white px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold leading-snug">{headerTitle}</span>
        <span className={`shrink-0 px-2 py-0.5 text-[10px] font-black rounded-none ${passed ? 'bg-emerald-400 text-white' : 'bg-[#C8102E] text-white'}`}>
          {passed ? (isBn ? 'উত্তীর্ণ ✅' : 'PASSED ✅') : (isBn ? 'অনুত্তীর্ণ ❌' : 'FAILED ❌')}
        </span>
      </div>

      <div className="p-3 space-y-2">
        {/* Student info */}
        <div className="space-y-1">
          <div className="text-sm font-extrabold text-neutral-900">{result.studentName}</div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {isBn ? 'রোল:' : 'Roll:'} <span className="font-bold text-neutral-800">{result.roll}</span>
            {result.registration && (
              <> &nbsp;|&nbsp; {isBn ? 'রেজি:' : 'Reg:'} <span className="font-bold text-neutral-800">{result.registration}</span></>
            )}
          </div>
        </div>

        {/* GPA + grade badge */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-neutral-900">{result.gpa.toFixed(2)}</div>
          <div className="space-y-0.5">
            <span className={`inline-block px-2 py-0.5 text-sm font-black rounded-none ${gradeColorClass(result.grade)}`}>
              {result.grade}
            </span>
            <div className="text-[10px] text-neutral-500 font-mono uppercase">{isBn ? 'জিপিএ / গ্রেড' : 'GPA / Grade'}</div>
          </div>
        </div>

        {/* Full variant: extra info + subject table */}
        {!isCompact && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t border-neutral-100 pt-2">
              <div>
                <span className="text-neutral-500">{isBn ? 'পিতা:' : "Father:"}</span>{' '}
                <span className="font-semibold text-neutral-800">{result.fatherName}</span>
              </div>
              <div>
                <span className="text-neutral-500">{isBn ? 'মাতা:' : "Mother:"}</span>{' '}
                <span className="font-semibold text-neutral-800">{result.motherName}</span>
              </div>
              <div>
                <span className="text-neutral-500">{isBn ? 'বিভাগ:' : "Group:"}</span>{' '}
                <span className="font-semibold text-neutral-800">{result.group}</span>
              </div>
            </div>

            {result.subjects && result.subjects.length > 0 && (
              <div className="border-t border-neutral-100 pt-2">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{isBn ? 'বিষয়ভিত্তিক ফলাফল' : 'Subject Results'}</span>
                </div>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-600 font-bold">
                      <th className="text-left px-2 py-1 border border-neutral-200">{isBn ? 'কোড' : 'Code'}</th>
                      <th className="text-left px-2 py-1 border border-neutral-200">{isBn ? 'বিষয়' : 'Subject'}</th>
                      <th className="text-center px-2 py-1 border border-neutral-200">{isBn ? 'গ্রেড' : 'Grade'}</th>
                      <th className="text-center px-2 py-1 border border-neutral-200">{isBn ? 'জিপিএ' : 'GPA'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjects.map((s, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                        <td className="px-2 py-1 border border-neutral-200 font-mono">{s.code}</td>
                        <td className="px-2 py-1 border border-neutral-200">{s.name}</td>
                        <td className="px-2 py-1 border border-neutral-200 text-center">
                          <span className={`inline-block px-1.5 text-[10px] font-bold ${gradeColorClass(s.grade)}`}>{s.grade}</span>
                        </td>
                        <td className="px-2 py-1 border border-neutral-200 text-center font-mono font-bold">{s.gpa.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className={`flex gap-2 pt-1 border-t border-neutral-100 ${isCompact ? 'flex-col' : 'flex-row'}`}>
          {isCompact && (
            <a
              href="/jonobondhu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-semibold border border-neutral-300 text-neutral-700 hover:border-[#006A4E] hover:text-[#006A4E] win-press transition-colors rounded-none cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSaveToLocker}
            disabled={saving || saved}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold win-press transition-colors rounded-none cursor-pointer ${
              saved
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
                : saving
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-[#006A4E] hover:bg-[#004D38] text-white'
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>
              {saved
                ? (isBn ? '✅ লকারে সংরক্ষিত' : '✅ Saved to Locker')
                : (isBn ? 'লকারে সংরক্ষণ করুন' : 'Save to Locker')}
            </span>
          </button>
        </div>

        {saveError && (
          <p className="text-[11px] text-[#C8102E] font-semibold">{saveError}</p>
        )}
      </div>
    </div>
  )
}
