'use client';

import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import type { PortalAdviser, PortalMessage } from '@/lib/api/portal-data';
import { cn } from '@/lib/utils';

function formatMessageTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date(iso))
    .replace(',', '');
}

export function ChatPanel({
  adviser,
  messages,
  draft,
  onDraftChange,
  onSend,
}: {
  adviser: PortalAdviser;
  messages: PortalMessage[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
}) {
  const adviserName = `${adviser.firstName} ${adviser.lastName}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    /*
     * Mobile: flex-1 min-h-0 fills parent height; messages area scrolls
     * internally and the input sits naturally at the bottom of the flex col.
     * sm+: card appearance with rounded corners, border, and shadow.
     */
    /*
     * Mobile (below lg): flex-1 min-h-0 fills the parent height so messages
     * scroll inside and the input stays pinned at the bottom. No card border.
     * Desktop (lg+): original card appearance with fixed minimum height.
     */
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white lg:flex-none lg:min-h-[560px] lg:rounded-2xl lg:border lg:border-[#e4e4e7] lg:shadow-sm">

      {/* Adviser header */}
      <div className="shrink-0 flex items-center gap-3 border-b border-[#e4e4e7] px-4 py-4 sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber/20 text-sm font-bold text-amber">
          {adviser.initials}
        </div>
        <div>
          <p className="font-heading text-base font-bold text-[#18181b]">{adviserName}</p>
          <p className="text-xs text-[#71717a]">{adviser.title} · Replies within 2 hours</p>
        </div>
      </div>

      {/* Messages — scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <div className="space-y-5">
          {messages.map((message, i) => {
            const isClient = message.direction === 'INBOUND';
            const showAvatar =
              !isClient && (i === 0 || messages[i - 1]?.direction === 'INBOUND');

            return (
              <div
                key={message.id}
                className={cn('flex gap-3', isClient ? 'justify-end' : 'justify-start')}
              >
                {!isClient && showAvatar ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber/20 text-xs font-bold text-amber">
                    {adviser.initials}
                  </div>
                ) : !isClient ? (
                  <div className="w-9 shrink-0" />
                ) : null}

                <div className={cn('max-w-[78%]', isClient ? 'text-right' : 'text-left')}>
                  <div
                    className={cn(
                      'inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed',
                      isClient
                        ? 'bg-brand-teal-50 text-[#18181b]'
                        : 'border border-[#e4e4e7] bg-white text-[#18181b]',
                    )}
                  >
                    {message.body}
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#a1a1aa]">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input — pinned at bottom */}
      <form
        className="shrink-0 border-t border-[#e4e4e7] px-4 py-3 sm:px-5 sm:py-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="flex items-center gap-3 rounded-full border border-[#e4e4e7] bg-[#fafafa] py-1.5 pl-5 pr-1.5">
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type a message…"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#18181b] outline-none placeholder:text-[#a1a1aa]"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-teal-700 text-white transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
