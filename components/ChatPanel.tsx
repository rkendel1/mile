"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatContext, ContextState, APISpec } from '@/types';
import '@/styles/ChatPanel.css';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface ChatPanelProps {
  sessionId: string;
  context: ChatContext;
  contextState: ContextState;
  onContextUpdate: (updates: Partial<ContextState>) => void;
  currentSpec: APISpec | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ sessionId, context, contextState, onContextUpdate, currentSpec }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getMessagesForSession, { sessionId }) || [];
  const sendMessage = useAction(api.chat.sendMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      const result = await sendMessage({
        message: messageToSend,
        sessionId,
        context: {
          activeTab: context.activeTab,
          specId: contextState.currentSpec as Id<"specs"> | undefined,
        },
      });

      if (result?.newGoalId) {
        onContextUpdate({ currentGoal: result.newGoalId });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
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