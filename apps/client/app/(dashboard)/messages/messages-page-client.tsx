'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
  sendPortalMessage,
  type PortalDocumentTask,
  type PortalMessage,
} from '@/lib/api/portal-data';

export default function MessagesPageClient() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<MessagesTab>(tabParam === 'documents' ? 'documents' : 'chat');

  const { data: session, isLoading: sessionLoading, error: sessionError, refetch } =
    usePortalSession();
  const { data: messages, isLoading: messagesLoading, error: messagesError } = usePortalMessages();

  const [localMessages, setLocalMessages] = useState<PortalMessage[]>([]);
  const [documents, setDocuments] = useState<PortalDocumentTask[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  async function handleSend() {
    const body = draft.trim();
    if (!body || isSending) return;

    const optimistic: PortalMessage = {
      id: `local-${Date.now()}`,
      direction: 'INBOUND',
      body,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setIsSending(true);

    try {
      const sent = await sendPortalMessage(body);
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? { ...sent, createdAt: sent.createdAt ?? optimistic.createdAt }
            : m,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ['portal', 'messages'] });
    } catch {
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
    } finally {
      setIsSending(false);
    }
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
  const isChatTab = tab === 'chat';

  return (
    <>
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
