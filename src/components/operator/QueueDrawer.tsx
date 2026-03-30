/**
 * QueueDrawer — mobile slide-in queue panel (spring animation from the left).
 * Renders a backdrop + animated <aside> containing the same QueueList content.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X }                       from 'lucide-react'
import { QueueList }               from './QueueList'
import type { QueueListProps }     from './QueueList'

interface Props extends QueueListProps {
  open:    boolean
  onClose: () => void
}

export function QueueDrawer({ open, onClose, ...listProps }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="sm:hidden fixed inset-y-14 left-0 z-50 w-72 bg-[#0f1726] border-r border-white/8 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 shrink-0">
              <span className="text-xs font-black text-white/50 uppercase tracking-widest">Очередь</span>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-white/40"
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <QueueList {...listProps} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
