// Create and inject the sidebar iframe
function injectSidebar() {
    const iframe = document.createElement('iframe');
    const sidebarURL = chrome.runtime.getURL('dist/src/sidebar/index.html');
    iframe.src = sidebarURL;
    iframe.id = 'ai-assistant-sidebar';
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        right: -320px; /* Start hidden */
        width: 320px;
        height: 100vh;
        border: none;
        z-index: 9999;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        transition: right 0.3s ease;
        background: white;
    `;
    document.body.appendChild(iframe);

    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'ai-assistant-toggle';
    toggleButton.innerHTML = '🎤';
    toggleButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 24px;
        border: none;
        background: #4CAF50;
        color: white;
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    `;
    document.body.appendChild(toggleButton);

    let sidebarVisible = false;
    toggleButton.addEventListener('click', () => {
        sidebarVisible = !sidebarVisible;
        iframe.style.right = sidebarVisible ? '0' : '-320px';
        toggleButton.style.transform = sidebarVisible ? 'rotate(360deg)' : 'none';
    });
}

// Initialize when the content script loads
injectSidebar();

// Listen for messages from the sidebar
window.addEventListener('message', (event) => {
    // Verify the message source is our sidebar
    if (event.source !== window) {
        const sidebarFrame = document.getElementById('ai-assistant-sidebar') as HTMLIFrameElement;
        if (event.source === sidebarFrame?.contentWindow) {
            console.log('Received message from sidebar:', event.data);
            // Handle sidebar messages here
        }
    }
}); 