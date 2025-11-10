import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatContext, ContextState } from '../types';
import { apiService } from '../services/api';
import '../styles/ChatPanel.css';

interface ChatPanelProps {
  sessionId: string;
  context: ChatContext;
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ sessionId, context, contextState, onContextUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add system message when tab changes
    const systemMsg: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: getSystemMessage(context.activeTab),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMsg]);
  }, [context.activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSystemMessage = (tab: ChatContext['activeTab']): string => {
    const messages = {
      spec: "I'm ready to help you import and understand your API specification.",
      goal: "Let's define what you want to build with this API.",
      test: "I can execute live API calls to validate the endpoints.",
      component: "I'll generate a fully functional UI component for you.",
      edit: "Make any changes you'd like - I'll keep everything in sync.",
    };
    return messages[tab];
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      context,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiService.sendMessage(input, context, sessionId);
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        context: response.context,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle actions if any
      if (response.actions) {
        handleActions(response.actions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleActions = (actions: any[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'request-file-upload':
          // Trigger file upload in workspace panel
          break;
        case 'switch-tab':
          // Handle tab switching
          break;
        case 'create-goal-plan':
          // Create goal plan
          break;
        default:
          console.log('Unhandled action:', action);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>💬 Conversation</h2>
        <span className="chat-context">Active: {context.activeTab}</span>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : message.role === 'assistant' ? '🤖' : 'ℹ️'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything or describe what you want to build..."
          rows={3}
          disabled={loading}
        />
        <button 
          className="chat-send-button" 
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '📤'} Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
