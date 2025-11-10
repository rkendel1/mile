"use client";

import React, { useState } from 'react';
import { ContextState, DataFlow, UIComponent, FunctionBinding } from '@/types';
import '@/styles/Tabs.css';

interface GoalTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const GoalTab: React.FC<GoalTabProps> = ({ contextState, onContextUpdate }) => {
  const [planExpanded, setPlanExpanded] = useState(true);
  
  const currentGoal = contextState.currentGoal 
    ? contextState.goals[contextState.currentGoal] 
    : null;

  const currentSpec = contextState.currentSpec 
    ? contextState.specs[contextState.currentSpec] 
    : null;

  return (
    <div className="tab-container goal-tab">
      <h2>🎯 Goal & Planning</h2>
      
      {!currentSpec && (
        <div className="warning-box">
          <p>⚠️ Please import an API spec first before defining your goal.</p>
        </div>
      )}

      {currentSpec && !currentGoal && (
        <div className="goal-prompt">
          <p>Describe what you want to build in the chat...</p>
          <div className="example-goals">
            <h4>Example Goals:</h4>
            <ul>
              <li>💼 "Create a dashboard showing user metrics"</li>
              <li>📝 "Build a form to create new orders"</li>
              <li>📊 "Show a table of all products with filters"</li>
              <li>📈 "Display sales data in a chart"</li>
            </ul>
          </div>
        </div>
      )}

      {currentGoal && (
        <div className="goal-details">
          <div className="goal-header">
            <h3>Current Goal</h3>
            <span className={`status-badge status-${currentGoal.status}`}>
              {currentGoal.status}
            </span>
          </div>

          <div className="goal-description">
            <p>{currentGoal.description}</p>
          </div>

          <div className="plan-section">
            <div 
              className="plan-header"
              onClick={() => setPlanExpanded(!planExpanded)}
            >
              <h4>📝 Execution Plan</h4>
              <span className="expand-icon">{planExpanded ? '▼' : '▶'}</span>
            </div>

            {planExpanded && (
              <div className="plan-content">
                <div className="plan-item">
                  <h5>UI Type</h5>
                  <div className="ui-type-badge">
                    {currentGoal.plan.uiStructure.type}
                  </div>
                </div>

                <div className="plan-item">
                  <h5>Endpoints to Use ({currentGoal.plan.endpoints.length})</h5>
                  <ul className="endpoint-list">
                    {currentGoal.plan.endpoints.map((endpointId: string, idx: number) => (
                      <li key={idx}>
                        <span className="endpoint-id">{endpointId}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-item">
                  <h5>Data Flow</h5>
                  <div className="data-flow">
                    {currentGoal.plan.dataFlow.map((flow: DataFlow, idx: number) => (
                      <div key={idx} className="flow-item">
                        <span className="flow-source">{flow.source}</span>
                        <span className="flow-arrow">→</span>
                        <span className="flow-target">{flow.target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="plan-item">
                  <h5>Components ({currentGoal.plan.uiStructure.components.length})</h5>
                  <ul className="component-list">
                    {currentGoal.plan.uiStructure.components.map((comp: UIComponent, idx: number) => (
                      <li key={idx}>
                        <span className="component-type">{comp.type}</span>
                        <span className="component-id">{comp.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-item">
                  <h5>Functions ({currentGoal.plan.functions.length})</h5>
                  <ul className="function-list">
                    {currentGoal.plan.functions.map((fn: FunctionBinding, idx: number) => (
                      <li key={idx}>
                        <code>{fn.name}()</code>
                        <span className="function-endpoint"> → {fn.endpoint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="next-steps">
            <p>✅ Plan ready! Continue to the <strong>Test</strong> tab to validate the endpoints.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTab;