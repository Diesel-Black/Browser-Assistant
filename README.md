# Web AI Assistant - Browser Extension

A Chrome extension that brings real-time AI voice interaction to your browser, powered by OpenAI's WebRTC API. This extension allows you to interact with an AI assistant through voice commands while browsing, enabling dynamic webpage manipulation and automation.

## Features

- 🎤 Real-time voice interaction with AI
- 🔄 Animated sidebar interface
- 🛠️ Extensible tool system for webpage manipulation
- 🔒 Privacy-first design with BYOK (Bring Your Own Key)
- 🌐 Cross-browser compatibility (planned)

## Project Structure

```
Browser-Assistant/
├── extension/           # Chrome extension source code
│   ├── src/            # TypeScript source files
│   ├── dist/           # Built extension files
│   └── icons/          # Extension icons
├── infrastructure/     # Backend infrastructure code
│   └── serverless/     # Serverless functions
└── private/           # Private documentation and planning
    └── docs/          # Project documentation
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Diesel-Black/Browser-Assistant.git
cd Browser-Assistant
```

2. Install dependencies:
```bash
cd extension
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` directory

### Development Commands

- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build the extension
- `npm run watch` - Build and watch for changes
- `npm run lint` - Run linter
- `npm run format` - Format code

## Usage

1. Click the extension icon in Chrome
2. Use the microphone button to start voice interaction
3. Speak commands to interact with the current webpage
4. Watch as the AI assistant executes your commands in real-time

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Acknowledgments

This project builds upon the [OpenAI WebRTC API](https://platform.openai.com/docs/api-reference/realtime) and was inspired by the original prototype demonstrating real-time AI interactions.

---
Built with 🧡 using TypeScript, WebRTC, and the OpenAI Realtime API
