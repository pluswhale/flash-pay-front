import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, FileText, Lock, Building2, Award, ChevronRight } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { GlassCard } from '../components/shared/GlassCard'
import { cn } from '../components/shared/cn'

const LAST_UPDATED = 'January 15, 2026'

const SECTIONS = [
  {
    id: 'agreement',
    icon: FileText,
    key: 'userAgreement' as const,
    color: 'text-[#5B8CFF]',
    bg: 'bg-blue-50 dark:bg-[#1a2235]',
    content: `
      1. ACCEPTANCE OF TERMS
      By accessing or using QuickPay services, you agree to be bound by these Terms. If you disagree, do not use our services.

      2. SERVICES
      QuickPay provides peer-to-peer cryptocurrency and fiat currency exchange services. We act as an intermediary facilitating transactions between counterparties.

      3. USER OBLIGATIONS
      - Provide accurate information during registration
      - Comply with applicable laws and regulations
      - Not use services for money laundering or illegal activities
      - Maintain confidentiality of your account credentials

      4. EXCHANGE RATES
      Rates are indicative and locked for 15 minutes upon deal confirmation. We reserve the right to cancel a deal if significant market movement occurs during payment processing.

      5. FEES
      QuickPay charges a service fee ranging from 0.5% to 1.5% per transaction, included in the quoted rate.

      6. LIMITATION OF LIABILITY
      QuickPay is not liable for losses resulting from market volatility, network delays, or third-party failures beyond our control.
    `,
  },
  {
    id: 'privacy',
    icon: Lock,
    key: 'privacy' as const,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-[#1a1535]',
    content: `
      1. DATA WE COLLECT
      - Account information: username, phone, Telegram handle
      - Transaction data: amounts, currencies, timestamps, wallet addresses
      - Device data: IP address, browser type, operating system

      2. HOW WE USE YOUR DATA
      - Process your exchange transactions
      - Comply with AML/KYC regulatory requirements
      - Provide customer support
      - Improve our services

      3. DATA SHARING
      We do not sell your personal data. We may share data with:
      - Regulatory authorities when required by law
      - Payment processors to complete transactions
      - Fraud prevention services

      4. DATA RETENTION
      Transaction records are retained for 7 years per financial regulations. Account data is retained while your account is active.

      5. YOUR RIGHTS
      You have the right to access, correct, or delete your personal data, subject to legal requirements.
    `,
  },
  {
    id: 'consent',
    icon: Shield,
    key: 'dataConsent' as const,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-[#0f2020]',
    content: `
      By using QuickPay, you consent to the processing of your personal data as described in our Privacy Policy, including:
      - Collection and storage of transaction data
      - Identity verification procedures (KYC) where applicable
      - Communication via provided contact details
      - Analytics for service improvement

      You may withdraw consent at any time by contacting support@quickpay.io, subject to our legal obligations.
    `,
  },
  {
    id: 'company',
    icon: Building2,
    key: 'companyInfo' as const,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-[#1a1500]',
    content: `
      COMPANY NAME: QuickPay OTC Exchange Ltd.
      REGISTRATION: Company No. 12345678
      REGISTERED ADDRESS: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
      
      MANAGEMENT:
      - CEO: Alex Volkov
      - CTO: Maria Chen
      - Compliance Officer: James Richardson

      CONTACT:
      - General: info@quickpay.io
      - Support: support@quickpay.io
      - Legal: legal@quickpay.io
      - Phone: +44 20 1234 5678
    `,
  },
  {
    id: 'license',
    icon: Award,
    key: 'license' as const,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-[#1a1520]',
    content: `
      LICENSE INFORMATION:
      QuickPay OTC Exchange Ltd. is registered with the Financial Conduct Authority (FCA) as a cryptoasset business under the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017.
      
      Registration Number: FRN 987654
      Regulated Activity: Cryptoasset Exchange Provider

      COMPLIANCE:
      - Anti-Money Laundering (AML) procedures in place
      - Know Your Customer (KYC) verification for high-value transactions
      - Sanctions screening on all transactions
      - Regular compliance audits by independent third parties

      RISK NOTICE:
      Cryptocurrency exchange involves significant risk. The value of digital assets can fluctuate significantly. Past performance is not indicative of future results.
    `,
  },
]

export function LegalPage() {
  const { t } = useTranslation()
  const [active, setActive] = useState<string | null>('agreement')

  const activeSection = SECTIONS.find((s) => s.id === active)

  return (
    <div className="min-h-screen bg-app pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4',
            'bg-gray-100 border border-gray-200 text-gray-600',
            'dark:bg-white/6 dark:border-white/10 dark:text-white/50',
          )}>
            <Shield size={11} />
            {t.legal.lastUpdated}: {LAST_UPDATED}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-3">{t.legal.title}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sidebar navigation */}
          <div className="space-y-2">
            {SECTIONS.map(({ id, icon: Icon, key, color, bg }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
                  active === id
                    ? ['border-gray-300 shadow-sm dark:border-white/20', bg].join(' ')
                    : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-[#1a2235] dark:border-white/8 dark:hover:border-white/14',
                )}
              >
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', bg)}>
                  <Icon size={14} className={color} />
                </div>
                <span className={cn('text-sm font-bold flex-1', active === id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/60')}>
                  {t.legal[key]}
                </span>
                <ChevronRight size={13} className={cn('shrink-0', active === id ? 'text-gray-500 dark:text-white/40' : 'text-gray-300 dark:text-white/20')} />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {activeSection && (
              <motion.div
                key={activeSection.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard variant="elevated">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-white/8">
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', activeSection.bg)}>
                      <activeSection.icon size={18} className={activeSection.color} />
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-gray-900 dark:text-white">{t.legal[activeSection.key]}</h2>
                      <p className="text-xs text-gray-400 dark:text-white/35">{t.legal.lastUpdated}: {LAST_UPDATED}</p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {activeSection.content.trim().split('\n\n').map((block, i) => {
                      const trimmed = block.trim()
                      if (!trimmed) return null
                      const isHeading = /^\d+\.\s+[A-Z]/.test(trimmed)
                      return isHeading ? (
                        <h3 key={i} className="font-black text-sm text-gray-900 dark:text-white mt-4 mb-2 first:mt-0">
                          {trimmed}
                        </h3>
                      ) : (
                        <p key={i} className="text-sm text-gray-600 dark:text-white/55 leading-relaxed mb-3 whitespace-pre-line">
                          {trimmed}
                        </p>
                      )
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
