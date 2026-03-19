import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle, Mail, Clock, Shield, Zap, HelpCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { GlassCard } from '../components/shared/GlassCard'
import { cn } from '../components/shared/cn'

const FAQ_EN = [
  {
    q: 'How long does an exchange take?',
    a: 'Most exchanges complete within 3–15 minutes. During high network load or manual verification, it may take up to 1 hour.',
  },
  {
    q: 'What are the minimum and maximum amounts?',
    a: 'Minimum: $50 equivalent. Maximum: $50,000 per transaction for unverified accounts, unlimited for KYC-verified accounts.',
  },
  {
    q: 'How is the rate fixed?',
    a: 'The rate is locked for 15 minutes from the moment you confirm the deal details. If not paid within this window, a new rate will be calculated.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept bank cards (Visa/Mastercard/MIR), bank transfers (SWIFT/SEPA), and all major cryptocurrencies including Bitcoin, Ethereum, USDT, TON.',
  },
  {
    q: 'Do I need to verify my identity (KYC)?',
    a: 'For amounts up to $50,000/month, no verification is required. For higher volumes or corporate accounts, KYC/KYB is mandatory.',
  },
  {
    q: 'What if my payment gets stuck?',
    a: 'Contact support immediately via the chat in your deal window. Our operators work 24/7 and resolve issues within minutes.',
  },
  {
    q: 'Is QuickPay licensed?',
    a: 'Yes, QuickPay operates under a financial services license. See our Legal page for full regulatory details.',
  },
  {
    q: 'How do referrals work?',
    a: 'Share your referral link. When someone completes a deal using your link, you earn 0.5% of their deal volume. Rewards accumulate in your dashboard.',
  },
]

const FAQ_RU = [
  {
    q: 'Сколько занимает обмен?',
    a: 'Большинство обменов завершаются за 3–15 минут. При высокой нагрузке или ручной верификации — до 1 часа.',
  },
  {
    q: 'Каковы минимальные и максимальные суммы?',
    a: 'Минимум: эквивалент $50. Максимум: $50 000 на транзакцию для неверифицированных, без ограничений для KYC-клиентов.',
  },
  {
    q: 'Как фиксируется курс?',
    a: 'Курс фиксируется на 15 минут с момента подтверждения деталей сделки.',
  },
  {
    q: 'Какие способы оплаты вы принимаете?',
    a: 'Банковские карты (Visa/Mastercard/МИР), банковские переводы (SWIFT/SEPA), основные криптовалюты: Bitcoin, Ethereum, USDT, TON.',
  },
  {
    q: 'Нужно ли проходить верификацию (KYC)?',
    a: 'До $50 000/месяц верификация не нужна. Для более крупных объёмов или корпоративных клиентов — обязательна.',
  },
  {
    q: 'Что делать, если платёж завис?',
    a: 'Обратитесь в поддержку через чат в окне сделки. Операторы работают 24/7.',
  },
  {
    q: 'Есть ли у QuickPay лицензия?',
    a: 'Да, QuickPay работает на основании лицензии на предоставление финансовых услуг.',
  },
  {
    q: 'Как работает реферальная программа?',
    a: 'Поделитесь своей ссылкой. Когда кто-то завершает сделку по ней, вы получаете 0.5% от объёма.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('border-b last:border-b-0', 'border-gray-100 dark:border-white/8')}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-semibold text-sm text-gray-900 dark:text-white">{q}</span>
        <ChevronDown
          size={15}
          className={cn('shrink-0 text-gray-400 dark:text-white/30 transition-transform duration-200', open && 'rotate-180 text-[#5B8CFF]')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-gray-500 dark:text-white/50 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqPage() {
  const { t, language } = useTranslation()
  const FAQ = language === 'ru' ? FAQ_RU : FAQ_EN

  return (
    <div className="min-h-screen bg-app pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
      <div className="fixed inset-0 bg-mesh-brand pointer-events-none opacity-40" />
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4',
            'bg-blue-100 border border-blue-200 text-blue-600',
            'dark:bg-[#5B8CFF]/15 dark:border-[#5B8CFF]/25 dark:text-[#7AAEFF]',
          )}>
            <HelpCircle size={11} />
            {FAQ.length} questions answered
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-3">{t.faq.title}</h1>
          <p className="text-gray-500 dark:text-white/45">{t.faq.subtitle}</p>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Clock,  label: t.faq.workingHoursValue, sub: t.faq.workingHours,  color: 'text-[#5B8CFF]', bg: 'bg-blue-50 border-blue-100 dark:bg-[#1a2235] dark:border-white/8' },
            { icon: Shield, label: 'SSL',    sub: 'Encrypted',  color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100 dark:bg-[#0f2020] dark:border-white/8' },
            { icon: Zap,    label: '< 2 min', sub: 'Response',  color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100 dark:bg-[#1a1500] dark:border-white/8' },
          ].map(({ icon: Icon, label, sub, color, bg }) => (
            <div key={label} className={cn('flex flex-col items-center p-3 rounded-2xl border text-center', bg)}>
              <Icon size={18} className={cn('mb-1.5', color)} />
              <p className="font-black text-sm text-gray-900 dark:text-white">{label}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">{sub}</p>
            </div>
          ))}
        </div>

        {/* FAQ list */}
        <GlassCard variant="elevated">
          {FAQ.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </GlassCard>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <GlassCard variant="elevated">
            <h2 className="font-black text-base text-gray-900 dark:text-white mb-4">{t.faq.contactUs}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://t.me/quickpay_support"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border transition-all',
                  'bg-sky-50 border-sky-200 hover:border-sky-400',
                  'dark:bg-[#1a2a40] dark:border-sky-500/25 dark:hover:border-sky-500/50',
                )}
              >
                <MessageCircle size={18} className="text-sky-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{t.faq.telegram}</p>
                  <p className="text-xs text-gray-400 dark:text-white/35">@quickpay_support</p>
                </div>
              </a>
              <a
                href="mailto:support@quickpay.io"
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border transition-all',
                  'bg-violet-50 border-violet-200 hover:border-violet-400',
                  'dark:bg-[#1a1535] dark:border-violet-500/25 dark:hover:border-violet-500/50',
                )}
              >
                <Mail size={18} className="text-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{t.faq.email}</p>
                  <p className="text-xs text-gray-400 dark:text-white/35">support@quickpay.io</p>
                </div>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
