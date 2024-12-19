let streamActive = true;
let audioElement = null;

const fns = {
	getPageHTML: () => {
		console.log('Getting page HTML');
		return { success: true, html: document.documentElement.outerHTML };
	},
	changeBackgroundColor: ({ color }) => {
		console.log('Changing background color to:', color);
		document.body.style.backgroundColor = color;
		return { success: true, color };
	},
	changeTextColor: ({ color }) => {
		console.log('Changing text color to:', color);
		document.body.style.color = color;
		return { success: true, color };
	},
	addText: ({ text, position, style }) => {
		console.log('Adding text:', text, 'with style:', style, 'at position:', position);
		const contentDiv = document.querySelector('.content');
		const div = document.createElement('div');
		div.textContent = text;
		if (style === 'fancy') {
			div.style.fontFamily = 'cursive';
				div.style.fontSize = '24px';
				div.style.padding = '10px';
				div.style.margin = '10px';
				div.style.borderRadius = '10px';
				div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
		} else if (style === 'code') {
			div.style.fontFamily = 'monospace';
			div.style.backgroundColor = '#1e1e1e';
			div.style.color = '#fff';
			div.style.padding = '15px';
			div.style.borderRadius = '5px';
			div.style.margin = '10px';
		}
		if (position === 'top') {
			contentDiv.prepend(div);
		} else {
			contentDiv.appendChild(div);
		}
		return { success: true, text };
	},
	clearPage: () => {
		console.log('Clearing page');
		const contentDiv = document.querySelector('.content');
		const controlButton = document.getElementById('streamControl');
		contentDiv.innerHTML = '<h1>AI Web Assistant</h1>';
		if (controlButton) document.body.appendChild(controlButton);
		if (audioElement) document.body.appendChild(audioElement);
		return { success: true };
	},
	addImage: ({ url, size }) => {
		console.log('Adding image:', url, 'with size:', size);
		const contentDiv = document.querySelector('.content');
		const img = document.createElement('img');
		img.src = url;
		img.style.maxWidth = size || '300px';
		img.style.borderRadius = '10px';
		img.style.margin = '10px';
		contentDiv.appendChild(img);
		return { success: true, url };
	},
	createList: ({ items, style }) => {
		console.log('Creating list with items:', items, 'and style:', style);
		const contentDiv = document.querySelector('.content');
		const ul = document.createElement('ul');
		ul.style.listStyle = style || 'disc';
		ul.style.margin = '20px';
		items.forEach(item => {
			const li = document.createElement('li');
			li.textContent = item;
			ul.appendChild(li);
		});
		contentDiv.appendChild(ul);
		return { success: true, items };
	},
	addButton: ({ text, color }) => {
		console.log('Adding button with text:', text, 'and color:', color);
		const contentDiv = document.querySelector('.content');
		const button = document.createElement('button');
		button.textContent = text;
		button.style.padding = '10px 20px';
		button.style.margin = '10px';
		button.style.borderRadius = '5px';
		button.style.backgroundColor = color || '#4CAF50';
		button.style.color = 'white';
		button.style.border = 'none';
		button.style.cursor = 'pointer';
		contentDiv.appendChild(button);
		return { success: true, text };
	}
};

// Create control button
const controlButton = document.createElement('button');
controlButton.id = 'streamControl';
controlButton.innerHTML = '⏸️ Pause Assistant';
controlButton.style.position = 'fixed';
controlButton.style.top = '20px';
controlButton.style.left = '50%';
controlButton.style.transform = 'translateX(-50%)';
controlButton.style.padding = '15px 30px';
controlButton.style.borderRadius = '25px';
controlButton.style.backgroundColor = '#4CAF50';
controlButton.style.color = 'white';
controlButton.style.border = 'none';
controlButton.style.cursor = 'pointer';
controlButton.style.fontSize = '16px';
controlButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
controlButton.style.transition = 'all 0.3s ease';

controlButton.addEventListener('mouseenter', () => {
	controlButton.style.transform = 'translateX(-50%) scale(1.05)';
});

controlButton.addEventListener('mouseleave', () => {
	controlButton.style.transform = 'translateX(-50%)';
});

controlButton.addEventListener('click', () => {
	streamActive = !streamActive;
	if (streamActive) {
		controlButton.innerHTML = '⏸️ Pause Assistant';
		controlButton.style.backgroundColor = '#4CAF50';
		if (audioElement) audioElement.play();
	} else {
		controlButton.innerHTML = '▶️ Resume Assistant';
		controlButton.style.backgroundColor = '#2196F3';
		if (audioElement) audioElement.pause();
	}
});

document.body.appendChild(controlButton);

// Create a WebRTC Agent
const peerConnection = new RTCPeerConnection();

// Log connection state changes
peerConnection.onconnectionstatechange = () => {
	console.log('Connection state:', peerConnection.connectionState);
};

peerConnection.oniceconnectionstatechange = () => {
	console.log('ICE connection state:', peerConnection.iceConnectionState);
};

peerConnection.onicegatheringstatechange = () => {
	console.log('ICE gathering state:', peerConnection.iceGatheringState);
};

peerConnection.onicecandidate = (event) => {
	console.log('ICE candidate:', event.candidate);
};

// On inbound audio add to page
peerConnection.ontrack = (event) => {
	console.log('Received audio track:', event.streams[0]);
	audioElement = document.createElement('audio');
	audioElement.srcObject = event.streams[0];
	audioElement.autoplay = streamActive;
	audioElement.controls = true;  // Make controls visible for debugging
	audioElement.style.position = 'fixed';
	audioElement.style.bottom = '20px';
	audioElement.style.right = '20px';
	audioElement.style.display = 'block';  // Show the audio element for debugging
	document.body.appendChild(audioElement);
};

