export type RTCConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export type RTCMessage = {
  type: string;
  [key: string]: any;
};

export type RTCMessageHandler = (message: RTCMessage) => void;

export type RTCConfig = {
  serverUrl: string;
  onStateChange?: (state: RTCConnectionState) => void;
  onMessage?: RTCMessageHandler;
}; 