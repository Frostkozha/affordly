import './AccountPage.css';
import { useState } from 'react';
import { restore, getAccount } from '../lib/account';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { PlanBadge } from './PlanBadge';
import { HistoryTable } from './HistoryTable';

export function AccountPage() {
  const { state, setPlus, ready, reloadAccount } = useStore();
  const [toast, setToast] = useState('');
  const [code, setCode] = useState('');
  const [restoreError, setRestoreError] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const account = getAccount();
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Copied');
    } catch {
      setToast('Copy unavailable. Select and copy the code shown.');
    }
  };
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Your weeks, kept together</span>
        <h1>Your account</h1>
      </div>
      {!ready ?
        <Skeleton />
        :
        <div className="account-layout">
          <section className="card">
            <h2>Guest account</h2>
            <PlanBadge plus={state.plus} />
            <label>Account ID</label>
            <div className="receipt-row">
              <code>{account?.id.slice(0, 8) ?? 'This session'}</code>
              {account
                &&
                <Button
                  quiet
                  onClick={() => {
                    void copy(account.id);
                  }}
                >
                  Copy
                  <span className="sr-only">{' '}account ID</span>
                </Button>
              }
            </div>
            <label>Restore code</label>
            <div className="receipt-row">
              <code className="restore-code">{account?.restoreCode ?? 'Unavailable'}</code>
              {account
                &&
                <Button
                  quiet
                  onClick={() => {
                    void copy(account.restoreCode);
                  }}
                >
                  Copy
                  <span className="sr-only">{' '}restore code</span>
                </Button>
              }
            </div>
            <p className="meta">Enter this code on another device to open this account.</p>
            {import.meta.env.VITE_API_BASE
              &&
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setRestoring(true);
                  setRestoreError(false);
                  void restore(code).then(async ok => {
                    if (ok) {
                      await reloadAccount();
                      setToast('Account opened.');
                      setCode('');
                    } else
                      setRestoreError(true);
                  }).finally(() => setRestoring(false));
                }}
              >
                <h3>Open my account on this device</h3>
                <label htmlFor="restore">Restore from a code</label>
                <input
                  id="restore"
                  value={code}
                  required
                  onChange={e => setCode(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={restoring}
                >
                  {restoring ? 'Opening...' : 'Restore'}
                </Button>
                {restoreError
                  &&
                  <p className="error" role="alert">That code did not match an account.</p>
                }
              </form>
            }
            <p role="status">{toast}</p>
            {state.plus
              &&
              <Button
                quiet
                onClick={() => setPlus(false)}
              >
                Switch back to Free (demo)
              </Button>
            }
            <p className="meta">Sign-in arrives in v2.</p>
          </section>
          <HistoryTable state={state} />
        </div>
      }
    </>
  );
}
