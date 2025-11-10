const SwaggerParser = require('swagger-parser');
import { APISpec, ParsedSpec, Endpoint, Model, AuthMethod, Parameter, RequestBody, Response } from '../types';

export class SpecParserService {
  async parseSpec(content: any, type: 'openapi' | 'swagger' | 'graphql'): Promise<ParsedSpec> {
    switch (type) {
      case 'openapi':
      case 'swagger':
        return this.parseOpenAPI(content);
      case 'graphql':
        return this.parseGraphQL(content);
      default:
        throw new Error(`Unsupported spec type: ${type}`);
    }
  }

  private async parseOpenAPI(content: any): Promise<ParsedSpec> {
    try {
      const parser = new SwaggerParser();
      const api: any = await parser.validate(content);
      
      const endpoints: Endpoint[] = [];
      const models: Model[] = [];
      const authMethods: AuthMethod[] = [];

      // Parse endpoints
      if (api.paths) {
        Object.entries(api.paths).forEach(([path, pathItem]: [string, any]) => {
          ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
            if (pathItem[method]) {
              const operation = pathItem[method];
              endpoints.push({
                id: `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, '-'),
                path,
                method: method.toUpperCase(),
                summary: operation.summary,
                description: operation.description,
                parameters: this.parseParameters(operation.parameters, pathItem.parameters),
                requestBody: this.parseRequestBody(operation.requestBody),
                responses: this.parseResponses(operation.responses),
                tags: operation.tags,
              });
            }
          });
        });
      }

      // Parse models/schemas
      if (api.components?.schemas) {
        Object.entries(api.components.schemas).forEach(([name, schema]: [string, any]) => {
          models.push({
            name,
            properties: schema.properties || {},
            required: schema.required,
          });
        });
      }

      // Parse auth methods
      if (api.components?.securitySchemes) {
        Object.entries(api.components.securitySchemes).forEach(([name, scheme]: [string, any]) => {
          authMethods.push({
            type: this.mapAuthType(scheme.type),
            name: scheme.name || name,
            in: scheme.in,
          });
        });
      }

      const baseUrl = api.servers?.[0]?.url || '';

      return {
        endpoints,
        models,
        authMethods,
        baseUrl,
      };
    } catch (error) {
      throw new Error(`Failed to parse OpenAPI spec: ${error}`);
    }
  }

  private parseParameters(operationParams?: any[], pathParams?: any[]): Parameter[] {
    const allParams = [...(pathParams || []), ...(operationParams || [])];
    return allParams.map((param) => ({
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.required || false,
      schema: param.schema || {},
    }));
  }

  private parseRequestBody(requestBody?: any): RequestBody | undefined {
    if (!requestBody) return undefined;
    
    return {
      description: requestBody.description,
      required: requestBody.required || false,
      content: requestBody.content || {},
    };
  }

  private parseResponses(responses: any): Response[] {
    return Object.entries(responses || {}).map(([statusCode, response]: [string, any]) => ({
      statusCode,
      description: response.description || '',
      content: response.content,
    }));
  }

  private parseGraphQL(content: any): ParsedSpec {
    // Simplified GraphQL parsing - would need graphql-js for full implementation
    return {
      endpoints: [],
      models: [],
      authMethods: [],
      baseUrl: content.url || '',
    };
  }

  private mapAuthType(type: string): AuthMethod['type'] {
    const mapping: { [key: string]: AuthMethod['type'] } = {
      apiKey: 'apiKey',
      http: 'bearer',
      oauth2: 'oauth2',
      basic: 'basic',
    };
    return mapping[type] || 'apiKey';
  }

  generateApiClient(spec: APISpec): string {
    // Generate a basic API client template
    const endpoints = spec.parsed.endpoints;
    
    let clientCode = `// Auto-generated API Client for ${spec.name}\n\n`;
    clientCode += `const BASE_URL = '${spec.parsed.baseUrl || 'https://api.example.com'}';\n\n`;
    clientCode += `class ${this.toPascalCase(spec.name)}Client {\n`;
    clientCode += `  constructor(apiKey) {\n`;
    clientCode += `    this.apiKey = apiKey;\n`;
    clientCode += `  }\n\n`;

    endpoints.slice(0, 10).forEach((endpoint) => {
      const methodName = this.generateMethodName(endpoint);
      const params = this.generateMethodParams(endpoint);
      
      clientCode += `  async ${methodName}(${params}) {\n`;
      clientCode += `    const url = \`\${BASE_URL}${endpoint.path}\`;\n`;
      clientCode += `    const response = await fetch(url, {\n`;
      clientCode += `      method: '${endpoint.method}',\n`;
      clientCode += `      headers: {\n`;
      clientCode += `        'Authorization': \`Bearer \${this.apiKey}\`,\n`;
      clientCode += `        'Content-Type': 'application/json'\n`;
      clientCode += `      },\n`;
      if (endpoint.requestBody) {
        clientCode += `      body: JSON.stringify(data)\n`;
      }
      clientCode += `    });\n`;
      clientCode += `    return await response.json();\n`;
      clientCode += `  }\n\n`;
    });

    clientCode += `}\n\n`;
    clientCode += `export default ${this.toPascalCase(spec.name)}Client;\n`;

    return clientCode;
  }

  private generateMethodName(endpoint: Endpoint): string {
    const parts = endpoint.path.split('/').filter(p => p && !p.startsWith('{'));
    const name = parts.join('_');
    return `${endpoint.method.toLowerCase()}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private generateMethodParams(endpoint: Endpoint): string {
    const params: string[] = [];
    
    endpoint.parameters.forEach((param) => {
      if (param.in === 'path' || param.required) {
        params.push(param.name);
      }
    });

    if (endpoint.requestBody) {
      params.push('data');
    }

    return params.join(', ');
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

export const specParserService = new SpecParserService();
