import { AIProvider } from './types';
import { GeminiProvider } from './gemini-provider';

export class AIFactory {
  private static geminiInstance: GeminiProvider | null = null;

  static getProvider(name: 'gemini' | string = 'gemini'): AIProvider {
    if (name.toLowerCase() === 'gemini') {
      if (!this.geminiInstance) {
        this.geminiInstance = new GeminiProvider();
      }
      return this.geminiInstance;
    }

    throw new Error(`AI Provider "${name}" is not currently implemented. Supported: gemini`);
  }
}
