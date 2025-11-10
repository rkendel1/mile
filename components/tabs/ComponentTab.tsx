"use client";

import React, { useState } from 'react';
import { ContextState } from '@/types';
import '@/styles/Tabs.css';

interface ComponentTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const ComponentTab: React.FC<ComponentTabProps> = ({ contextState, onContextUpdate }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  
  const currentComponent = contextState.currentComponent 
    ? contextState.components[contextState.currentComponent] 
    : null;

  const currentGoal = contextState.currentGoal 
    ? contextState.goals[contextState.currentGoal] 
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="tab-container component-tab">
      <h2>🧩 Component Builder</h2>
      
      {!currentGoal && (
        <div className="warning-box">
          <p>⚠️ Please define your goal and test the API first.</p>
        </div>
      )}

      {currentGoal && !currentComponent && (
        <div className="component-prompt">
          <p>Ask me to generate the component in the chat...</p>
          <div className="component-info">
            <h4>What I'll create:</h4>
            <ul>
              <li>🎨 Fully styled React component</li>
              <li>🔗 Pre-wired API bindings</li>
              <li>📦 State management with hooks</li>
              <li>⚠️ Error handling & loading states</li>
              <li>📱 Responsive design</li>
            </ul>
          </div>
        </div>
      )}

      {currentComponent && (
        <div className="component-viewer">
          <div className="component-header">
            <h3>{currentComponent.name}</h3>
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
              >
                👁️ Preview
              </button>
              <button
                className={`view-btn ${viewMode === 'code' ? 'active' : ''}`}
                onClick={() => setViewMode('code')}
              >
                💻 Code
              </button>
            </div>
          </div>

          {viewMode === 'preview' && (
            <div className="component-preview">
              <div className="preview-frame">
                {currentComponent.preview ? (
                  <iframe
                    title="Component Preview"
                    srcDoc={currentComponent.preview}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div className="preview-placeholder">
                    <p>Component preview will appear here</p>
                    <div className="demo-ui">
                      <div className="demo-card">
                        <div className="demo-header">Generated Component</div>
                        <div className="demo-content">
                          <p>Your interactive component with live API data</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'code' && (
            <div className="component-code">
              <div className="code-header">
                <span>React Component ({currentComponent.framework})</span>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(currentComponent.code)}
                >
                  📋 Copy Code
                </button>
              </div>
              <pre className="code-block">
                <code>{currentComponent.code}</code>
              </pre>
            </div>
          )}

          <div className="component-controls">
            <h4>Customize Component</h4>
            <p>Ask me in chat to:</p>
            <div className="control-suggestions">
              <button className="suggestion-btn">📊 Make it a table</button>
              <button className="suggestion-btn">📈 Add a chart</button>
              <button className="suggestion-btn">🔍 Add filters</button>
              <button className="suggestion-btn">📄 Add pagination</button>
              <button className="suggestion-btn">✏️ Edit styling</button>
            </div>
          </div>

          <div className="component-metadata">
            <h4>Component Details</h4>
            <div className="metadata-grid">
              <div className="metadata-item">
                <strong>Bindings:</strong> {currentComponent.bindings.length}
              </div>
              <div className="metadata-item">
                <strong>Functions:</strong> {currentComponent.functions.length}
              </div>
              <div className="metadata-item">
                <strong>Framework:</strong> {currentComponent.framework}
              </div>
              <div className="metadata-item">
                <strong>Created:</strong> {new Date(currentComponent.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="export-section">
            <h4>Export Component</h4>
            <div className="export-buttons">
              <button className="btn btn-primary">📦 Download as Package</button>
              <button className="btn btn-secondary">🔗 Get Embed Code</button>
              <button className="btn btn-secondary">💾 Export to CodeSandbox</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentTab;