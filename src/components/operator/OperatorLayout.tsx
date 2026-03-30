/**
 * OperatorLayout — 3-column full-screen container for the operator CRM.
 * Renders:
 *   [header]
 *   [queueSidebar | chat | detailsSidebar]  ← desktop 3-col flex row
 *   + queueDrawer / detailsDrawer           ← mobile overlay drawers
 *   [mobileNav]
 *
 * Pure layout: NO logic, NO state, NO hooks. Each slot is a React node
 * provided by OperatorCRM after composing the view model.
 */
interface Props {
  header:         React.ReactNode
  queueSidebar:   React.ReactNode
  queueDrawer:    React.ReactNode
  chat:           React.ReactNode
  detailsSidebar: React.ReactNode
  detailsDrawer:  React.ReactNode
  mobileNav:      React.ReactNode
}

export function OperatorLayout({
  header,
  queueSidebar,
  queueDrawer,
  chat,
  detailsSidebar,
  detailsDrawer,
  mobileNav,
}: Props) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>

      {/* Ambient mesh gradient (fixed so it spans the whole viewport) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse at 15% 20%, rgba(91,140,255,0.10) 0px, transparent 50%)',
            'radial-gradient(ellipse at 85% 80%, rgba(124,92,255,0.08) 0px, transparent 50%)',
          ].join(', '),
        }}
      />

      {header}

      {/* 3-column main area */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {queueSidebar}
        {queueDrawer}

        {/* Center chat column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {chat}
        </div>

        {detailsSidebar}
        {detailsDrawer}
      </div>

      {mobileNav}
    </div>
  )
}
