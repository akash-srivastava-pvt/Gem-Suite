/**
 * Agent Orchestrator - Coordinates agent workflows
 */

import { Workflow, WorkflowResult, WorkflowStep } from './types.js';
import { agentRegistry } from './agentRegistry.js';
import { messageBus } from './messageBus.js';
import { mcpServer } from '../mcp/mcpServer.js';

class AgentOrchestrator {
  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: Workflow, initialContext?: any): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results: Record<string, any> = {
      initial: initialContext || {}
    };
    const errors: Record<string, any> = {};
    const executedSteps = new Set<string>();

    // Get MCP context for the workflow
    const mcpContext = mcpServer.getContext(workflow.id.split('-')[0]);

    try {
      // Execute steps in dependency order
      const stepsToExecute = [...workflow.steps];
      
      while (stepsToExecute.length > 0) {
        const executableSteps = stepsToExecute.filter(step => {
          // Check if dependencies are met
          if (!step.dependsOn || step.dependsOn.length === 0) {
            return true;
          }
          return step.dependsOn.every(depId => executedSteps.has(depId));
        });

        if (executableSteps.length === 0) {
          throw new Error('Circular dependency or missing dependencies in workflow');
        }

        // Execute steps in parallel
        const stepPromises = executableSteps.map(step => 
          this.executeStep(step, results, mcpContext, workflow.onError)
        );

        const stepResults = await Promise.allSettled(stepPromises);

        stepResults.forEach((result, index) => {
          const step = executableSteps[index];
          if (result.status === 'fulfilled') {
            results[step.id] = result.value;
            executedSteps.add(step.id);
            stepsToExecute.splice(stepsToExecute.indexOf(step), 1);
          } else {
            // Serialize error properly for JSON response
            const error = result.reason;
            errors[step.id] = {
              message: error?.message || String(error),
              stack: error?.stack,
              name: error?.name || 'Error'
            };
            if (workflow.onError === 'stop') {
              throw result.reason;
            }
            // Mark as executed even if failed (for continue mode)
            executedSteps.add(step.id);
            stepsToExecute.splice(stepsToExecute.indexOf(step), 1);
          }
        });
      }

      const duration = Date.now() - startTime;
      return {
        workflowId: workflow.id,
        success: Object.keys(errors).length === 0,
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        workflowId: workflow.id,
        success: false,
        results,
        errors: { 
          ...errors, 
          workflow: {
            message: error?.message || String(error),
            stack: error?.stack,
            name: error?.name || 'Error'
          }
        },
        duration
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    previousResults: Record<string, any>,
    mcpContext: any,
    onError?: 'stop' | 'continue' | 'retry'
  ): Promise<any> {
    const agent = agentRegistry.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }

    // Resolve input (could be a function or static value)
    const input = typeof step.input === 'function' 
      ? step.input(previousResults)
      : this.resolveInput(step.input, previousResults);

    const timeout = step.timeout || 30000;

    try {
      // Execute with timeout
      const result = await Promise.race([
        agent.execute(input, mcpContext),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Step timeout: ${step.id}`)), timeout)
        )
      ]);

      return result;
    } catch (error: any) {
      if (onError === 'retry') {
        // Simple retry logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        return agent.execute(input, mcpContext);
      }
      throw error;
    }
  }

  /**
   * Resolve input references (e.g., "$stepId.field")
   */
  private resolveInput(input: any, results: Record<string, any>): any {
    if (typeof input === 'string' && input.startsWith('$')) {
      const path = input.substring(1).split('.');
      let value = results[path[0]];
      for (let i = 1; i < path.length && value !== undefined; i++) {
        value = value[path[i]];
      }
      return value;
    }
    
    if (typeof input === 'object' && input !== null) {
      const resolved: any = Array.isArray(input) ? [] : {};
      for (const key in input) {
        resolved[key] = this.resolveInput(input[key], results);
      }
      return resolved;
    }
    
    return input;
  }

  /**
   * Call a single agent directly
   */
  async callAgent(agentId: string, input: any, context?: any): Promise<any> {
    const agent = agentRegistry.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const mcpContext = context || mcpServer.getContext(agentId.split('-')[0]);
    return agent.execute(input, mcpContext);
  }
}

export const agentOrchestrator = new AgentOrchestrator();

