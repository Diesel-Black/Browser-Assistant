import { RTCConnectionState, RTCMessageHandler } from '../types/webrtc';

export class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private messageHandler: RTCMessageHandler | null = null;
  private connectionState: RTCConnectionState = 'disconnected';

  constructor() {
    this.peerConnection = new RTCPeerConnection();
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.peerConnection.onconnectionstatechange = () => {
      this.connectionState = this.peerConnection.connectionState as RTCConnectionState;
      console.log('Connection state:', this.connectionState);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };

    this.peerConnection.ontrack = (event) => {
      console.log('Received audio track:', event.streams[0]);
      this.audioElement = document.createElement('audio');
      this.audioElement.srcObject = event.streams[0];
      this.audioElement.autoplay = true;
    };
  }

  public async connect(serverUrl: string): Promise<void> {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => {
        this.peerConnection.addTransceiver(track, { direction: 'sendrecv' });
      });

      // Create and configure data channel
      this.dataChannel = this.peerConnection.createDataChannel('response');
      this.setupDataChannel();

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to server and get answer
      const response = await fetch(serverUrl, {
        method: 'POST',
        body: this.peerConnection.localDescription?.sdp,
        headers: { 'Content-Type': 'application/sdp' },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const answer = await response.text();
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answer,
      });

    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.configureSession();
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    this.dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageHandler?.(message);
    };
  }

  private configureSession() {
    if (!this.dataChannel) return;

    const config = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        tools: [] // Tool definitions will be injected
      }
    };

    this.dataChannel.send(JSON.stringify(config));
  }

  public setMessageHandler(handler: RTCMessageHandler) {
    this.messageHandler = handler;
  }

  public sendMessage(message: any) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    this.dataChannel?.close();
    this.peerConnection.close();
    this.audioElement?.remove();
  }

  public getConnectionState(): RTCConnectionState {
    return this.connectionState;
  }

  public toggleAudio(enabled: boolean) {
    if (this.audioElement) {
      this.audioElement.muted = !enabled;
    }
  }
} 