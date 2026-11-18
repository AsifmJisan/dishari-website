// SessionStorage helper that syncs state between the floating widget and the /jonobondhu full page

const SESSION_KEY = 'dishari_chat_session'

export interface ChatSessionData {
  messages: StoredMessage[]
  activeResultSession: string | null
  lang: 'bn' | 'en'
}

export interface StoredMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  time: string
  navCard?: { url: string; titleBn: string; titleEn: string; breadcrumbBn: string; breadcrumbEn: string }
  resultCard?: ResultCardPayload
  fieldForm?: FieldFormPayload
  captchaCard?: CaptchaCardPayload
}

export interface ResultCardPayload {
  phase: 'scanning' | 'captcha_pending' | 'result_ready' | 'error'
  sessionId?: string
  captchaImage?: string
  confirmedFields?: AdmitCardFields
  result?: HscResultData
  errorMsg?: string
}

export interface FieldFormPayload {
  foundFields: AdmitCardFields
  missingFields: string[]
}

export interface CaptchaCardPayload {
  captchaImage: string
  sessionId: string
  confirmedFields: AdmitCardFields
}

export interface AdmitCardFields {
  roll?: string
  registration?: string
  examYear?: string
  board?: string
  examType?: string
  group?: string
}

export interface SubjectResult {
  code: string
  name: string
  grade: string
  gpa: number
}

export interface HscResultData {
  studentName: string
  roll: string
  registration: string
  fatherName: string
  motherName: string
  group: string
  gpa: number
  grade: string
  resultStatus: 'passed' | 'failed'
  subjects: SubjectResult[]
  board: string
  examYear: string
  examType: string
}

export function loadChatSession(): ChatSessionData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ChatSessionData
  } catch {
    return null
  }
}

export function saveChatSession(data: ChatSessionData): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage may be unavailable (private mode quota exceeded, etc.)
  }
}

export function clearResultSession(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as ChatSessionData
    data.activeResultSession = null
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {}
}
