'use client'

import React, { useState, useEffect, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type MascotFrameKey =
  | 'eyesopen_mouthclose_wavedown'
  | 'eyesclose_mouthclose_wavedown'
  | 'eyesopen_mouthclose_waveup'
  | 'eyesclose_mouthclose_waveup'
  | 'eyesopen_mouthopen_waveup'
  | 'eyesclose_mouthopen_waveup'

export interface JonobondhuMascotProps {
  /** Which side of the viewport the mascot peeks from: 'right' (default) or 'left'. */
  side?: 'right' | 'left'
  /** Animate the mouth as though the mascot is speaking. */
  isSpeaking?: boolean
  /** External hover state from parent. */
  isHovered?: boolean
  /** Listening state for voice. */
  isListening?: boolean
  /** Whether the chat speech bubble is open. */
  isOpen?: boolean
  /** Optional click handler. */
  onClick?: () => void
  /** Optional styles for the wrapper. */
  style?: CSSProperties
  className?: string
}

const ALL_FRAMES: MascotFrameKey[] = [
  'eyesopen_mouthclose_wavedown',
  'eyesclose_mouthclose_wavedown',
  'eyesopen_mouthclose_waveup',
  'eyesclose_mouthclose_waveup',
  'eyesopen_mouthopen_waveup',
  'eyesclose_mouthopen_waveup',
]

/**
 * Jonobondhu — Handcrafted Peeking Stop-Motion 3D Robot Mascot.
 * 
 * - Continuous, calm stop-motion animation loop (gentle wave and blink).
 * - Clicking or opening chat opens his mouth (mouthopen frames).
 * - Speech lip-sync when reading out answers.
 * - Perfectly aligned alpha-masked frames.
 */
export function JonobondhuMascot({
  side = 'right',
  isSpeaking = false,
  isHovered: propHovered,
  isListening = false,
  isOpen = false,
  onClick,
  style,
  className,
}: JonobondhuMascotProps) {
  const [internalHover, setInternalHover] = useState(false)
  const isHovered = propHovered !== undefined ? propHovered : internalHover

  // Click-reaction state (temporarily pops mouth open on click)
  const [justClicked, setJustClicked] = useState(false)

  // Active frame currently displayed
  const [activeFrame, setActiveFrame] = useState<MascotFrameKey>('eyesopen_mouthclose_waveup')

  // Preload all frames on client mount to guarantee zero flicker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ALL_FRAMES.forEach((frame) => {
        const imgWebp = new Image()
        imgWebp.src = `/mascot/frames/${frame}.webp`
        const imgSvg = new Image()
        imgSvg.src = `/mascot/frames/${frame}.svg`
      })
    }
  }, [])

  // Handle click with immediate mouth-open reaction
  const handleClick = () => {
    setJustClicked(true)
    setActiveFrame('eyesopen_mouthopen_waveup')
    setTimeout(() => {
      setJustClicked(false)
    }, 1200)
    if (onClick) {
      onClick()
    }
  }

  // ─── CONTINUOUS STOP-MOTION CONTROLLER (ALWAYS ANIMATING & SLOWER) ───
  useEffect(() => {
    let timer: NodeJS.Timeout
    let stepIndex = 0

    const isMouthOpenState = isOpen || justClicked

    if (isSpeaking) {
      // ── Speaking Voice Cadence (~180ms per frame) ──
      const speechSeq: MascotFrameKey[] = [
        'eyesopen_mouthopen_waveup',
        'eyesopen_mouthclose_waveup',
        'eyesclose_mouthopen_waveup',
        'eyesopen_mouthclose_waveup',
      ]
      timer = setInterval(() => {
        stepIndex = (stepIndex + 1) % speechSeq.length
        setActiveFrame(speechSeq[stepIndex])
      }, 180)
    } else if (isListening) {
      // ── Listening Stance (Mouth open attentive) ──
      setActiveFrame('eyesopen_mouthopen_waveup')
    } else if (isMouthOpenState) {
      // ── When Clicked or Chat is Open: Mouth is Open! (~450ms gentle rhythm) ──
      const openSeq: MascotFrameKey[] = [
        'eyesopen_mouthopen_waveup',
        'eyesclose_mouthopen_waveup',
        'eyesopen_mouthopen_waveup',
        'eyesopen_mouthclose_waveup',
      ]
      timer = setInterval(() => {
        stepIndex = (stepIndex + 1) % openSeq.length
        setActiveFrame(openSeq[stepIndex])
      }, 480)
    } else if (isHovered) {
      // ── Hovered: Cheerful Greeting Wave (~360ms cadence) ──
      const hoverSeq: MascotFrameKey[] = [
        'eyesopen_mouthclose_waveup',
        'eyesclose_mouthclose_waveup',
        'eyesopen_mouthclose_waveup',
        'eyesopen_mouthclose_wavedown',
      ]
      timer = setInterval(() => {
        stepIndex = (stepIndex + 1) % hoverSeq.length
        setActiveFrame(hoverSeq[stepIndex])
      }, 360)
    } else {
      // ── Always-Animating Gentle Calm Loop (~520ms cadence) ──
      // Gently waves up, smiles with closed eyes, lowers hand, blinks, and raises back up
      const idleSeq: MascotFrameKey[] = [
        'eyesopen_mouthclose_waveup',     // 0: Wave up
        'eyesclose_mouthclose_waveup',    // 1: Happy smile eyes wave
        'eyesopen_mouthclose_wavedown',   // 2: Arm lowered
        'eyesclose_mouthclose_wavedown',  // 3: Natural blink
        'eyesopen_mouthclose_wavedown',   // 4: Arm lowered, eyes open
        'eyesopen_mouthclose_waveup',     // 5: Wave back up
      ]
      timer = setInterval(() => {
        stepIndex = (stepIndex + 1) % idleSeq.length
        setActiveFrame(idleSeq[stepIndex])
      }, 520)
    }

    return () => {
      clearInterval(timer)
      clearTimeout(timer)
    }
  }, [isSpeaking, isListening, isOpen, isHovered, justClicked])

  const wrapperStyle: CSSProperties = {
    position: style?.position || 'relative',
    width: style?.width || '100%',
    height: style?.height || '100%',
    pointerEvents: 'none',
    lineHeight: 0,
    ...style,
  }

  return (
    <div
      className={className}
      style={wrapperStyle}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: side === 'left' ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      >
        {/* Soft Ambient Contact Glow Behind Mascot */}
        <div
          className="absolute inset-0 rounded-full bg-sky-400/20 blur-xl pointer-events-none -z-10"
          style={{ transform: 'scale(0.85)' }}
        />

        {/* Listening Acoustic Pulse Rings */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0.85 }}
              animate={{ scale: [0.85, 1.25, 1.4], opacity: [0.85, 0.4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-[#00E5FF] pointer-events-none -z-10"
            />
          )}
        </AnimatePresence>

        {/* ─── ACTIVE STOP-MOTION FRAME ─── */}
        {/* Uses <picture> to prefer ultra-fast 130KB WebP with instant SVG fallback */}
        <picture className="w-full h-full flex items-center justify-center pointer-events-none">
          <source srcSet={`/mascot/frames/${activeFrame}.webp`} type="image/webp" />
          <img
            src={`/mascot/frames/${activeFrame}.svg`}
            alt="জনবন্ধু AI সহকারী"
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl"
            draggable={false}
            style={{
              filter: isHovered
                ? 'drop-shadow(0 10px 20px rgba(0, 160, 255, 0.28))'
                : 'drop-shadow(0 6px 14px rgba(0, 40, 100, 0.2))',
              transition: 'filter 0.2s ease',
            }}
          />
        </picture>

        {/* Click Interaction Hitbox */}
        <button
          type="button"
          onClick={handleClick}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          aria-label="জনবন্ধু AI সহকারী চ্যাট খুলুন"
        />
      </div>
    </div>
  )
}

export default JonobondhuMascot
