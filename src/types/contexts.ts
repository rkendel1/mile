/**
 * Context Types for Dynamic Component Configuration
 * Each embed can be configured with these contexts to adapt behavior
 */

export interface EmbedContext {
  tenant?: TenantContext;
  user?: UserContext;
  userState?: UserStateContext;
  environment?: EnvironmentContext;
  permissions?: PermissionsContext;
  featureFlags?: FeatureFlagsContext;
  liveData?: LiveDataContext;
  externalIntegrations?: ExternalIntegrationsContext;
}

/**
 * 1. Tenant / Brand Context
 * Applies branding, messaging, feature availability, and default flows
 */
export interface TenantContext {
  id: string;
  name: string;
  brand: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  messaging?: {
    welcomeMessage?: string;
    supportEmail?: string;
    customLabels?: { [key: string]: string };
  };
  features?: {
    enabledModules?: string[];
    disabledModules?: string[];
    customFlows?: string[];
  };
  locale?: string;
  timezone?: string;
  subBrand?: string;
}

/**
 * 2. User Identity & Role Context
 * Shows or hides actions based on role, personalizes greetings and features
 */
export interface UserContext {
  id: string;
  email?: string;
  name?: string;
  role: 'customer' | 'admin' | 'manager' | 'guest' | string;
  permissions?: string[];
  groups?: string[];
  metadata?: {
    accountType?: string;
    tier?: string;
    since?: string;
    [key: string]: any;
  };
}

/**
 * 3. User State / Progress Context
 * Tracks workflow progress, skips completed steps, pre-fills information
 */
export interface UserStateContext {
  currentStep?: string;
  completedSteps?: string[];
  progressPercent?: number;
  sessionData?: {
    [key: string]: any;
  };
  savedState?: {
    lastAccessed?: string;
    resumePoint?: string;
    formData?: { [key: string]: any };
  };
  history?: {
    timestamp: string;
    action: string;
    data?: any;
  }[];
}

/**
 * 4. Environment Context
 * Adapts UI for device, platform, and live vs test modes
 */
export interface EnvironmentContext {
  mode: 'live' | 'sandbox' | 'test' | 'development';
  platform: 'web' | 'mobile' | 'desktop' | 'embedded';
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os?: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
    browser?: string;
    screenSize?: { width: number; height: number };
  };
  apiEndpoint?: string;
  version?: string;
  debugMode?: boolean;
}

/**
 * 5. Permissions & Policy Context
 * Enforces feature limits, access controls, allowed actions
 */
export interface PermissionsContext {
  allowedActions?: string[];
  deniedActions?: string[];
  featureLimits?: {
    [feature: string]: {
      limit?: number;
      used?: number;
      resetPeriod?: string;
    };
  };
  policies?: {
    [policy: string]: boolean | string | number;
  };
  subscriptionTier?: string;
  trialMode?: boolean;
  expiresAt?: string;
}

/**
 * 6. Feature Flags / Flow Variant Context
 * Enables A/B testing, staged rollouts, experimental features
 */
export interface FeatureFlagsContext {
  flags?: {
    [flagName: string]: boolean | string | number;
  };
  variant?: string;
  cohort?: string;
  experiments?: {
    id: string;
    name: string;
    variant: string;
    startDate?: string;
  }[];
  rolloutPercent?: number;
}

/**
 * 7. Live Data / Real-Time Context
 * Shows current metrics, updates UI live, disables actions dynamically
 */
export interface LiveDataContext {
  metrics?: {
    [metricName: string]: number | string;
  };
  status?: {
    [service: string]: 'online' | 'offline' | 'degraded';
  };
  updates?: {
    timestamp: string;
    type: string;
    data: any;
  }[];
  notifications?: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
  }[];
  refreshInterval?: number;
}

/**
 * 8. External Integration Context
 * Determines which external services are available and their status
 */
export interface ExternalIntegrationsContext {
  integrations?: {
    [serviceName: string]: {
      enabled: boolean;
      status: 'available' | 'unavailable' | 'maintenance';
      version?: string;
      config?: any;
    };
  };
  fallbacks?: {
    [serviceName: string]: string;
  };
  webhooks?: {
    url: string;
    events: string[];
  }[];
}

/**
 * Context Configuration for Component Generation
 */
export interface ContextConfiguration {
  embedId: string;
  contexts: EmbedContext;
  overrides?: {
    [componentId: string]: Partial<EmbedContext>;
  };
  validation?: {
    required?: (keyof EmbedContext)[];
    strict?: boolean;
  };
}

/**
 * Context-Aware Component Metadata
 */
export interface ContextAwareComponent {
  id: string;
  name: string;
  code: string;
  contexts: EmbedContext;
  contextBindings: {
    [propertyPath: string]: {
      contextType: keyof EmbedContext;
      contextPath: string;
      defaultValue?: any;
    };
  };
  conditionalRendering?: {
    condition: string; // e.g., "tenant.features.enabledModules.includes('cards')"
    renderIf: boolean;
  }[];
}
