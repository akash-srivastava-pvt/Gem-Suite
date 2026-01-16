/**
 * Agent Registry - Manages agent registration and discovery
 */

import { Agent } from './types.js';

class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent already registered: ${agent.id}`);
    }
    this.agents.set(agent.id, agent);
  }

  /**
   * Get an agent by ID
   */
  get(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Check if agent exists
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * List all agents
   */
  list(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * List agents by category/prefix
   */
  listByPrefix(prefix: string): Agent[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.id.startsWith(prefix)
    );
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }
}

export const agentRegistry = new AgentRegistry();

