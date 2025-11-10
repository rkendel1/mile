# Context-Aware Components Guide

Mile components are **context-aware**, meaning they dynamically adapt their behavior, appearance, and functionality based on configurable contexts. This enables true multi-tenancy and personalization.

## Overview

Every generated component can be configured with **8 types of contexts**:

1. **Tenant / Brand** - Branding, colors, logos, feature availability
2. **User Identity & Role** - Permissions, personalization based on role
3. **User State / Progress** - Workflow state, completed steps, saved data
4. **Environment** - Device type, platform, live vs sandbox mode
5. **Permissions & Policy** - Access controls, feature limits, subscription tiers
6. **Feature Flags / Flow Variant** - A/B testing, experimental features
7. **Live Data / Real-Time** - Dynamic metrics, notifications, status updates
8. **External Integration** - Available services, fallback options

## Setting Context

### Backend (Node.js)

```typescript
import { EmbedContext } from './types/contexts';

const embedContext: EmbedContext = {
  tenant: {
    id: 'bank-a',
    name: 'Bank A',
    brand: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      theme: 'dark',
      logo: 'https://example.com/logo.png'
    },
    features: {
      enabledModules: ['cards', 'payments', 'transfers']
    }
  },
  user: {
    id: 'user-123',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'customer',
    metadata: {
      accountType: 'premium',
      tier: 'gold'
    }
  },
  environment: {
    mode: 'live',
    platform: 'web',
    device: {
      type: 'desktop',
      os: 'macos'
    }
  },
  permissions: {
    allowedActions: ['view', 'create', 'update'],
    subscriptionTier: 'premium'
  }
};

// Send context with chat message
await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Create a dashboard',
    context: chatContext,
    sessionId: 'session-123',
    embedContext // Add context here
  })
});

// Or set context separately
await fetch('/api/chat/embed-context/session-123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(embedContext)
});
```

### Frontend (React)

```typescript
import { EmbedContext } from './types/contexts';

const MyApp = () => {
  const [embedContext, setEmbedContext] = useState<EmbedContext>({
    tenant: {
      id: 'tenant-1',
      name: 'My Company',
      brand: {
        primaryColor: '#3b82f6',
        theme: 'light'
      }
    },
    user: {
      id: 'user-1',
      name: 'Jane Smith',
      role: 'admin'
    }
  });

  // Pass context when generating components
  const generateComponent = async () => {
    const response = await apiService.generateComponent({
      name: 'Dashboard',
      uiComponents: [...],
      embedContext // Context is used in generation
    });
  };

  return <GeneratedComponent context={embedContext} />;
};
```

## Context Examples

### 1. Tenant/Brand Context

**Use Case:** Different brands with different UI appearances

```typescript
{
  tenant: {
    id: 'bank-a',
    name: 'Bank A',
    brand: {
      primaryColor: '#2563eb',  // Blue for Bank A
      logo: '/logos/bank-a.png',
      theme: 'light'
    }
  }
}

// Bank B uses different colors
{
  tenant: {
    id: 'bank-b',
    name: 'Bank B',
    brand: {
      primaryColor: '#10b981',  // Green for Bank B
      logo: '/logos/bank-b.png',
      theme: 'dark'
    }
  }
}
```

**Result:** Same component renders with different colors and branding for each tenant.

### 2. User Identity & Role Context

**Use Case:** Show different features based on user role

```typescript
// Customer sees limited features
{
  user: {
    id: 'user-1',
    role: 'customer',
    permissions: ['view']
  }
}

// Admin sees all features
{
  user: {
    id: 'admin-1',
    role: 'admin',
    permissions: ['view', 'create', 'update', 'delete']
  }
}
```

**Result:** Customers see read-only views, admins see full CRUD operations.

### 3. User State/Progress Context

**Use Case:** Resume multi-step workflows

```typescript
{
  userState: {
    currentStep: 'step-3',
    completedSteps: ['step-1', 'step-2'],
    progressPercent: 60,
    savedState: {
      formData: {
        cardType: 'virtual',
        name: 'John Doe'
      }
    }
  }
}
```

**Result:** Component skips completed steps and pre-fills saved data.

### 4. Environment Context

**Use Case:** Adapt UI for mobile vs desktop

```typescript
// Mobile
{
  environment: {
    mode: 'live',
    platform: 'mobile',
    device: {
      type: 'mobile',
      os: 'ios',
      screenSize: { width: 375, height: 812 }
    }
  }
}

// Desktop
{
  environment: {
    mode: 'live',
    platform: 'web',
    device: {
      type: 'desktop',
      screenSize: { width: 1920, height: 1080 }
    }
  }
}
```

