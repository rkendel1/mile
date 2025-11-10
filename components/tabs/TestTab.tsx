"use client";

import React from 'react';
import { ContextState, TestResult } from '@/types';
import '@/styles/Tabs.css';

interface TestTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const TestTab: React.FC<TestTabProps> = ({ contextState, onContextUpdate }) => {
  const currentGoal = contextState.currentGoal 
    ? contextState.goals[contextState.currentGoal] 
    : null;

  const testResults = contextState.currentGoal && contextState.tests[contextState.currentGoal]
    ? contextState.tests[contextState.currentGoal]
    : [];

  return (
    <div className="tab-container test-tab">
      <h2>🧪 API Testing & Validation</h2>
      
      {!currentGoal && (
        <div className="warning-box">
          <p>⚠️ Please define your goal first before testing endpoints.</p>
        </div>
      )}

      {currentGoal && testResults.length === 0 && (
        <div className="test-prompt">
          <p>Ask me to run tests in the chat to validate your API endpoints.</p>
          <div className="test-info">
            <h4>What I'll test:</h4>
            <ul>
              <li>✅ Endpoint connectivity</li>
              <li>✅ Response status codes</li>
              <li>✅ Data structure validation</li>
              <li>✅ Authentication flow</li>
            </ul>
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="test-results">
          <div className="results-header">
            <h3>Test Results</h3>
            <div className="results-summary">
              <span className="success-count">
                ✅ {testResults.filter((t: TestResult) => t.success).length} Passed
              </span>
              <span className="fail-count">
                ❌ {testResults.filter((t: TestResult) => !t.success).length} Failed
              </span>
            </div>
          </div>

          <div className="results-list">
            {testResults.map((result: TestResult) => (
              <div key={result.id} className={`test-result ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-icon">{result.success ? '✅' : '❌'}</span>
                  <span className={`method-badge method-${result.method.toLowerCase()}`}>
                    {result.method}
                  </span>
                  <span className="endpoint-name">{result.endpoint}</span>
                  <span className="status-code">{result.status}</span>
                </div>

                <div className="result-details">
                  <div className="result-timing">
                    ⏱️ {result.duration}ms
                  </div>

                  {result.requestData && (
                    <details className="result-section">
                      <summary>Request Data</summary>
                      <pre>{JSON.stringify(result.requestData, null, 2)}</pre>
                    </details>
                  )}

                  {result.responseData && (
                    <details className="result-section">
                      <summary>Response Data</summary>
                      <pre>{JSON.stringify(result.responseData, null, 2)}</pre>
                    </details>
                  )}

                  {result.error && (
                    <div className="result-error">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="next-steps">
            {testResults.every((t: TestResult) => t.success) ? (
              <p>✅ All tests passed! Ready to generate the component in the <strong>Component</strong> tab.</p>
            ) : (
              <p>⚠️ Some tests failed. Please check the errors above before proceeding.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTab;