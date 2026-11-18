'use client'

import React, { useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import type { AdmitCardFields } from '@/lib/chat-session'

interface FieldCollectionFormProps {
  foundFields: AdmitCardFields
  missingFields: string[]
  isBn: boolean
  onSubmit: (completedFields: AdmitCardFields) => void
}

const BOARD_OPTIONS = [
  { value: 'dhaka',      labelBn: 'ঢাকা',       labelEn: 'Dhaka' },
  { value: 'chittagong', labelBn: 'চট্টগ্রাম',   labelEn: 'Chittagong' },
  { value: 'rajshahi',   labelBn: 'রাজশাহী',    labelEn: 'Rajshahi' },
  { value: 'comilla',    labelBn: 'কুমিল্লা',    labelEn: 'Comilla' },
  { value: 'barishal',   labelBn: 'বরিশাল',     labelEn: 'Barishal' },
  { value: 'sylhet',     labelBn: 'সিলেট',      labelEn: 'Sylhet' },
  { value: 'dinajpur',   labelBn: 'দিনাজপুর',   labelEn: 'Dinajpur' },
  { value: 'mymensingh', labelBn: 'ময়মনসিংহ',  labelEn: 'Mymensingh' },
  { value: 'madrasah',   labelBn: 'মাদ্রাসা',   labelEn: 'Madrasah' },
  { value: 'technical',  labelBn: 'কারিগরি',    labelEn: 'Technical' },
]

const EXAM_YEAR_OPTIONS = [2024, 2023, 2022, 2021, 2020, 2019]

const EXAM_TYPE_OPTIONS = [
  { value: 'hsc',   labelBn: 'এইচএসসি (HSC)',   labelEn: 'HSC' },
  { value: 'ssc',   labelBn: 'এসএসসি (SSC)',    labelEn: 'SSC' },
  { value: 'jsc',   labelBn: 'জেএসসি (JSC)',    labelEn: 'JSC' },
  { value: 'alim',  labelBn: 'আলিম',             labelEn: 'Alim' },
  { value: 'dakhil',labelBn: 'দাখিল',            labelEn: 'Dakhil' },
]

const GROUP_OPTIONS = [
  { value: 'science',  labelBn: 'বিজ্ঞান',    labelEn: 'Science' },
  { value: 'arts',     labelBn: 'মানবিক',    labelEn: 'Arts' },
  { value: 'commerce', labelBn: 'ব্যবসায়',   labelEn: 'Commerce' },
]

const FIELD_LABELS: Record<string, { bn: string; en: string }> = {
  roll:         { bn: 'রোল নম্বর',      en: 'Roll Number' },
  registration: { bn: 'রেজিস্ট্রেশন', en: 'Registration' },
  examYear:     { bn: 'পরীক্ষার বছর',  en: 'Exam Year' },
  board:        { bn: 'বোর্ড',          en: 'Board' },
  examType:     { bn: 'পরীক্ষার ধরন',  en: 'Exam Type' },
  group:        { bn: 'বিভাগ',          en: 'Group' },
}

export function FieldCollectionForm({ foundFields, missingFields, isBn, onSubmit }: FieldCollectionFormProps) {
  const [formValues, setFormValues] = useState<AdmitCardFields>({})

  const allConfirmed = Object.entries(foundFields).filter(([, v]) => v && !missingFields.includes(''))

  const handleChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const completed: AdmitCardFields = { ...foundFields, ...formValues }
    onSubmit(completed)
  }

  const isReady = missingFields.every(f => formValues[f as keyof AdmitCardFields])

  return (
    <form onSubmit={handleSubmit} className="mt-2 w-full space-y-2">
      {/* Confirmed (found) fields */}
      {Object.entries(foundFields)
        .filter(([, v]) => v)
        .map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 px-2 py-1.5 bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-neutral-500 w-24 shrink-0">
              {isBn ? FIELD_LABELS[key]?.bn : FIELD_LABELS[key]?.en}
            </span>
            <span className="text-[11px] font-bold text-neutral-900">{value}</span>
          </div>
        ))}

      {/* Missing (editable) fields */}
      {missingFields.map((field) => {
        const label = isBn ? FIELD_LABELS[field]?.bn : FIELD_LABELS[field]?.en

        if (field === 'board') {
          return (
            <div key={field} className="space-y-0.5">
              <label className="text-[11px] font-semibold text-neutral-600">
                {label} <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formValues.board || ''}
                  onChange={e => handleChange('board', e.target.value)}
                  className="w-full border border-neutral-300 bg-white text-xs text-neutral-900 px-2 py-1.5 outline-none focus:border-[#006A4E] rounded-none appearance-none pr-7 cursor-pointer"
                  required
                >
                  <option value="">{isBn ? 'বোর্ড নির্বাচন করুন' : 'Select Board'}</option>
                  {BOARD_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {isBn ? o.labelBn : o.labelEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>
          )
        }

        if (field === 'examYear') {
          return (
            <div key={field} className="space-y-0.5">
              <label className="text-[11px] font-semibold text-neutral-600">
                {label} <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formValues.examYear || ''}
                  onChange={e => handleChange('examYear', e.target.value)}
                  className="w-full border border-neutral-300 bg-white text-xs text-neutral-900 px-2 py-1.5 outline-none focus:border-[#006A4E] rounded-none appearance-none pr-7 cursor-pointer"
                  required
                >
                  <option value="">{isBn ? 'বছর নির্বাচন করুন' : 'Select Year'}</option>
                  {EXAM_YEAR_OPTIONS.map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>
          )
        }

        if (field === 'examType') {
          return (
            <div key={field} className="space-y-0.5">
              <label className="text-[11px] font-semibold text-neutral-600">
                {label} <span className="text-[#C8102E]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formValues.examType || ''}
                  onChange={e => handleChange('examType', e.target.value)}
                  className="w-full border border-neutral-300 bg-white text-xs text-neutral-900 px-2 py-1.5 outline-none focus:border-[#006A4E] rounded-none appearance-none pr-7 cursor-pointer"
                  required
                >
                  <option value="">{isBn ? 'পরীক্ষার ধরন নির্বাচন করুন' : 'Select Exam Type'}</option>
                  {EXAM_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {isBn ? o.labelBn : o.labelEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>
          )
        }

        if (field === 'group') {
          return (
            <div key={field} className="space-y-0.5">
              <label className="text-[11px] font-semibold text-neutral-600">
                {label} <span className="text-neutral-400 text-[10px]">({isBn ? 'ঐচ্ছিক' : 'optional'})</span>
              </label>
              <div className="relative">
                <select
                  value={formValues.group || ''}
                  onChange={e => handleChange('group', e.target.value)}
                  className="w-full border border-neutral-300 bg-white text-xs text-neutral-900 px-2 py-1.5 outline-none focus:border-[#006A4E] rounded-none appearance-none pr-7 cursor-pointer"
                >
                  <option value="">{isBn ? 'বিভাগ নির্বাচন করুন' : 'Select Group'}</option>
                  {GROUP_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {isBn ? o.labelBn : o.labelEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>
          )
        }

        // Generic text input fallback
        return (
          <div key={field} className="space-y-0.5">
            <label className="text-[11px] font-semibold text-neutral-600">
              {label} <span className="text-[#C8102E]">*</span>
            </label>
            <input
              type="text"
              value={formValues[field as keyof AdmitCardFields] || ''}
              onChange={e => handleChange(field, e.target.value)}
              className="w-full border border-neutral-300 bg-white text-xs text-neutral-900 px-2 py-1.5 outline-none focus:border-[#006A4E] rounded-none"
              placeholder={isBn ? `${label} লিখুন` : `Enter ${label}`}
              required
            />
          </div>
        )
      })}

      <button
        type="submit"
        disabled={!isReady}
        className={`w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 win-press transition-colors rounded-none mt-1 ${
          isReady
            ? 'bg-[#006A4E] hover:bg-[#004D38] text-white cursor-pointer'
            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
        }`}
      >
        {isBn ? 'ফলাফল দেখুন' : 'Show Result'}
      </button>
    </form>
  )
}