**Result:** Component renders with responsive layout optimized for each device.

### 5. Permissions & Policy Context

**Use Case:** Enforce subscription limits

```typescript
{
  permissions: {
    subscriptionTier: 'basic',
    featureLimits: {
      'api-calls': {
        limit: 1000,
        used: 850,
        resetPeriod: 'monthly'
      }
    },
    allowedActions: ['view', 'create']
  }
}
```

**Result:** Component shows usage warnings and disables features when limits are reached.

### 6. Feature Flags Context

**Use Case:** A/B testing new features

```typescript
{
  featureFlags: {
    flags: {
      'new-dashboard': true,
      'beta-charts': false
    },
    variant: 'test-group-a',
    experiments: [{
      id: 'exp-1',
      name: 'Dashboard Redesign',
      variant: 'variant-b'
    }]
  }
}
```

**Result:** Different users see different UI variants for testing.

### 7. Live Data Context

**Use Case:** Real-time metrics and notifications

```typescript
{
  liveData: {
    metrics: {
      'cards-issued': 42,
      'active-users': 1250
    },
    notifications: [{
      id: 'notif-1',
      type: 'success',
      message: 'New card activated',
      timestamp: '2024-01-15T10:30:00Z'
    }],
    refreshInterval: 5000  // 5 seconds
  }
}
```

**Result:** Component displays live metrics and updates automatically.

### 8. External Integration Context

**Use Case:** Handle service availability

```typescript
{
  externalIntegrations: {
    integrations: {
      'apple-wallet': {
        enabled: true,
        status: 'available'
      },
      'google-pay': {
        enabled: true,
        status: 'maintenance'
      }
    },
    fallbacks: {
      'google-pay': 'show-qr-code'
    }
  }
}
```

**Result:** Component shows Apple Wallet button, but fallback for Google Pay.

## Using Contexts in Generated Components

Generated components automatically use context:

```typescript
export const Dashboard: React.FC<DashboardProps> = ({ context, apiClient }) => {
  // Extract context values
  const brandColor = context.tenant?.brand?.primaryColor || '#3b82f6';
  const theme = context.tenant?.brand?.theme || 'light';
  const userRole = context.user?.role || 'guest';
  const userName = context.user?.name || 'User';

  // Check permissions
  const hasPermission = (action: string) => 
    context.permissions?.allowedActions?.includes(action) || false;

  // Conditional rendering based on role
  if (userRole === 'customer') {
    return <CustomerDashboard />;
  } else if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  // Apply branding
  return (
    <div style={{
      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: brandColor
    }}>
      <h1>Welcome, {userName}!</h1>
      {hasPermission('create') && <CreateButton />}
    </div>
  );
};
```

## OpenAI Integration

When OpenAI is enabled, context information is automatically passed to the LLM to generate smarter, more context-aware components:

1. **Set your OpenAI API key:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. **OpenAI will automatically:**
   - Generate components with tenant-specific styling
   - Add role-based conditional rendering
   - Include permission checks
   - Apply device-specific layouts
   - Integrate with available external services

## API Endpoints

### Set Embed Context
```
POST /api/chat/embed-context/:sessionId
Body: EmbedContext object
```

### Get Embed Context
```
GET /api/chat/embed-context/:sessionId
```

### Delete Embed Context
```
DELETE /api/chat/embed-context/:sessionId
```

### Generate Context-Aware Component
```
POST /api/component/generate
Body: {
  name: string,
  uiComponents: UIComponent[],
  embedContext: EmbedContext  // Optional
}
```

## Benefits

✅ **Reusability** - Same component code works for multiple tenants
✅ **Personalization** - Adapts to each user's role and preferences
✅ **Security** - Enforces permissions and policies automatically
✅ **Multi-tenancy** - Easy white-labeling and branding
✅ **A/B Testing** - Built-in support for feature flags
✅ **Responsive** - Automatically adapts to device and platform

## Best Practices

1. **Always provide default values** for context properties
2. **Validate permissions** before rendering sensitive components
3. **Cache context** to avoid repeated API calls
4. **Update context** when user state changes (login, navigation)
5. **Use TypeScript** for type safety with context objects
6. **Test components** with different context configurations

---

**Learn More:**
- [Type Definitions](/src/types/contexts.ts)
- [OpenAI Integration](/src/services/openai.ts)
- [Component Generator](/src/services/componentGenerator.ts)
