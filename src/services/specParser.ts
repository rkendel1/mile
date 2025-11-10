const SwaggerParser = require('swagger-parser');
import { APISpec, ParsedSpec, Endpoint, Model, AuthMethod, Parameter, RequestBody, Response, Schema } from '../types';

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
      // The `bundle` method resolves all external and internal $refs
      const api: any = await parser.bundle(content);
      
      const endpoints: Endpoint[] = [];
      const models: Model[] = [];
      const authMethods: AuthMethod[] = [];

      // Parse endpoints
      if (api.paths) {
        Object.entries(api.paths).forEach(([path, pathItem]: [string, any]) => {
          Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
            if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
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

      // Parse models/schemas from components
      if (api.components?.schemas) {
        models.push(...this.parseModels(api.components.schemas));
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
    } catch (error: any) {
      throw new Error(`Failed to parse OpenAPI spec: ${error.message}`);
    }
  }

  private parseSchema(schemaObj: any): Schema {
    if (!schemaObj) return { type: 'any' };

    const { type, properties, items, required, description, format, enum: enumValues } = schemaObj;

    const parsedSchema: Schema = {
      type: type || 'object', // Default to object if type is missing
      description,
      format,
      enum: enumValues,
    };

    if (type === 'object' && properties) {
      parsedSchema.properties = {};
      Object.entries(properties).forEach(([propName, propSchema]: [string, any]) => {
        parsedSchema.properties![propName] = this.parseSchema(propSchema);
      });
      parsedSchema.required = required;
    }

    if (type === 'array' && items) {
      parsedSchema.items = this.parseSchema(items);
    }

    return parsedSchema;
  }

  private parseParameters(operationParams?: any[], pathParams?: any[]): Parameter[] {
    const combinedParams = [...(pathParams || []), ...(operationParams || [])];
    const uniqueParams = combinedParams.filter(
      (param, index, self) => index === self.findIndex(p => p.name === param.name && p.in === param.in)
    );
    if (!uniqueParams) return [];
    return uniqueParams.map((param) => ({
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.required || false,
      schema: this.parseSchema(param.schema),
    }));
  }

  private parseRequestBody(requestBody?: any): RequestBody | undefined {
    if (!requestBody) return undefined;
    
    const content: RequestBody['content'] = {};
    if (requestBody.content) {
      Object.entries(requestBody.content).forEach(([mediaType, mediaTypeObj]: [string, any]) => {
        if (mediaTypeObj.schema) {
          content[mediaType] = {
            schema: this.parseSchema(mediaTypeObj.schema),
          };
        }
      });
    }

    return {
      description: requestBody.description,
      required: requestBody.required || false,
      content,
    };
  }

  private parseResponses(responses?: any): Response[] {
    if (!responses) return [];
    return Object.entries(responses).map(([statusCode, response]: [string, any]) => {
      const content: Response['content'] = {};
      if (response.content) {
        Object.entries(response.content).forEach(([mediaType, mediaTypeObj]: [string, any]) => {
          if (mediaTypeObj.schema) {
            content[mediaType] = {
              schema: this.parseSchema(mediaTypeObj.schema),
            };
          }
        });
      }
      return {
        statusCode,
        description: response.description || '',
        content,
      };
    });
  }

  private parseModels(schemas?: any): Model[] {
    if (!schemas) return [];
    return Object.entries(schemas).map(([name, schema]: [string, any]) => {
      const properties: { [key: string]: Schema } = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
          properties[propName] = this.parseSchema(propSchema);
        });
      }
      return {
        name,
        description: schema.description,
        properties,
        required: schema.required,
      };
    });
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