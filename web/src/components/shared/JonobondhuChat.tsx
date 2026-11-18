'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import {
  X,
  Send,
  Mic,
  MicOff,
  User,
  Info,
  Volume2,
  VolumeX,
  Sparkles,
  Navigation,
  ArrowRight,
  ExternalLink,
  FileText,
  Compass,
  CheckCircle2,
  Zap,
  Move,
  Maximize2,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { WIN10_EASE_ENTRANCE } from '@/lib/motion'
import {
  generateJonobondhuResponse,
  type NavCard,
} from '@/lib/civic-nlp'
import { JonobondhuMascot } from './JonobondhuMascot'
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const GREETING_TEXT_BN = `আসসালামু আলাইকুম ও আন্তরিক শুভেচ্ছা! 🌸
দিশারীতে আপনাকে স্বাগতম। আমি জনবন্ধু — আপনার সার্বক্ষণিক নাগরিক ডিজিটাল সহকারী।

পাসপোর্ট, জাতীয় পরিচয়পত্র (NID) সংশোধন, জন্ম নিবন্ধন, জমির খতিয়ান বা ই-পর্চা যাচাই এবং শিক্ষা বোর্ডের পরীক্ষার ফলাফল সংক্রান্ত যে কোনো সরকারি সেবায় আমি সরাসরি সহায়তা করি।

যেকোনো প্রশ্ন করতে পারেন, বাংলায় কথা বলতে পারেন, কিংবা প্রবেশপত্রের ছবি আপলোড করলেই ফলাফল দেখতে পারবেন।

আজ আপনাকে কীভাবে সাহায্য করতে পারি?`

export const GREETING_TEXT_EN = `Assalamu Alaikum & Warm Welcome! 🌸
Welcome to Dishari. I am Jonobondhu — your dedicated citizen service companion and assistant.

I can guide you through citizen services: E-Passport applications, NID corrections, Birth Registrations, Land Records (Khotian/Mutation), and Board Exam Results.

Feel free to ask any question, speak naturally, or upload an admit card photo to retrieve your official result instantly.

How may I assist you today?`

export const CIVIC_STARTER_CHIPS = [
  {
    icon: '🎓',
    labelBn: 'এইচএসসি রেজাল্ট দেখুন',
    labelEn: 'Check HSC Result',
    subBn: 'প্রবেশপত্র স্ক্যান বা রোল-রেজি দিয়ে খুঁজুন',
    subEn: 'Scan admit card or enter roll & reg',
    promptBn: 'এইচএসসি পরীক্ষার ফলাফল অনুসন্ধান করতে চাই',
    promptEn: 'I want to check my HSC exam result',
  },
  {
    icon: '🪪',
    labelBn: 'এনআইডি সংশোধন',
    labelEn: 'NID Correction',
    subBn: 'নাম, জন্মতারিখ বা ঠিকানা পরিবর্তন',
    subEn: 'Change name, birth date or address',
    promptBn: 'জাতীয় পরিচয়পত্র (NID) সংশোধনের নিয়ম কী?',
    promptEn: 'What is the procedure for NID correction?',
  },
  {
    icon: '✈️',
    labelBn: 'ই-পাসপোর্ট আবেদন',
    labelEn: 'E-Passport Guide',
    subBn: 'প্রয়োজনীয় কাগজ, সরকারি ফি ও ধাপ',
    subEn: 'Documents, official fee & steps',
    promptBn: 'ই-পাসপোর্টের প্রয়োজনীয় কাগজ ও সরকারি ফি কত?',
    promptEn: 'What are the required documents and fee for E-Passport?',
  },
  {
    icon: '📜',
    labelBn: 'জন্ম নিবন্ধন যাচাই',
    labelEn: 'Birth Registration',
    subBn: 'BDRIS অনলাইন রেকর্ড ভেরিফিকেশন',
    subEn: 'BDRIS online record verification',
    promptBn: 'অনলাইনে জন্ম নিবন্ধন যাচাই কীভাবে করব?',
    promptEn: 'How to verify birth registration online?',
  },
  {
    icon: '📂',
    labelBn: 'নাগরিক লকার',
    labelEn: 'Citizen Locker',
    subBn: 'জরুরি সরকারি সনদ সুরক্ষিত রাখুন',
    subEn: 'Safely store official certificates',
    promptBn: 'আমার নাগরিক ডকুমেন্ট লকার দেখান',
    promptEn: 'Show me my citizen document locker',
  },
]

interface Message extends StoredMessage {
  expandToFullPage?: { url: string; promptBn: string; promptEn: string }
}

