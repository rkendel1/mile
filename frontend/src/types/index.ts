export interface APISpec {
  id: string;
  name: string;
  version: string;
  type: 'openapi' | 'swagger' | 'graphql';
  content: any;
  parsed: ParsedSpec;
  suggestedFlows?: string[];
  createdAt: string;
  apiKey?: string;
}

export interface ParsedSpec {
  endpoints: Endpoint[];
  models: Model[];
  authMethods: AuthMethod[];
  baseUrl?: string;
}

export interface Endpoint {
  id: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters: any[];
  requestBody?: any;
  responses: any[];
  tags?: string[];
}

export interface Model {
  name: string;
  properties: { [key: string]: any };
  required?: string[];
}

export interface AuthMethod {
  type: 'apiKey' | 'bearer' | 'oauth2' | 'basic';
  name?: string;
  in?: 'header' | 'query';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: ChatContext;
}

export interface ChatContext {
  activeTab: 'spec' | 'goal' | 'test' | 'component' | 'edit';
  specId?: string;
  goalId?: string;
  testResults?: TestResult[];
  componentId?: string;
}

export interface Goal {
  id: string;
  description: string;
  plan: GoalPlan;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface GoalPlan {
  endpoints: string[];
  dataFlow: DataFlow[];
  uiStructure: UIStructure;
  functions: FunctionBinding[];
}

export interface DataFlow {
  source: string;
  target: string;
  transformation?: string;
}

export interface UIStructure {
  type: 'dashboard' | 'form' | 'table' | 'chart' | 'custom';
  components: UIComponent[];
}

export interface UIComponent {
  id: string;
  type: string;
  props: { [key: string]: any };
  bindings: DataBinding[];
  children?: UIComponent[];
}

export interface DataBinding {
  source: string;
  target: string;
  transform?: string;
}

export interface FunctionBinding {
  name: string;
  endpoint: string;
  parameters: { [key: string]: any };
  onSuccess?: string;
  onError?: string;
}

export interface TestResult {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  requestData?: any;
  responseData?: any;
  error?: string;
  timestamp: string;
  duration: number;
}

export interface Component {
  id: string;
  name: string;
  code: string;
  framework: 'react' | 'vue' | 'angular';
  preview?: string;
  bindings: DataBinding[];
  functions: FunctionBinding[];
  createdAt: string;
  updatedAt: string;
}

export interface ContextState {
  specs: { [id: string]: APISpec };
  goals: { [id: string]: Goal };
  tests: { [id: string]: TestResult[] };
  components: { [id: string]: Component };
  currentSpec?: string;
  currentGoal?: string;
  currentComponent?: string;
  chatHistory: ChatMessage[];
}

export interface ChatAction {
  type: string;
  [key: string]: any;
}

// API Response Types
export interface ParseSpecSuccessResponse {
  success: true;
  spec: {
    id: string;
    name: string;
    version: string;
    type: string;
    endpoints: number;
    models: number;
    authMethods: number;
  };
}

export interface ParseSpecErrorResponse {
  success: false;
  error: string;
}

export type ParseSpecResponse = ParseSpecSuccessResponse | ParseSpecErrorResponse;

export interface GetSpecResponse {
  spec: APISpec;
}