"use client";

import React, { useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import WorkspacePanel from '@/components/WorkspacePanel';
import { ChatContext, ContextState, DocId, APISpec } from '@/types';
import '@/styles/App.css';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function Home() {
  const [sessionId] = useState(`session-${Date.now()}`);
  const [context, setContext] = useState<ChatContext>({
    activeTab: 'spec',
  });
  const [contextState, setContextState] = useState<ContextState>({
    goals: {},
    tests: {},
    components: {},
    chatHistory: [],
  });

  const currentSpec = useQuery(api.specs.get, { 
    id: contextState.currentSpec as Id<"specs"> | undefined 
  }) as APISpec | null;

  const handleTabChange = (tab: ChatContext['activeTab']) => {
    setContext({ ...context, activeTab: tab });
  };

  const handleContextUpdate = (updates: Partial<ContextState>) => {
    setContextState(prevState => ({ ...prevState, ...updates }));
    if (updates.currentSpec) {
      setContext(prevContext => ({ ...prevContext, specId: updates.currentSpec as DocId }));
    }
  };

  return (
    <main className="app">
      <div className="workspace">
        <ChatPanel 
          sessionId={sessionId}
          context={context}
          contextState={contextState}
          onContextUpdate={handleContextUpdate}
          currentSpec={currentSpec}
        />
        <WorkspacePanel 
          context={context}
          contextState={contextState}
          onTabChange={handleTabChange}
          onContextUpdate={handleContextUpdate}
          sessionId={sessionId}
        />
      </div>
    </main>
  );
}