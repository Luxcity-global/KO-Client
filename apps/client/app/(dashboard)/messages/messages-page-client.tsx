'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiErrorState } from '@/components/dashboard/api-error-state';
import { ChatPanel } from '@/components/messages/chat-panel';
import { DocumentsPanel } from '@/components/messages/documents-panel';
import {
  MessagesPageHeader,
  MessagesTabSwitcher,
  type MessagesTab,
} from '@/components/messages/messages-page-header';
import { usePortalMessages } from '@/hooks/use-portal-messages';
import { usePortalSession } from '@/hooks/use-portal-session';
import {
  fetchPortalDocuments,
  type PortalDocumentTask,
  type PortalMessage,
} from '@/lib/api/portal-data';

export default function MessagesPageClient() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<MessagesTab>(tabParam === 'documents' ? 'documents' : 'chat');

  const { data: session, isLoading: sessionLoading, error: sessionError, refetch } =
    usePortalSession();
  const { data: messages, isLoading: messagesLoading, error: messagesError } = usePortalMessages();

  const [localMessages, setLocalMessages] = useState<PortalMessage[]>([]);
  const [documents, setDocuments] = useState<PortalDocumentTask[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (tabParam === 'documents') setTab('documents');
  }, [tabParam]);

  useEffect(() => {
    if (messages) setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    fetchPortalDocuments()
      .then(setDocuments)
      .finally(() => setDocsLoading(false));
  }, []);

  if (sessionLoading || messagesLoading) {
    return <p className="text-sm text-ink-60">Loading messages…</p>;
  }

  if (sessionError || messagesError || !session) {
    return <ApiErrorState error={sessionError ?? messagesError} onRetry={() => refetch()} />;
  }

  function handleSend() {
    if (!draft.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        direction: 'INBOUND',
        body: draft.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft('');
  }

  function handleUpload(id: string, file: File) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, completed: true, fileName: file.name } : d,
      ),
    );
  }

  function handleRemove(id: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, completed: false, fileName: undefined } : d,
      ),
    );
  }

  const docsCompleted = documents.filter((d) => d.completed).length;
  const docsTotal = documents.length;

  /*
   * Mobile layout:
   *  - -mx-4: negate shell's horizontal p-4 so the header border-b is full-width.
   *  - h-[calc(100dvh-6rem)]: shell has p-4 (1rem top) + pb-20 (5rem bottom) = 6rem
   *    of vertical padding, so this fills exactly the available content area.
   *  - overflow-hidden (chat tab only): prevents the page from scrolling;
   *    the ChatPanel scrolls internally instead.
   * Desktop (lg+): restore normal centred, auto-height layout.
   */
  const isChatTab = tab === 'chat';

  return (
    <>
      {/*
       * ── Mobile layout (below lg) ──────────────────────────────────────────
       * -mx-4 negates the shell's horizontal p-4 so the header border-b is
       * full-width. On the Chat tab, h-[calc(100dvh-6rem)] fills the available
       * content area exactly (6rem = 1rem top + 5rem bottom padding of main).
       * overflow-hidden stops the page from scrolling; ChatPanel scrolls inside.
       */}
      <div
        className={[
          '-mx-4 flex flex-col lg:hidden',
          isChatTab ? 'h-[calc(100dvh-6rem)] overflow-hidden' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <MessagesPageHeader docsCompleted={docsCompleted} docsTotal={docsTotal}>
          <MessagesTabSwitcher active={tab} onChange={setTab} />
        </MessagesPageHeader>

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
          {isChatTab ? (
            <ChatPanel
              adviser={session.adviser}
              messages={localMessages}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSend}
            />
          ) : docsLoading ? (
            <p className="text-sm text-ink-60">Loading documents…</p>
          ) : (
            <DocumentsPanel documents={documents} onUpload={handleUpload} onRemove={handleRemove} />
          )}
        </div>
      </div>

      {/*
       * ── Desktop layout (lg+) — original unchanged ─────────────────────────
       */}
      <div className="mx-auto hidden max-w-5xl flex-col gap-6 pb-8 lg:flex">
        <MessagesPageHeader docsCompleted={docsCompleted} docsTotal={docsTotal}>
          <MessagesTabSwitcher active={tab} onChange={setTab} />
        </MessagesPageHeader>

        {isChatTab ? (
          <ChatPanel
            adviser={session.adviser}
            messages={localMessages}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
          />
        ) : docsLoading ? (
          <p className="text-sm text-ink-60">Loading documents…</p>
        ) : (
          <DocumentsPanel documents={documents} onUpload={handleUpload} onRemove={handleRemove} />
        )}
      </div>
    </>
  );
}
