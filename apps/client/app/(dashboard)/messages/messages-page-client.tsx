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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-8">
      <MessagesPageHeader>
        <MessagesTabSwitcher active={tab} onChange={setTab} />
      </MessagesPageHeader>

      {tab === 'chat' ? (
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
  );
}
