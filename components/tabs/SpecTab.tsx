"use client";

import React, { useState, useEffect } from 'react';
import { ContextState, Schema, Endpoint, Parameter, Response, Model, APISpec } from '@/types';
import SchemaViewer from '@/components/SchemaViewer';
import '@/styles/Tabs.css';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface SpecTabProps {
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
  sessionId: string;
}

const SpecTab: React.FC<SpecTabProps> = ({ contextState, onContextUpdate, sessionId }) => {
  const [uploading, setUploading] = useState(false);
  const [specType, setSpecType] = useState<'openapi' | 'swagger' | 'graphql'>('openapi');
  const [pastedSpec, setPastedSpec] = useState('');
  const [specUrl, setSpecUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const parseSpecAction = useAction(api.specs.parseSpec);
  const setApiKeyAction = useAction(api.specs.setApiKey);
  
  const currentSpec = useQuery(api.specs.get, { 
    id: contextState.currentSpec as Id<"specs"> | undefined 
  }) as APISpec | null;

  useEffect(() => {
    if (currentSpec) {
      setApiKey(currentSpec.apiKey || '');
    }
  }, [currentSpec]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleParse = async (content: any, name: string) => {
    setUploading(true);
    try {
      const specId = await parseSpecAction({
        content,
        type: specType,
        name,
        version: '1.0.0',
        sessionId,
      });
      onContextUpdate({ currentSpec: specId });
    } catch (error) {
      console.error('Error parsing spec:', error);
      alert('Failed to parse API spec. Please check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const text = await file.text();
    let content;
    try { content = JSON.parse(text); } catch { content = text; }
    await handleParse(content, file.name.replace(/\.(json|yaml|yml)$/, ''));
    event.currentTarget.value = '';
  };

  const handleParsePastedSpec = async () => {
    if (!pastedSpec.trim()) return alert('Please paste a spec first.');
    let content;
    try { content = JSON.parse(pastedSpec); } catch { content = pastedSpec; }
    await handleParse(content, 'Pasted Spec');
    setPastedSpec('');
  };

  const handleFetchFromUrl = async () => {
    if (!specUrl.trim()) return alert('Please enter a URL.');
    // For now, we pass the URL itself as content, as swagger-parser can handle it.
    await handleParse(specUrl, 'Spec from URL');
    setSpecUrl('');
  };

  const handleSaveApiKey = async () => {
    if (!currentSpec) return;
    try {
      await setApiKeyAction({ id: currentSpec._id as Id<"specs">, apiKey });
      alert('API Key saved!');
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('Failed to save API key.');
    }
  };

  const renderSchemaForContent = (content: { [mediaType: string]: { schema: Schema } }) => {
    const jsonContent = content['application/json'];
    if (jsonContent?.schema) {
      return <SchemaViewer schema={jsonContent.schema} requiredFields={jsonContent.schema.required} />;
    }
    return <p className="no-info">No JSON schema available.</p>;
  };

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

      {currentSpec && currentSpec.parsed && (
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

          <div className="api-key-section">
            <h4>API Key / Bearer Token</h4>
            <p>If your API requires authentication, enter the key here. It will be used in the Test tab.</p>
            <div className="api-key-input-group">
              <input
                type="password"
                className="api-key-input"
                placeholder="Enter your API key or token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={handleSaveApiKey}
              >
                Save Key
              </button>
            </div>
          </div>

          {currentSpec.suggestedFlows && currentSpec.suggestedFlows.length > 0 && (
            <div className="suggested-flows-section">
              <h4>🤖 AI-Suggested Flows</h4>
              <div className="flows-list">
                {currentSpec.suggestedFlows.map((flow: string, index: number) => (
                  <button key={index} className="flow-suggestion-btn">
                    {flow}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="detailed-lists">
            <div className="endpoints-list">
              <h4>Endpoints</h4>
              <div className="scrollable-list">
                {currentSpec.parsed.endpoints.map((endpoint: Endpoint) => (
                  <div key={endpoint.id} className="endpoint-item-container">
                    <div className="endpoint-item" onClick={() => toggleExpand(endpoint.id)}>
                      <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
                      <span className="endpoint-path">{endpoint.path}</span>
                      <span className="expand-icon">{expandedItems[endpoint.id] ? '▼' : '▶'}</span>
                    </div>
                    {expandedItems[endpoint.id] && (
                      <div className="endpoint-details">
                        {endpoint.summary && <p className="endpoint-summary">{endpoint.summary}</p>}
                        {endpoint.parameters.length > 0 && (
                          <div className="detail-section">
                            <h5>Parameters</h5>
                            {endpoint.parameters.map((p: Parameter) => (
                              <div key={`${p.in}-${p.name}`} className="parameter-item">
                                <span className="param-name">{p.name}</span>
                                <span className="param-in">{p.in}</span>
                                <span className="param-type">{p.schema.format || p.schema.type}</span>
                                {p.required && <span className="param-required">required</span>}
                                {p.description && <p className="param-desc">{p.description}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                        {endpoint.requestBody && (
                          <div className="detail-section">
                            <h5>Request Body {endpoint.requestBody.required && <span className="param-required">(required)</span>}</h5>
                            {renderSchemaForContent(endpoint.requestBody.content)}
                          </div>
                        )}
                        {endpoint.responses.length > 0 && (
                          <div className="detail-section">
                            <h5>Responses</h5>
                            {endpoint.responses.map((r: Response) => (
                              <div key={r.statusCode} className="response-item">
                                <span className={`status-code-badge status-${r.statusCode.charAt(0)}xx`}>{r.statusCode}</span>
                                <p>{r.description}</p>
                                {r.content && renderSchemaForContent(r.content)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="models-list">
              <h4>Models</h4>
              <div className="scrollable-list">
                {currentSpec.parsed.models.map((model: Model) => (
                  <div key={model.name} className="model-item-container">
                    <div className="model-item" onClick={() => toggleExpand(model.name)}>
                      <span className="model-name">{model.name}</span>
                      <span className="expand-icon">{expandedItems[model.name] ? '▼' : '▶'}</span>
                    </div>
                    {expandedItems[model.name] && (
                      <div className="model-details">
                        {model.description && <p className="model-description">{model.description}</p>}
                        <SchemaViewer schema={{ type: 'object', properties: model.properties, required: model.required }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {currentSpec.parsed.baseUrl && (
            <div className="base-url">
              <strong>Base URL:</strong> {currentSpec.parsed.baseUrl}
            </div>
          )}
        </div>
      )}

      {currentSpec && !currentSpec.parsed && (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p>Parsing your spec...</p>
          <p className="empty-hint">This should only take a moment.</p>
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