/**
 * MCP (Model Context Protocol) Type Definitions
 */

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface MCPResource {
  name: string;
  description: string;
  get: (params?: Record<string, any>) => Promise<any>;
}

export interface MCPContext {
  tools: MCPTool[];
  resources: MCPResource[];
}

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'error';
  payload: any;
  correlationId?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  execute: (input: any, context?: MCPContext) => Promise<any>;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  input: any | ((results: Record<string, any>) => any);
  dependsOn?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

