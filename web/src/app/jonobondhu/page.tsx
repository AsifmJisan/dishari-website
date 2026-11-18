'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Send,
  Mic,
  MicOff,
  User,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Volume2,
  VolumeX,
  Info,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { WIN10_EASE_ENTRANCE } from '@/lib/motion'
import { generateJonobondhuResponse, type NavCard } from '@/lib/civic-nlp'
import {
  loadChatSession,
  saveChatSession,
  type StoredMessage,
  type AdmitCardFields,
  type HscResultData,
  type FieldFormPayload,
  type CaptchaCardPayload,
  type ResultCardPayload,
} from '@/lib/chat-session'
import { FieldCollectionForm } from '@/components/chat/FieldCollectionForm'
import { CaptchaCard } from '@/components/chat/CaptchaCard'
import { ResultCard } from '@/components/chat/ResultCard'
import {
  GREETING_TEXT_BN,
  GREETING_TEXT_EN,
  CIVIC_STARTER_CHIPS,
} from '@/components/shared/JonobondhuChat'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Message extends StoredMessage {
  expandToFullPage?: { url: string; promptBn: string; promptEn: string }
}

export default function JonobondhuPage() {
  const { lang } = useLanguage()
  const isBn = lang === 'bn'
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load session from sessionStorage on mount
  useEffect(() => {
    setMounted(true)
    const session = loadChatSession()
    if (session && session.messages.length > 0) {
      // Upgrade any previous canned greeting to the warm hospitable greeting
      const upgraded = session.messages.map((m: any, idx: number) => {
        if (
          idx === 0 &&
          m.id?.startsWith('welcome') &&
          (m.text.includes('আপনার সরকারি সেবা সহকারী') || m.text.includes('Hello! I am Jonobondhu'))
        ) {
          return {
            ...m,
            text: isBn ? GREETING_TEXT_BN : GREETING_TEXT_EN,
          }
        }
        return m
      })
      setMessages(upgraded as Message[])
    } else {
      setMessages([
        {
          id: 'welcome-full',
          sender: 'ai',
          text: isBn ? GREETING_TEXT_BN : GREETING_TEXT_EN,
          time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isBn])

  // Sync messages to sessionStorage
  const syncSession = useCallback((msgs: Message[]) => {
    saveChatSession({
      messages: msgs,
      activeResultSession: null,
      lang: isBn ? 'bn' : 'en',
    })
  }, [isBn])

  const addMessages = useCallback((newMsgs: Message[]) => {
    setMessages(prev => {
      const updated = [...prev, ...newMsgs]
      syncSession(updated)
      return updated
    })
  }, [syncSession])

  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...patch } : m)
      syncSession(updated)
      return updated
    })
  }, [syncSession])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const now = () => new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  // ─── SEND TEXT MESSAGE ───
  const handleSendMessage = useCallback((textOverride?: string) => {
    const text = (textOverride || input).trim()
    if (!text) return
    if (!textOverride) setInput('')

    const userMsg: Message = { id: `user-${Date.now()}`, sender: 'user', text, time: now() }

    setMessages(prev => {
      const updated = [...prev, userMsg]
      syncSession(updated)
      return updated
    })

    const nlpResult = generateJonobondhuResponse(text, isBn ? 'bn' : 'en')

    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: nlpResult.reply,
        time: now(),
        navCard: nlpResult.navCard,
      }

      if (nlpResult.autoNav && nlpResult.navCard) {
        setMessages(prev => {
          const updated = [...prev, aiMsg]
          syncSession(updated)
          return updated
        })
        setTimeout(() => router.push(nlpResult.navCard!.url), 950)
      } else {
        setMessages(prev => {
          const updated = [...prev, aiMsg]
          syncSession(updated)
          return updated
        })
      }
    }, 320)
  }, [input, isBn, router, syncSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── IMAGE UPLOAD FLOW ───
  const handleImageUpload = useCallback(async (base64: string, fileName: string) => {
    const userMsg: Message = { id: `user-img-${Date.now()}`, sender: 'user', text: `📎 ${fileName}`, time: now() }
    const scanMsgId = `ai-scan-${Date.now()}`
    const scanMsg: Message = {
      id: scanMsgId,
      sender: 'ai',
      text: isBn ? '⏳ অ্যাডমিট কার্ড স্ক্যান করা হচ্ছে...' : '⏳ Scanning admit card...',
      time: now(),
    }

    setMessages(prev => {
      const updated = [...prev, userMsg, scanMsg]
      syncSession(updated)
      return updated
    })

    setImageUploading(true)
    try {
      const res = await fetch(`${API_BASE}/result/scan-admit-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        throw new Error(
          res.status >= 500
            ? (isBn ? `সার্ভার সাময়িকভাবে সাড়া দিচ্ছে না (HTTP ${res.status})। দয়া করে ব্যাকএন্ড স্ট্যাটাস চেক করুন।` : `Server temporarily unavailable (HTTP ${res.status}).`)
            : (isBn ? `সার্ভার ত্রুটি (HTTP ${res.status})` : `Server error (HTTP ${res.status})`)
        )
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
      }

      if (data.readyToFetch && data.sessionId && data.captchaImage) {
        const captchaMsg: Message = {
          id: `ai-captcha-${Date.now()}`,
          sender: 'ai',
          text: isBn ? 'অ্যাডমিট কার্ড স্ক্যান সম্পন্ন। ক্যাপচা পূরণ করুন:' : 'Admit card scanned. Please complete the captcha:',
          time: now(),
          captchaCard: { captchaImage: data.captchaImage, sessionId: data.sessionId, confirmedFields: data.scanResult?.found || {} },
        }
        setMessages(prev => {
          const updated = prev.map(m => m.id === scanMsgId ? { ...m, text: isBn ? '✅ স্ক্যান সম্পন্ন।' : '✅ Scan complete.' } : m)
          const withCaptcha = [...updated, captchaMsg]
          syncSession(withCaptcha)
          return withCaptcha
        })
      } else if (data.scanResult?.missing?.length > 0) {
        const formMsg: Message = {
          id: `ai-form-${Date.now()}`,
          sender: 'ai',
          text: isBn ? 'কিছু তথ্য পাওয়া গেছে। বাকিগুলো পূরণ করুন:' : 'Some fields detected. Please fill in the rest:',
          time: now(),
          fieldForm: { foundFields: data.scanResult.found || {}, missingFields: data.scanResult.missing },
        }
        setMessages(prev => {
          const updated = prev.map(m => m.id === scanMsgId ? { ...m, text: isBn ? '✅ আংশিক স্ক্যান সম্পন্ন।' : '✅ Partial scan done.' } : m)
          const withForm = [...updated, formMsg]
          syncSession(withForm)
          return withForm
        })
      } else if (data.sessionError) {
        setMessages(prev => {
          const updated = prev.map(m =>
            m.id === scanMsgId
              ? { ...m, text: isBn ? `⚠️ ${data.sessionError}` : `⚠️ ${data.sessionError}` }
              : m
          )
          syncSession(updated)
          return updated
        })
      } else {
        setMessages(prev => {
          const updated = prev.map(m =>
            m.id === scanMsgId
              ? { ...m, text: isBn ? '❌ স্ক্যান ব্যর্থ হয়েছে। স্পষ্ট ছবি ব্যবহার করুন।' : '❌ Scan failed. Please use a clearer image.' }
              : m
          )
          syncSession(updated)
          return updated
        })
      }
    } catch (err: any) {
      console.error('Admit card scan error:', err)
      const isLocalhostMisconfig = API_BASE.includes('localhost') && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      let errorMsg = isBn ? '❌ সংযোগ ত্রুটি। পুনরায় চেষ্টা করুন।' : '❌ Connection error. Please retry.'
      if (isLocalhostMisconfig) {
        errorMsg = isBn
          ? '❌ লাইভ সার্ভারে ব্যাকএন্ডের ঠিকানা (NEXT_PUBLIC_API_URL) সেট করা নেই।'
          : '❌ Backend URL (NEXT_PUBLIC_API_URL) is not set in production settings.'
      } else if (err?.message) {
        errorMsg = isBn ? `❌ সংযোগ ত্রুটি: ${err.message}` : `❌ Connection error: ${err.message}`
      }

      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === scanMsgId
            ? { ...m, text: errorMsg }
            : m
        )
        syncSession(updated)
        return updated
      })
    } finally {
      setImageUploading(false)
    }
  }, [isBn, syncSession]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      handleImageUpload(base64, file.name)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ─── FIELD FORM SUBMIT ───
  const handleFieldFormSubmit = useCallback(async (formMsgId: string, fields: AdmitCardFields) => {
    try {
      const res = await fetch(`${API_BASE}/result/hsc/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (data.sessionId && data.captchaImage) {
        const captchaMsg: Message = {
          id: `ai-captcha-${Date.now()}`,
          sender: 'ai',
          text: isBn ? 'ধন্যবাদ! এখন ক্যাপচা পূরণ করুন:' : 'Thank you! Now complete the captcha:',
          time: now(),
          captchaCard: { captchaImage: data.captchaImage, sessionId: data.sessionId, confirmedFields: fields },
        }
        // Replace fieldForm msg with done status, add captcha
        setMessages(prev => {
          const updated = prev.map(m => m.id === formMsgId ? { ...m, fieldForm: undefined, text: isBn ? '✅ তথ্য জমা দেওয়া হয়েছে।' : '✅ Fields submitted.' } : m)
          const withCaptcha = [...updated, captchaMsg]
          syncSession(withCaptcha)
          return withCaptcha
        })
      }
    } catch {
      // silent
    }
  }, [isBn, syncSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── CAPTCHA RESOLVED ───
  const handleCaptchaResolved = useCallback((captchaMsgId: string, result: HscResultData) => {
    const resultMsg: Message = {
      id: `ai-result-${Date.now()}`,
      sender: 'ai',
      text: isBn ? '✅ ফলাফল পাওয়া গেছে:' : '✅ Result retrieved:',
      time: now(),
      resultCard: { phase: 'result_ready', result },
    }
    setMessages(prev => {
      const updated = prev.map(m => m.id === captchaMsgId ? { ...m, captchaCard: undefined, text: isBn ? '✅ ক্যাপচা যাচাই সম্পন্ন।' : '✅ Captcha verified.' } : m)
      const withResult = [...updated, resultMsg]
      syncSession(withResult)
      return withResult
    })
  }, [isBn, syncSession]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── VOICE ───
  const toggleListening = () => {
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      return
    }
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    try {
      const rec = new SR()
      rec.lang = isBn ? 'bn-BD' : 'en-US'
      rec.continuous = false
      rec.interimResults = false
      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = () => setIsListening(false)
      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) handleSendMessage(transcript)
      }
      recognitionRef.current = rec
      rec.start()
    } catch { setIsListening(false) }
  }

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingMsgId(null)
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = isBn ? 'bn-BD' : 'en-US'
    u.rate = 0.95
    u.onend = () => setSpeakingMsgId(null)
    u.onerror = () => setSpeakingMsgId(null)
    setSpeakingMsgId(msgId)
    window.speechSynthesis.speak(u)
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* ─── TOP BAR ─── */}
      <div className="shrink-0 bg-white border-b border-neutral-200 flex items-center justify-between px-4 py-2.5 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-[#006A4E] transition-colors cursor-pointer win-press rounded-lg px-2.5 py-1 border border-neutral-200 hover:bg-neutral-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'মূল পাতায় ফিরুন' : 'Back'}</span>
          </button>

          <div className="w-px h-5 bg-neutral-200" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center overflow-hidden p-0.5 shadow-xs">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/jonobondhu_head.svg" alt="Jonobondhu" className="w-full h-full object-contain" />
              </picture>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900">{isBn ? 'জনবন্ধু AI' : 'Jonobondhu AI'}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">{isBn ? 'সার্বক্ষণিক নাগরিক ডিজিটাল সহকারী' : 'Civic Digital Assistant'}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>{isBn ? 'AI ইঞ্জিন সক্রিয়' : 'Civic AI Active'}</span>
        </div>
      </div>

      {/* ─── MESSAGES AREA (LOCKED BOUNDARY) ─── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="inline-flex items-center gap-1.5 bg-white border border-neutral-200/90 shadow-2xs px-2.5 py-1 text-[11px] text-neutral-600 rounded-full font-medium">
              <Info className="w-3.5 h-3.5 text-[#006A4E] shrink-0" />
              <span>{isBn ? 'দিশারী স্মার্ট সেবা গাইডেন্স ইন্টারফেস (পূর্ণ পাতা)' : 'Dishari Smart Civic Guidance — Full Page'}</span>
            </div>
          </div>

          {messages.map((msg) => {
            const isAi = msg.sender === 'ai'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: WIN10_EASE_ENTRANCE }}
                className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-white border border-neutral-300 flex items-center justify-center shrink-0 mt-1 overflow-hidden p-0.5 shadow-xs">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/mascot/jonobondhu_head.svg" alt="AI" className="w-full h-full object-contain pointer-events-none" />
                    </picture>
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${isAi ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl leading-[1.8] sm:leading-[1.85] text-[15px] sm:text-[15.5px] font-normal tracking-[0.01em] whitespace-pre-line shadow-xs select-text ${
                      isAi
                        ? 'bg-white border border-neutral-200/90 text-slate-800 rounded-tl-xs'
                        : 'bg-[#006A4E] text-white rounded-tr-xs shadow-md'
                    }`}
                  >
                    {msg.text}

                    {/* Nav Card */}
                    {msg.navCard && (
                      <div className="mt-3 border-2 border-[#006A4E] bg-[#F0FAF5] rounded-xl overflow-hidden shadow-sm not-prose">
                        <div className="flex items-center justify-between px-3 py-2 bg-[#006A4E] text-white">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                            <span className="text-[12px] font-bold tracking-wide uppercase truncate">
                              {isBn ? 'স্বয়ংক্রিয় নেভিগেশন' : 'Autonomous AI Navigation'}
                            </span>
                          </div>
                        </div>
                        <div className="px-3 pt-2.5 pb-2">
                          <div className="flex items-center flex-wrap gap-1 text-[12px] font-medium text-neutral-700">
                            {(isBn ? msg.navCard.breadcrumbBn : msg.navCard.breadcrumbEn)
                              .split('→')
                              .map((step, i, arr) => (
                                <React.Fragment key={i}>
                                  <span className={`px-1.5 py-0.5 rounded-sm border ${i === arr.length - 1 ? 'bg-[#006A4E] text-white border-[#004D38] font-bold' : 'bg-white border-neutral-300 text-neutral-700'}`}>
                                    {step.trim()}
                                  </span>
                                  {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />}
                                </React.Fragment>
                              ))}
                          </div>
                        </div>
                        <div className="px-3 pb-2.5 pt-1 border-t border-emerald-100">
                          <button
                            type="button"
                            onClick={() => router.push(msg.navCard!.url)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#006A4E] border border-[#006A4E] px-2.5 py-1 hover:bg-[#006A4E] hover:text-white transition-colors cursor-pointer win-press rounded-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{isBn ? 'সরাসরি এই পাতায় যান' : 'Go directly to page'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Field Form */}
                    {msg.fieldForm && (
                      <div className="mt-2.5 not-prose">
                        <FieldCollectionForm
                          foundFields={msg.fieldForm.foundFields}
                          missingFields={msg.fieldForm.missingFields}
                          isBn={isBn}
                          onSubmit={(fields) => handleFieldFormSubmit(msg.id, fields)}
                        />
                      </div>
                    )}

                    {/* Captcha Card */}
                    {msg.captchaCard && (
                      <div className="mt-2.5 not-prose">
                        <CaptchaCard
                          captchaImage={msg.captchaCard.captchaImage}
                          sessionId={msg.captchaCard.sessionId}
                          confirmedFields={msg.captchaCard.confirmedFields}
                          isBn={isBn}
                          variant="full"
                          onResolved={(result) => handleCaptchaResolved(msg.id, result)}
                          onError={(err) => {
                            setMessages(prev => {
                              const updated = [...prev, { id: `ai-err-${Date.now()}`, sender: 'ai' as const, text: err, time: now() }]
                              syncSession(updated)
                              return updated
                            })
                          }}
                        />
                      </div>
                    )}

                    {/* Result Card */}
                    {msg.resultCard?.phase === 'result_ready' && msg.resultCard.result && (
                      <div className="mt-2.5 not-prose">
                        <ResultCard
                          result={msg.resultCard.result}
                          variant="full"
                          isBn={isBn}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-mono text-neutral-400">{msg.time}</span>
                    {isAi && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border cursor-pointer win-press transition-colors ${
                          speakingMsgId === msg.id
                            ? 'bg-emerald-100 text-[#006A4E] border-emerald-300 font-bold'
                            : 'bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-[#C8102E]" /> : <Volume2 className="w-3.5 h-3.5 text-[#006A4E]" />}
                        <span>{speakingMsgId === msg.id ? (isBn ? 'থামুন' : 'Stop') : (isBn ? 'ভয়েস' : 'Listen')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 bg-neutral-200 border border-neutral-300 rounded-full flex items-center justify-center shrink-0 mt-1 text-neutral-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            )
          })}

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[14px] font-bold text-neutral-800">
                  {isBn ? 'প্রয়োজনীয় সেবা বেছে নিন বা সরাসরি লিখুন:' : 'Popular Services (Tap to explore):'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CIVIC_STARTER_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(isBn ? chip.promptBn : chip.promptEn)}
                    className="flex items-start gap-3 p-3 bg-neutral-50/70 hover:bg-emerald-50/80 border border-neutral-200/80 hover:border-[#006A4E] text-left transition-all rounded-xl cursor-pointer group win-press"
                  >
                    <span className="text-lg shrink-0 p-1.5 bg-white rounded-lg border border-neutral-200 group-hover:border-emerald-300">
                      {chip.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold text-neutral-900 group-hover:text-[#006A4E] truncate">
                        {isBn ? chip.labelBn : chip.labelEn}
                      </div>
                      <div className="text-[11.5px] text-neutral-500 truncate leading-snug mt-0.5">
                        {isBn ? chip.subBn : chip.subEn}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── INPUT FOOTER (STRICTLY PINNED TO BOTTOM) ─── */}
      <div className="shrink-0 sticky bottom-0 z-20 bg-white border-t border-neutral-200/90 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 border border-neutral-300 bg-neutral-50/60 focus-within:bg-white focus-within:border-[#006A4E] focus-within:ring-2 focus-within:ring-[#006A4E]/10 transition-all rounded-xl px-3 py-1.5">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
              placeholder={isBn ? 'কী সরকারি সেবা প্রয়োজন? এখানে লিখুন...' : 'Ask about government services...'}
              className="flex-1 h-10 sm:h-11 bg-transparent text-[14.5px] sm:text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none font-normal"
            />

            {/* Image upload */}
            <label
              className={`p-2 transition-colors cursor-pointer rounded-lg win-press text-neutral-500 hover:text-[#006A4E] hover:bg-neutral-100 ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}
              title={isBn ? 'অ্যাডমিট কার্ড বা নথির ছবি আপলোড করুন' : 'Upload admit card or document image'}
            >
              {imageUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#006A4E]" /> : <ImagePlus className="w-4 h-4" />}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
                disabled={imageUploading}
              />
            </label>

            {/* Voice */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors cursor-pointer win-press ${
                isListening ? 'bg-rose-100 text-[#C8102E] animate-pulse border border-rose-300' : 'text-neutral-500 hover:text-[#006A4E] hover:bg-neutral-100'
              }`}
              title={isListening ? (isBn ? 'থামুন' : 'Stop') : (isBn ? 'ভয়েসে বলুন' : 'Speak')}
            >
              {isListening ? <MicOff className="w-4 h-4 text-[#C8102E]" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors shrink-0 win-press ${
                input.trim() ? 'bg-[#006A4E] hover:bg-[#004D38] text-white shadow-sm cursor-pointer' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
              title={isBn ? 'পাঠান' : 'Send'}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 px-1 font-mono">
            <span>{isBn ? '📎 প্রবেশপত্র স্ক্যান করতে ছবি আইকনে ক্লিক করুন' : 'Tap 📎 to scan admit card image'}</span>
            <span>{isBn ? 'দিশারী জনবন্ধু সহায়ক ৩.০' : 'Dishari Jonobondhu v3.0'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
