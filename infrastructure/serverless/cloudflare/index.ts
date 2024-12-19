import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `You are a helpful AI assistant with the ability to modify web pages in real-time. You can:
- Add text with different styles (normal, fancy, or code)
- Change colors of the background and text
- Add images and create lists
- Add interactive buttons
- Clear the page when needed

Always acknowledge when users want to try specific features, and be creative with the styling options. You can combine multiple tools to create interesting layouts and demonstrations.

Remember that users can pause your audio stream using the control button at the top of the page to save tokens.`;

app.post('/rtc-connect', async (c) => {
	const body = await c.req.text();
	const url = new URL('https://api.openai.com/v1/realtime');
	url.searchParams.set('model', 'gpt-4o-mini-realtime-preview-2024-12-17');
	url.searchParams.set('instructions', DEFAULT_INSTRUCTIONS);
	url.searchParams.set('voice', 'ash');

	const response = await fetch(url.toString(), {
		method: 'POST',
		body,
		headers: {
			Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
			'Content-Type': 'application/sdp',
		},
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	}
	const sdp = await response.text();
	return c.body(sdp, {
		headers: {
			'Content-Type': 'application/sdp',
		},
	});
});

export default app;
