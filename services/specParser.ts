import SwaggerParser from 'swagger-parser';
import { ParsedSpec, Endpoint, Model, AuthMethod, Parameter, RequestBody, Response, Schema } from '@/types';

export class SpecParserService {
  async parse(content: any): Promise<ParsedSpec> {
    try {
      // Dereference and validate the spec to resolve all $refs
      const api = await SwaggerParser.validate(content, {
        dereference: { circular: 'ignore' }
      });

      const endpoints: Endpoint[] = this.parseEndpoints(api.paths);
      const models: Model[] = this.parseModels(api.components?.schemas);
      const authMethods: AuthMethod[] = this.parseAuthMethods(api.components?.securitySchemes);
      const baseUrl = api.servers?.[0]?.url || '';

      return { endpoints, models, authMethods, baseUrl };
    } catch (error: any) {
      console.error('Failed to parse OpenAPI spec:', error);
      throw new Error(`Spec parsing failed: ${error.message}`);
    }
  }

  private parseEndpoints(paths: any): Endpoint[] {
    const endpoints: Endpoint[] = [];
    if (!paths) return endpoints;

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem as object)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          endpoints.push({
            id: operation.operationId || `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, '-'),
            path,
            method: method.toUpperCase(),
            summary: operation.summary,
            description: operation.description,
            parameters: this.parseParameters(operation.parameters),
            requestBody: this.parseRequestBody(operation.requestBody),
            responses: this.parseResponses(operation.responses),
            tags: operation.tags,
          });
        }
      }
    }
    return endpoints;
  }

  private parseModels(schemas: any): Model[] {
    if (!schemas) return [];
    return Object.entries(schemas).map(([name, schema]: [string, any]) => ({
      name,
      description: schema.description,
      properties: this.parseProperties(schema.properties),
      required: schema.required || [],
    }));
  }

  private parseAuthMethods(securitySchemes: any): AuthMethod[] {
    if (!securitySchemes) return [];
    return Object.entries(securitySchemes).map(([name, scheme]: [string, any]) => ({
      type: this.mapAuthType(scheme.type, scheme.scheme),
      name: scheme.name || name,
      in: scheme.in,
    }));
  }

  private parseParameters(params: any[] = []): Parameter[] {
    return params.map(p => ({
      name: p.name,
      in: p.in,
      description: p.description,
      required: p.required || false,
      schema: this.parseSchema(p.schema),
    }));
  }

  private parseRequestBody(body: any): RequestBody | undefined {
    if (!body) return undefined;
    const content = this.parseContent(body.content);
    return content ? {
      description: body.description,
      required: body.required || false,
      content,
    } : undefined;
  }

  private parseResponses(responses: any): Response[] {
    if (!responses) return [];
    return Object.entries(responses).map(([statusCode, response]: [string, any]) => ({
      statusCode,
      description: response.description || '',
      content: this.parseContent(response.content),
    }));
  }

  private parseContent(content: any): { [mediaType: string]: { schema: Schema } } | undefined {
    if (!content) return undefined;
    const parsedContent: { [mediaType: string]: { schema: Schema } } = {};
    const jsonMediaType = Object.keys(content).find(mt => mt.includes('json'));
    
    if (jsonMediaType && content[jsonMediaType].schema) {
      parsedContent[jsonMediaType] = {
        schema: this.parseSchema(content[jsonMediaType].schema),
      };
      return parsedContent;
    }
    return undefined;
  }

  private parseSchema(schema: any): Schema {
    if (!schema) return { type: 'any' };
    const { type, properties, items, required, description, format, enum: enumValues } = schema;
    const parsed: Schema = {
      type: type || 'object',
      description,
      format,
      required,
      enum: enumValues,
    };
    if (properties) {
      parsed.properties = this.parseProperties(properties);
    }
    if (items) {
      parsed.items = this.parseSchema(items);
    }
    return parsed;
  }

  private parseProperties(properties: any): { [key: string]: Schema } {
    if (!properties) return {};
    const parsedProps: { [key: string]: Schema } = {};
    for (const [propName, propSchema] of Object.entries(properties)) {
      parsedProps[propName] = this.parseSchema(propSchema);
    }
    return parsedProps;
  }

  private mapAuthType(type: string, scheme?: string): AuthMethod['type'] {
    if (type === 'http') {
      return scheme === 'bearer' ? 'bearer' : 'basic';
    }
    return type as AuthMethod['type'];
  }
}

export const specParserService = new SpecParserService();