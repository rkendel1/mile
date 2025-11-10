import { Component, UIComponent, DataBinding, FunctionBinding } from '../types';
import { EmbedContext } from '../types/contexts';
import { openAIService } from './openai';

export class ComponentGeneratorService {
  async generateReactComponent(
    name: string,
    uiComponents: UIComponent[],
    bindings: DataBinding[],
    functions: FunctionBinding[],
    embedContext?: EmbedContext
  ): Promise<string> {
    // Try OpenAI generation if context is provided
    if (embedContext) {
      try {
        const goal = `Generate a UI component with ${uiComponents.length} sub-components`;
        const endpoints = functions.map(f => f.endpoint);
        const aiCode = await openAIService.generateContextAwareComponent(name, goal, endpoints, embedContext);
        if (aiCode && aiCode.length > 100) {
          return aiCode;
        }
      } catch (error) {
        console.log('Falling back to template generation');
      }
    }

    // Fallback to template generation
    return this.generateReactComponentTemplate(name, uiComponents, bindings, functions, embedContext);
  }

  private generateReactComponentTemplate(
    name: string,
    uiComponents: UIComponent[],
    bindings: DataBinding[],
    functions: FunctionBinding[],
    embedContext?: EmbedContext
  ): string {
    const componentName = this.toPascalCase(name);
    
    let code = `import React, { useState, useEffect } from 'react';\n`;
    code += `import { EmbedContext } from './types/contexts';\n\n`;
    
    // Generate component with context prop
    code += `interface ${componentName}Props {\n`;
    code += `  apiClient: any;\n`;
    code += `  context: EmbedContext;\n`;
    code += `}\n\n`;
    code += `export const ${componentName}: React.FC<${componentName}Props> = ({ apiClient, context }) => {\n`;
    code += `  // State management\n`;
    code += `  const [data, setData] = useState({});\n`;
    code += `  const [loading, setLoading] = useState(false);\n`;
    code += `  const [error, setError] = useState(null);\n\n`;

    // Add context-aware variables
    if (embedContext) {
      code += `  // Extract context values\n`;
      if (embedContext.tenant) {
        code += `  const brandColor = context.tenant?.brand?.primaryColor || '#3b82f6';\n`;
        code += `  const theme = context.tenant?.brand?.theme || 'light';\n`;
      }
      if (embedContext.user) {
        code += `  const userRole = context.user?.role || 'guest';\n`;
        code += `  const userName = context.user?.name || 'User';\n`;
      }
      if (embedContext.permissions) {
        code += `  const hasPermission = (action: string) => context.permissions?.allowedActions?.includes(action) || false;\n`;
      }
      code += `\n`;
    }

    // Generate API fetch functions
    code += `  // API functions\n`;
    functions.forEach((fn) => {
      code += `  const ${fn.name} = async () => {\n`;
      code += `    setLoading(true);\n`;
      code += `    try {\n`;
      code += `      const response = await apiClient.${fn.endpoint}();\n`;
      code += `      setData(prev => ({ ...prev, ${fn.endpoint}: response }));\n`;
      if (fn.onSuccess) {
        code += `      ${fn.onSuccess}(response);\n`;
      }
      code += `    } catch (err) {\n`;
      code += `      setError(err.message);\n`;
      if (fn.onError) {
        code += `      ${fn.onError}(err);\n`;
      }
      code += `    } finally {\n`;
      code += `      setLoading(false);\n`;
      code += `    }\n`;
      code += `  };\n\n`;
    });

    // useEffect for initial data fetch
    code += `  // Load data on mount\n`;
    code += `  useEffect(() => {\n`;
    if (functions.length > 0) {
      code += `    ${functions[0].name}();\n`;
    }
    code += `  }, []);\n\n`;

    // Conditional rendering based on context
    if (embedContext?.permissions) {
      code += `  // Check permissions before rendering\n`;
      code += `  if (!hasPermission('view')) {\n`;
      code += `    return <div>You don't have permission to view this component.</div>;\n`;
      code += `  }\n\n`;
    }

    // Generate JSX with context-aware styling
    code += `  if (loading) return <div>Loading...</div>;\n`;
    code += `  if (error) return <div>Error: {error}</div>;\n\n`;
    code += `  return (\n`;
    code += `    <div style={{\n`;
    if (embedContext?.tenant) {
      code += `      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',\n`;
      code += `      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',\n`;
      code += `      padding: '20px',\n`;
      code += `      borderRadius: '8px'\n`;
    } else {
      code += `      padding: '20px'\n`;
    }
    code += `    }}>\n`;
    
    if (embedContext?.user) {
      code += `      <div style={{ marginBottom: '20px' }}>\n`;
      code += `        <h3 style={{ color: brandColor }}>Welcome, {userName}!</h3>\n`;
      code += `        <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Role: {userRole}</span>\n`;
      code += `      </div>\n`;
    }
    
    code += this.generateJSX(uiComponents, 3, embedContext);
    code += `    </div>\n`;
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;

    return code;
  }

  private generateJSX(components: UIComponent[], indentLevel: number, embedContext?: EmbedContext): string {
    if (components.length === 0) {
      return `${' '.repeat(indentLevel * 2)}<div>No components</div>\n`;
    }

    let jsx = '';
    const indent = ' '.repeat(indentLevel * 2);

    components.forEach((component) => {
      jsx += `${indent}<${component.type}`;
      
      // Add props
      Object.entries(component.props).forEach(([key, value]) => {
        if (typeof value === 'string') {
          jsx += ` ${key}="${value}"`;
        } else {
          jsx += ` ${key}={${JSON.stringify(value)}}`;
        }
      });

      if (component.children && component.children.length > 0) {
        jsx += `>\n`;
        jsx += this.generateJSX(component.children, indentLevel + 1, embedContext);
        jsx += `${indent}</${component.type}>\n`;
      } else {
        jsx += ` />\n`;
      }
    });

    return jsx;
  }

  generateComponentPreview(component: Component): string {
    // Generate a simplified HTML preview
    let preview = `<!DOCTYPE html>\n`;
    preview += `<html lang="en">\n`;
    preview += `<head>\n`;
    preview += `  <meta charset="UTF-8">\n`;
    preview += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    preview += `  <title>${component.name} - Preview</title>\n`;
    preview += `  <style>\n`;
    preview += `    body { font-family: Arial, sans-serif; padding: 20px; }\n`;
    preview += `    .container { max-width: 1200px; margin: 0 auto; }\n`;
    preview += `  </style>\n`;
    preview += `</head>\n`;
    preview += `<body>\n`;
    preview += `  <div class="container">\n`;
    preview += `    <h1>${component.name}</h1>\n`;
    preview += `    <div id="root">Component Preview</div>\n`;
    preview += `  </div>\n`;
    preview += `</body>\n`;
    preview += `</html>\n`;

    return preview;
  }

  exportComponent(component: Component, format: 'code' | 'package' | 'embed'): string {
    switch (format) {
      case 'code':
        return component.code;
      
      case 'package':
        return JSON.stringify({
          name: component.name,
          code: component.code,
          bindings: component.bindings,
          functions: component.functions,
          framework: component.framework,
        }, null, 2);
      
      case 'embed':
        return `<iframe src="/embed/${component.id}" width="100%" height="600px" />`;
      
      default:
        return component.code;
    }
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

export const componentGeneratorService = new ComponentGeneratorService();
