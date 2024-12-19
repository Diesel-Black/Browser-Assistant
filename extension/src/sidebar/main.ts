import { WebRTCManager } from '../core/webrtc';
import { ToolManager, createDOMTools } from '../core/tools';

export class Sidebar {
    private webrtc: WebRTCManager;
    private tools: ToolManager;
    private voiceButton: HTMLButtonElement;
    private statusElement: HTMLSpanElement;
    private messagesContainer: HTMLDivElement;
    private isListening: boolean = false;

    constructor() {
        this.webrtc = new WebRTCManager();
        this.tools = new ToolManager();
        
        // Initialize DOM elements
        this.voiceButton = document.getElementById('voiceButton') as HTMLButtonElement;
        this.statusElement = document.getElementById('connectionStatus') as HTMLSpanElement;
        this.messagesContainer = document.getElementById('messages') as HTMLDivElement;
        
        // Register tools
        createDOMTools().forEach(tool => this.tools.registerTool(tool));
        
        // Setup event listeners
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Voice button click handler
        this.voiceButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // WebRTC message handler
        this.webrtc.setMessageHandler((message) => {
            console.log('Received message:', message);
            if (message.type === 'response.function_call_arguments.done') {
                this.handleToolExecution(message);
            }
        });
    }

    private async startListening() {
        try {
            await this.webrtc.connect('http://localhost:8787/rtc-connect');
            this.isListening = true;
            this.voiceButton.classList.add('listening');
            this.statusElement.textContent = 'Connected';
            this.addMessage('System', 'Listening...');
        } catch (error) {
            console.error('Failed to start listening:', error);
            this.addMessage('System', 'Failed to connect. Please try again.');
        }
    }

    private stopListening() {
        this.webrtc.disconnect();
        this.isListening = false;
        this.voiceButton.classList.remove('listening');
        this.statusElement.textContent = 'Disconnected';
        this.addMessage('System', 'Stopped listening.');
    }

    private async handleToolExecution(message: any) {
        try {
            const result = await this.tools.executeTool(
                message.name,
                JSON.parse(message.arguments)
            );

            if (result.success) {
                this.addMessage('System', `Tool "${message.name}" executed successfully`);
            } else {
                this.addMessage('System', `Tool execution failed: ${result.error}`);
            }

            // Send result back to OpenAI
            this.webrtc.sendMessage({
                type: 'conversation.item.create',
                item: {
                    type: 'function_call_output',
                    call_id: message.call_id,
                    output: JSON.stringify(result),
                },
            });
        } catch (error) {
            console.error('Tool execution error:', error);
            this.addMessage('System', 'Failed to execute tool.');
        }
    }

    private addMessage(sender: 'User' | 'AI' | 'System', text: string) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize the sidebar and export the instance
export const sidebar = new Sidebar(); 