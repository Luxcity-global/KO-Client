'use client';

import { Send } from 'lucide-react';
import type { PortalAdviser, PortalMessage } from '@/lib/api/portal-data';
import { cn } from '@/lib/utils';

function formatMessageTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
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

  return (
    <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#e4e4e7] px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-teal-700 text-sm font-bold text-white">
          {adviser.initials}
        </div>
        <div>
          <p className="font-heading text-base font-bold text-[#18181b]">{adviserName}</p>
          <p className="text-xs text-[#71717a]">
            {adviser.title} · Typically replies within 2 hours
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-teal-700 text-xs font-bold text-white">
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
                      ? 'bg-[#E9FCFF] text-[#18181b]'
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
      </div>

      <form
        className="border-t border-[#e4e4e7] px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="flex items-center gap-3 rounded-full border border-[#e4e4e7] bg-[#fafafa] py-1.5 pl-5 pr-1.5">
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type a message to your advisor…"
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
