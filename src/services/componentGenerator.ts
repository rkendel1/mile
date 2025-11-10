import { Component, UIComponent, DataBinding, FunctionBinding } from '../types';

export class ComponentGeneratorService {
  generateReactComponent(
    name: string,
    uiComponents: UIComponent[],
    bindings: DataBinding[],
    functions: FunctionBinding[]
  ): string {
    const componentName = this.toPascalCase(name);
    
    let code = `import React, { useState, useEffect } from 'react';\n\n`;
    
    // Generate component
    code += `export const ${componentName} = ({ apiClient }) => {\n`;
    code += `  // State management\n`;
    code += `  const [data, setData] = useState({});\n`;
    code += `  const [loading, setLoading] = useState(false);\n`;
    code += `  const [error, setError] = useState(null);\n\n`;

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

    // Generate JSX
    code += `  if (loading) return <div>Loading...</div>;\n`;
    code += `  if (error) return <div>Error: {error}</div>;\n\n`;
    code += `  return (\n`;
    code += this.generateJSX(uiComponents, 2);
    code += `  );\n`;
    code += `};\n\n`;
    code += `export default ${componentName};\n`;

    return code;
  }

  private generateJSX(components: UIComponent[], indentLevel: number): string {
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
        jsx += this.generateJSX(component.children, indentLevel + 1);
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
