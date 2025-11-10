import React, { useState } from 'react';
import { ContextState } from '../../types';
import { apiService } from '../../services/api';
import '../../styles/Tabs.css';

interface SpecTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const SpecTab: React.FC<SpecTabProps> = ({ contextState, onContextUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [specType, setSpecType] = useState<'openapi' | 'swagger' | 'graphql'>('openapi');
  const [pastedSpec, setPastedSpec] = useState('');
  const [specUrl, setSpecUrl] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      let content;
      
      try {
        content = JSON.parse(text);
      } catch {
        content = text;
      }

      const result = await apiService.parseSpec(
        content,
        specType,
        file.name.replace(/\.(json|yaml|yml)$/, ''),
        '1.0.0'
      );

      if (result.success) {
        const specData = await apiService.getSpec(result.spec.id);
        onContextUpdate({
          specs: { ...contextState.specs, [result.spec.id]: specData.spec },
          currentSpec: result.spec.id,
        });
      } else {
        alert(`Failed to parse API spec: ${result.error || 'Please check the file format.'}`);
      }
    } catch (error) {
      console.error('Error uploading spec:', error);
      alert('Failed to parse API spec. Please check the file format.');
    } finally {
      setUploading(false);
      event.currentTarget.value = '';
    }
  };

  const handleParsePastedSpec = async () => {
    if (!pastedSpec.trim()) {
      alert('Please paste a spec first.');
      return;
    }

    setUploading(true);
    try {
      let content;
      try {
        content = JSON.parse(pastedSpec);
      } catch {
        content = pastedSpec;
      }

      const result = await apiService.parseSpec(
        content,
        specType,
        'Pasted Spec',
        '1.0.0'
      );

      if (result.success) {
        const specData = await apiService.getSpec(result.spec.id);
        onContextUpdate({
          specs: { ...contextState.specs, [result.spec.id]: specData.spec },
          currentSpec: result.spec.id,
        });
        setPastedSpec('');
      } else {
        alert(`Failed to parse API spec: ${result.error || 'Please check the format and content.'}`);
      }
    } catch (error) {
      console.error('Error parsing spec:', error);
      alert('Failed to parse API spec. Please check the format and content.');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchFromUrl = async () => {
    if (!specUrl.trim()) {
      alert('Please enter a URL.');
      return;
    }

    setUploading(true);
    try {
      const result = await apiService.parseSpecFromUrl(specUrl, specType);

      if (result.success) {
        const specData = await apiService.getSpec(result.spec.id);
        onContextUpdate({
          specs: { ...contextState.specs, [result.spec.id]: specData.spec },
          currentSpec: result.spec.id,
        });
        setSpecUrl('');
      } else {
        alert(`Failed to parse API spec from URL: ${result.error || 'Please check the URL and spec format.'}`);
      }
    } catch (error) {
      console.error('Error fetching spec from URL:', error);
      alert('Failed to parse API spec from URL. Please check the URL and spec format.');
    } finally {
      setUploading(false);
    }
  };

  const currentSpec = contextState.currentSpec 
    ? contextState.specs[contextState.currentSpec] 
    : null;

  return (
    <div className="tab-container spec-tab">
      <h2>📋 API Specification</h2>
      
      <div className="spec-upload-section">
        <h3>Import API Spec</h3>
        <div className="upload-controls">
          <select 
            value={specType} 
            onChange={(e) => setSpecType(e.currentTarget.value as any)}
            className="spec-type-select"
          >
            <option value="openapi">OpenAPI 3.x</option>
            <option value="swagger">Swagger 2.0</option>
            <option value="graphql">GraphQL</option>
          </select>
          
          <label className="file-upload-label">
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <button className="btn btn-primary" disabled={uploading} onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
              {uploading ? '⏳ Parsing...' : '📁 Choose File'}
            </button>
          </label>
        </div>

        <div className="url-spec-section">
          <input
            type="url"
            className="spec-url-input"
            placeholder="Or paste a URL to your spec"
            value={specUrl}
            onChange={(e) => setSpecUrl(e.currentTarget.value)}
            disabled={uploading}
          />
          <button
            className="btn btn-secondary"
            onClick={handleFetchFromUrl}
            disabled={uploading || !specUrl.trim()}
          >
            {uploading ? '⏳ Fetching...' : '🔗 Fetch from URL'}
          </button>
        </div>

        <div className="paste-spec-section">
          <textarea
            className="spec-paste-area"
            placeholder="Or paste your spec here (JSON or YAML)"
            value={pastedSpec}
            onChange={(e) => setPastedSpec(e.currentTarget.value)}
            disabled={uploading}
            rows={10}
          />
          <button 
            className="btn btn-secondary" 
            onClick={handleParsePastedSpec}
            disabled={uploading || !pastedSpec.trim()}
          >
            {uploading ? '⏳ Parsing...' : '📝 Parse Pasted Spec'}
          </button>
        </div>
      </div>

      {currentSpec && (
        <div className="spec-details">
          <h3>Current Spec: {currentSpec.name}</h3>
          
          <div className="spec-stats">
            <div className="stat-card">
              <div className="stat-icon">🔌</div>
              <div className="stat-value">{currentSpec.parsed.endpoints.length}</div>
              <div className="stat-label">Endpoints</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{currentSpec.parsed.models.length}</div>
              <div className="stat-label">Models</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-value">{currentSpec.parsed.authMethods.length}</div>
              <div className="stat-label">Auth Methods</div>
            </div>
          </div>

          {currentSpec.suggestedFlows && currentSpec.suggestedFlows.length > 0 && (
            <div className="suggested-flows-section">
              <h4>🤖 AI-Suggested Flows</h4>
              <div className="flows-list">
                {currentSpec.suggestedFlows.map((flow, index) => (
                  <button key={index} className="flow-suggestion-btn">
                    {flow}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="endpoints-list">
            <h4>Endpoints</h4>
            <div className="scrollable-list">
              {currentSpec.parsed.endpoints.map((endpoint) => (
                <div key={endpoint.id} className="endpoint-item">
                  <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <span className="endpoint-path">{endpoint.path}</span>
                  {endpoint.summary && (
                    <span className="endpoint-summary">{endpoint.summary}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {currentSpec.parsed.baseUrl && (
            <div className="base-url">
              <strong>Base URL:</strong> {currentSpec.parsed.baseUrl}
            </div>
          )}
        </div>
      )}

      {!currentSpec && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No API spec loaded yet</p>
          <p className="empty-hint">Upload an OpenAPI, Swagger, or GraphQL spec to get started</p>
        </div>
      )}
    </div>
  );
};

export default SpecTab;