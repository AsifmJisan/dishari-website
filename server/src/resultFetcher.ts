/**
 * resultFetcher.ts
 * Handles fetching HSC/SSC results from educationboardresults.gov.bd.
 *
 * NOTE: The CAPTCHA image URL `captcha.php` should be verified against the live site.
 *       Inspect the HTML of http://www.educationboardresults.gov.bd/ to confirm
 *       the exact img src used for the CAPTCHA (commonly `captcha.php`).
 */

import * as cheerio from 'cheerio'
import { randomUUID, createHash } from 'crypto'
import type { ParsedDocumentData } from './ocrEngine.js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdmitCardFields {
  roll?: string
  registration?: string
  examYear?: string
  board?: string        // board code
  examType?: string     // 'hsc'|'ssc'|'jsc'|'alim'|'dakhil'
  group?: string
}

export interface ResultSession {
  sessionId: string
  cookie: string
  confirmedFields: AdmitCardFields
  captchaImage: string  // base64 data URL
  createdAt: number
}

export interface AdmitCardScanResult {
  found: AdmitCardFields
  missing: string[]
  confidence: number
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

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.educationboardresults.gov.bd'
const SESSION_TTL_MS = 10 * 60 * 1000 // 10 minutes

// ─── Helper: Cookie Jar ──────────────────────────────────────────────────────

function updateCookieJar(cookieJar: Record<string, string>, res: Response): void {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  for (const c of raw) {
    const part = c.split(';')[0].trim()
    const [k, v] = part.split('=')
    if (k && v) cookieJar[k] = v
  }
}

function stringifyCookies(cookieJar: Record<string, string>): string {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ')
}

// Board display name → form code mapping
const BOARD_NAME_TO_CODE: Record<string, string> = {
  dhaka: 'dhaka',
  'ঢাকা': 'dhaka',
  chittagong: 'chittagong',
  chattogram: 'chittagong',
  চট্টগ্রাম: 'chittagong',
  rajshahi: 'rajshahi',
  রাজশাহী: 'rajshahi',
  comilla: 'comilla',
  cumilla: 'comilla',
  কুমিল্লা: 'comilla',
  barishal: 'barishal',
  barisal: 'barishal',
  বরিশাল: 'barishal',
  sylhet: 'sylhet',
  সিলেট: 'sylhet',
  dinajpur: 'dinajpur',
  দিনাজপুর: 'dinajpur',
  mymensingh: 'mymensingh',
  ময়মনসিংহ: 'mymensingh',
  madrasah: 'madrasah',
  মাদ্রাসা: 'madrasah',
  technical: 'technical',
  কারিগরি: 'technical',
  jessore: 'jessore',
  যশোর: 'jessore',
}

// Exam name → form code mapping
const EXAM_NAME_TO_CODE: Record<string, string> = {
  hsc: 'hsc',
  'উচ্চ মাধ্যমিক': 'hsc',
  'higher secondary': 'hsc',
  ssc: 'ssc',
  মাধ্যমিক: 'ssc',
  'secondary school': 'ssc',
  jsc: 'jsc',
  'জেএসসি': 'jsc',
  alim: 'alim',
  আলিম: 'alim',
  dakhil: 'dakhil',
  দাখিল: 'dakhil',
}

// ─── In-Memory Session Store ──────────────────────────────────────────────────

const sessionStore = new Map<string, ResultSession>()

function cleanupSession(sessionId: string): void {
  sessionStore.delete(sessionId)
}

// ─── Helper: Normalize board name to code ────────────────────────────────────

function normalizeBoardCode(raw: string): string | undefined {
  if (!raw) return undefined
  const key = raw.trim().toLowerCase()
  // Direct match
  if (BOARD_NAME_TO_CODE[key]) return BOARD_NAME_TO_CODE[key]
  // Partial match
  for (const [name, code] of Object.entries(BOARD_NAME_TO_CODE)) {
    if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key)) {
      return code
    }
  }
  // Check Bengali
  for (const [name, code] of Object.entries(BOARD_NAME_TO_CODE)) {
    if (raw.includes(name)) return code
  }
  return undefined
}

