/**
 * MCP Server - Manages tools and resources
 */

import { MCPTool, MCPResource, MCPContext } from './types.js';
import { GeocodingTool } from './tools/geocoding.tool.js';
import { ATSTool } from './tools/ats.tool.js';
import { StyleTool } from './tools/style.tool.js';
import { DesignTool } from './tools/design.tool.js';
import { allResources } from './resources/index.js';

class MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();

  constructor() {
    this.registerTools();
    this.registerResources();
  }

  private registerTools() {
    // Trip Planner tools
    this.tools.set('geocoding', GeocodingTool);
    
    // Resume Maker tools
    this.tools.set('ats_analyzer', ATSTool);
    
    // Text Editor tools
    this.tools.set('style_guide', StyleTool);
    
    // Invitation Maker tools
    this.tools.set('design_resources', DesignTool);
  }

  private registerResources() {
    allResources.forEach(resource => {
      this.resources.set(resource.name, resource);
    });
  }

  /**
   * Get context for a specific app
   */
  getContext(appName: string): MCPContext {
    const appTools: Record<string, MCPTool[]> = {
      'trip-planner': [GeocodingTool],
      'resume-maker': [ATSTool],
      'text-editor': [StyleTool],
      'invitation-maker': [DesignTool]
    };

    return {
      tools: appTools[appName] || [],
      resources: allResources
    };
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return tool.execute(params);
  }

  /**
   * Get a resource
   */
  async getResource(resourceName: string, params?: Record<string, any>): Promise<any> {
    const resource = this.resources.get(resourceName);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceName}`);
    }
    return resource.get(params);
  }

  /**
   * List all available tools
   */
  listTools(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description
    }));
  }

  /**
   * List all available resources
   */
  listResources(): Array<{ name: string; description: string }> {
    return Array.from(this.resources.values()).map(resource => ({
      name: resource.name,
      description: resource.description
    }));
  }
}

export const mcpServer = new MCPServer();