const dataChannel = peerConnection.createDataChannel('response');

dataChannel.onopen = () => {
	console.log('Data channel opened');
};

dataChannel.onclose = () => {
	console.log('Data channel closed');
};

dataChannel.onerror = (error) => {
	console.error('Data channel error:', error);
};

function configureData() {
	console.log('Configuring data channel');
	const event = {
		type: 'session.update',
		session: {
			modalities: ['text', 'audio'],
			tools: [
				{
					type: 'function',
					name: 'changeBackgroundColor',
					description: 'Changes the background color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value or color name' },
						},
					},
				},
				{
					type: 'function',
					name: 'changeTextColor',
					description: 'Changes the text color of a web page',
					parameters: {
						type: 'object',
						properties: {
							color: { type: 'string', description: 'A hex value or color name' },
						},
					},
				},
				{
					type: 'function',
					name: 'addText',
					description: 'Adds styled text to the web page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'The text to add' },
							position: { type: 'string', description: 'The position to add the text (top or bottom)' },
							style: { type: 'string', description: 'Style of the text (normal, fancy, or code)' },
						},
					},
				},
				{
					type: 'function',
					name: 'clearPage',
					description: 'Clears the web page while preserving controls',
				},
				{
					type: 'function',
					name: 'addImage',
					description: 'Adds an image to the page',
					parameters: {
						type: 'object',
						properties: {
							url: { type: 'string', description: 'The URL of the image' },
							size: { type: 'string', description: 'Maximum width of the image (e.g., "300px")' },
						},
					},
				},
				{
					type: 'function',
					name: 'createList',
					description: 'Creates a list of items',
					parameters: {
						type: 'object',
						properties: {
							items: { type: 'array', description: 'Array of items to list' },
							style: { type: 'string', description: 'List style (disc, circle, square, etc)' },
						},
					},
				},
				{
					type: 'function',
					name: 'addButton',
					description: 'Adds a styled button to the page',
					parameters: {
						type: 'object',
						properties: {
							text: { type: 'string', description: 'Button text' },
							color: { type: 'string', description: 'Button background color' },
						},
					},
				},
				{
					type: 'function',
					name: 'getPageHTML',
					description: 'Gets the HTML for the current page',
				},
			],
		},
	};
	dataChannel.send(JSON.stringify(event));
}

dataChannel.addEventListener('open', (ev) => {
	console.log('Opening data channel', ev);
	configureData();
});

// {
//     "type": "response.function_call_arguments.done",
//     "event_id": "event_Ad2gt864G595umbCs2aF9",
//     "response_id": "resp_Ad2griUWUjsyeLyAVtTtt",
//     "item_id": "item_Ad2gsxA84w9GgEvFwW1Ex",
//     "output_index": 1,
//     "call_id": "call_PG12S5ER7l7HrvZz",
//     "name": "get_weather",
//     "arguments": "{\"location\":\"Portland, Oregon\"}"
// }

dataChannel.addEventListener('message', async (ev) => {
	const msg = JSON.parse(ev.data);
	console.log('Received message:', msg); // Log all incoming messages
	
	// Handle function calls
	if (msg.type === 'response.function_call_arguments.done') {
		const fn = fns[msg.name];
		if (fn !== undefined) {
			console.log(`Calling local function ${msg.name} with arguments:`, msg.arguments);
			try {
				const args = JSON.parse(msg.arguments);
				const result = await fn(args);
				console.log('Function result:', result);
				
				// Let OpenAI know that the function has been called and share its output
				const event = {
					type: 'conversation.item.create',
					item: {
						type: 'function_call_output',
						call_id: msg.call_id,
						output: JSON.stringify(result),
					},
				};
				console.log('Sending response to OpenAI:', event);
				dataChannel.send(JSON.stringify(event));
			} catch (error) {
				console.error('Error executing function:', error);
			}
		} else {
			console.warn('Unknown function called:', msg.name);
		}
	}
});

// Capture microphone with error handling
navigator.mediaDevices.getUserMedia({ audio: true })
	.then((stream) => {
		console.log('Microphone access granted');
		// Add microphone to PeerConnection
		stream.getTracks().forEach((track) => {
			console.log('Adding track to connection:', track.kind);
			peerConnection.addTransceiver(track, { direction: 'sendrecv' });
		});

		peerConnection.createOffer()
			.then((offer) => {
				console.log('Created offer');
				return peerConnection.setLocalDescription(offer);
			})
			.then(() => {
				console.log('Set local description, sending to server');
				// Send WebRTC Offer to Workers Realtime WebRTC API Relay
				return fetch('/rtc-connect', {
					method: 'POST',
					body: peerConnection.localDescription.sdp,
					headers: {
						'Content-Type': 'application/sdp',
					},
				});
			})
			.then((r) => {
				if (!r.ok) throw new Error(`Server error: ${r.status}`);
				return r.text();
			})
			.then((answer) => {
				console.log('Received answer from server');
				// Accept answer from Realtime WebRTC API
				return peerConnection.setRemoteDescription({
					sdp: answer,
					type: 'answer',
				});
			})
			.then(() => {
				console.log('Set remote description, connection should be establishing');
			})
			.catch((error) => {
				console.error('Connection error:', error);
			});
	})
	.catch((error) => {
		console.error('Error accessing microphone:', error);
	});
