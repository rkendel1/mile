import { Router, Request, Response } from 'express';
import { componentGeneratorService } from '../services/componentGenerator';
import { Component } from '../types';

export const componentRouter = Router();

// In-memory storage (would use a database in production)
const components: { [id: string]: Component } = {};

// Generate component
componentRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { name, uiComponents, bindings, functions, framework } = req.body;

    if (!name || !uiComponents) {
      return res.status(400).json({ error: 'Missing required fields: name, uiComponents' });
    }

    const code = componentGeneratorService.generateReactComponent(
      name,
      uiComponents,
      bindings || [],
      functions || []
    );

    const component: Component = {
      id: `component-${Date.now()}`,
      name,
      code,
      framework: framework || 'react',
      bindings: bindings || [],
      functions: functions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    component.preview = componentGeneratorService.generateComponentPreview(component);
    components[component.id] = component;

    res.json({
      success: true,
      component: {
        id: component.id,
        name: component.name,
        framework: component.framework,
        code: component.code,
        preview: component.preview,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get component by ID
componentRouter.get('/:id', (req: Request, res: Response) => {
  const component = components[req.params.id];
  
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  res.json({ component });
});

// Update component
componentRouter.put('/:id', (req: Request, res: Response) => {
  const component = components[req.params.id];
  
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  const { code, bindings, functions } = req.body;

  // Safely update properties to prevent prototype pollution
  if (code !== undefined && typeof code === 'string') {
    component.code = code;
  }
  if (bindings !== undefined && Array.isArray(bindings)) {
    component.bindings = bindings;
  }
  if (functions !== undefined && Array.isArray(functions)) {
    component.functions = functions;
  }
  component.updatedAt = new Date().toISOString();

  res.json({ success: true, component });
});

// Export component
componentRouter.get('/:id/export', (req: Request, res: Response) => {
  const component = components[req.params.id];
  
  if (!component) {
    return res.status(404).json({ error: 'Component not found' });
  }

  const format = (req.query.format as string) || 'code';
  const exported = componentGeneratorService.exportComponent(component, format as any);

  res.json({ exported, format });
});

// List all components
componentRouter.get('/', (req: Request, res: Response) => {
  const componentList = Object.values(components).map(comp => ({
    id: comp.id,
    name: comp.name,
    framework: comp.framework,
    createdAt: comp.createdAt,
    updatedAt: comp.updatedAt,
  }));

  res.json({ components: componentList });
});

// Delete component
componentRouter.delete('/:id', (req: Request, res: Response) => {
  if (!components[req.params.id]) {
    return res.status(404).json({ error: 'Component not found' });
  }

  delete components[req.params.id];
  res.json({ success: true });
});
