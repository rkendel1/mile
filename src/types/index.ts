export interface APISpec {
  id: string;
  name: string;
  version: string;
  type: 'openapi' | 'swagger' | 'graphql';
  content: any;
  parsed: ParsedSpec;
  createdAt: string;
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
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  tags?: string[];
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required: boolean;
  schema: Schema;
}

export interface RequestBody {
  description?: string;
  required: boolean;
  content: {
    [mediaType: string]: {
      schema: Schema;
    };
  };
}

export interface Response {
  statusCode: string;
  description: string;
  content?: {
    [mediaType: string]: {
      schema: Schema;
    };
  };
}

export interface Schema {
  type: string;
  properties?: { [key: string]: Schema };
  items?: Schema;
  required?: string[];
  enum?: any[];
  format?: string;
  description?: string;
}

export interface Model {
  name: string;
  properties: { [key: string]: Schema };
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
