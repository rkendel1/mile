import { Router, Request, Response } from 'express';
import { specParserService } from '../services/specParser';
import { APISpec } from '../types';

export const apiSpecRouter = Router();

// In-memory storage (would use a database in production)
const specs: { [id: string]: APISpec } = {};

// Parse and store API spec
apiSpecRouter.post('/parse', async (req: Request, res: Response) => {
  try {
    const { content, name, version, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({ error: 'Missing required fields: content, type' });
    }

    const parsed = await specParserService.parseSpec(content, type);
    
    const spec: APISpec = {
      id: `spec-${Date.now()}`,
      name: name || 'Unnamed API',
      version: version || '1.0.0',
      type,
      content,
      parsed,
      createdAt: new Date().toISOString(),
    };

    specs[spec.id] = spec;

    res.json({
      success: true,
      spec: {
        id: spec.id,
        name: spec.name,
        version: spec.version,
        type: spec.type,
        endpoints: spec.parsed.endpoints.length,
        models: spec.parsed.models.length,
        authMethods: spec.parsed.authMethods.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get spec by ID
apiSpecRouter.get('/:id', (req: Request, res: Response) => {
  const spec = specs[req.params.id];
  
  if (!spec) {
    return res.status(404).json({ error: 'Spec not found' });
  }

  res.json({ spec });
});

// List all specs
apiSpecRouter.get('/', (req: Request, res: Response) => {
  const specList = Object.values(specs).map(spec => ({
    id: spec.id,
    name: spec.name,
    version: spec.version,
    type: spec.type,
    createdAt: spec.createdAt,
    endpointCount: spec.parsed.endpoints.length,
  }));

  res.json({ specs: specList });
});

// Generate API client code
apiSpecRouter.get('/:id/client', (req: Request, res: Response) => {
  const spec = specs[req.params.id];
  
  if (!spec) {
    return res.status(404).json({ error: 'Spec not found' });
  }

  const clientCode = specParserService.generateApiClient(spec);
  
  res.json({ code: clientCode });
});

// Delete spec
apiSpecRouter.delete('/:id', (req: Request, res: Response) => {
  if (!specs[req.params.id]) {
    return res.status(404).json({ error: 'Spec not found' });
  }

  delete specs[req.params.id];
  res.json({ success: true });
});
