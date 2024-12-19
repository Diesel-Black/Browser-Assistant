import { Tool, ToolDefinition, ToolResult } from '../types/tools';

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  public registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  public unregisterTool(name: string) {
    this.tools.delete(name);
  }

  public async executeTool(name: string, params: unknown): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found`
      };
    }

    try {
      if (!tool.validate(params)) {
        return {
          success: false,
          error: 'Invalid parameters'
        };
      }

      const result = await tool.execute(params);
      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}

// Core DOM manipulation tools
export const createDOMTools = () => {
  const tools: Tool[] = [
    {
      name: 'changeBackgroundColor',
      description: 'Changes the background color of a web page',
      parameters: {
        type: 'object',
        properties: {
          color: { type: 'string', description: 'A hex value or color name' }
        }
      },
      validate: (params: any) => typeof params?.color === 'string',
      execute: async (params: any) => {
        document.body.style.backgroundColor = params.color;
        return { color: params.color };
      }
    },
    {
      name: 'addText',
      description: 'Adds styled text to the web page',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to add' },
          position: { type: 'string', description: 'Position (top or bottom)' },
          style: { type: 'string', description: 'Style (normal, fancy, or code)' }
        }
      },
      validate: (params: any) => {
        return typeof params?.text === 'string' &&
               ['top', 'bottom'].includes(params?.position) &&
               ['normal', 'fancy', 'code'].includes(params?.style);
      },
      execute: async (params: any) => {
        const div = document.createElement('div');
        div.textContent = params.text;

        switch (params.style) {
          case 'fancy':
            div.style.fontFamily = 'cursive';
            div.style.fontSize = '24px';
            div.style.padding = '10px';
            div.style.margin = '10px';
            div.style.borderRadius = '10px';
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            break;
          case 'code':
            div.style.fontFamily = 'monospace';
            div.style.backgroundColor = '#1e1e1e';
            div.style.color = '#fff';
            div.style.padding = '15px';
            div.style.borderRadius = '5px';
            div.style.margin = '10px';
            break;
        }

        if (params.position === 'top') {
          document.body.prepend(div);
        } else {
          document.body.appendChild(div);
        }

        return { text: params.text };
      }
    },
    {
      name: 'clearPage',
      description: 'Clears the web page content',
      parameters: { type: 'object', properties: {} },
      validate: () => true,
      execute: async () => {
        const content = document.querySelector('.content');
        if (content) {
          content.innerHTML = '';
        }
        return { success: true };
      }
    }
  ];

  return tools;
}; 