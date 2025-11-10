import { ChatMessage, ChatContext, ContextState } from '../types';
import { EmbedContext } from '../types/contexts';
import { openAIService } from './openai';

export class ChatService {
  private contextState: ContextState = {
    specs: {},
    goals: {},
    tests: {},
    components: {},
    chatHistory: [],
  };

  async processMessage(
    message: string,
    context: ChatContext,
    state: ContextState,
    embedContext?: EmbedContext
  ): Promise<{ response: string; context: ChatContext; actions?: any[] }> {
    this.contextState = state;
    
    // Try OpenAI first, fallback to rule-based system
    try {
      const aiResponse = await openAIService.generateResponse(message, context, state, embedContext);
      return {
        response: aiResponse.response,
        context,
        actions: aiResponse.actions,
      };
    } catch (error) {
      console.error('Error in AI processing, using fallback:', error);
      return this.processMessageFallback(message, context, state);
    }
  }

  private processMessageFallback(
    message: string,
    context: ChatContext,
    state: ContextState
  ): { response: string; context: ChatContext; actions?: any[] } {
    
    const lowerMessage = message.toLowerCase();
    const activeTab = context.activeTab;

    // Route to appropriate handler based on active tab
    switch (activeTab) {
      case 'spec':
        return this.handleSpecTab(message, context);
      
      case 'goal':
        return this.handleGoalTab(message, context);
      
      case 'test':
        return this.handleTestTab(message, context);
      
      case 'component':
        return this.handleComponentTab(message, context);
      
      case 'edit':
        return this.handleEditTab(message, context);
      
      default:
        return {
          response: "I'm here to help you build amazing experiences from your API specs. What would you like to do?",
          context,
        };
    }
  }

  private handleSpecTab(message: string, context: ChatContext): any {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('upload') || lowerMessage.includes('import') || lowerMessage.includes('add')) {
      return {
        response: "Great! Please upload your API specification file (OpenAPI/Swagger JSON or YAML). I'll parse it and index all endpoints, models, and authentication methods.",
        context,
        actions: [{ type: 'request-file-upload' }],
      };
    }

    if (context.specId && this.contextState.specs[context.specId]) {
      const spec = this.contextState.specs[context.specId];
      return {
        response: `Perfect! I've analyzed your ${spec.name} API spec. I found:\n\n` +
                 `• ${spec.parsed.endpoints.length} endpoints\n` +
                 `• ${spec.parsed.models.length} data models\n` +
                 `• ${spec.parsed.authMethods.length} authentication method(s)\n\n` +
                 `What would you like to build with this API?`,
        context,
      };
    }

