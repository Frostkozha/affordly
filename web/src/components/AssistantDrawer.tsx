import './AssistantDrawer.css';
import { useEffect, useRef, useState } from 'react';
import type { AssistantResponse, Recipe } from '@affordly/engine';
import { ask } from '../lib/assistant';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { ErrorState } from './ErrorState';
import { Overlay } from './Overlay';
import { AssistantMessage } from './AssistantMessage';
import { Paywall } from './Paywall';
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
  const [step, setStep] = useState('Reading your question\u2026');
  const [error, setError] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
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
      const previous = [...messages].reverse().find(m => m.response?.options?.length)?.response;
      const ordinal = message.match(/^apply (?:the )?(first|second|third|[123])(?: one)?[.!]?$/i);
      if (ordinal) {
        const index = { first: 1, second: 2, third: 3 }[ordinal[1].toLowerCase()]
          ?? Number(ordinal[1]);
        const option = previous?.action === 'compare'
          ? previous.options?.find(o => o.label === 'Apply Scenario ' + index)
          : index === 1 ? previous?.options?.[0] : undefined;
        if (option) {
          await run(option.inputs);
          close();
          go('plan');
          return;
        }
        setMessages([...messages, { user: message, response: {
          action: 'off-topic', intent: 'off-topic', source: 'template', refused: true,
          text: 'That option is unavailable. Choose an Apply button on a feasible scenario.',
          recipeIds: [], suggestions: ['What if $70 vs $90?', 'Explain my plan'],
        } }]);
        return;
      }
      const contextInputs = /^(and|make it|without)/i.test(message)
        ? previous?.options?.[0]?.inputs ?? inputs : inputs;
      const history = messages.flatMap(m => [
        { role: 'user' as const, text: m.user },
        ...(m.response ? [{ role: 'assistant' as const, text: m.response.text }] : []),
      ]).slice(-6);
      const response = await ask(message, contextInputs, state.pantry, history,
        state.currentPlan, state.plus, setStep);
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
      <p className="meta">
        I can price changes, compare plans, swap foods, explain your receipt, and help you cook.
      </p>
      <div
        className="messages"
        aria-live="polite"
      >
        {!messages.length
          &&
          <div className="suggestions">
            {[
              'Can I do this on $70?',
              'Why is my gap so big?',
              'No tuna this week',
              'What can I cook with leftovers?'
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
                disabled={busy}
                suggest={text => { void send(text); }}
                paywall={() => setShowPlus(true)}
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
          <p role="status" className="assistant-working">{step}</p>
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
      {showPlus && <Paywall unlocked={() => setShowPlus(false)} />}
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
          maxLength={500}
          onChange={e => setDraft(e.target.value)}
        />
        <Button primary type="submit" disabled={busy || !draft.trim()}>Send</Button>
      </form>
    </Overlay>
  );
}
