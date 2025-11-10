"use client";

import React from 'react';
import { ChatContext, ContextState } from '@/types';
import SpecTab from '@/components/tabs/SpecTab';
import GoalTab from '@/components/tabs/GoalTab';
import TestTab from '@/components/tabs/TestTab';
import ComponentTab from '@/components/tabs/ComponentTab';
import EditTab from '@/components/tabs/EditTab';
import '@/styles/WorkspacePanel.css';

interface WorkspacePanelProps {
  context: ChatContext;
  contextState: ContextState;
  onTabChange: (tab: ChatContext['activeTab']) => void;
  onContextUpdate: (updates: Partial<ContextState>) => void;
  sessionId: string;
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  context,
  contextState,
  onTabChange,
  onContextUpdate,
  sessionId,
}) => {
  const tabs: { id: ChatContext['activeTab']; label: string; icon: string }[] = [
    { id: 'spec', label: 'Spec', icon: '📋' },
    { id: 'goal', label: 'Goal', icon: '🎯' },
    { id: 'test', label: 'Test', icon: '🧪' },
    { id: 'component', label: 'Component', icon: '🧩' },
    { id: 'edit', label: 'Edit', icon: '✏️' },
  ];

  const renderActiveTab = () => {
    switch (context.activeTab) {
      case 'spec':
        return <SpecTab contextState={contextState} onContextUpdate={onContextUpdate} sessionId={sessionId} />;
      case 'goal':
        return <GoalTab contextState={contextState} onContextUpdate={onContextUpdate} />;
      case 'test':
        return <TestTab contextState={contextState} onContextUpdate={onContextUpdate} />;
      case 'component':
        return <ComponentTab contextState={contextState} onContextUpdate={onContextUpdate} />;
      case 'edit':
        return <EditTab contextState={contextState} onContextUpdate={onContextUpdate} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="workspace-panel">
      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`workspace-tab ${context.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="workspace-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default WorkspacePanel;