
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  text: string;
  chunks: GroundingChunk[];
}

export enum TabType {
  CHAT = 'chat',
  LIVE = 'live',
  SEARCH = 'search',
  IMAGE = 'image'
}