export function JonobondhuChat() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { lang } = useLanguage()
  const isBn = lang === 'bn'
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)

  // ─── PEEKING MASCOT POSITION & EDGE ATTACHMENT ───
  // Mascot always sticks flush against the left or right screen border
  const [mascotSide, setMascotSide] = useState<'right' | 'left'>('right')
  const [mascotY, setMascotY] = useState<number | null>(null)

  // Mascot Dragging & Interaction States
  const [isDraggingMascot, setIsDraggingMascot] = useState(false)
  const [isSnappingMascot, setIsSnappingMascot] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Chat Window Draggable Position States
  const [windowPos, setWindowPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingWindow, setIsDraggingWindow] = useState(false)
  const winDragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    initWinX: number
    initWinY: number
    hasMoved: boolean
  } | null>(null)

  // Chat message & voice state
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mascot DOM Ref
  const mascotRef = useRef<HTMLDivElement>(null)

  // Ref tracking mascot pointer drag
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    initialY: number
    currentY: number
    currentX: number
    hasMoved: boolean
    lastX: number
    lastTime: number
    vx: number
  } | null>(null)

  // Welcome & Civic Guide Screen State
  const [showHeroGreeting, setShowHeroGreeting] = useState(false)
  const [hasCheckedFirstOpen, setHasCheckedFirstOpen] = useState(false)

  // Autonomous AI Navigation HUD Overlay State (Promo Teleport Animation)
  const [navTransition, setNavTransition] = useState<{
    isActive: boolean
    targetUrl: string
    titleBn: string
    titleEn: string
    breadcrumbBn: string
    breadcrumbEn: string
    phase: 'locking' | 'warping' | 'arrived'
  } | null>(null)

  // Viewport calculation excluding Windows scrollbars
  const getViewportWidth = useCallback(() => {
    if (typeof document !== 'undefined' && document.documentElement.clientWidth) {
      return document.documentElement.clientWidth
    }
    return typeof window !== 'undefined' ? window.innerWidth : 1280
  }, [])

  const getViewportHeight = useCallback(() => {
    if (typeof document !== 'undefined' && document.documentElement.clientHeight) {
      return document.documentElement.clientHeight
    }
    return typeof window !== 'undefined' ? window.innerHeight : 800
  }, [])

  // Responsive mascot sizing: ultra-compact on mobile phones (64x82px) and sleek on desktop (88x113px)
  const getMascotDimensions = useCallback(() => {
    const vw = getViewportWidth()
    const isMobile = vw < 640
    return {
      width: isMobile ? 64 : 88,
      height: isMobile ? 82 : 113,
      isMobile,
    }
  }, [getViewportWidth])

  const { width: MASCOT_WIDTH, height: MASCOT_HEIGHT } = getMascotDimensions()
  const WINDOW_WIDTH = 440
  const WINDOW_HEIGHT = 600
  const EDGE_PADDING = 12

  // Initialize responsive default position on mount
  useEffect(() => {
    const initPos = () => {
      const vh = getViewportHeight()
      const defY = Math.max(EDGE_PADDING, Math.min(vh * 0.58, vh - MASCOT_HEIGHT - 60))
      setMascotY((prev) => (prev !== null ? prev : defY))
    }
    initPos()
    window.addEventListener('resize', initPos)
    return () => window.removeEventListener('resize', initPos)
  }, [getViewportHeight])

  // Trigger welcome guide when opened for the first time
  useEffect(() => {
    if (isOpen && !hasCheckedFirstOpen) {
      setHasCheckedFirstOpen(true)
      const seen = typeof window !== 'undefined' ? sessionStorage.getItem('dishari_civic_welcome_seen') : null
      if (!seen) {
        setShowHeroGreeting(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dishari_civic_welcome_seen', 'true')
        }
      }
    }
  }, [isOpen, hasCheckedFirstOpen])

  // Initial hospitable welcome message in selected language
  useEffect(() => {
    const session = loadChatSession()
    if (session && session.messages.length > 0) {
      // Upgrade any previous canned/robotic welcome message to the new warm greeting
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
      return
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: isBn ? GREETING_TEXT_BN : GREETING_TEXT_EN,
        time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
  }, [isBn])

  // Sync messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveChatSession({
        messages,
        activeResultSession: null,
        lang: isBn ? 'bn' : 'en',
      })
    }
  }, [messages, isBn])

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Close with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // ─── POINTER CAPTURE: MASCOT DRAG & EDGE SNAPPING ───
  const handleMascotPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()

    const currentY = mascotY ?? 300

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialY: currentY,
      currentY,
      currentX: e.clientX,
      hasMoved: false,
      lastX: e.clientX,
      lastTime: performance.now(),
      vx: 0,
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    setIsSnappingMascot(false)
  }

  const handleMascotPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY

    if (!drag.hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      drag.hasMoved = true
      setIsDraggingMascot(true)
    }

    if (!drag.hasMoved) return

    const now = performance.now()
    const dt = now - drag.lastTime
    if (dt > 10) {
      drag.vx = (e.clientX - drag.lastX) / dt
      drag.lastX = e.clientX
      drag.lastTime = now
    }

    const vh = getViewportHeight()
    const boundedY = Math.min(Math.max(16, drag.initialY + dy), vh - MASCOT_HEIGHT - 16)
    drag.currentY = boundedY
    drag.currentX = e.clientX

    setMascotY(boundedY)
  }

  const handleMascotPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    const hadMoved = drag.hasMoved
    const finalX = drag.currentX
    const vx = drag.vx
    dragRef.current = null
    setIsDraggingMascot(false)

    if (!hadMoved) {
      // Crisp click/tap -> toggle speech bubble chat
      setIsOpen((prev) => !prev)
      return
    }

    // Snapping logic: Always stick to left or right screen border
    const vw = getViewportWidth()
    const midX = vw / 2
    let newSide: 'right' | 'left' = 'right'

    if (Math.abs(vx) > 0.35) {
      newSide = vx > 0 ? 'right' : 'left'
    } else {
      newSide = finalX > midX ? 'right' : 'left'
    }

    setIsSnappingMascot(true)
    setMascotSide(newSide)
  }

  const handleMascotPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
      dragRef.current = null
      setIsDraggingMascot(false)
    }
  }

  // ─── CHAT WINDOW TITLEBAR DRAGGING HANDLERS ───
  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore button clicks inside the titlebar (like sound toggle or close button)
    if ((e.target as HTMLElement).closest('button')) return

    const vw = getViewportWidth()
    const vh = getViewportHeight()
    const wWidth = Math.min(WINDOW_WIDTH, vw - 24)
    const wHeight = Math.min(WINDOW_HEIGHT, vh - 32)
    const defMascotY = mascotY ?? vh * 0.58
    const defWinY = Math.max(12, Math.min(defMascotY - (wHeight / 2) + (MASCOT_HEIGHT / 2), vh - wHeight - 16))
    const defWinX = vw < 640 ? Math.max(8, (vw - wWidth) / 2) : mascotSide === 'right' ? Math.max(16, vw - wWidth - MASCOT_WIDTH - 8) : Math.min(vw - wWidth - 16, MASCOT_WIDTH + 8)

    const curX = Math.max(8, Math.min(windowPos?.x ?? defWinX, vw - wWidth - 8))
    const curY = Math.max(12, Math.min(windowPos?.y ?? defWinY, vh - wHeight - 16))

    winDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initWinX: curX,
      initWinY: curY,
      hasMoved: false,
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    setIsDraggingWindow(true)
  }

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = winDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY

    if (!drag.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      drag.hasMoved = true
    }

    if (!drag.hasMoved) return

    const vw = getViewportWidth()
    const vh = getViewportHeight()
    const wWidth = Math.min(WINDOW_WIDTH, vw - 24)
    const wHeight = Math.min(WINDOW_HEIGHT, vh - 32)

    const newX = Math.max(8, Math.min(drag.initWinX + dx, vw - wWidth - 8))
    const newY = Math.max(12, Math.min(drag.initWinY + dy, vh - wHeight - 16))

    setWindowPos({ x: newX, y: newY })
  }

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (winDragRef.current?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
      winDragRef.current = null
      setIsDraggingWindow(false)
    }
  }

  const handleHeaderPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (winDragRef.current?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
      winDragRef.current = null
      setIsDraggingWindow(false)
    }
  }

  // ─── BANGLA SPEECH-TO-TEXT & TEXT-TO-SPEECH VOICE ASSISTANT ───
  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch {}
      setIsListening(false)
      return
    }

    if (typeof window === 'undefined') return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert(
        isBn
          ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সুবিধা উপলব্ধ নেই। দয়া করে Google Chrome ব্যবহার করুন।'
          : 'Speech recognition is not supported in this browser. Please use Google Chrome.'
      )
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.lang = isBn ? 'bn-BD' : 'en-US'
      rec.continuous = false
      rec.interimResults = false

      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = () => setIsListening(false)

      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) {
          setInput(transcript)
          handleSendMessage(transcript)
        }
      }

      recognitionRef.current = rec
      rec.start()
    } catch {
      setIsListening(false)
    }
  }

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingMsgId(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = isBn ? 'bn-BD' : 'en-US'
    utterance.rate = 0.95

    utterance.onend = () => setSpeakingMsgId(null)
    utterance.onerror = () => setSpeakingMsgId(null)

    setSpeakingMsgId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // ─── CHAT ENGINE: SEND & AUTOMATED CIVIC KNOWLEDGE RESPONSE ───
  const handleSendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride || input).trim()
      if (!text) return

      const userTime = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        time: userTime,
      }

      setMessages((prev) => [...prev, userMsg])
      if (!textOverride) setInput('')

      const nlpResult = generateJonobondhuResponse(text, isBn ? 'bn' : 'en')

      if (nlpResult.autoNav && nlpResult.navCard) {
        setTimeout(() => {
          const aiMsg: Message = {
            id: `ai-nav-${Date.now()}`,
            sender: 'ai',
            text: nlpResult.reply,
            time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            navCard: nlpResult.navCard,
          }

          setMessages((prev) => [...prev, aiMsg])

          // Trigger Autonomous Navigation HUD
          setNavTransition({
            isActive: true,
            targetUrl: nlpResult.navCard!.url,
            titleBn: nlpResult.navCard!.titleBn,
            titleEn: nlpResult.navCard!.titleEn,
            breadcrumbBn: nlpResult.navCard!.breadcrumbBn,
            breadcrumbEn: nlpResult.navCard!.breadcrumbEn,
            phase: 'warping',
          })

          setTimeout(() => {
            router.push(nlpResult.navCard!.url)

            setTimeout(() => {
              setNavTransition((prev) => (prev ? { ...prev, phase: 'arrived' } : null))

              setTimeout(() => {
                setNavTransition(null)
              }, 1200)
            }, 400)
          }, 950)
        }, 320)
        return
      }

      let aiReplyText = nlpResult.reply
      let aiNavCard = nlpResult.navCard

      try {
        const apiRes = await fetch(`${API_BASE}/chat/jonobondhu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, lang: isBn ? 'bn' : 'en' }),
        })
        if (apiRes.ok) {
          const data = await apiRes.json()
          if (data.reply) {
            aiReplyText = data.reply
            if (data.navCard) aiNavCard = data.navCard
          }
        }
      } catch (err) {
        // Fallback gracefully
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        navCard: aiNavCard,
      }

      setMessages((prev) => [...prev, aiMsg])
    },
    [input, isBn, router]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImageUpload = async (base64: string, fileName: string) => {
    setImageUploading(true)
    const time = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    const userMsgId = `user-img-${Date.now()}`
    const aiScanId = `ai-scan-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: `📎 ${fileName}`,
        time,
      },
      {
        id: aiScanId,
        sender: 'ai',
        text: isBn ? '🔍 প্রবেশপত্রের ছবি স্ক্যান করা হচ্ছে... রোল ও রেজিস্ট্রেশন নম্বর খোঁজা হচ্ছে।' : '🔍 Scanning admit card image... Extracting roll and registration numbers.',
        time,
      },
    ])

    try {
      const res = await fetch(`${API_BASE}/result/scan-admit-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiScanId
              ? {
                  ...m,
                  text: isBn
                    ? 'দুঃখিত, ছবিটি থেকে প্রয়োজনীয় তথ্য স্পষ্ট বোঝা যায়নি। অনুগ্রহ করে পরিষ্কার ছবি দিন অথবা ম্যানুয়ালি তথ্য পূরণ করুন।'
                    : 'Sorry, could not read details from image clearly. Please provide a sharper photo or enter fields manually.',
                }
              : m
          )
        )
        setImageUploading(false)
        return
      }

      if (data.readyToFetch && data.sessionId && data.captchaImage) {
        const fields = data.confirmedFields || {}
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiScanId
              ? {
                  ...m,
                  text: isBn
                    ? `✅ রোল (${fields.roll}) ও রেজিস্ট্রেশন (${fields.registration}) পাওয়া গেছে! ফলাফল পেতে নিচের ক্যাপচাটি পূরণ করুন:`
                    : `✅ Found Roll (${fields.roll}) and Reg (${fields.registration})! Please solve the captcha below:`,
                  captchaCard: {
                    captchaImage: data.captchaImage,
                    sessionId: data.sessionId,
                    confirmedFields: fields,
                  },
                  expandToFullPage: {
                    url: '/jonobondhu',
                    promptBn: 'ক্যাপচা সহজে দেখতে পূর্ণাঙ্গ পেজে যান →',
                    promptEn: 'Open full chat page for easier view →',
                  },
                }
              : m
          )
        )
      } else if (data.scanResult) {
        const missing = data.scanResult.missing || []
        const found = data.scanResult.found || {}
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiScanId
              ? {
                  ...m,
                  text: isBn
                    ? 'প্রবেশপত্র স্ক্যান সম্পন্ন হয়েছে। ফলাফল অনুসন্ধান করতে বাকি তথ্যগুলো নির্বাচন করুন:'
                    : 'Admit card scanned. Please select the remaining fields to search results:',
                  fieldForm: {
                    foundFields: found,
                    missingFields: missing,
                  },
                }
              : m
          )
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiScanId
            ? {
                ...m,
                text: isBn ? 'সার্ভারে সংযোগে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' : 'Connection error. Please try again.',
              }
            : m
        )
      )
    } finally {
      setImageUploading(false)
    }
  }

  const handleFieldFormSubmit = async (completedFields: AdmitCardFields, msgId: string) => {
    const time = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    const loadingId = `ai-init-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        sender: 'ai',
        text: isBn ? '⏳ শিক্ষাবোর্ড সার্ভার থেকে ক্যাপচা আনা হচ্ছে...' : '⏳ Connecting to education board for captcha...',
        time,
      },
    ])

    try {
      const res = await fetch(`${API_BASE}/result/hsc/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedFields),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? {
                  ...m,
                  text: isBn
                    ? `ত্রুটি: ${data.error || 'ক্যাপচা আনতে ব্যর্থ হয়েছে।'}`
                    : `Error: ${data.error || 'Failed to load captcha.'}`,
                }
              : m
          )
        )
        return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                text: isBn ? 'নিচের ক্যাপচাটি পূরণ করুন:' : 'Please enter the captcha below:',
                captchaCard: {
                  captchaImage: data.captchaImage,
                  sessionId: data.sessionId,
                  confirmedFields: data.confirmedFields,
                },
                expandToFullPage: {
                  url: '/jonobondhu',
                  promptBn: 'ক্যাপচা সহজে দেখতে পূর্ণাঙ্গ পেজে যান →',
                  promptEn: 'Open full chat page for easier view →',
                },
              }
            : m
        )
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                text: isBn ? 'ক্যাপচা আনা সম্ভব হয়নি।' : 'Failed to connect for captcha.',
              }
            : m
        )
      )
    }
  }

  const handleCaptchaResolved = (result: HscResultData, msgId: string) => {
    const time = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    const resultMsgId = `ai-res-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      {
        id: resultMsgId,
        sender: 'ai',
        text: isBn
          ? `🎉 অভিনন্দন! ${result.studentName}-এর ফলাফল পাওয়া গেছে (GPA ${result.gpa.toFixed(2)}, Grade ${result.grade})`
          : `🎉 Congratulations! Result found for ${result.studentName} (GPA ${result.gpa.toFixed(2)}, Grade ${result.grade})`,
        time,
        resultCard: {
          phase: 'result_ready',
          result,
        },
        expandToFullPage: {
          url: '/jonobondhu',
          promptBn: 'পূর্ণাঙ্গ মার্কশিট ও গ্রেড বিবরণী দেখুন →',
          promptEn: 'View full subject grades & marksheet →',
        },
      },
    ])
  }

  const handleCaptchaError = (errMsg: string, msgId: string) => {
    const time = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: isBn ? `⚠️ ক্যাপচা যাচাই ব্যর্থ: ${errMsg}` : `⚠️ Captcha verification failed: ${errMsg}`,
        time,
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Pre-prepared civic guidance prompt chips
  const quickPrompts = isBn
    ? [
        'বাবার মৃত্যুর পর জমির নামজারি কীভাবে করব?',
        'বিধবা ভাতার নিয়ম ও কোনো দালাল ফি লাগে কি?',
        'ডিগ্রি পাসের পর সরকারি যুব প্রশিক্ষণ ও ঋণ',
        'ই-পাসপোর্টের প্রয়োজনীয় কাগজ ও সরকারি ফি কত?',
        'উপবৃত্তি পাওয়ার অনলাইন আবেদন প্রক্রিয়া কী?',
      ]
    : [
        'How to apply for land mutation after father’s death?',
        'Is there any fee or middleman for Widow Allowance?',
        'Govt youth skill training & loans for graduates?',
        'Documents and official fee for E-Passport?',
        'Online application process for student stipend?',
      ]

  // Intro Cards
  const introCards = [
    {
      title: isBn ? 'ই-পাসপোর্ট আবেদন' : 'E-Passport Application',
      desc: isBn ? 'ফি হিসাব, প্রয়োজনীয় কাগজপত্র ও সরাসরি পেজে যান' : 'Fee calculation, papers & direct navigation',
      prompt: isBn ? 'পাসপোর্ট আবেদন পাতায় নিয়ে যান' : 'Take me to passport application',
      icon: <Navigation className="w-3.5 h-3.5" />,
    },
    {
      title: isBn ? 'জমির ই-নামজারি' : 'Land Mutation (E-Namjari)',
      desc: isBn ? 'বাবার মৃত্যুর পর ওয়ারিশি জমির রেকর্ড ও খতিয়ান' : 'Inheritance succession & mutation guide',
      prompt: isBn ? 'বাবার মৃত্যুর পর জমির নামজারি কীভাবে করব?' : 'How to apply for land mutation after father’s death?',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      title: isBn ? 'ডকুমেন্ট লকার' : 'Document Locker',
      desc: isBn ? 'স্মার্ট এনআইডি ও জরুরি কাগজপত্র সংরক্ষণ' : 'Saved citizen documents & radar',
      prompt: isBn ? 'আমার ডকুমেন্ট লকার দেখান' : 'Show me my document locker',
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      title: isBn ? 'ভয়েস সহায়ক' : 'Bangla Voice Assistant',
      desc: isBn ? 'মাইক্রোফোনে ক্লিক করে মুখে কথা বলুন' : 'Speak naturally in Bangla or English',
      prompt: '',
      isVoice: true,
      icon: <Mic className="w-3.5 h-3.5" />,
    },
  ]

  const handleIntroCardClick = (promptText: string, isVoice = false) => {
    setShowHeroGreeting(false)
    if (isVoice) {
      setTimeout(() => {
        toggleListening()
      }, 300)
    } else if (promptText) {
      setTimeout(() => {
        handleSendMessage(promptText)
      }, 100)
    }
  }

  // ─── SPEECH BUBBLE WINDOW & PEEKING MASCOT DYNAMICS ───
  const vw = getViewportWidth()
  const vh = getViewportHeight()
  const wWidth = Math.min(WINDOW_WIDTH, vw - 24)
  const wHeight = Math.min(WINDOW_HEIGHT, vh - 32)

  // Default initial window position (when not manually moved)
  const defaultMascotY = mascotY ?? vh * 0.58
  const defaultWinY = Math.max(12, Math.min(defaultMascotY - (wHeight / 2) + (MASCOT_HEIGHT / 2), vh - wHeight - 16))

  let defaultWinX = 0
  if (vw < 640) {
    defaultWinX = Math.max(8, (vw - wWidth) / 2)
  } else if (mascotSide === 'right') {
    defaultWinX = Math.max(16, vw - wWidth - MASCOT_WIDTH - 8)
  } else {
    defaultWinX = Math.min(vw - wWidth - 16, MASCOT_WIDTH + 8)
  }

  // Active window coordinates (strictly clamped so bottom of window never goes off-screen)
  const curWinX = Math.max(8, Math.min(windowPos?.x ?? defaultWinX, vw - wWidth - 8))
  const curWinY = Math.max(12, Math.min(windowPos?.y ?? defaultWinY, vh - wHeight - 16))

  // Distance from window edges to screen bezels
  const distRight = vw - (curWinX + wWidth)
  const distLeft = curWinX
  const PEEK_THRESHOLD = 230 // Window must be within 230px of an edge for mascot to peek

  let isMascotPeeking = true
  let effectiveSide: 'right' | 'left' = mascotSide

  if (isOpen) {
    if (distRight <= PEEK_THRESHOLD && distRight <= distLeft) {
      isMascotPeeking = true
      effectiveSide = 'right'
    } else if (distLeft <= PEEK_THRESHOLD && distLeft < distRight) {
      isMascotPeeking = true
      effectiveSide = 'left'
    } else {
      // Too far away from both sides: mascot stops peeking and retreats off-screen!
      isMascotPeeking = false
      effectiveSide = distRight < distLeft ? 'right' : 'left'
    }
  } else {
    // When window is closed, mascot is always peeking at its docked side
    isMascotPeeking = true
    effectiveSide = mascotSide
  }

  // Mascot vertical position smoothly follows the window when open, or its own drag when closed:
  const actualMascotY = isOpen
    ? Math.max(16, Math.min(curWinY + (wHeight / 2) - (MASCOT_HEIGHT / 2), vh - MASCOT_HEIGHT - 16))
    : defaultMascotY

  // Vertical offset of the speech tail relative to the bubble card
  const tailY = Math.max(32, Math.min(actualMascotY + (MASCOT_HEIGHT / 2) - curWinY, wHeight - 32))

  if (!mounted || pathname === '/jonobondhu') return null

  return (
    <>
      {/* ─── AI AUTONOMOUS NAVIGATION HUD OVERLAY ─── */}
      <AnimatePresence>
        {navTransition?.isActive && (
          <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ top: '-10%', opacity: 0 }}
              animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], repeat: 1, repeatDelay: 0.15 }}
              className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00E599] to-transparent shadow-[0_0_24px_8px_rgba(0,229,153,0.8)]"
            />

            <div className="relative pt-6 w-full max-w-lg mx-auto px-4 z-10">
              <motion.div
                initial={{ opacity: 0, y: -28, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.94 }}
                transition={{ duration: 0.32, ease: WIN10_EASE_ENTRANCE }}
                className="w-full bg-neutral-900/95 border-2 border-[#006A4E] text-white p-4 shadow-2xl rounded-none backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-neutral-700/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E599]" />
                    </span>
                    <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-emerald-400">
                      {isBn ? 'জনবন্ধু AI স্বয়ংক্রিয় নেভিগেশন' : 'Jonobondhu AI Autonomous Transit'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-neutral-300 font-semibold px-2 py-0.5 bg-neutral-800 border border-neutral-700">
                    {navTransition.phase === 'arrived'
                      ? (isBn ? '✓ গন্তব্যে উপস্থিত' : '✓ Arrived')
                      : (isBn ? '⚡ স্থানান্তর হচ্ছে...' : '⚡ Teleporting...')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center shrink-0 shadow-lg overflow-hidden p-1">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                      <img
                        src="/mascot/jonobondhu_head.svg"
                        alt="AI"
                        className="w-full h-full object-contain"
                      />
                    </picture>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                        {isBn ? 'টার্গেট সেবা:' : 'Target Service:'}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                        {isBn ? navTransition.titleBn : navTransition.titleEn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 mt-1 truncate">
                      <span>
                        {isBn ? navTransition.breadcrumbBn : navTransition.breadcrumbEn}
                      </span>
                    </div>
                  </div>

                  {navTransition.phase === 'arrived' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 text-white shadow-md"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 shrink-0">
                      <Zap className="w-4 h-4 animate-pulse text-amber-300" />
                    </div>
                  )}
                </div>

                <div className="w-full bg-neutral-800 h-1.5 mt-3 overflow-hidden rounded-none relative">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: navTransition.phase === 'arrived' ? '100%' : '88%' }}
                    transition={{
                      duration: navTransition.phase === 'arrived' ? 0.2 : 0.9,
                      ease: 'easeInOut',
                    }}
                    className="h-full bg-gradient-to-r from-[#006A4E] via-[#00E599] to-emerald-400"
                  />
                </div>
              </motion.div>
            </div>

            <div className="relative pb-6 text-center z-10">
              <span className="inline-block px-3 py-1 bg-neutral-900/90 text-emerald-400 font-mono text-[10px] uppercase tracking-widest border border-neutral-700/80 shadow-md">
                {isBn ? 'দিশারী পোর্টাল ডিরেক্টরি রুট লকিং...' : 'Dishari Portal Route Locking...'}
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── PEEKING ROBOT MASCOT (STUCK TO SCREEN EDGE, MOVABLE VERTICALLY & DYNAMIC PEEKING) ─── */}
      <div
        ref={mascotRef}
        onPointerDown={handleMascotPointerDown}
        onPointerMove={handleMascotPointerMove}
        onPointerUp={handleMascotPointerUp}
        onPointerCancel={handleMascotPointerCancel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          top: `${actualMascotY}px`,
          ...(effectiveSide === 'right' ? { right: 0 } : { left: 0 }),
          width: `${MASCOT_WIDTH}px`,
          height: `${MASCOT_HEIGHT}px`,
          zIndex: 99999,
          touchAction: 'none',
          transform: isMascotPeeking
            ? 'translateX(0px)'
            : effectiveSide === 'right'
            ? `translateX(${MASCOT_WIDTH + 14}px)`
            : `translateX(-${MASCOT_WIDTH + 14}px)`,
          opacity: isMascotPeeking ? 1 : 0,
          pointerEvents: isMascotPeeking ? 'auto' : 'none',
          transition: isDraggingMascot
            ? 'none'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease, top 0.22s ease-out, left 0.32s cubic-bezier(0.1, 0.9, 0.2, 1), right 0.32s cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
        className={`group select-none ${
          isDraggingMascot ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105 active:scale-95'
        }`}
        role="button"
        tabIndex={0}
        aria-label={isBn ? 'জনবন্ধু AI সহকারী' : 'Jonobondhu AI Assistant'}
        title={isBn ? 'জনবন্ধু AI (টেনে সরানো যাবে, ক্লিক করলে চ্যাট খুলবে)' : 'Jonobondhu AI (Movable, click to chat)'}
      >
        {/* ─── 3D GLOSSY MULTI-PART ANIMATED MASCOT ─── */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <JonobondhuMascot
            isHovered={isHovered}
            isListening={isListening}
            isSpeaking={speakingMsgId !== null}
            isOpen={isOpen}
            side={effectiveSide}
            className="w-full h-full pointer-events-none"
          />

          {/* Subtle Mobile Active Badge when closed */}
          {!isOpen && (
            <div className={`sm:hidden absolute -top-1.5 ${effectiveSide === 'right' ? 'right-1' : 'left-1'} flex items-center justify-center pointer-events-none`}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E599] border-2 border-white shadow-xs" />
              </span>
            </div>
          )}

          {/* Cute Peek-Out Prompt Pill on Hover or Voice Listening */}
          <AnimatePresence>
            {(isHovered || isListening) && !isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 4 }}
                transition={{ duration: 0.16 }}
                className={`absolute -top-7 ${
                  mascotSide === 'right' ? 'right-2' : 'left-2'
                } px-2.5 py-1 bg-neutral-900/95 text-white text-[11px] font-semibold whitespace-nowrap rounded-full shadow-lg border border-neutral-700/80 flex items-center gap-1.5 z-50 pointer-events-none`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse shrink-0" />
                <span>
                  {isListening
                    ? (isBn ? '🎙️ শুনছি... বলুন' : '🎙️ Listening... speak')
                    : (isBn ? '👋 কথা বলুন! সাহায্য লাগবে?' : '👋 Chat with me!')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── SPEECH BUBBLE CHAT INTERFACE EMANATING DIRECTLY FROM MASCOT ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.88,
              x: effectiveSide === 'right' ? 20 : -20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.88,
              x: effectiveSide === 'right' ? 20 : -20,
            }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'fixed',
              left: `${curWinX}px`,
              top: `${curWinY}px`,
              width: `${wWidth}px`,
              height: `${wHeight}px`,
              zIndex: 99998,
              transformOrigin:
                vw < 640
                  ? 'bottom center'
                  : effectiveSide === 'right'
                  ? 'calc(100% + 14px) center'
                  : '-14px center',
            }}
            className="flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-visible select-none"
          >
            {/* ─── SPEECH BUBBLE DIRECTIONAL TAIL (CARET) POINTING AT MASCOT ─── */}
            {vw >= 640 && isMascotPeeking && (
              effectiveSide === 'right' ? (
                <div
                  className="absolute -right-3 z-30 pointer-events-none transition-opacity duration-200"
                  style={{ top: `${tailY - 12}px` }}
                >
                  <svg width="14" height="24" viewBox="0 0 14 24" className="overflow-visible">
                    <path
                      d="M 0 0 L 12 12 L 0 24 Z"
                      fill="#FFFFFF"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                    />
                    <rect x="-2" y="1" width="4" height="22" fill="#FFFFFF" />
                  </svg>
                </div>
              ) : (
                <div
                  className="absolute -left-3 z-30 pointer-events-none transition-opacity duration-200"
                  style={{ top: `${tailY - 12}px` }}
                >
                  <svg width="14" height="24" viewBox="0 0 14 24" className="overflow-visible">
                    <path
                      d="M 14 0 L 2 12 L 14 24 Z"
                      fill="#FFFFFF"
                      stroke="#E5E7EB"
                      strokeWidth="1.5"
                    />
                    <rect x="12" y="1" width="4" height="22" fill="#FFFFFF" />
                  </svg>
                </div>
              )
            )}

            {/* Inner Speech Bubble Body with Rounded Corners */}
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden rounded-2xl bg-white">
              {/* Top 3px Bangladesh Green Accent Line */}
              <div className="h-[3px] bg-[#006A4E] w-full shrink-0" />

              {/* ─── SPEECH BUBBLE HEADER / TITLEBAR (DRAGGABLE TO MOVE WINDOW) ─── */}
              <div
                onPointerDown={handleHeaderPointerDown}
                onPointerMove={handleHeaderPointerMove}
                onPointerUp={handleHeaderPointerUp}
                onPointerCancel={handleHeaderPointerCancel}
                style={{ touchAction: 'none' }}
                className={`flex items-center justify-between px-3.5 py-2.5 bg-neutral-100 border-b border-neutral-200 select-none transition-colors ${
                  isDraggingWindow ? 'cursor-grabbing bg-neutral-200/90 shadow-inner' : 'cursor-grab hover:bg-neutral-150'
                }`}
                title={isBn ? 'মাউস দিয়ে চেপে ধরে উইন্ডোটি যেকোনো জায়গায় সরান' : 'Drag titlebar to move window'}
              >
                {/* Title & Avatar */}
                <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-white border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden p-0.5 shadow-xs">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                      <img
                        src="/mascot/jonobondhu_head.svg"
                        alt="Jonobondhu"
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                    </picture>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-none truncate">
                        {isBn ? 'জনবন্ধু AI' : 'Jonobondhu AI'}
                      </h3>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block mt-0.5 truncate">
                      {isBn ? 'নাগরিক সেবা সহায়ক' : 'Civic Service Assistant'}
                    </span>
                  </div>
                </div>

                {/* Center Drag Grip Handle */}
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-200/60 text-neutral-400 text-[10px] font-mono pointer-events-none select-none">
                  <Move className="w-3 h-3 text-neutral-500" />
                  <span>{isBn ? 'সরান' : 'Move'}</span>
                </div>

                {/* Header Actions: Guide Toggle & Close Cross */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowHeroGreeting((prev) => !prev)}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer rounded-none win-press ${
                      showHeroGreeting
                        ? 'bg-[#006A4E] text-white border-[#004D38]'
                        : 'bg-emerald-50 text-[#006A4E] border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title={isBn ? 'জনবন্ধু সেবা নির্দেশিকা ও ওভারভিউ' : 'Jonobondhu Service Guide & Overview'}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="hidden sm:inline font-mono">
                      {showHeroGreeting
                        ? (isBn ? 'চ্যাটে যান' : 'To Chat')
                        : (isBn ? 'নির্দেশিকা' : 'Guide')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/jonobondhu')}
                    className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-[#006A4E] hover:bg-emerald-50 transition-colors cursor-pointer rounded-none win-press z-10"
                    title={isBn ? 'পূর্ণাঙ্গ চ্যাট পেজে যান' : 'Open full chat page'}
                    aria-label={isBn ? 'পূর্ণাঙ্গ পেজ' : 'Full page'}
                  >
                    <Maximize2 className="w-3.5 h-3.5 pointer-events-none" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer rounded-none win-press z-10"
                    title={isBn ? 'বন্ধ করুন' : 'Close'}
                    aria-label={isBn ? 'চ্যাট বন্ধ করুন' : 'Close chat'}
                  >
                    <X className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* ─── CONDITIONAL VIEW: CIVIC WELCOME GUIDE VS CHAT ─── */}
              {showHeroGreeting ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: WIN10_EASE_ENTRANCE }}
                  className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#F0FDF4] via-white to-[#F8FAFC] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#006A4E] text-white text-[10px] font-bold tracking-wider uppercase font-mono">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>{isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ' : 'Govt. of Bangladesh'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>{isBn ? 'AI ইঞ্জিন সক্রিয়' : 'Civic AI Engine'}</span>
                    </div>
                  </div>

                  <div className="my-auto py-2 text-center flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-3">
                      <div
                        className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-ping"
                        style={{ animationDuration: '3s' }}
                      />
                      <div className="absolute w-20 h-20 rounded-full border border-emerald-400/40 bg-gradient-to-tr from-emerald-100/60 to-rose-100/30 animate-pulse" />

                      <div className="relative w-16 h-16 rounded-full bg-white border-2 border-[#006A4E] shadow-xl flex items-center justify-center z-10 overflow-hidden p-1.5">
                        <picture className="w-full h-full flex items-center justify-center">
                          <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                          <img
                            src="/mascot/jonobondhu_head.svg"
                            alt="Jonobondhu AI"
                            className="w-full h-full object-contain select-none"
                            draggable={false}
                          />
                        </picture>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 mb-2.5 h-4">
                      {[35, 75, 100, 55, 90, 45, 80].map((h, i) => (
                        <motion.span
                          key={i}
                          className="w-1 bg-[#006A4E] rounded-full"
                          animate={{
                            height: [
                              `${Math.max(4, h * 0.18)}px`,
                              `${h * 0.15}px`,
                              `${Math.max(4, h * 0.18)}px`,
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.85 + i * 0.1,
                            ease: 'easeInOut',
                            delay: i * 0.07,
                          }}
                        />
                      ))}
                    </div>

                    <motion.h2
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-tight"
                    >
                      {isBn ? 'স্বাগতম! আমি জনবন্ধু' : 'Welcome! I am Jonobondhu'}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xs font-semibold text-[#006A4E] mt-0.5"
                    >
                      {isBn ? 'আপনার ডিজিটাল নাগরিক সেবা নির্দেশক' : 'Your Smart Civic Service Navigator'}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-[11px] text-neutral-600 mt-1 max-w-[340px] leading-relaxed"
                    >
                      {isBn
                        ? 'যেকোনো সরকারি সেবা সহজে খুঁজে পেতে আমাকে বলুন, বাংলায় কথা বলুন অথবা নিচের সেবাগুলো বেছে নিন।'
                        : 'Ask anything about citizen services, speak in natural Bangla/English, or tap an option below.'}
                    </motion.p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2 shrink-0">
                    {introCards.map((card, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 + idx * 0.05 }}
                        type="button"
                        onClick={() => handleIntroCardClick(card.prompt, card.isVoice)}
                        className="group relative p-2.5 text-left bg-white hover:bg-emerald-50/70 border border-neutral-300 hover:border-[#006A4E] transition-all cursor-pointer win-press rounded-none"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="p-1 bg-emerald-100 text-[#006A4E] group-hover:bg-[#006A4E] group-hover:text-white transition-colors">
                            {card.icon}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {card.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 line-clamp-2 leading-snug">
                          {card.desc}
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowHeroGreeting(false)}
                      className="flex-1 py-2 px-3 bg-[#006A4E] hover:bg-[#004D38] text-white text-xs font-bold flex items-center justify-center gap-1.5 win-press transition-colors rounded-none shadow-sm cursor-pointer"
                    >
                      <span>{isBn ? 'কথোপকথন শুরু করুন' : 'Start Conversation'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIntroCardClick('', true)}
                      className="py-2 px-3 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 text-xs font-semibold flex items-center gap-1 win-press transition-colors rounded-none cursor-pointer"
                      title={isBn ? 'ভয়েস সহকারী চালু করুন' : 'Activate Voice Assistant'}
                    >
                      <Mic className="w-3.5 h-3.5 text-[#006A4E]" />
                      <span>{isBn ? 'ভয়েস' : 'Voice'}</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* ─── CONVERSATION SCROLL AREA (LOCKED BOUNDARY) ─── */}
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-4 bg-[#F8FAFC]">
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="inline-flex items-center gap-1.5 bg-white border border-neutral-200/90 shadow-2xs px-2.5 py-1 text-[11px] text-neutral-600 rounded-full font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>{isBn ? 'জনবন্ধু সার্বক্ষণিক নাগরিক সহকারী' : 'Jonobondhu Civic Companion'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowHeroGreeting(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#006A4E] hover:underline cursor-pointer"
                        title={isBn ? 'জনবন্ধু সেবা নির্দেশিকা দেখুন' : 'View Jonobondhu Service Guide'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isBn ? 'নির্দেশিকা' : 'Guide'}</span>
                      </button>
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
                            <div className="w-7 h-7 rounded-full bg-white border border-neutral-300 flex items-center justify-center shrink-0 mt-1 overflow-hidden p-0.5 shadow-xs">
                              <picture className="w-full h-full flex items-center justify-center">
                                <source srcSet="/mascot/jonobondhu_head.webp" type="image/webp" />
                                <img
                                  src="/mascot/jonobondhu_head.svg"
                                  alt="AI"
                                  className="w-full h-full object-contain pointer-events-none"
                                />
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
                              {msg.navCard && (
                                <div className="mt-3 border-2 border-[#006A4E] bg-[#F0FAF5] rounded-xl overflow-hidden shadow-sm not-prose">
                                  <div className="flex items-center justify-between px-3 py-2 bg-[#006A4E] text-white">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                                      <span className="text-[12px] font-bold tracking-wide uppercase truncate">
                                        {isBn ? 'স্বয়ংক্রিয় নেভিগেশন' : 'Autonomous AI Navigation'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-200 shrink-0">
                                      {isBn ? 'সক্রিয় রুট' : 'Active Route'}
                                    </span>
                                  </div>

                                  <div className="px-3 pt-2.5 pb-2">
                                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5 font-bold">
                                      {isBn ? 'পরবর্তীবার নিজে যেতে ম্যানুয়াল পথ:' : 'Manual path for next time:'}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-1 text-[12px] font-medium text-neutral-700">
                                      {(isBn ? msg.navCard.breadcrumbBn : msg.navCard.breadcrumbEn)
                                        .split('→')
                                        .map((step, i, arr) => (
                                          <React.Fragment key={i}>
                                            <span
                                              className={`px-1.5 py-0.5 rounded-sm border ${
                                                i === arr.length - 1
                                                  ? 'bg-[#006A4E] text-white border-[#004D38] font-bold shadow-xs'
                                                  : 'bg-white border-neutral-300 text-neutral-700'
                                              }`}
                                            >
                                              {step.trim()}
                                            </span>
                                            {i < arr.length - 1 && (
                                              <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                                            )}
                                          </React.Fragment>
                                        ))}
                                    </div>
                                  </div>

                                  <div className="px-3 pb-2.5 pt-1 border-t border-emerald-100 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => router.push(msg.navCard!.url)}
                                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#006A4E] border border-[#006A4E] px-2.5 py-1 hover:bg-[#006A4E] hover:text-white transition-colors cursor-pointer win-press rounded-sm"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>{isBn ? 'সরাসরি এই পাতায় যান' : 'Go directly to page'}</span>
                                    </button>
                                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                                      {msg.navCard.url}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {msg.fieldForm && (
                                <div className="mt-2.5 not-prose">
                                  <FieldCollectionForm
                                    foundFields={msg.fieldForm.foundFields}
                                    missingFields={msg.fieldForm.missingFields}
                                    isBn={isBn}
                                    onSubmit={(fields) => handleFieldFormSubmit(fields, msg.id)}
                                  />
                                </div>
                              )}

                              {msg.captchaCard && (
                                <div className="mt-2.5 not-prose">
                                  <CaptchaCard
                                    captchaImage={msg.captchaCard.captchaImage}
                                    sessionId={msg.captchaCard.sessionId}
                                    confirmedFields={msg.captchaCard.confirmedFields}
                                    isBn={isBn}
                                    variant="compact"
                                    onResolved={(result) => handleCaptchaResolved(result, msg.id)}
                                    onError={(err) => handleCaptchaError(err, msg.id)}
                                    onExpandToFullPage={() => router.push('/jonobondhu')}
                                  />
                                </div>
                              )}

                              {msg.resultCard?.result && (
                                <div className="mt-2.5 not-prose">
                                  <ResultCard
                                    result={msg.resultCard.result}
                                    variant="compact"
                                    isBn={isBn}
                                  />
                                </div>
                              )}

                              {msg.expandToFullPage && (
                                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-end not-prose">
                                  <button
                                    type="button"
                                    onClick={() => router.push(msg.expandToFullPage!.url)}
                                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#006A4E] hover:underline cursor-pointer"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span>{isBn ? msg.expandToFullPage.promptBn : msg.expandToFullPage.promptEn}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 px-1">
                              <span className="text-[11px] font-mono text-neutral-400">
                                {msg.time}
                              </span>
                              {isAi && (
                                <button
                                  type="button"
                                  onClick={() => speakText(msg.text, msg.id)}
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border cursor-pointer win-press transition-colors ${
                                    speakingMsgId === msg.id
                                      ? 'bg-emerald-100 text-[#006A4E] border-emerald-300 font-bold'
                                      : 'bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-50'
                                  }`}
                                  title={speakingMsgId === msg.id ? (isBn ? 'থামুন' : 'Stop') : (isBn ? 'ভয়েসে শুনুন' : 'Listen')}
                                >
                                  {speakingMsgId === msg.id ? (
                                    <>
                                      <VolumeX className="w-3 h-3 text-[#C8102E]" />
                                      <span>{isBn ? 'থামুন' : 'Stop'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3 h-3 text-[#006A4E]" />
                                      <span>{isBn ? 'ভয়েস শুনুন' : 'Listen'}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {!isAi && (
                            <div className="w-7 h-7 bg-neutral-200 border border-neutral-300 rounded-full flex items-center justify-center shrink-0 mt-1 text-neutral-700">
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
                        className="p-3.5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center gap-2 px-1">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-[13px] font-bold text-neutral-800">
                            {isBn ? 'প্রয়োজনীয় সেবা বেছে নিন বা সরাসরি লিখুন:' : 'Popular Services (Tap to explore):'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CIVIC_STARTER_CHIPS.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(isBn ? chip.promptBn : chip.promptEn)}
                              className="flex items-start gap-2.5 p-2.5 bg-neutral-50/70 hover:bg-emerald-50/80 border border-neutral-200/80 hover:border-[#006A4E] text-left transition-all rounded-xl cursor-pointer group win-press"
                            >
                              <span className="text-base shrink-0 p-1 bg-white rounded-lg border border-neutral-200 group-hover:border-emerald-300">
                                {chip.icon}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-semibold text-neutral-900 group-hover:text-[#006A4E] truncate">
                                  {isBn ? chip.labelBn : chip.labelEn}
                                </div>
                                <div className="text-[11px] text-neutral-500 truncate leading-snug">
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

                  {/* ─── INPUT TERMINAL FOOTER (STRICTLY PINNED TO BOTTOM) ─── */}
                  <div className="shrink-0 sticky bottom-0 z-20 bg-white border-t border-neutral-200/90 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 border border-neutral-300 bg-neutral-50/60 focus-within:bg-white focus-within:border-[#006A4E] focus-within:ring-2 focus-within:ring-[#006A4E]/10 transition-all rounded-xl px-3 py-1.5">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isBn ? 'কী সরকারি সেবা প্রয়োজন? এখানে লিখুন...' : 'Ask about government services...'}
                        className="flex-1 h-9 sm:h-10 bg-transparent text-[14.5px] sm:text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none font-normal"
                      />

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                        className="p-1.5 text-neutral-500 hover:text-[#006A4E] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer win-press shrink-0"
                        title={isBn ? 'প্রবেশপত্র বা নথির ছবি আপলোড করুন' : 'Upload admit card or document image'}
                        aria-label={isBn ? 'ছবি আপলোড' : 'Upload image'}
                      >
                        {imageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#006A4E]" />
                        ) : (
                          <ImagePlus className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer win-press shrink-0 ${
                          isListening
                            ? 'bg-rose-100 text-[#C8102E] animate-pulse border border-rose-300'
                            : 'text-neutral-500 hover:text-[#006A4E] hover:bg-neutral-100'
                        }`}
                        title={
                          isListening
                            ? (isBn ? 'শুনছি... কথা বলা শেষ করতে ক্লিক করুন' : 'Listening... click to stop')
                            : (isBn ? 'বাংলায় ভয়েসে প্রশ্ন করুন (কথা বলুন)' : 'Ask via voice (Speak in Bangla)')
                        }
                        aria-label={isBn ? 'ভয়েস ইনপুট' : 'Voice input'}
                      >
                        {isListening ? <MicOff className="w-4 h-4 text-[#C8102E]" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim()}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 win-press ${
                          input.trim()
                            ? 'bg-[#006A4E] hover:bg-[#004D38] text-white shadow-sm cursor-pointer'
                            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }`}
                        title={isBn ? 'বার্তা পাঠান' : 'Send message'}
                        aria-label={isBn ? 'বার্তা পাঠান' : 'Send message'}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 px-1 font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {isBn ? 'জনবন্ধু ৩.০ (স্মার্ট চ্যাট)' : 'Jonobondhu v3.0'}
                      </span>
                      <span>{isBn ? 'দিশারী নাগরিক পোর্টাল' : 'Dishari Citizen Portal'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default JonobondhuChat
