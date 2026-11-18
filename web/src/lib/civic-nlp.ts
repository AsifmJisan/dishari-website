import { ALL_OFFICIAL_SERVICES } from './default-services'
import type { Service } from '@/types'

export interface NavCard {
  url: string
  titleBn: string
  titleEn: string
  breadcrumbBn: string
  breadcrumbEn: string
}

export interface NavEntry {
  url: string
  titleBn: string
  titleEn: string
  breadcrumbBn: string
  breadcrumbEn: string
  keywordsBn: string[]
  keywordsEn: string[]
  serviceSlug?: string
}

// ─── BENGALI SPEECH & TEXT NORMALIZER ─────────────────────────────────────────
export function normalizeBanglaText(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFC')
    // Remove zero-width characters (ZWJ, ZWNJ, etc.)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize Bengali decomposed characters (e.g. \u09AF\u09BC -> \u09DF 'য়')
    .replace(/\u09AF\u09BC/g, '\u09DF')
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড়
    .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ়
    // Standardize acronyms spoken with pauses or spaces
    .replace(/এন\s*আই\s*ডি/g, 'এনআইডি')
    .replace(/ই\s*পাসপোর্ট/g, 'ইপাসপোর্ট')
    .replace(/ই\s*নামজারি/g, 'ইনামজারি')
    .replace(/টি\s*আই\s*এন/g, 'টিআইএন')
    .replace(/বি\s*এম\s*ই\s*টি/g, 'বিএমইটি')
    .replace(/বি\s*আর\s*টি\s*এ/g, 'বিআরটিএ')
    .replace(/আর\s*জে\s*এস\s*সি/g, 'আরজেএসসি')
    .replace(/লক\s*কার/g, 'লকার')
    .replace(/লোকার/g, 'লকার')
    // Strip Bengali & English punctuation
    .replace(/[\u0964\.,\?!;:'"()[\]{}/\\_\-=+*&^%$#@~`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── BENGALI SUFFIX STEMMER ───────────────────────────────────────────────────
// Common Bengali nominal suffixes (বিভক্তি ও প্রত্যয়)
const BENGALI_SUFFIXES = ['তে', 'ে', 'র', 'ের', 'কে', 'টা', 'টি', 'গুলো', 'সমূহ', 'খান', 'খানা']

export function matchesKeywordOrStem(normalizedText: string, keyword: string): boolean {
  const normKw = normalizeBanglaText(keyword)
  if (!normKw) return false

  // Direct substring check
  if (normalizedText.includes(normKw)) return true

  // Token-level stemming check (e.g. 'এনআইডিতে' -> 'এনআইডি', 'পাসপোর্টের' -> 'পাসপোর্ট')
  const tokens = normalizedText.split(' ')
  for (const token of tokens) {
    if (token === normKw) return true
    for (const suffix of BENGALI_SUFFIXES) {
      if (token.endsWith(suffix) && token.slice(0, -suffix.length) === normKw) {
        return true
      }
    }
  }

  return false
}

// ─── NAVIGATION INTENT TRIGGERS ──────────────────────────────────────────────
export const NAV_TRIGGERS_BN = [
  'নিয়ে যাও',
  'নিয়ে যাও',
  'নিয়ে যান',
  'নিয়ে যান',
  'নিয়ে চল',
  'নিয়ে চল',
  'নিয়ে চলো',
  'নিয়ে চলো',
  'নিয়ে চলেন',
  'নিয়ে চলেন',
  'যাব',
  'যাবো',
  'যেতে চাই',
  'যাইতে চাই',
  'যাও',
  'যান',
  'চল',
  'চলো',
  'চলেন',
  'যাই',
  'দেখান',
  'দেখাও',
  'দেখতে চাই',
  'দেখবো',
  'দেখব',
  'খুলুন',
  'খোল',
  'খুলো',
  'ওপেন কর',
  'ওপেন করো',
  'ওপেন করুন',
  'ঢোকো',
  'ঢুকো',
  'ঢুকুন',
  'প্রবেশ কর',
  'প্রবেশ করো',
  'প্রবেশ করুন',
  'কোথায়',
  'কোনে',
  'কিভাবে যাব',
  'কেমনে যাব',
  'খুঁজে দাও',
  'বের করো',
  'বের করে দাও',
  'পেজে যাও',
  'পেইজে যাও',
  'পেজে নিয়ে যাও',
  'পেইজে নিয়ে যাও',
  'সাইটে যাও',
  'মেনুতে যাও'
]

export const NAV_TRIGGERS_EN = [
  'take me to',
  'go to',
  'open',
  'show me',
  'navigate to',
  'navigate',
  'find',
  'where is',
  'bring me to',
  'i want to go to',
  'i need to go to',
  'head to',
  'visit',
  'direct me to',
  'teleport to'
]

// ─── FULL APPLICATION SITE NAVIGATION MAP ────────────────────────────────────
export const SITE_NAV_MAP: NavEntry[] = [
  {
    url: '/services/nid-correction',
    serviceSlug: 'nid-correction',
    titleBn: 'NID সংশোধন ও জাতীয় পরিচয়পত্র',
    titleEn: 'NID Correction & Smart National ID',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → জাতীয় পরিচয়পত্র সংশোধন',
    breadcrumbEn: 'Services → Identity → NID Correction',
    keywordsBn: [
      'এনআইডি',
      'এন আইডি',
      'এনআইডি সংশোধন',
      'এনআইডি কার্ড',
      'স্মার্ট কার্ড',
      'স্মার্ট এনআইডি',
      'জাতীয় পরিচয়পত্র',
      'পরিচয়পত্র',
      'ভোটার আইডি',
      'ভোটার কার্ড',
      'ভোটার আইডি কার্ড',
      'ভোটার',
      'সংশোধন'
    ],
    keywordsEn: ['nid', 'national id', 'nid correction', 'voter id', 'smart card', 'smart nid']
  },
  {
    url: '/services/passport',
    serviceSlug: 'passport',
    titleBn: 'ই-পাসপোর্ট আবেদন',
    titleEn: 'E-Passport Application',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → ই-পাসপোর্ট আবেদন',
    breadcrumbEn: 'Services → Identity → E-Passport Application',
    keywordsBn: [
      'পাসপোর্ট',
      'ই-পাসপোর্ট',
      'ইপাসপোর্ট',
      'পাসপোর্ট আবেদন',
      'নতুন পাসপোর্ট',
      'পাসপোর্ট ফি',
      'পাসপোর্ট করতে চাই'
    ],
    keywordsEn: ['passport', 'e-passport', 'passport application', 'epassport', 'new passport']
  },
  {
    url: '/services/passport-renewal',
    serviceSlug: 'passport-renewal',
    titleBn: 'পাসপোর্ট নবায়ন / রি-ইস্যু',
    titleEn: 'Passport Renewal',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → পাসপোর্ট নবায়ন',
    breadcrumbEn: 'Services → Identity → Passport Renewal',
    keywordsBn: [
      'পাসপোর্ট নবায়ন',
      'পাসপোর্ট রিনিউ',
      'নবায়ন',
      'রিনিউ',
      'পাসপোর্ট মেয়াদ শেষ',
      'রিইস্যু',
      'রি-ইস্যু'
    ],
    keywordsEn: ['passport renewal', 'renew passport', 'renewal', 'renew my passport', 'renew', 'reissue']
  },
  {
    url: '/services/birth-registration',
    serviceSlug: 'birth-registration',
    titleBn: 'জন্ম নিবন্ধন',
    titleEn: 'Birth Registration',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → জন্ম নিবন্ধন (BDRIS)',
    breadcrumbEn: 'Services → Identity → Birth Registration (BDRIS)',
    keywordsBn: [
      'জন্ম নিবন্ধন',
      'জন্মনিবন্ধন',
      'জন্ম সনদ',
      'জন্মসনদ',
      'জন্মের কাগজ',
      'বিডিআরআইএস',
      'অনলাইন জন্ম নিবন্ধন'
    ],
    keywordsEn: ['birth registration', 'birth certificate', 'bdris', 'birth record']
  },
  {
    url: '/services/land-mutation',
    serviceSlug: 'land-mutation',
    titleBn: 'ই-নামজারি (ভূমি খারিজ)',
    titleEn: 'E-Mutation (Land)',
    breadcrumbBn: 'সেবা সমূহ → ভূমি সেবা → ই-নামজারি',
    breadcrumbEn: 'Services → Land Services → E-Mutation',
    keywordsBn: [
      'নামজারি',
      'ই-নামজারি',
      'ইনামজারি',
      'মিউটেশন',
      'খারিজ',
      'জমি খারিজ',
      'জমির নামজারি',
      'বাবার মৃত্যুর পর জমি',
      'ওয়ারিশি জমি'
    ],
    keywordsEn: ['land mutation', 'mutation', 'land', 'e-mutation', 'khatian', 'namjari']
  },
  {
    url: '/services/land-khatian',
    serviceSlug: 'land-khatian',
    titleBn: 'অনলাইন খতিয়ান ও পর্চা',
    titleEn: 'Khatian & Porcha',
    breadcrumbBn: 'সেবা সমূহ → ভূমি সেবা → অনলাইন খতিয়ান ও পর্চা',
    breadcrumbEn: 'Services → Land Services → Online Khatian & Porcha',
    keywordsBn: [
      'খতিয়ান',
      'পর্চা',
      'অনলাইন খতিয়ান',
      'সিএস',
      'এসএ',
      'আরএস',
      'বিএস',
      'দাগ নম্বর',
      'পর্চা উত্তোলন',
      'সার্টিফাইড কপি'
    ],
    keywordsEn: ['khatian', 'porcha', 'land record', 'certified copy', 'eporcha']
  },
  {
    url: '/services/land-tax',
    serviceSlug: 'land-tax',
    titleBn: 'ভূমি উন্নয়ন কর (খাজনা)',
    titleEn: 'Land Development Tax',
    breadcrumbBn: 'সেবা সমূহ → ভূমি সেবা → ভূমি উন্নয়ন কর (খাজনা)',
    breadcrumbEn: 'Services → Land Services → Land Development Tax (Khajna)',
    keywordsBn: [
      'খাজনা',
      'ভূমি উন্নয়ন কর',
      'দাখিলা',
      'জমির কর',
      'এলডি ট্যাক্স',
      'জমির খাজনা'
    ],
    keywordsEn: ['land tax', 'khajna', 'ld tax', 'land development tax', 'dakhila']
  },
  {
    url: '/services/mouza-map',
    serviceSlug: 'mouza-map',
    titleBn: 'মৌজা ম্যাপ ও জমির নকশা',
    titleEn: 'Mouza Map & Plot Sheet',
    breadcrumbBn: 'সেবা সমূহ → ভূমি সেবা → ডিজিটাল মৌজা ম্যাপ',
    breadcrumbEn: 'Services → Land Services → Digital Mouza Map',
    keywordsBn: [
      'মৌজা ম্যাপ',
      'মৌজা নকশা',
      'ম্যাপ',
      'নকশা',
      'জমির নকশা',
      'মৌজা শিট',
      'প্লট শিট'
    ],
    keywordsEn: ['mouza map', 'map', 'land map', 'plot sheet', 'mouza sheet']
  },
  {
    url: '/services/driving-license',
    serviceSlug: 'driving-license',
    titleBn: 'ড্রাইভিং লাইসেন্স',
    titleEn: 'Driving License',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → ড্রাইভিং লাইসেন্স',
    breadcrumbEn: 'Services → Identity → Driving License',
    keywordsBn: [
      'ড্রাইভিং লাইসেন্স',
      'লাইসেন্স',
      'লার্নার',
      'বিআরটিএ',
      'ড্রাইভিং',
      'গাড়ির লাইসেন্স',
      'বিআরটিএ লাইসেন্স'
    ],
    keywordsEn: ['driving license', 'driving', 'license', 'brta', 'learner license']
  },
  {
    url: '/services/vehicle-fitness',
    serviceSlug: 'vehicle-fitness',
    titleBn: 'মোটরযান ফিটনেস ও ট্যাক্স টোকেন',
    titleEn: 'Vehicle Fitness & Tax Token',
    breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও পরিবহন → ফিটনেস ও ট্যাক্স টোকেন',
    breadcrumbEn: 'Services → Business & Transport → Vehicle Fitness & Tax Token',
    keywordsBn: [
      'ফিটনেস',
      'ট্যাক্স টোকেন',
      'গাড়ির ফিটনেস',
      'মোটরযান',
      'বিআরটিএ ট্যাক্স',
      'মোটরযান ফিটনেস'
    ],
    keywordsEn: ['fitness', 'vehicle fitness', 'tax token', 'car fitness', 'vehicle']
  },
  {
    url: '/services/police-clearance',
    serviceSlug: 'police-clearance',
    titleBn: 'পুলিশ ক্লিয়ারেন্স সনদ',
    titleEn: 'Police Clearance',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → পুলিশ ক্লিয়ারেন্স সার্টিফিকেট',
    breadcrumbEn: 'Services → Identity → Police Clearance Certificate',
    keywordsBn: [
      'পুলিশ ক্লিয়ারেন্স',
      'ক্লিয়ারেন্স',
      'থানা ভেরিফিকেশন',
      'পুলিশ সনদ',
      'পিসিসি',
      'পুলিশ ভেরিফিকেশন'
    ],
    keywordsEn: ['police clearance', 'police clearance certificate', 'pcc', 'police verification']
  },
  {
    url: '/services/tin-certificate',
    serviceSlug: 'tin-certificate',
    titleBn: 'টিআইএন সনদ (ই-টিন)',
    titleEn: 'TIN Certificate',
    breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও কর → টিআইএন সনদ',
    breadcrumbEn: 'Services → Business & Tax → TIN Certificate',
    keywordsBn: ['টিআইএন', 'টিন', 'টিন সনদ', 'টিন সার্টিফিকেট', 'কর শনাক্তকরণ', 'ট্যাক্স আইডি'],
    keywordsEn: ['tin', 'tin certificate', 'tax identification', 'e-tin']
  },
  {
    url: '/services/tax-return',
    serviceSlug: 'tax-return',
    titleBn: 'আয়কর রিটার্ন',
    titleEn: 'Income Tax Return',
    breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও কর → আয়কর রিটার্ন',
    breadcrumbEn: 'Services → Business & Tax → Income Tax Return',
    keywordsBn: ['আয়কর', 'ট্যাক্স রিটার্ন', 'কর রিটার্ন', 'ইনকাম ট্যাক্স', 'জিরো রিটার্ন'],
    keywordsEn: ['tax return', 'income tax', 'income tax return']
  },
  {
    url: '/services/trade-license',
    serviceSlug: 'trade-license',
    titleBn: 'ট্রেড লাইসেন্স',
    titleEn: 'Trade License',
    breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও কর → ট্রেড লাইসেন্স',
    breadcrumbEn: 'Services → Business & Tax → Trade License',
    keywordsBn: ['ট্রেড লাইসেন্স', 'ট্রেডলাইসেন্স', 'ব্যবসা লাইসেন্স', 'বাণিজ্য লাইসেন্স', 'দোকানের লাইসেন্স'],
    keywordsEn: ['trade license', 'business license', 'trade']
  },
  {
    url: '/services/bmet-smart-card',
    serviceSlug: 'bmet-smart-card',
    titleBn: 'বিএমইটি স্মার্ট কার্ড (প্রবাসী)',
    titleEn: 'BMET Smart Card',
    breadcrumbBn: 'সেবা সমূহ → প্রবাসী সেবা → বিএমইটি স্মার্ট কার্ড',
    breadcrumbEn: 'Services → Overseas → BMET Smart Card',
    keywordsBn: [
      'বিএমইটি',
      'প্রবাসী কার্ড',
      'ম্যানপাওয়ার কার্ড',
      'আমি প্রবাসী',
      'ইমিগ্রেশন ছাড়পত্র',
      'প্রবাসী'
    ],
    keywordsEn: ['bmet', 'bmet card', 'smart card', 'emigration clearance', 'ami probashi']
  },
  {
    url: '/services/widow-allowance',
    serviceSlug: 'widow-allowance',
    titleBn: 'বিধবা ভাতা',
    titleEn: 'Widow Allowance',
    breadcrumbBn: 'সেবা সমূহ → সামাজিক সুরক্ষা → বিধবা ভাতা',
    breadcrumbEn: 'Services → Social Welfare → Widow Allowance',
    keywordsBn: ['বিধবা ভাতা', 'বিধবা', 'স্বামীহারা', 'স্বামী নিগৃহীতা ভাতা'],
    keywordsEn: ['widow allowance', 'widow', 'widow benefit']
  },
  {
    url: '/services/old-age-allowance',
    serviceSlug: 'old-age-allowance',
    titleBn: 'বয়স্ক ভাতা',
    titleEn: 'Old Age Allowance',
    breadcrumbBn: 'সেবা সমূহ → সামাজিক সুরক্ষা → বয়স্ক ভাতা',
    breadcrumbEn: 'Services → Social Welfare → Old Age Allowance',
    keywordsBn: ['বয়স্ক ভাতা', 'বয়স্ক', 'বৃদ্ধ ভাতা', 'বয়োবৃদ্ধ ভাতা'],
    keywordsEn: ['old age allowance', 'elderly allowance', 'senior allowance']
  },
  {
    url: '/services/disability-allowance',
    serviceSlug: 'disability-allowance',
    titleBn: 'প্রতিবন্ধী ভাতা',
    titleEn: 'Disability Allowance',
    breadcrumbBn: 'সেবা সমূহ → সামাজিক সুরক্ষা → অসচ্ছল প্রতিবন্ধী ভাতা',
    breadcrumbEn: 'Services → Social Welfare → Disability Allowance',
    keywordsBn: ['প্রতিবন্ধী ভাতা', 'প্রতিবন্ধী', 'প্রতিবন্ধিতা ভাতা'],
    keywordsEn: ['disability allowance', 'disability benefit']
  },
  {
    url: '/services/scholarship',
    serviceSlug: 'scholarship',
    titleBn: 'উপবৃত্তি / বৃত্তি (PMEAT)',
    titleEn: 'Scholarship / Stipend',
    breadcrumbBn: 'সেবা সমূহ → শিক্ষা → উপবৃত্তি ও বৃত্তি',
    breadcrumbEn: 'Services → Education → Scholarship & Stipend',
    keywordsBn: ['উপবৃত্তি', 'বৃত্তি', 'স্কলারশিপ', 'শিক্ষা সহায়তা', 'পিএমইএটি', 'ছাত্র উপবৃত্তি'],
    keywordsEn: ['scholarship', 'stipend', 'pmeat', 'education grant']
  },
  {
    url: '/services/maternity-allowance',
    serviceSlug: 'maternity-allowance',
    titleBn: 'মাতৃত্বকালীন ভাতা',
    titleEn: 'Maternity Allowance',
    breadcrumbBn: 'সেবা সমূহ → সামাজিক নিরাপত্তা → মা ও শিশু সহায়তা ভাতা',
    breadcrumbEn: 'Services → Welfare → Mother & Child Benefit Allowance',
    keywordsBn: ['মাতৃত্বকালীন ভাতা', 'গর্ভবতী ভাতা', 'মা ও শিশু সহায়তা', 'মাতৃত্ব ভাতা'],
    keywordsEn: ['maternity allowance', 'pregnancy allowance', 'mother and child benefit']
  },
  {
    url: '/services/warishan-certificate',
    serviceSlug: 'warishan-certificate',
    titleBn: 'ওয়ারিশান সনদ',
    titleEn: 'Warishan Certificate',
    breadcrumbBn: 'সেবা সমূহ → পরিচয় ও নাগরিক সেবা → ওয়ারিশান সনদ',
    breadcrumbEn: 'Services → Identity → Legal Heirship Certificate',
    keywordsBn: ['ওয়ারিশান', 'ওয়ারিশ সনদ', 'উত্তরাধিকার সনদ', 'ওয়ারিশান সনদ', 'ওয়ারিশ'],
    keywordsEn: ['warishan', 'warishan certificate', 'heirship', 'legal heir', 'inheritance']
  },
  {
    url: '/services/suborno-nagorik-card',
    serviceSlug: 'suborno-nagorik-card',
    titleBn: 'সুবর্ণ নাগরিক কার্ড',
    titleEn: 'Suborno Nagorik Card',
    breadcrumbBn: 'সেবা সমূহ → স্বাস্থ্য ও কল্যাণ → সুবর্ণ নাগরিক স্মার্ট কার্ড',
    breadcrumbEn: 'Services → Health & Welfare → Suborno Nagorik Card',
    keywordsBn: ['সুবর্ণ নাগরিক', 'প্রতিবন্ধী কার্ড', 'প্রতিবন্ধী স্মার্ট কার্ড'],
    keywordsEn: ['suborno nagorik', 'disability card', 'disability smart card']
  },
  {
    url: '/services/rjsc-company-registration',
    serviceSlug: 'rjsc-company-registration',
    titleBn: 'আরজেএসসি কোম্পানি নিবন্ধন',
    titleEn: 'RJSC Company Registration',
    breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও উদ্যোগ → আরজেএসসি কোম্পানি নিবন্ধন',
    breadcrumbEn: 'Services → Business → RJSC Company Registration',
    keywordsBn: ['কোম্পানি নিবন্ধন', 'আরজেএসসি', 'ফার্ম নিবন্ধন', 'নামের ছাড়পত্র', 'লিমিটেড কোম্পানি'],
    keywordsEn: ['company registration', 'rjsc', 'company incorporation', 'name clearance']
  },
  {
    url: '/services/board-certificate-duplicate',
    serviceSlug: 'board-certificate-duplicate',
    titleBn: 'শিক্ষা বোর্ড সনদ উত্তোলন',
    titleEn: 'Board Certificate Issue',
    breadcrumbBn: 'সেবা সমূহ → শিক্ষা → শিক্ষা বোর্ড সনদ ও নম্বরপত্র',
    breadcrumbEn: 'Services → Education → Board Certificate & Transcript',
    keywordsBn: ['বোর্ড সনদ', 'সার্টিফিকেট উত্তোলন', 'নম্বরপত্র', 'এসএসসি সনদ', 'এইচএসসি সনদ', 'মার্কশিট'],
    keywordsEn: ['board certificate', 'duplicate certificate', 'transcript', 'marksheet']
  },
  {
    url: '/services/school-admission',
    serviceSlug: 'school-admission',
    titleBn: 'বিদ্যালয়ে কেন্দ্রীয় ভর্তি',
    titleEn: 'School Admission (GSA)',
    breadcrumbBn: 'সেবা সমূহ → শিক্ষা → কেন্দ্রীয় বিদ্যালয় ভর্তি আবেদন',
    breadcrumbEn: 'Services → Education → Central School Admission',
    keywordsBn: ['স্কুল ভর্তি', 'বিদ্যালয় ভর্তি', 'ভর্তি আবেদন', 'জিএসএ ভর্তি', 'টেলিটক ভর্তি'],
    keywordsEn: ['school admission', 'gsa', 'admission', 'school lottery']
  },
  {
    url: '/services/telemedicine-16263',
    serviceSlug: 'telemedicine-16263',
    titleBn: 'স্বাস্থ্য বাতায়ন ১৬২৬৩',
    titleEn: 'Shastho Batayan 16263',
    breadcrumbBn: 'সেবা সমূহ → স্বাস্থ্যসেবা → স্বাস্থ্য বাতায়ন ও টেলিমেডিসিন',
    breadcrumbEn: 'Services → Health → Shastho Batayan Telemedicine',
    keywordsBn: ['স্বাস্থ্য বাতায়ন', 'টেলিমেডিসিন', '১৬২৬৩', 'ডাক্তার পরামর্শ', 'স্বাস্থ্যসেবা', 'চিকিৎসা'],
    keywordsEn: ['telemedicine', '16263', 'doctor consultation', 'shastho batayan']
  },
  {
    url: '/services/vaccination-certificate',
    serviceSlug: 'vaccination-certificate',
    titleBn: 'ইপিআই টিকাদান ও সনদ',
    titleEn: 'Vaccination Certificate',
    breadcrumbBn: 'সেবা সমূহ → স্বাস্থ্যসেবা → ইপিআই টিকাদান সনদ',
    breadcrumbEn: 'Services → Health → Vaccination Certificate',
    keywordsBn: ['টিকা', 'ভ্যাকসিন', 'ইপিআই', 'টিকাদান সনদ', 'ভ্যাকসিনেশন', 'টিকা কার্ড'],
    keywordsEn: ['vaccine', 'vaccination', 'epi', 'vaccine certificate']
  },

  // ─── CORE CITIZEN PORTAL WORKSPACES ───
  {
    url: '/dashboard?tab=locker',
    titleBn: 'সুরক্ষিত ডিজিটাল লকার',
    titleEn: 'Document Locker (Vault)',
    breadcrumbBn: 'ড্যাশবোর্ড → ডিজিটাল লকার ট্যাব',
    breadcrumbEn: 'Dashboard → Document Locker tab',
    keywordsBn: [
      'লকার',
      'ডকুমেন্ট লকার',
      'আমার লকার',
      'কাগজপত্র',
      'ডকুমেন্ট',
      'নথিপত্র',
      'লকারে'
    ],
    keywordsEn: ['locker', 'document locker', 'vault', 'my locker', 'documents', 'my documents']
  },
  {
    url: '/dashboard?tab=applications',
    titleBn: 'আমার আবেদনসমূহ',
    titleEn: 'My Applications',
    breadcrumbBn: 'ড্যাশবোর্ড → আমার আবেদন ট্যাব',
    breadcrumbEn: 'Dashboard → My Applications tab',
    keywordsBn: ['আবেদন', 'আমার আবেদন', 'আবেদনের তালিকা', 'আবেদনসমূহ', 'চলমান আবেদন'],
    keywordsEn: ['applications', 'my applications', 'application list', 'active applications']
  },
  {
    url: '/dashboard?tab=deadlines',
    titleBn: 'ডেডলাইন রাডার',
    titleEn: 'Deadlines Radar',
    breadcrumbBn: 'ড্যাশবোর্ড → ডেডলাইন রাডার ট্যাব',
    breadcrumbEn: 'Dashboard → Deadlines Radar tab',
    keywordsBn: ['ডেডলাইন', 'সময়সীমা', 'শেষ তারিখ', 'ক্যালেন্ডার', 'কাউন্টডাউন'],
    keywordsEn: ['deadlines', 'deadline radar', 'due dates', 'calendar deadlines']
  },
  {
    url: '/dashboard?tab=settings',
    titleBn: 'প্রোফাইল সেটিংস',
    titleEn: 'Profile Settings',
    breadcrumbBn: 'ড্যাশবোর্ড → সেটিংস ট্যাব',
    breadcrumbEn: 'Dashboard → Settings tab',
    keywordsBn: ['সেটিংস', 'প্রোফাইল', 'অ্যাকাউন্ট', 'আমার তথ্য', 'প্রোফাইল সেটিংস'],
    keywordsEn: ['settings', 'profile', 'account settings', 'my profile']
  },
  {
    url: '/dashboard',
    titleBn: 'নাগরিক ড্যাশবোর্ড',
    titleEn: 'Citizen Dashboard',
    breadcrumbBn: 'নেভিবার → ড্যাশবোর্ড',
    breadcrumbEn: 'Navbar → Dashboard',
    keywordsBn: ['ড্যাশবোর্ড', 'কন্ট্রোল প্যানেল', 'আমার ড্যাশবোর্ড'],
    keywordsEn: ['dashboard', 'my dashboard', 'workspace']
  },
  {
    url: '/opportunities',
    titleBn: 'সরকারি সুযোগ ও অনুদান',
    titleEn: 'Government Opportunities',
    breadcrumbBn: 'নেভিবার → সরকারি সুযোগ',
    breadcrumbEn: 'Navbar → Opportunities',
    keywordsBn: ['সুযোগ', 'সরকারি সুযোগ', 'অনুদান', 'গ্রান্ট', 'যুব ঋণ', 'যুব প্রশিক্ষণ', 'ঋণ'],
    keywordsEn: ['opportunities', 'grants', 'government opportunities', 'youth loan']
  },
  {
    url: '/services',
    titleBn: 'সকল সরকারি সেবা',
    titleEn: 'All Services Directory',
    breadcrumbBn: 'নেভিবার → সেবা সমূহ',
    breadcrumbEn: 'Navbar → Services',
    keywordsBn: ['সেবা', 'সকল সেবা', 'সেবা সমূহ', 'সার্ভিস', 'সেবা তালিকা'],
    keywordsEn: ['services', 'all services', 'service directory']
  },
  {
    url: '/login',
    titleBn: 'নাগরিক প্রবেশ (লগইন)',
    titleEn: 'Citizen Login',
    breadcrumbBn: 'নেভিবার → লগইন',
    breadcrumbEn: 'Navbar → Login',
    keywordsBn: ['লগইন', 'লগ ইন', 'সাইন ইন', 'প্রবেশ', 'লগইন পেজ'],
    keywordsEn: ['login', 'sign in', 'log in', 'citizen login']
  },
  {
    url: '/register',
    titleBn: 'নাগরিক নিবন্ধন (সাইন আপ)',
    titleEn: 'Citizen Registration',
    breadcrumbBn: 'নেভিবার → নিবন্ধন',
    breadcrumbEn: 'Navbar → Register',
    keywordsBn: ['নিবন্ধন', 'রেজিস্ট্রেশন', 'সাইন আপ', 'অ্যাকাউন্ট তৈরি', 'অ্যাকাউন্ট খুলব', 'নতুন অ্যাকাউন্ট'],
    keywordsEn: ['register', 'sign up', 'registration', 'create account']
  },
  {
    url: '/about',
    titleBn: 'আমাদের সম্পর্কে',
    titleEn: 'About Dishari',
    breadcrumbBn: 'নেভিবার → সম্পর্কে',
    breadcrumbEn: 'Navbar → About',
    keywordsBn: ['সম্পর্কে', 'আমাদের সম্পর্কে', 'পরিচিতি', 'দিশারী সম্পর্কে'],
    keywordsEn: ['about', 'about us', 'who we are']
  },
  {
    url: '/',
    titleBn: 'দিশারী হোম পেজ',
    titleEn: 'Home Page',
    breadcrumbBn: 'নেভিবার → হোম',
    breadcrumbEn: 'Navbar → Home',
    keywordsBn: ['হোম', 'প্রথম পাতা', 'মূল পাতা', 'হোম পেজ', 'মেইন পেজ'],
    keywordsEn: ['home', 'home page', 'main page']
  }
]

// ─── NAVIGATION INTENT RESOLVER ──────────────────────────────────────────────
export function resolveNavigationIntent(rawText: string): {
  navEntry: NavEntry | null
  isExplicitNav: boolean
} {
  const norm = normalizeBanglaText(rawText)
  if (!norm) return { navEntry: null, isExplicitNav: false }

  // Check if speech has a navigation trigger verb
  const hasNavTrigger =
    NAV_TRIGGERS_BN.some((t) => norm.includes(normalizeBanglaText(t))) ||
    NAV_TRIGGERS_EN.some((t) => norm.includes(t.toLowerCase()))

  // Find the best matching navigation destination
  let bestMatch: NavEntry | null = null
  let bestScore = 0

  for (const entry of SITE_NAV_MAP) {
    const allKeywords = [...entry.keywordsBn, ...entry.keywordsEn]
    for (const kw of allKeywords) {
      if (matchesKeywordOrStem(norm, kw)) {
        const score = kw.length
        if (score > bestScore) {
          bestMatch = entry
          bestScore = score
        }
      }
    }
  }

  if (bestMatch) {
    return {
      navEntry: bestMatch,
      isExplicitNav: hasNavTrigger
    }
  }

  return { navEntry: null, isExplicitNav: false }
}

// ─── CIVIC KNOWLEDGE & INTENT ANSWER GENERATOR ──────────────────────────────
export interface CivicResponseResult {
  reply: string
  navCard?: NavCard
  autoNav?: boolean
}

export function generateJonobondhuResponse(
  rawText: string,
  lang: 'bn' | 'en'
): CivicResponseResult {
  const norm = normalizeBanglaText(rawText)
  const isBn = lang === 'bn'

  // 1. Check for explicit or direct navigation
  const { navEntry, isExplicitNav } = resolveNavigationIntent(rawText)

  if (navEntry && isExplicitNav) {
    const navCard: NavCard = {
      url: navEntry.url,
      titleBn: navEntry.titleBn,
      titleEn: navEntry.titleEn,
      breadcrumbBn: navEntry.breadcrumbBn,
      breadcrumbEn: navEntry.breadcrumbEn
    }

    const reply = isBn
      ? `স্বয়ংক্রিয় নেভিগেশন সক্রিয়! আপনাকে "${navEntry.titleBn}" পৃষ্ঠায় নিয়ে যাচ্ছি...`
      : `Autonomous navigation engaged! Taking you to "${navEntry.titleEn}"...`

    return {
      reply,
      navCard,
      autoNav: true
    }
  }

  // 2. Identify if user is asking about a specific service
  let matchedService: Service | null = null
  if (navEntry?.serviceSlug) {
    matchedService = ALL_OFFICIAL_SERVICES.find((s) => s.slug === navEntry.serviceSlug) || null
  }

  // Fallback service search across ALL_OFFICIAL_SERVICES if not mapped through navEntry
  if (!matchedService) {
    for (const s of ALL_OFFICIAL_SERVICES) {
      if (
        matchesKeywordOrStem(norm, s.name_bn) ||
        matchesKeywordOrStem(norm, s.name_en) ||
        norm.includes(s.slug.replace(/-/g, ' '))
      ) {
        matchedService = s
        break
      }
    }
  }

  // 3. Question Topic Classification (Fees, Documents, Time, Steps, Errors, General)
  const isAskingFee =
    norm.includes('ফি') ||
    norm.includes('খরচ') ||
    norm.includes('টাকা') ||
    norm.includes('কত লাগবে') ||
    norm.includes('খরচা') ||
    norm.includes('fee') ||
    norm.includes('cost') ||
    norm.includes('charge')

  const isAskingDocs =
    norm.includes('কাগজ') ||
    norm.includes('ডকুমেন্ট') ||
    norm.includes('সনদ') ||
    norm.includes('নথিপত্র') ||
    norm.includes('কি কি লাগবে') ||
    norm.includes('কী কী লাগবে') ||
    norm.includes('document') ||
    norm.includes('papers') ||
    norm.includes('checklist')

  const isAskingTime =
    norm.includes('কত দিন') ||
    norm.includes('সময়') ||
    norm.includes('কবে পাব') ||
    norm.includes('মেয়াদ') ||
    norm.includes('সময়সীমা') ||
    norm.includes('time') ||
    norm.includes('days') ||
    norm.includes('duration')

  const isAskingProcess =
    norm.includes('কিভাবে') ||
    norm.includes('কীভাবে') ||
    norm.includes('নিয়ম') ||
    norm.includes('পদ্ধতি') ||
    norm.includes('ধাপ') ||
    norm.includes('কোথায় যেতে হবে') ||
    norm.includes('আবেদন') ||
    norm.includes('how to') ||
    norm.includes('process') ||
    norm.includes('apply')

  // 4. If a service is recognized, build an authoritative, structured answer
  if (matchedService) {
    const navCard: NavCard = navEntry
      ? {
          url: navEntry.url,
          titleBn: navEntry.titleBn,
          titleEn: navEntry.titleEn,
          breadcrumbBn: navEntry.breadcrumbBn,
          breadcrumbEn: navEntry.breadcrumbEn
        }
      : {
          url: `/services/${matchedService.slug}`,
          titleBn: matchedService.name_bn,
          titleEn: matchedService.name_en,
          breadcrumbBn: `সেবা সমূহ → ${matchedService.name_bn}`,
          breadcrumbEn: `Services → ${matchedService.name_en}`
        }

    // A. Specific Fee Query
    if (isAskingFee) {
      const reply = isBn
        ? `"${matchedService.name_bn}"-এর সরকারি গেজেট ফি: ${matchedService.fee} টাকা (${matchedService.fee_note_bn})। সরকারি ফি ছাড়া কোনো অতিরিক্ত বা দালাল ফি দেওয়া দণ্ডনীয় অপরাধ। সব সময় অফিসিয়াল চালানের মাধ্যমে ফি জমা দিন।`
        : `Official government gazette fee for "${matchedService.name_en}" is ${matchedService.fee} BDT (${matchedService.fee_note_bn}). Government services do not have extra broker fees. Always pay through official A-Challan.`

      return { reply, navCard }
    }

    // B. Specific Required Documents Query
    if (isAskingDocs) {
      const docList = matchedService.required_docs
        .map((d, i) => `${i + 1}) ${d.name_bn}`)
        .join(', ')

      const reply = isBn
        ? `"${matchedService.name_bn}"-এর জন্য প্রয়োজনীয় কাগজপত্র:\n${docList}। আপনার সুবিধার্থে মূল কপিগুলো দিশারীর ডিজিটাল লকারে আগে থেকেই সেভ রাখতে পারেন।`
        : `Required documents for "${matchedService.name_en}":\n${matchedService.required_docs.map((d, i) => `${i + 1}) ${d.name_en}`).join(', ')}.`

      return { reply, navCard }
    }

    // C. Specific Time Query
    if (isAskingTime) {
      const reply = isBn
        ? `"${matchedService.name_bn}" প্রদানের আনুমানিক সরকারি সময়সীমা: ${matchedService.processing_time_bn}। কোনো বিলম্ব হলে সিটিজেন চার্টার অনুযায়ী সংশ্লিষ্ট কর্তৃপক্ষের অভিযোগ সেলে জানানো যায়।`
        : `Estimated processing time for "${matchedService.name_en}": ${matchedService.processing_time_bn}.`

      return { reply, navCard }
    }

    // D. Specific How-to / Process Query
    if (isAskingProcess) {
      const stepsBrief = matchedService.steps
        .map((s) => `${s.step}. ${s.title_bn}`)
        .join(' → ')

      const reply = isBn
        ? `"${matchedService.name_bn}" আবেদনের ধাপসমূহ: ${stepsBrief}। অফিসিয়াল পোর্টাল: ${matchedService.official_url}। বিস্তারিত নির্দেশিকা দেখতে নিচের বাটনে ক্লিক করুন।`
        : `Application workflow for "${matchedService.name_en}": ${matchedService.steps.map((s) => `${s.step}. ${s.title_bn}`).join(' → ')}. Official Portal: ${matchedService.official_url}.`

      return { reply, navCard }
    }

    // E. General Service Overview
    const reply = isBn
      ? `"${matchedService.name_bn}" (${matchedService.department_bn}):\n• সরকারি ফি: ${matchedService.fee} টাকা\n• ডেলিভারি সময়: ${matchedService.processing_time_bn}\n• আবেদনের নিয়ম ও চেকলিস্ট দেখতে নিচের কার্ডে ক্লিক করুন অথবা বলুন "নিয়ে যাও"।`
      : `"${matchedService.name_en}" (${matchedService.department_en}):\n• Official Fee: ${matchedService.fee} BDT\n• Processing Time: ${matchedService.processing_time_bn}\nClick the card below to inspect full application rules or say "take me there".`

    return { reply, navCard }
  }

  // 5. Special Domain Heuristics (Passport invalid errors, Land inheritance, Allowances, etc.)
  if (
    norm.includes('ইনভ্যালিড') ||
    norm.includes('invalid') ||
    (norm.includes('পাসপোর্ট') && norm.includes('ভুল'))
  ) {
    return {
      reply: isBn
        ? 'পাসপোর্ট আবেদনে ইনভ্যালিড দেখানোর প্রধান কারণ: ১) NID ও জন্মনিবন্ধনের নামের ইংরেজি বানানে অমিল, ২) ১৭ ডিজিটের অনলাইন ডিজিটাল সনদের স্থানে পুরাতন হাতে লেখা নম্বর প্রদান। epassport.gov.bd-তে ডাটা মিলিয়ে পুনরায় যাচাই করুন।'
        : 'Invalid passport errors usually happen when: 1) English name spelling does not match Smart NID, or 2) old manual certificate number is used instead of 17-digit online birth record.',
      navCard: {
        url: '/services/passport',
        titleBn: 'ই-পাসপোর্ট আবেদন',
        titleEn: 'E-Passport Application',
        breadcrumbBn: 'সেবা সমূহ → পরিচয় সেবা → ই-পাসপোর্ট আবেদন',
        breadcrumbEn: 'Services → Identity → E-Passport Application'
      }
    }
  }

  if (
    norm.includes('বাবা') ||
    norm.includes('বাবার') ||
    norm.includes('মৃত্যু') ||
    norm.includes('ওয়ারিশ') ||
    norm.includes('জমির কাগজ') ||
    norm.includes('খতিয়ান')
  ) {
    return {
      reply: isBn
        ? 'পিতার মৃত্যুর পর ওয়ারিশি জমি বৈধ করতে: ১) ইউনিয়ন/পৌরসভা থেকে ওয়ারিশান ও মৃত্যু সনদ সংগ্রহ করুন, ২) পিতার ক্রয় দলিল ও পূর্ববর্তী খতিয়ান যোগাড় করুন, ৩) mutation.land.gov.bd-তে ই-নামজারি আবেদন করুন। মোট সরকারি ফি ১,১৭০ টাকা। কোনো দালাল ছাড়াই অনলাইনে ট্র্যাক করা যায়।'
        : 'To regularize inherited land: obtain succession certificate & death cert from Union/City council, collect father\'s deed/khatian, and file e-mutation at mutation.land.gov.bd. Total govt fee 1,170 BDT.',
      navCard: {
        url: '/services/land-mutation',
        titleBn: 'ই-নামজারি (ভূমি)',
        titleEn: 'E-Mutation (Land)',
        breadcrumbBn: 'সেবা সমূহ → ভূমি সেবা → ই-নামজারি',
        breadcrumbEn: 'Services → Land Services → E-Mutation'
      }
    }
  }

  if (
    norm.includes('বিধবা') ||
    norm.includes('স্বামী') ||
    norm.includes('মেম্বার') ||
    norm.includes('দালাল')
  ) {
    return {
      reply: isBn
        ? 'বিধবা ও স্বামী নিগৃহীতা ভাতা সম্পূর্ণ বিনামূল্যে সরকার প্রদান করে। মেম্বার বা দালালকে কোনো টাকা দেওয়া দণ্ডনীয় অপরাধ। ভাতা প্রতি মাসে সরাসরি বিকাশ/নগদে (G2P) পৌঁছে যাবে। ইউনিয়ন পরিষদ বা সমাজসেবা অফিসে যোগাযোগ করুন। দালাল উৎপাত করলে সরাসরি ১০৬ নম্বরে জানান।'
        : 'Widow Allowance is 100% free with no middleman fees. Monthly ৳850 is sent directly to mobile banking accounts (G2P). If someone demands a bribe, report directly to Anti-Corruption Hotline 106.',
      navCard: {
        url: '/services/widow-allowance',
        titleBn: 'বিধবা ভাতা',
        titleEn: 'Widow Allowance',
        breadcrumbBn: 'সেবা সমূহ → সামাজিক সুরক্ষা → বিধবা ভাতা',
        breadcrumbEn: 'Services → Social Welfare → Widow Allowance'
      }
    }
  }

  if (
    norm.includes('ভাতা') ||
    norm.includes('বয়স্ক') ||
    norm.includes('প্রতিবন্ধী') ||
    norm.includes('allowance')
  ) {
    return {
      reply: isBn
        ? 'বয়স্ক ও প্রতিবন্ধী ভাতা সমাজসেবা অধিদপ্তরের মাধ্যমে পরিচালিত হয়। সরকারিভাবে কোনো ফি নেওয়া হয় না (বিনামূল্যে)। ইউনিয়ন পরিষদ বা ওয়ার্ড কার্যালয়ে NID ও ছবিসহ আবেদন করা যায়।'
        : 'Old age & disability allowances are free of government charge. Eligible citizens can apply at Union Council or Ward offices with NID and passport photo.'
    }
  }

  if (
    norm.includes('বেকার') ||
    norm.includes('চাকরি') ||
    norm.includes('ডিগ্রী') ||
    norm.includes('যুব') ||
    norm.includes('প্রশিক্ষণ')
  ) {
    return {
      reply: isBn
        ? 'ডিগ্রী পাস বা বেকার যুবসমাজের জন্য যুব উন্নয়ন অধিদপ্তর (DYD) ৩-৬ মাসের বিনামূল্যে আইটি, গবাদিপশু ও কারিগরি প্রশিক্ষণ এবং ৫০,০০০ থেকে ২,০০,০০০ টাকা সহজ শর্তে আত্মকর্মসংস্থান ঋণ দেয়। বিস্তারিত জানতে দিশারীর "সরকারি সুযোগ" পাতা দেখুন।'
        : 'For unemployed graduates, the Dept of Youth Development (DYD) provides free 3-6 months skill courses and soft loans from ৳50,000 to ৳2,00,000. Check Dishari\'s Opportunities Hub for details.',
      navCard: {
        url: '/opportunities',
        titleBn: 'সরকারি সুযোগ ও অনুদান',
        titleEn: 'Government Opportunities',
        breadcrumbBn: 'নেভিবার → সরকারি সুযোগ',
        breadcrumbEn: 'Navbar → Opportunities'
      }
    }
  }

  if (
    norm.includes('উপবৃত্তি') ||
    norm.includes('বৃত্তি') ||
    norm.includes('স্কলারশিপ') ||
    norm.includes('scholarship')
  ) {
    return {
      reply: isBn
        ? 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট (PMEAT) মাধ্যমিক ও উচ্চ মাধ্যমিক অসচ্ছল মেধাবী শিক্ষার্থীদের বার্ষিক ৫,০০০-১০,০০০ টাকা উপবৃত্তি দেয়। শিক্ষাপ্রতিষ্ঠানের প্রত্যয়নপত্র নিয়ে pmeat.gov.bd-তে আবেদন করতে হয়।'
        : 'PM Education Assistance Trust provides annual ৳5,000 - ৳10,000 stipends for secondary & higher secondary students. Apply via pmeat.gov.bd with institution head\'s endorsement.',
      navCard: {
        url: '/services/scholarship',
        titleBn: 'উপবৃত্তি / বৃত্তি',
        titleEn: 'Scholarship / Stipend',
        breadcrumbBn: 'সেবা সমূহ → শিক্ষা → উপবৃত্তি ও বৃত্তি',
        breadcrumbEn: 'Services → Education → Scholarship & Stipend'
      }
    }
  }

  if (
    norm.includes('প্রবাসী') ||
    norm.includes('সৌদি') ||
    norm.includes('বিদেশ') ||
    norm.includes('রেমিট্যান্স')
  ) {
    return {
      reply: isBn
        ? 'প্রবাসী কর্মীদের জন্য প্রবাসী কল্যাণ ব্যাংক স্বল্প সুদে পুনর্বাসন ঋণ দেয়। এছাড়া ওয়েলফেয়ার কার্ডধারীদের জন্য বিমানবন্দর ওয়েলফেয়ার ডেস্ক ও ১০ লাখ টাকার দুর্ঘটনা বীমা সুবিধা রয়েছে। probashi.gov.bd দেখুন।'
        : 'Probashi Kallyan Bank offers returnee rehabilitation loans. BMET cardholders receive airport welfare desk assistance and ৳10 lakh insurance coverage.',
      navCard: {
        url: '/services/bmet-smart-card',
        titleBn: 'বিএমইটি স্মার্ট কার্ড',
        titleEn: 'BMET Smart Card',
        breadcrumbBn: 'সেবা সমূহ → প্রবাসী সেবা → বিএমইটি স্মার্ট কার্ড',
        breadcrumbEn: 'Services → Overseas → BMET Smart Card'
      }
    }
  }

  // HSC / SSC / Exam Results Guidance
  if (
    norm.includes('hsc') ||
    norm.includes('ssc') ||
    norm.includes('রেজাল্ট') ||
    norm.includes('ফলাফল') ||
    norm.includes('এডমিট') ||
    norm.includes('প্রবেশপত্র') ||
    norm.includes('মার্কশিট') ||
    norm.includes('পরীক্ষা') ||
    norm.includes('result') ||
    norm.includes('grade')
  ) {
    return {
      reply: isBn
        ? 'আমি সরাসরি শিক্ষা বোর্ডের অফিশিয়াল সার্ভার থেকে আপনার পরীক্ষার ফলাফল এনে দিতে পারি! 🎓\n\nসবচেয়ে সহজ উপায়: নিচে 📎 ছবি আইকনে ক্লিক করে আপনার প্রবেশপত্রের (Admit Card) ছবি দিন—আমাদের AI রোল ও রেজিস্ট্রেশন স্বয়ংক্রিয়ভাবে শনাক্ত করবে।\n\nঅথবা রোল নম্বর, রেজিস্ট্রেশন নম্বর ও বোর্ডের নাম লিখে আমাকে পাঠান।'
        : 'I can fetch your official Board Examination results directly! 🎓\n\nEasiest way: Click the 📎 image icon below to upload a photo of your admit card — our AI will auto-detect your Roll & Registration.\n\nAlternatively, send your Roll, Registration number, and Board name.',
    }
  }

  if (
    norm.includes('ট্রেড') ||
    norm.includes('trade') ||
    norm.includes('ব্যবসা') ||
    norm.includes('উদ্যোক্তা')
  ) {
    return {
      reply: isBn
        ? 'ব্যবসার জন্য স্থানীয় ইউনিয়ন বা পৌরসভা থেকে ই-ট্রেড লাইসেন্স সংগ্রহ করুন। এরপর এসএমই ফাউন্ডেশন ও বিসিক থেকে ৪% হ্রাসকৃত সুদে কুটির শিল্প ঋণ নেওয়া যায়।'
        : 'Obtain an E-Trade License from local union/municipality. Then apply for 4% concessional cottage enterprise loans via SME Foundation and BSCIC.',
      navCard: {
        url: '/services/trade-license',
        titleBn: 'ট্রেড লাইসেন্স',
        titleEn: 'Trade License',
        breadcrumbBn: 'সেবা সমূহ → ব্যবসা ও কর → ট্রেড লাইসেন্স',
        breadcrumbEn: 'Services → Business & Tax → Trade License'
      }
    }
  }

  if (
    norm.includes('ডেডলাইন') ||
    norm.includes('শেষ তারিখ') ||
    norm.includes('ক্যালেন্ডার')
  ) {
    return {
      reply: isBn
        ? 'গুরুত্বপূর্ণ ডেডলাইন: আয়কর রিটার্ন জমা ৩০ নভেম্বর ২০২৬, উপবৃত্তি আবেদন ১৫ ডিসেম্বর ২০২৬। দিশারীর "ডেডলাইন" মেনুতে প্রতিটি সরকারি সেবার সময়সীমা ও কাউন্টডাউন দেখতে পাবেন।'
        : 'Key Deadlines: Tax return filing Nov 30, PM scholarship application Dec 15. Check Dishari\'s Deadlines view for live alerts.',
      navCard: {
        url: '/dashboard?tab=deadlines',
        titleBn: 'ডেডলাইন রাডার',
        titleEn: 'Deadlines Radar',
        breadcrumbBn: 'ড্যাশবোর্ড → ডেডলাইন রাডার ট্যাব',
        breadcrumbEn: 'Dashboard → Deadlines Radar tab'
      }
    }
  }

  if (
    norm.includes('লকার') ||
    norm.includes('কাগজপত্র') ||
    norm.includes('ডকুমেন্ট') ||
    norm.includes('ভল্ট')
  ) {
    return {
      reply: isBn
        ? 'দিশারী ডিজিটাল লকারে আপনার জাতীয় পরিচয়পত্র (NID), জন্ম সনদ ও জরুরি কাগজপত্র ক্লাউডে এনক্রিপ্ট করে সুরক্ষিত রাখা যায়। যেকোনো সরকারি ফরম পূরণের সময় এটি মুহূর্তেই অটো-ডকেট তৈরি করে।'
        : 'Dishari Document Locker securely encrypts your Smart NID, Birth Certificate, and civic files to assemble auto-dockets.',
      navCard: {
        url: '/dashboard?tab=locker',
        titleBn: 'সুরক্ষিত ডিজিটাল লকার',
        titleEn: 'Document Locker',
        breadcrumbBn: 'ড্যাশবোর্ড → ডিজিটাল লকার ট্যাব',
        breadcrumbEn: 'Dashboard → Document Locker tab'
      }
    }
  }

  // 6. Conversational Greetings & General Assistance
  if (
    norm.includes('কেমন আছ') ||
    norm.includes('কেমন আছেন') ||
    norm.includes('hi') ||
    norm.includes('hello') ||
    norm.includes('সালাম') ||
    norm.includes('নমস্কার')
  ) {
    return {
      reply: isBn
        ? 'ওয়ালাইকুম আসসালাম ও শুভেচ্ছা! 🌸 আমি ভালো আছি। আমি জনবন্ধু — দিশারীতে আপনার সার্বক্ষণিক নাগরিক ডিজিটাল বন্ধু। পাসপোর্ট, NID সংশোধন, জন্ম নিবন্ধন, জমির নামজারি বা পরীক্ষার ফলাফল সম্পর্কে যেকোনো তথ্য জানতে আমাকে বলতে পারেন।'
        : 'Assalamu Alaikum & Warm Greetings! 🌸 I am doing well. I am Jonobondhu, your AI civic assistant on Dishari. Ask me anything about Passports, NID, birth registration, land records, or exam results.'
    }
  }

  // 7. General Fallback with Actionable Navigation Card to Services
  return {
    reply: isBn
      ? 'আপনার প্রশ্নটি বুঝতে পেরেছি। সরকারি ফি, প্রয়োজনীয় কাগজপত্র ও সঠিক অফিসিয়াল পোর্টাল দেখতে দিশারীর সকল সেবা ডিরেক্টরি দেখুন অথবা বলুন "পাসপোর্ট", "এনআইডি", "নামজারি", "লকার" ইত্যাদিতে নিয়ে যাও।'
      : 'I understand your query. You can browse Dishari\'s complete Services Directory for official government fees, checklists, and portal links, or say "take me to passport", "take me to NID", etc.',
    navCard: {
      url: '/services',
      titleBn: 'সকল সরকারি সেবা তালিকা',
      titleEn: 'All Services Directory',
      breadcrumbBn: 'নেভিবার → সেবা সমূহ',
      breadcrumbEn: 'Navbar → Services'
    }
  }
}
