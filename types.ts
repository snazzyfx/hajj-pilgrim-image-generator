
export interface ImageState {
  original: string | null;
  edited: string | null;
  loading: boolean;
  error: string | null;
}

export interface GeminiResponse {
  imageUrl: string;
  text?: string;
}
