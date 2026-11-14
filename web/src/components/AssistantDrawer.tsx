import './AssistantDrawer.css';
import { useEffect, useRef, useState } from 'react';
import type { AssistantResponse, Recipe } from '@affordly/engine';
import { ask } from '../lib/assistant';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { ErrorState } from './ErrorState';
import { Overlay } from './Overlay';
import { AssistantMessage } from './AssistantMessage';
export interface ChatMessage {
  user: string;
  response?: AssistantResponse;
}

export function AssistantDrawer({ close, open, go, messages, setMessages }: {
  close: () => void;
  open: (r: Recipe) => void;
  go: (tab: string) => void;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
}) {
  const { inputs, state, run } = useStore();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [last, setLast] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({
      block: 'nearest'
    });
  }, [messages, busy]);
  const send = async (message: string) => {
    if (!message.trim() || busy)
      return;
    setLast(message);
    setDraft('');
    setBusy(true);
    setError(false);
    const next = [...messages, {
      user: message
    }];
    setMessages(next);
    try {
      const response = await ask(message, inputs, state.pantry);
      setMessages([...messages, {
        user: message,
        response
      }]);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Overlay
      title="Ask Affordly"
      drawer
      onClose={close}
    >
      <p className="meta">Ask about your budget, swaps, or a recipe.</p>
      <div
        className="messages"
        aria-live="polite"
      >
        {!messages.length
          &&
          <div className="suggestions">
            {[
              'Cheapest week for my protein',
              'Swap the most expensive item',
              'A cheap dinner without dairy'
            ].map(text =>
              <Button
                key={text}
                onClick={() => {
                  void send(text);
                }}
              >
                {text}
              </Button>
            )}
          </div>
        }
        {messages.map((message, index) =>
          <div key={index}>
            <p className="user-message">{message.user}</p>
            {message.response
              &&
              <AssistantMessage
                response={message.response}
                open={open}
                apply={next => {
                  void run(next).then(() => {
                    close();
                    go('plan');
                  }).catch(() => { });
                }}
              />
            }
          </div>
        )}
        {busy &&
          <p role="status">Checking the numbers...</p>
        }
        {error
          &&
          <ErrorState
            retry={() => {
              setMessages(messages.slice(0, -1));
              void send(last);
            }}
          >
            Assistant is offline. Your plan still works.
          </ErrorState>
        }
        <div ref={end} />
      </div>
      <form
        className="assistant-input"
        onSubmit={e => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <label className="sr-only" htmlFor="question">Ask Affordly a question</label>
        <input
          id="question"
          placeholder={'Ask something, e.g. "What is the cheapest week with 150 g protein?"'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        <Button primary type="submit" disabled={busy || !draft.trim()}>Send</Button>
      </form>
    </Overlay>
  );
}
