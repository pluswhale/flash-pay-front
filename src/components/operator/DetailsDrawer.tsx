/**
 * DetailsDrawer — mobile slide-in details panel (spring animation from the right).
 * Reuses DetailsContent from DetailsSidebar so the panel UI is never duplicated.
 */
import { motion, AnimatePresence }      from 'framer-motion'
import { DetailsContent }               from './DetailsSidebar'
import type { DetailVm, TransitionVm }  from './DetailsSidebar'

interface Props {
  open:       boolean
  detail:     DetailVm
  transition: TransitionVm
  onClose:    () => void
}

export function DetailsDrawer({ open, detail, transition, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="md:hidden fixed inset-y-14 right-0 z-50 w-80 bg-[#0f1726] border-l border-white/8 flex flex-col overflow-y-auto"
          >
            <DetailsContent detail={detail} transition={transition} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
