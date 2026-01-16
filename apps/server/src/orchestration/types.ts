/**
 * Agent-to-Agent (A2A) Orchestration Types
 */

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'error' | 'notification';
  payload: any;
  correlationId: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  execute: (input: any, context?: any) => Promise<any>;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  input: any | ((results: Record<string, any>) => any);
  dependsOn?: string[];
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  onError?: 'stop' | 'continue' | 'retry';
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  results: Record<string, any>;
  errors?: Record<string, any>;
  duration: number;
}