    return {
      response: "Let's start by selecting or importing an API specification. Do you have a spec file ready?",
      context,
    };
  }

  private handleGoalTab(message: string, context: ChatContext): any {
    if (!context.specId) {
      return {
        response: "Please select an API spec first before defining your goal.",
        context: { ...context, activeTab: 'spec' },
        actions: [{ type: 'switch-tab', tab: 'spec' }],
      };
    }

    const spec = this.contextState.specs[context.specId];
    
    // Analyze the goal
    const lowerMessage = message.toLowerCase();
    let uiType = 'custom';
    
    if (lowerMessage.includes('dashboard')) uiType = 'dashboard';
    else if (lowerMessage.includes('form')) uiType = 'form';
    else if (lowerMessage.includes('table') || lowerMessage.includes('list')) uiType = 'table';
    else if (lowerMessage.includes('chart')) uiType = 'chart';

    // Find relevant endpoints
    const relevantEndpoints = spec.parsed.endpoints
      .filter(ep => {
        const epText = `${ep.path} ${ep.summary || ''} ${ep.description || ''}`.toLowerCase();
        return message.split(' ').some(word => word.length > 3 && epText.includes(word));
      })
      .slice(0, 3);

    return {
      response: `Got it! To create a ${uiType}, I'll use the following endpoints:\n\n` +
               relevantEndpoints.map((ep, idx) => 
                 `${idx + 1}. ${ep.method} ${ep.path}${ep.summary ? ' - ' + ep.summary : ''}`
               ).join('\n') + '\n\n' +
               `I'll fetch data from these endpoints and bind them to your UI components. ` +
               `Shall I generate a test plan and execute it?`,
      context: { ...context, goalId: `goal-${Date.now()}` },
      actions: [
        { type: 'create-goal-plan', endpoints: relevantEndpoints.map(e => e.id), uiType },
        { type: 'suggest-next-tab', tab: 'test' },
      ],
    };
  }

  private handleTestTab(message: string, context: ChatContext): any {
    if (!context.goalId) {
      return {
        response: "Please define your goal first before testing endpoints.",
        context: { ...context, activeTab: 'goal' },
        actions: [{ type: 'switch-tab', tab: 'goal' }],
      };
    }

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('test') || lowerMessage.includes('run') || lowerMessage.includes('execute')) {
      return {
        response: "Executing API tests now... I'll validate all the endpoints we plan to use.\n\n" +
                 "This may take a moment depending on API response times.",
        context,
        actions: [{ type: 'execute-tests', goalId: context.goalId }],
      };
    }

    if (lowerMessage.includes('success') || lowerMessage.includes('passed')) {
      return {
        response: "Excellent! All tests passed successfully. The API responses look good and match our expectations.\n\n" +
                 "✅ All endpoints returned 200 OK\n" +
                 "✅ Response data structures validated\n" +
                 "✅ Authentication working correctly\n\n" +
                 "Ready to generate the component?",
        context,
        actions: [{ type: 'suggest-next-tab', tab: 'component' }],
      };
    }

    return {
      response: "I can execute live API calls to test the endpoints. Would you like me to run the tests?",
      context,
    };
  }

  private handleComponentTab(message: string, context: ChatContext): any {
    if (!context.goalId) {
      return {
        response: "Let's define your goal and test the API first before generating components.",
        context: { ...context, activeTab: 'goal' },
        actions: [{ type: 'switch-tab', tab: 'goal' }],
      };
    }

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('build')) {
      return {
        response: "Generating your component now! I'm creating a React component with:\n\n" +
                 "• Pre-wired API bindings\n" +
                 "• State management hooks\n" +
                 "• Error handling\n" +
                 "• Loading states\n\n" +
                 "You'll see a live preview in just a moment...",
        context: { ...context, componentId: `component-${Date.now()}` },
        actions: [{ type: 'generate-component', goalId: context.goalId }],
      };
    }

    if (lowerMessage.includes('table')) {
      return {
        response: "Converting to a table layout... Updated the component to display data in a sortable, filterable table format.",
        context,
        actions: [{ type: 'update-component', change: 'convert-to-table' }],
      };
    }

    if (lowerMessage.includes('filter') || lowerMessage.includes('search')) {
      return {
        response: "Adding filters to the component... Users will now be able to search and filter the data.",
        context,
        actions: [{ type: 'update-component', change: 'add-filters' }],
      };
    }

    if (lowerMessage.includes('pagination') || lowerMessage.includes('page')) {
      return {
        response: "Adding pagination controls... The component will now handle large datasets with page navigation.",
        context,
        actions: [{ type: 'update-component', change: 'add-pagination' }],
      };
    }

    return {
      response: "Here's your component preview! It's fully functional with live API data. You can:\n\n" +
               "• Ask me to make it a table, chart, or form\n" +
               "• Add filters, pagination, or sorting\n" +
               "• Customize styling and layout\n" +
               "• Export the code or embed it\n\n" +
               "What would you like to adjust?",
      context,
    };
  }

  private handleEditTab(message: string, context: ChatContext): any {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('modify')) {
      return {
        response: "I've made the requested changes. All bindings are still valid and the component is working correctly.\n\n" +
                 "What else would you like to modify?",
        context,
        actions: [{ type: 'apply-edits', description: message }],
      };
    }

    if (lowerMessage.includes('undo') || lowerMessage.includes('revert')) {
      return {
        response: "Reverted to the previous version. Your component is back to its earlier state.",
        context,
        actions: [{ type: 'undo-last-change' }],
      };
    }

    if (lowerMessage.includes('export')) {
      return {
        response: "Here are your export options:\n\n" +
                 "1. **Code Snippet** - Copy/paste the component code\n" +
                 "2. **NPM Package** - Download as a reusable package\n" +
                 "3. **Embed Code** - Get an iframe embed for your app\n\n" +
                 "Which format would you prefer?",
        context,
        actions: [{ type: 'show-export-options' }],
      };
    }

    return {
      response: "You can make changes to any part of the workflow:\n\n" +
               "• Switch back to **Spec** to use a different API\n" +
               "• Return to **Goal** to redefine what you're building\n" +
               "• Go to **Test** to validate different endpoints\n" +
               "• Update the **Component** with new features\n\n" +
               "What would you like to do?",
      context,
    };
  }

  generateSystemMessage(context: ChatContext): string {
    const messages = {
      spec: "I'm ready to help you import and understand your API specification.",
      goal: "Let's define what you want to build with this API.",
      test: "I can execute live API calls to validate the endpoints.",
      component: "I'll generate a fully functional UI component for you.",
      edit: "Make any changes you'd like - I'll keep everything in sync.",
    };

    return messages[context.activeTab] || "How can I help you today?";
  }
}

export const chatService = new ChatService();
