import { useState, useCallback, useRef } from 'react';
import type { Lang } from '@/lib/weather';
import type { ConciergeContext } from '@/lib/concierge-prompts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseConciergeChat Options {
  lang: Lang;
  context?: ConciergeContext;
}

interface UseConciergeChat Return {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export function useConciergeChat({ lang, context }: UseConciergeChat Options): UseConciergeChat Return {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Build history (exclude the current messages)
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Call streaming API
        const response = await fetch('/api/concierge/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            history,
            context: { ...context, lang },
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get response');
        }

        // Read streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response stream');
        }

        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulatedText += parsed.text;

                  // Update assistant message
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        if (!accumulatedText) {
          throw new Error('No response received');
        }
      } catch (err: any) {
        console.error('Send message error:', err);

        if (err.name === 'AbortError') {
          // Request was cancelled
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
          return;
        }

        const errorMessage = err.message || 'Failed to send message';
        setError(errorMessage);

        // Remove empty assistant message
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, lang, context]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
