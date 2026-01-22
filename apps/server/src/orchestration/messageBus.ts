/**
 * Message Bus for Agent-to-Agent Communication
 */

import { AgentMessage } from './types.js';
import { EventEmitter } from 'events';

class MessageBus extends EventEmitter {
  private messages: AgentMessage[] = [];
  private subscriptions: Map<string, Set<string>> = new Map(); // agentId -> Set of subscribed topics

  /**
   * Subscribe an agent to a topic
   */
  subscribe(agentId: string, topic: string): void {
    if (!this.subscriptions.has(agentId)) {
      this.subscriptions.set(agentId, new Set());
    }
    this.subscriptions.get(agentId)!.add(topic);
  }

  /**
   * Publish a message
   */
  publish(message: AgentMessage): void {
    message.timestamp = Date.now();
    this.messages.push(message);
    
    // Emit to subscribers
    this.emit(`message:${message.to}`, message);
    this.emit('message', message);
  }

  /**
   * Send a request and wait for response
   */
  async request(from: string, to: string, payload: any, timeout: number = 30000): Promise<any> {
    const correlationId = `${from}-${to}-${Date.now()}-${Math.random()}`;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeListener(`response:${correlationId}`, handler);
        reject(new Error(`Request timeout: ${from} -> ${to}`));
      }, timeout);

      const handler = (response: AgentMessage) => {
        if (response.correlationId === correlationId) {
          clearTimeout(timer);
          this.removeListener(`response:${correlationId}`, handler);
          
          if (response.type === 'error') {
            reject(new Error(response.payload.message || 'Agent error'));
          } else {
            resolve(response.payload);
          }
        }
      };

      this.on(`response:${correlationId}`, handler);

      // Send request
      this.publish({
        from,
        to,
        type: 'request',
        payload,
        correlationId,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Send a response
   */
  respond(correlationId: string, from: string, to: string, payload: any, error?: Error): void {
    this.publish({
      from,
      to,
      type: error ? 'error' : 'response',
      payload: error ? { message: error.message, stack: error.stack } : payload,
      correlationId,
      timestamp: Date.now()
    });

    // Also emit to correlation ID for request handlers
    this.emit(`response:${correlationId}`, {
      from,
      to,
      type: error ? 'error' : 'response',
      payload: error ? { message: error.message } : payload,
      correlationId,
      timestamp: Date.now()
    });
  }

  /**
   * Get message history
   */
  getHistory(limit: number = 100): AgentMessage[] {
    return this.messages.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.messages = [];
  }
}

export const messageBus = new MessageBus();

