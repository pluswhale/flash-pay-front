/**
 * Pure component — full chat panel assembly.
 * Composes MessageList + ChatInput.
 */
import { MessageList } from './MessageList'
import { ChatInput }   from './ChatInput'
import type { Message } from '../../types/api'

interface Props {
  messages:      Message[]
  isLoading:     boolean
  isTyping:      boolean
  currentUserId?: string
  onSend:        (content: string) => void
  onTyping:      () => void
  disabled?:     boolean
  quickReplies?: string[]
}

export function ChatContainer(props: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <MessageList
        messages={props.messages}
        isLoading={props.isLoading}
        isTyping={props.isTyping}
        currentUserId={props.currentUserId}
      />
      <ChatInput
        onSend={props.onSend}
        onTyping={props.onTyping}
        disabled={props.disabled}
        quickReplies={props.quickReplies}
      />
    </div>
  )
}
