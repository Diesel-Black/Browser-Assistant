export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
  };
  validate: (params: unknown) => boolean;
  execute: (params: unknown) => Promise<any>;
}

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
  };
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface ToolExecutionContext {
  tabId?: number;
  frameId?: number;
  toolManager: ToolManager;
}

export interface ToolManager {
  registerTool(tool: Tool): void;
  unregisterTool(name: string): void;
  executeTool(name: string, params: unknown): Promise<ToolResult>;
  getToolDefinitions(): ToolDefinition[];
} 