// ─── Helper: Normalize exam type to code ─────────────────────────────────────

function normalizeExamCode(raw: string): string | undefined {
  if (!raw) return undefined
  const key = raw.trim().toLowerCase()
  if (EXAM_NAME_TO_CODE[key]) return EXAM_NAME_TO_CODE[key]
  for (const [name, code] of Object.entries(EXAM_NAME_TO_CODE)) {
    if (key.includes(name.toLowerCase())) return code
  }
  for (const [name, code] of Object.entries(EXAM_NAME_TO_CODE)) {
    if (raw.includes(name)) return code
  }
  return undefined
}

// ─── Helper: Extract year from text ──────────────────────────────────────────

function extractYear(text: string): string | undefined {
  if (!text) return undefined

  // Priority 1: explicitly labeled exam year (e.g. "Examination - 2017" or "Exam 2024" or "Certificate - 2017")
  const examYearMatch = text.match(/(?:Examination|Exam|Certificate|পরীক্ষা|সাল|বছর)\s*[-:\s]+([12]\d{3})/i)
  if (examYearMatch) return examYearMatch[1]

  // Priority 2: Session like "2015-16" -> for HSC it's session start year + 2 (e.g., 2017)
  const sessionMatch = text.match(/Session\s*[:\s.\-]+(20\d{2})[-/](\d{2,4})/i)
  if (sessionMatch) {
    const startYear = parseInt(sessionMatch[1], 10)
    return String(startYear + 2)
  }

  // Priority 3: any 4-digit year (take the latest year mentioned)
  const allYears = text.match(/\b(20\d{2}|19\d{2})\b/g)
  if (allYears && allYears.length > 0) {
    const sorted = [...new Set(allYears)].map(Number).sort((a, b) => b - a)
    return String(sorted[0])
  }
  return undefined
}

// ─── parseAdmitCardFields ─────────────────────────────────────────────────────

/**
 * Extracts admit card fields from OCR ParsedDocumentData.
 * Maps board names, exam types, etc. to their form codes.
 */
export function parseAdmitCardFields(ocrResult: ParsedDocumentData): AdmitCardScanResult {
  const found: AdmitCardFields = {}
  const missing: string[] = []

  // Roll number
  if (ocrResult.roll) {
    found.roll = ocrResult.roll.trim()
  } else {
    missing.push('roll')
  }

  // Registration number
  if (ocrResult.reg_no) {
    found.registration = ocrResult.reg_no.trim()
  } else {
    missing.push('registration')
  }

  // Board
  if (ocrResult.board) {
    const code = normalizeBoardCode(ocrResult.board)
    if (code) {
      found.board = code
    } else {
      found.board = ocrResult.board.toLowerCase().trim()
    }
  } else {
    missing.push('board')
  }

  // Exam type (from exam_name field)
  if (ocrResult.exam_name) {
    const code = normalizeExamCode(ocrResult.exam_name)
    found.examType = code || 'hsc'  // default to HSC
  } else {
    // Try doc_title for hints
    if (ocrResult.doc_title) {
      const code = normalizeExamCode(ocrResult.doc_title)
      if (code) {
        found.examType = code
      } else {
        missing.push('examType')
      }
    } else {
      missing.push('examType')
    }
  }

  // Exam year — try raw_text, dob surrounding context, or doc_title year
  const rawText = ocrResult.raw_text || ''
  const yearFromRaw = extractYear(rawText)
  if (yearFromRaw) {
    found.examYear = yearFromRaw
  } else {
    missing.push('examYear')
  }

  // Group (Science, Humanities, Business Studies / Commerce)
  const explicitGroup = rawText.match(/(?:Group|বিভাগ|শাখা)\s*[:\s.\-]*([A-Za-z\s\u0980-\u09FF]{3,24})/i)
  if (explicitGroup) {
    const gText = explicitGroup[1].toLowerCase()
    if (gText.includes('business') || gText.includes('commerce') || gText.includes('ব্যবসায়') || gText.includes('ব্যবসা')) {
      found.group = 'Business Studies'
    } else if (gText.includes('humanities') || gText.includes('arts') || gText.includes('মানবিক')) {
      found.group = 'Humanities'
    } else if (gText.includes('science') || gText.includes('বিজ্ঞান')) {
      found.group = 'Science'
    }
  }

  if (!found.group) {
    const textLower = rawText.toLowerCase()
    if (textLower.includes('business studies') || textLower.includes('commerce') || textLower.includes('ব্যবসায়')) {
      found.group = 'Business Studies'
    } else if (textLower.includes('humanities') || textLower.includes('মানবিক')) {
      found.group = 'Humanities'
    } else if (textLower.includes('science') || textLower.includes('বিজ্ঞান')) {
      found.group = 'Science'
    } else {
      missing.push('group')
    }
  }

  return {
    found,
    missing,
    confidence: ocrResult.confidence || 0,
  }
}

