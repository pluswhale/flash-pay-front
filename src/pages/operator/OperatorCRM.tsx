/**
 * OperatorCRM — route entry point.
 * Route: /operator/queue
 *
 * Pure orchestrator: calls the view model once, then wires every slot of
 * OperatorLayout by passing plain values and callbacks to dumb components.
 * Zero business logic lives here.
 */
import { useOperatorCRMViewModel } from '../../hooks/view-models/useOperatorCRMViewModel'
import { OperatorLayout }          from '../../components/operator/OperatorLayout'
import { OperatorHeader }          from '../../components/operator/OperatorHeader'
import { QueueSidebar }            from '../../components/operator/QueueSidebar'
import { QueueDrawer }             from '../../components/operator/QueueDrawer'
import { ChatSection }             from '../../components/operator/ChatSection'
import { DetailsSidebar }          from '../../components/operator/DetailsSidebar'
import { DetailsDrawer }           from '../../components/operator/DetailsDrawer'
import { MobileBottomNav }         from '../../components/operator/MobileBottomNav'

export function OperatorCRM() {
  const vm = useOperatorCRMViewModel()

  const queueListProps = {
    requests:       vm.derived.filteredRequests,
    isLoading:      vm.queue.isLoading,
    selectedId:     vm.selectedId,
    filter:         vm.ui.filter,
    search:         vm.ui.search,
    onFilterChange: vm.ui.setFilter,
    onSearchChange: vm.ui.setSearch,
    onSelect:       vm.actions.selectRequest,
  }

  return (
    <OperatorLayout
      header={
        <OperatorHeader
          activeCount={vm.derived.activeCount}
          now={vm.derived.now}
          userPhone={vm.derived.user?.phone ?? undefined}
          hasSelectedRequest={vm.selectedId !== null}
          showQueueDrawer={vm.ui.showQueueDrawer}
          showDetailDrawer={vm.ui.showDetailDrawer}
          onToggleQueue={() => vm.ui.setShowQueue((v) => !v)}
          onToggleDetail={() => vm.ui.setShowDetail((v) => !v)}
          onLogout={vm.actions.logout}
        />
      }
      queueSidebar={<QueueSidebar {...queueListProps} />}
      queueDrawer={
        <QueueDrawer
          {...queueListProps}
          open={vm.ui.showQueueDrawer}
          onClose={() => vm.ui.setShowQueue(false)}
        />
      }
      chat={
        <ChatSection
          request={vm.detail.request}
          chat={vm.chat}
          currentUserId={vm.derived.user?.id}
        />
      }
      detailsSidebar={
        <DetailsSidebar detail={vm.detail} transition={vm.transition} />
      }
      detailsDrawer={
        <DetailsDrawer
          open={vm.ui.showDetailDrawer}
          detail={vm.detail}
          transition={vm.transition}
          onClose={() => vm.ui.setShowDetail(false)}
        />
      }
      mobileNav={
        <MobileBottomNav
          activeCount={vm.derived.activeCount}
          onShowQueue={() => { vm.ui.setShowQueue(true);  vm.ui.setShowDetail(false) }}
          onShowChat={()  => { vm.ui.setShowQueue(false); vm.ui.setShowDetail(false) }}
          onShowDetail={() => { vm.ui.setShowDetail(true); vm.ui.setShowQueue(false) }}
        />
      }
    />
  )
}
