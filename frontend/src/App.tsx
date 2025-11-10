import React, { useState } from 'react';
import './styles/App.css';
import ChatPanel from './components/ChatPanel';
import WorkspacePanel from './components/WorkspacePanel';
import { ChatContext, ContextState } from './types';

function App() {
  const [sessionId] = useState(`session-${Date.now()}`);
  const [context, setContext] = useState<ChatContext>({
    activeTab: 'spec',
  });
  const [contextState, setContextState] = useState<ContextState>({
    specs: {},
    goals: {},
    tests: {},
    components: {},
    chatHistory: [],
  });

  const handleTabChange = (tab: ChatContext['activeTab']) => {
    setContext({ ...context, activeTab: tab });
  };

  const handleContextUpdate = (updates: Partial<ContextState>) => {
    setContextState({ ...contextState, ...updates });
  };

  return (
    <div className="app">
      <div className="workspace">
        <ChatPanel 
          sessionId={sessionId}
          context={context}
          contextState={contextState}
          onContextUpdate={handleContextUpdate}
        />
        <WorkspacePanel 
          context={context}
          contextState={contextState}
          onTabChange={handleTabChange}
          onContextUpdate={handleContextUpdate}
        />
      </div>
    </div>
  );
}

export default App;