// ─── initResultSession ────────────────────────────────────────────────────────

/**
 * Opens an HTTP session to educationboardresults.gov.bd (v2),
 * retrieves the official CAPTCHA image, and stores session data.
 * Returns sessionId, captchaImage (base64 data URL), and confirmedFields.
 */
export async function initResultSession(fields: AdmitCardFields): Promise<{
  sessionId: string
  captchaImage: string
  confirmedFields: AdmitCardFields
}> {
  const cookieJar: Record<string, string> = {}
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  try {
    // 1. Fetch root page to get initial cookies and challenge token
    const res1 = await fetch(BASE_URL + '/', {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    updateCookieJar(cookieJar, res1)
    const html1 = await res1.text()

    // 2. Solve cloud challenge token
    const challengeMatch = html1.match(/var challenge = (\{.*?\});/)
    if (challengeMatch) {
      try {
        const challenge = JSON.parse(challengeMatch[1])
        const proof = `browser-proof:${challenge.seed}:${challenge.salt}`
        const hash = createHash('sha256').update(proof).digest('hex')
        const ans = 'hash:' + hash

        const verifyRes = await fetch(BASE_URL + '/_challenge-verify', {
          method: 'POST',
          headers: {
            'User-Agent': ua,
            'Content-Type': 'application/json',
            'Cookie': stringifyCookies(cookieJar),
            'Referer': BASE_URL + '/_challenge-engine?goto=%2Fv2%2Fhome',
          },
          body: JSON.stringify({ token: challenge.token, answer: ans }),
        })
        updateCookieJar(cookieJar, verifyRes)
      } catch (cErr) {
        console.warn('Challenge verify warning:', cErr)
      }
    }

    // 3. Establish v2 home session
    const homeRes = await fetch(BASE_URL + '/v2/home', {
      headers: {
        'User-Agent': ua,
        'Cookie': stringifyCookies(cookieJar),
      },
    })
    updateCookieJar(cookieJar, homeRes)

    // 4. Fetch real CAPTCHA image
    const captchaRes = await fetch(`${BASE_URL}/v2/captcha?_=${Date.now()}`, {
      headers: {
        'User-Agent': ua,
        'Cookie': stringifyCookies(cookieJar),
        'Referer': BASE_URL + '/v2/home',
      },
    })
    updateCookieJar(cookieJar, captchaRes)

    if (!captchaRes.ok) {
      throw new Error(`CAPTCHA fetch returned HTTP ${captchaRes.status}`)
    }

    const captchaBuffer = await captchaRes.arrayBuffer()
    const contentType = captchaRes.headers.get('content-type') || 'image/jpeg'
    const base64Data = Buffer.from(captchaBuffer).toString('base64')
    const captchaImage = `data:${contentType};base64,${base64Data}`

    // 5. Store session
    const sessionId = randomUUID()
    const session: ResultSession = {
      sessionId,
      cookie: stringifyCookies(cookieJar),
      confirmedFields: { ...fields },
      captchaImage,
      createdAt: Date.now(),
    }
    sessionStore.set(sessionId, session)

    // Auto-cleanup after TTL
    setTimeout(() => cleanupSession(sessionId), SESSION_TTL_MS)

    return {
      sessionId,
      captchaImage,
      confirmedFields: { ...fields },
    }
  } catch (err: any) {
    throw new Error(
      `ফলাফল সার্ভারে সংযোগ ব্যর্থ হয়েছে: ${err?.message || err}`
    )
  }
}

// ─── fetchResultWithCaptcha ───────────────────────────────────────────────────

/**
 * Uses stored session cookie to POST to /v2/getres with CAPTCHA answer,
 * parses the returned JSON, and returns structured HscResultData.
 */
export async function fetchResultWithCaptcha(
  sessionId: string,
  captchaAnswer: string,
  overrides?: Partial<AdmitCardFields>
): Promise<HscResultData> {
  const session = sessionStore.get(sessionId)
  if (!session) {
    throw new Error('সেশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
  }

  const { cookie, confirmedFields } = session
  const fields = { ...confirmedFields, ...(overrides || {}) }
  const roll = (fields.roll || '').trim()
  const registration = (fields.registration || '').trim()
  const examYear = (fields.examYear || '').trim()
  const board = (fields.board || 'dhaka').trim().toLowerCase()
  const examType = (fields.examType || 'hsc').trim().toLowerCase()

  if (!roll || !registration || !examYear || !board || !examType) {
    throw new Error('রোল, রেজিস্ট্রেশন ও শিক্ষাবোর্ডের তথ্য প্রয়োজন।')
  }

  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  // Build v2 getres parameters
  const formParams = new URLSearchParams()
  formParams.append('board', board)
  formParams.append('exam', examType)
  formParams.append('year', examYear)
  formParams.append('result_type', '1') // Individual / Detailed Result
  formParams.append('roll', roll)
  formParams.append('reg', registration)
  formParams.append('captcha', captchaAnswer.trim())

  let postRes: Response
  try {
    postRes = await fetch(BASE_URL + '/v2/getres', {
      method: 'POST',
      headers: {
        'User-Agent': ua,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': cookie,
        'Referer': BASE_URL + '/v2/home',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formParams.toString(),
    })
  } catch (err: any) {
    throw new Error(`ফলাফল সার্ভার থেকে সাড়া পাওয়া যায়নি: ${err?.message || err}`)
  }

  if (!postRes.ok) {
    throw new Error(`ফলাফল সার্ভার ত্রুটি: HTTP ${postRes.status}`)
  }

  let data: any
  try {
    data = await postRes.json()
  } catch {
    const text = await postRes.text()
    return parseResultHtml(text, confirmedFields)
  }

  if (data.status === 1 || data.msg?.toLowerCase().includes('captcha')) {
    throw new Error(data.msg || 'ভুল ক্যাপচা কোড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।')
  }

  if (data.status !== 0 || !data.res) {
    throw new Error(data.msg || 'কোনো ফলাফল পাওয়া যায়নি। রোল ও রেজিস্ট্রেশন নম্বর যাচাই করুন।')
  }

  // Clean up session after successful use
  cleanupSession(sessionId)

  const res = data.res
  console.log('Official government result payload received:', JSON.stringify(res))

  // ── 1. Student Identity & Basic Info ──────────────────────────────────────
  const studentName = String(res.name || res.stud_name || confirmedFields.roll || '').trim()
  const rollResult = String(res.roll_no || res.roll || roll).trim()
  const regResult = String(res.regno || res.reg || registration).trim()
  const fatherName = String(res.fname || res.father_name || res.father || '').trim()
  const motherName = String(res.mname || res.mother_name || res.mother || '').trim()
  const group = String(res.stud_group || res.group || confirmedFields.group || 'Science').trim()
  const boardName = String(res.board_name || confirmedFields.board || 'Dhaka').trim()

  // ── 2. Parse Subjects (res.display_details or res.sub_list) ────────────────
  const BOARD_SUBJECT_NAMES: Record<string, string> = {
    // Common / SSC / HSC Language & Core
    '101': 'Bangla I',
    '102': 'Bangla II',
    '107': 'English I',
    '108': 'English II',
    '109': 'Mathematics',
    '110': 'Geography & Environment',
    '111': 'Islam & Moral Education',
    '112': 'Hindu Religion & Moral Education',
    '113': 'Buddhist Religion & Moral Education',
    '114': 'Christian Religion & Moral Education',
    '127': 'Science',
    '131': 'Computer Studies',
    '140': 'Bangladesh & Global Studies',
    '141': 'Bangladesh & Global Studies II',
    '143': 'Business Entrepreneurship',
    '144': 'Civics & Citizenship',
    '145': 'Economics',
    '146': 'Accounting',
    '147': 'Physical Education, Health & Sports',
    '149': 'Arts & Crafts',
    '150': 'Agriculture Studies',
    '151': 'Home Science',
    '152': 'Finance & Banking',
    '153': 'Career Education',
    '154': 'Information & Communication Technology',

    // HSC Science & Electives
    '174': 'Physics I',
    '175': 'Physics II',
    '176': 'Chemistry I',
    '177': 'Chemistry II',
    '178': 'Biology I',
    '179': 'Biology II',
    '265': 'Higher Mathematics I',
    '266': 'Higher Mathematics II',
    '275': 'Information & Communication Technology',

    // HSC Business & Humanities
    '253': 'Accounting I',
    '254': 'Accounting II',
    '277': 'Business Organization & Management I',
    '278': 'Business Organization & Management II',
    '269': 'Economics I',
    '270': 'Economics II',
    '249': 'Civics & Good Governance I',
    '250': 'Civics & Good Governance II',
    '267': 'Islamic History & Culture I',
    '268': 'Islamic History & Culture II',
    '121': 'Logic I',
    '122': 'Logic II',
    '125': 'Psychology I',
    '133': 'Agriculture Studies I',
    '134': 'Agriculture Studies II',
  }

  function getSubjectName(code: string, currentExamType?: string): string {
    const isSsc = (currentExamType || examType || '').toLowerCase() === 'ssc'
    if (isSsc) {
      if (code === '126') return 'Higher Mathematics'
      if (code === '136') return 'Physics'
      if (code === '137') return 'Chemistry'
      if (code === '138') return 'Biology'
    } else {
      if (code === '126') return 'Psychology II'
      if (code === '136') return 'Physics'
      if (code === '137') return 'Chemistry'
      if (code === '138') return 'Biology'
    }
    return BOARD_SUBJECT_NAMES[code] || `Subject ${code}`
  }

  function gradeToPoint(g: string): number {
    const clean = g.toUpperCase().replace(/[^A-Z\+\-]/g, '')
    if (clean === 'A+') return 5.0
    if (clean === 'A') return 4.0
    if (clean === 'A-') return 3.5
    if (clean === 'B') return 3.0
    if (clean === 'C') return 2.0
    if (clean === 'D') return 1.0
    if (clean === 'F') return 0.0
    const num = parseFloat(g)
    return isNaN(num) ? 0 : num
  }

  function pointToGrade(p: number): string {
    if (p >= 5.0) return 'A+'
    if (p >= 4.0) return 'A'
    if (p >= 3.5) return 'A-'
    if (p >= 3.0) return 'B'
    if (p >= 2.0) return 'C'
    if (p >= 1.0) return 'D'
    return 'F'
  }

  const subjects: SubjectResult[] = []

  // Check display_details (format: "101:A+,107:A=78,174:A+...")
  const rawDetails = res.display_details || res.log_display_details || ''
  if (typeof rawDetails === 'string' && rawDetails.trim()) {
    const items = rawDetails.split(',')
    for (const item of items) {
      if (!item.includes(':')) continue
      const [codePart, gradePart] = item.split(':')
      const code = codePart.trim()
      const cleanGrade = gradePart.split('=')[0].trim().toUpperCase()
      const pt = gradeToPoint(cleanGrade)
      const name = getSubjectName(code, examType)
      subjects.push({
        code,
        name,
        grade: cleanGrade,
        gpa: pt,
      })
    }
  } else if (Array.isArray(res.sub_list)) {
    for (const s of res.sub_list) {
      const code = String(s.code || s.sub_code || '').trim()
      const name = String(s.name || s.sub_name || getSubjectName(code, examType)).trim()
      const g = String(s.grade || '').trim().toUpperCase()
      const pt = parseFloat(String(s.gpa || s.point || gradeToPoint(g))) || 0
      subjects.push({
        code,
        name,
        grade: g || pointToGrade(pt),
        gpa: pt,
      })
    }
  }

  // ── 3. Parse GPA, Grade & Pass Status ─────────────────────────────────────
  const resDetail = String(res.res_detail || res.result || res.result_status || '').trim()
  let rawGpa = String(res.gpa || res.res_gpa || res.gpa4 || '').trim()
  let gpa = parseFloat(rawGpa) || 0

  // If GPA not in res.gpa, check res_detail for a number like "GPA 3.83" or "3.83" or "PASSED=GPA 4.92"
  if (gpa === 0 && resDetail) {
    const match = resDetail.match(/(?:GPA|Point|গিপিএ)?[=:\s]*([0-5]\.\d{1,2})/i)
    if (match) {
      gpa = parseFloat(match[1])
    }
  }

  // If still 0, but we have subject grades, compute GPA from subjects
  if (gpa === 0 && subjects.length > 0) {
    const nonZeroGpas = subjects.map(s => s.gpa).filter(p => p > 0)
    if (nonZeroGpas.length > 0) {
      const sum = nonZeroGpas.reduce((a, b) => a + b, 0)
      gpa = parseFloat((sum / nonZeroGpas.length).toFixed(2))
    }
  }

  // Determine pass status
  const lowerDetail = resDetail.toLowerCase()
  const hasFailSubject = subjects.some(s => s.grade === 'F')
  let resultStatus: 'passed' | 'failed' = 'failed'

  if (
    lowerDetail === 'p' ||
    lowerDetail.includes('pass') ||
    lowerDetail.includes('উত্তীর্ণ') ||
    (gpa >= 1.0 && !hasFailSubject && !lowerDetail.includes('fail'))
  ) {
    resultStatus = 'passed'
  }

  let grade = String(res.grade || res.letter_grade || '').trim().toUpperCase()
  if (!grade) {
    grade = resultStatus === 'passed' ? pointToGrade(gpa) : 'F'
  }

  return {
    studentName,
    roll: rollResult,
    registration: regResult,
    fatherName,
    motherName,
    group,
    gpa,
    grade,
    resultStatus,
    subjects,
    board: boardName ? (boardName.charAt(0).toUpperCase() + boardName.slice(1)) : 'Dhaka',
    examYear: confirmedFields.examYear || '2017',
    examType: (confirmedFields.examType || 'HSC').toUpperCase(),
  }
}

// ─── parseResultHtml ──────────────────────────────────────────────────────────

/**
 * Parses the result HTML page from educationboardresults.gov.bd.
 * NOTE: Table structure may change — verify against live responses.
 */
export function parseResultHtml(html: string, fields: AdmitCardFields): HscResultData {
  const $ = cheerio.load(html)
  const bodyText = $.text() || ''

  // Check for failure indicators
  const lowerBody = bodyText.toLowerCase()
  if (
    lowerBody.includes('no result found') ||
    lowerBody.includes('result not found') ||
    lowerBody.includes('wrong captcha') ||
    lowerBody.includes('invalid captcha') ||
    lowerBody.includes('captcha error') ||
    bodyText.includes('ফলাফল পাওয়া যায়নি')
  ) {
    if (lowerBody.includes('captcha')) {
      throw new Error('ভুল CAPTCHA কোড। অনুগ্রহ করে আবার চেষ্টা করুন। (Wrong CAPTCHA — please try again)')
    }
    throw new Error('কোনো ফলাফল পাওয়া যায়নি। Roll, Registration এবং তথ্য যাচাই করুন। (No result found)')
  }

  // ── Extract fields from table rows ───────────────────────────────────────
  // The site renders a table with label/value rows like:
  //   <tr><td>Student Name</td><td>JOHN DOE</td></tr>
  // We collect all label→value pairs from all tables.

  const tableData: Record<string, string> = {}
  $('table tr').each((_i, row) => {
    const cells = $(row).find('td')
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim().toLowerCase()
      const value = $(cells[1]).text().trim()
      if (label && value) {
        tableData[label] = value
      }
    }
  })

  // Helper to look up flexible label keys
  function getField(...keys: string[]): string {
    for (const key of keys) {
      const kl = key.toLowerCase()
      for (const [label, value] of Object.entries(tableData)) {
        if (label.includes(kl)) return value
      }
    }
    return ''
  }

  const studentName =
    getField('student name', 'examinee name', 'name of examinee', 'নাম') || ''
  const fatherName =
    getField("father's name", 'father name', 'পিতার নাম', 'পিতা') || ''
  const motherName =
    getField("mother's name", 'mother name', 'মাতার নাম', 'মাতা') || ''
  const group =
    getField('group', 'বিভাগ') || fields.group || ''
  const rawGpa =
    getField('gpa', 'grade point', 'point') || '0'
  const grade =
    getField('grade', 'letter grade') || ''
  const rollResult =
    getField('roll', 'roll no') || fields.roll || ''
  const regResult =
    getField('registration', 'reg no', 'reg. no') || fields.registration || ''

  // Result status
  let resultStatus: 'passed' | 'failed' = 'failed'
  const resultText = getField('result', 'final result', 'ফলাফল').toLowerCase()
  if (
    resultText.includes('passed') ||
    resultText.includes('pass') ||
    resultText.includes('উত্তীর্ণ') ||
    parseFloat(rawGpa) >= 1.0
  ) {
    resultStatus = 'passed'
  }

  // ── Subject-wise results ──────────────────────────────────────────────────
  // Subject table: Code | Subject Name | Grade | GPA
  const subjects: SubjectResult[] = []

  // Try to find a subject table — typically identifiable by "Subject Code" header
  $('table').each((_ti, table) => {
    const headerRow = $(table).find('tr').first()
    const headerText = $(headerRow).text().toLowerCase()
    if (
      headerText.includes('subject') ||
      headerText.includes('code') ||
      headerText.includes('বিষয়')
    ) {
      $(table).find('tr').slice(1).each((_ri, row) => {
        const cells = $(row).find('td')
        if (cells.length >= 3) {
          const code = $(cells[0]).text().trim()
          const name = $(cells[1]).text().trim()
          const gradeVal = $(cells[2]).text().trim()
          const gpaVal = cells.length >= 4 ? $(cells[3]).text().trim() : ''

          if (code && name && gradeVal && !/subject|code|বিষয়/i.test(name)) {
            subjects.push({
              code,
              name,
              grade: gradeVal,
              gpa: parseFloat(gpaVal) || 0,
            })
          }
        }
      })
    }
  })

  return {
    studentName,
    roll: rollResult,
    registration: regResult,
    fatherName,
    motherName,
    group,
    gpa: parseFloat(rawGpa) || 0,
    grade,
    resultStatus,
    subjects,
    board: fields.board || '',
    examYear: fields.examYear || '',
    examType: fields.examType || '',
  }
}


