import React, { useState } from 'react';
import { ContextState } from '../../types';
import '../../styles/Tabs.css';

interface EditTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const EditTab: React.FC<EditTabProps> = ({ contextState, onContextUpdate }) => {
  const [history] = useState<string[]>([]);
  
  const hasContent = contextState.currentSpec || contextState.currentGoal || contextState.currentComponent;

  return (
    <div className="tab-container edit-tab">
      <h2>✏️ Edit & Iterate</h2>
      
      {!hasContent && (
        <div className="warning-box">
          <p>⚠️ Nothing to edit yet. Start by importing an API spec and defining a goal.</p>
        </div>
      )}

      {hasContent && (
        <div className="edit-workspace">
          <div className="edit-section">
            <h3>🔄 Iteration Tools</h3>
            <p>You can jump between any tab to refine your work:</p>
            
            <div className="iteration-options">
              <div className="option-card">
                <div className="option-icon">📋</div>
                <h4>Spec Tab</h4>
                <p>Switch API or import additional specs</p>
              </div>
              
              <div className="option-card">
                <div className="option-icon">🎯</div>
                <h4>Goal Tab</h4>
                <p>Redefine or refine what you're building</p>
              </div>
              
              <div className="option-card">
                <div className="option-icon">🧪</div>
                <h4>Test Tab</h4>
                <p>Validate different endpoints or data</p>
              </div>
              
              <div className="option-card">
                <div className="option-icon">🧩</div>
                <h4>Component Tab</h4>
                <p>Update UI, styling, or functionality</p>
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h3>💾 Version Control</h3>
            <div className="history-section">
              {history.length === 0 ? (
                <p>No changes recorded yet. Major changes will appear here.</p>
              ) : (
                <ul className="history-list">
                  {history.map((change, idx) => (
                    <li key={idx} className="history-item">
                      <span className="history-time">{new Date().toLocaleTimeString()}</span>
                      <span className="history-desc">{change}</span>
                      <button className="btn-small">Revert</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="edit-section">
            <h3>📤 Export Options</h3>
            <div className="export-options">
              <div className="export-option">
                <div className="export-icon">💻</div>
                <h4>Code Snippet</h4>
                <p>Copy/paste the component code</p>
                <button className="btn btn-secondary">Get Code</button>
              </div>
              
              <div className="export-option">
                <div className="export-icon">📦</div>
                <h4>NPM Package</h4>
                <p>Download as a reusable package</p>
                <button className="btn btn-secondary">Download</button>
              </div>
              
              <div className="export-option">
                <div className="export-icon">🔗</div>
                <h4>Embed Code</h4>
                <p>Get an iframe for your app</p>
                <button className="btn btn-secondary">Generate</button>
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h3>🔧 Advanced Features</h3>
            <div className="feature-grid">
              <div className="feature-item">
                <input type="checkbox" id="undo" />
                <label htmlFor="undo">Enable Auto-save</label>
              </div>
              <div className="feature-item">
                <input type="checkbox" id="highlight" />
                <label htmlFor="highlight">Cross-highlighting</label>
              </div>
              <div className="feature-item">
                <input type="checkbox" id="voice" />
                <label htmlFor="voice">Voice mode</label>
              </div>
              <div className="feature-item">
                <input type="checkbox" id="preview" />
                <label htmlFor="preview">Live preview</label>
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h3>🎨 Quick Actions</h3>
            <p>Ask me in chat to:</p>
            <div className="quick-actions">
              <button className="action-btn">🔄 Regenerate component</button>
              <button className="action-btn">📝 Change UI layout</button>
              <button className="action-btn">🎨 Update styling</button>
              <button className="action-btn">🔗 Add more endpoints</button>
              <button className="action-btn">⚙️ Modify bindings</button>
              <button className="action-btn">🧹 Start fresh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTab;
