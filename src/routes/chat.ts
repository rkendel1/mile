import { Router, Request, Response } from 'express';
import { chatService } from '../services/chat';
import { ChatMessage, ChatContext, ContextState } from '../types';

export const chatRouter = Router();

// In-memory storage (would use a database in production)
const contextStates: { [sessionId: string]: ContextState } = {};

// Process chat message
chatRouter.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, context, sessionId } = req.body;

    if (!message || !context || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: message, context, sessionId' });
    }

    // Get or create context state
    if (!contextStates[sessionId]) {
      contextStates[sessionId] = {
        specs: {},
        goals: {},
        tests: {},
        components: {},
        chatHistory: [],
      };
    }

    const state = contextStates[sessionId];

    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      context,
    };
    state.chatHistory.push(userMessage);

    // Process message
    const result = await chatService.processMessage(message, context, state);

    // Add assistant response to history
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: result.response,
      timestamp: new Date().toISOString(),
      context: result.context,
    };
    state.chatHistory.push(assistantMessage);

    res.json({
      success: true,
      response: result.response,
      context: result.context,
      actions: result.actions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
chatRouter.get('/history/:sessionId', (req: Request, res: Response) => {
  const state = contextStates[req.params.sessionId];
  
  if (!state) {
    return res.json({ history: [] });
  }

  res.json({ history: state.chatHistory });
});

// Clear chat history
chatRouter.delete('/history/:sessionId', (req: Request, res: Response) => {
  if (contextStates[req.params.sessionId]) {
    contextStates[req.params.sessionId].chatHistory = [];
  }
  
  res.json({ success: true });
});

// Get system message for current context
chatRouter.post('/system-message', (req: Request, res: Response) => {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: 'Missing required field: context' });
  }

  const systemMessage = chatService.generateSystemMessage(context);
  
  res.json({ message: systemMessage });
});

// Update context state
chatRouter.post('/context/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const updates = req.body;

  if (!contextStates[sessionId]) {
    contextStates[sessionId] = {
      specs: {},
      goals: {},
      tests: {},
      components: {},
      chatHistory: [],
    };
  }

  // Merge updates into context state
  contextStates[sessionId] = {
    ...contextStates[sessionId],
    ...updates,
  };

  res.json({ success: true, state: contextStates[sessionId] });
});
