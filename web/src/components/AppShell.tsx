import { useToast } from '../lib/useToast';
import { Toast } from './Toast';
import { CreatorsPage } from './CreatorsPage';
import { DiscoverPage } from './DiscoverPage';
import { isSavedToServer } from '../lib/account';
import { useEffect, useState } from 'react';
import type { Plan, Recipe } from '@affordly/engine';
import { useStore } from '../lib/store';
import { Badge } from './Badge';
import { Button } from './Button';
import { Overlay } from './Overlay';
import { PriceSourceLine } from './PriceSourceLine';
import { SkipLink } from './SkipLink';
import { Skeleton } from './Skeleton';
import { Landing } from './Landing';
import { InputsForm } from './InputsForm';
import { PlanView } from './PlanView';
import { RecipeDialog } from './RecipeDialog';
import { BasketTable } from './BasketTable';
import { CheckoutGapCard } from './CheckoutGapCard';
import { DoesNotFit } from './DoesNotFit';
import { WeekTwo } from './WeekTwo';
import { AccountPage } from './AccountPage';
import { Paywall } from './Paywall';
import { AssistantDrawer } from './AssistantDrawer';
import type { ChatMessage } from './AssistantDrawer';
import './AppShell.css';
import { SolveStatus } from './SolveStatus';
import { ErrorState } from './ErrorState';
import { TopBar } from './TopBar';
import { BottomBar } from './BottomBar';

export function AppShell() {
  const { message: toast, id: toastId } = useToast();
  const [synced, setSynced] = useState(isSavedToServer);
  useEffect(() => {
    const update = () => setSynced(isSavedToServer());
    window.addEventListener('affordly:save', update);
    return () => window.removeEventListener('affordly:save', update);
  }, []);
  const [hash, setHash] = useState(location.hash || '#/');
  const [assistant, setAssistant] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<{
    recipe: Recipe;
    servings?: number;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { state, result, ready, sample, solving, solveError, retry } = useStore();
  useEffect(() => {
    const change = () => {
      setHash(location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const go = (tab: string) => {
    location.hash = tab === 'plan' ? '/plan' : `/plan/${tab}`;
  };
  const locked = (message = '') => setPaywall(message);
  const open = (r: Recipe, servings?: number) => setRecipe({
    recipe: r,
    servings
  });
  const landing = hash === '#/' || hash === '';
  const week = /^#\/(next-week|week2)/.test(hash);
  const account = hash.startsWith('#/account');
  const creators = hash.startsWith('#/creators');
  const discover = hash.startsWith('#/discover');
  const tab = /[#/]basket$/.test(hash) ?
    'basket' :
    /[#/]inputs$/.test(hash) ? 'inputs' : 'plan';
  const plan = result?.ok ? result.plan : null;
  const [lastPlan, setLastPlan] = useState<Plan | null>(null);
  if (plan && plan !== lastPlan)
    setLastPlan(plan);
  // Keep the basket on screen while a swap or price edit re-solves, so the page does not jump.
  const stale = tab === 'basket' && solving ? lastPlan : null;
  const shown = plan ?? stale;
  const gated = state.week > 1 && !state.plus;
  return (
    <>
      <SkipLink />
      <TopBar
        hash={hash}
        ask={() => setAssistant(true)}
      />
      <main
        className={discover ? "discover-main" : undefined}
        id="content"
        tabIndex={-1}
      >
        <div className="page-enter" key={hash}>
        {landing ?
          <Landing go={go} />
          :
          <>
            {!discover && <div className="device-banner">
              <span>{synced ? 'Saved to your guest account' : 'Saved on this device only'}</span>
              <PriceSourceLine />
            </div>}

            {creators ? <CreatorsPage /> : discover ?
              <DiscoverPage reels={hash.startsWith('#/discover/reels')} open={open} /> : account ?
              <AccountPage />
              :
              week ?
                <WeekTwo locked={locked} go={go} />
                :
                <>
                  <div className="page-heading plan-heading">
                    <div>
                      <span className="eyebrow">A plan that starts with your limit</span>
                      <h1>
                        {tab === 'inputs' ?
                          'Let’s price your week.' :
                          result && !result.ok && !solving ? 'This week does not fit yet.' :
                          tab === 'basket' ? 'What you’ll actually pay.' : 'Your week, within reach.'}
                      </h1>
                    </div>
                    <div className="plan-badges">
                      {state.week > 1 && <Badge kind="save">Week {state.week}</Badge>}
                      {sample && <Badge>Sample week</Badge>}
                    </div>
                  </div>
                  <nav
                    className="sub-tabs"
                    aria-label="Plan sections"
                  >
                    {['inputs', 'plan', 'basket'].map(t =>
                      <a
                        href={t === 'plan' ? '#/plan' : `#/plan/${t}`}
                        key={t}
                        aria-current={tab === t ? 'page' : undefined}
                      >
                        {t[0].toUpperCase() + t.slice(1)}
                      </a>
                    )}
                  </nav>
                  {!ready ?
                    <Skeleton />
                    :
                    solving && !stale ?
                      <SolveStatus />
                      :
                      solveError ?
                        <ErrorState retry={retry}>{solveError}</ErrorState>
                        :
                        tab === 'inputs' ?
                          <InputsForm locked={locked} go={go} />
                          :
                          result && !result.ok ?
                            <DoesNotFit result={result} go={go} />
                            :
                            gated ?
                              <Paywall />
                              :
                              tab === 'basket' ?
                                <div className="stack">
                                  {shown &&
                                    <CheckoutGapCard plan={shown} budget={state.inputs!.budget} />
                                  }
                                  <BasketTable plan={shown} locked={locked} />
                                </div>
                                :
                                <PlanView plan={plan} go={go} open={open} />
                  }
                </>
            }
          </>
        }
        </div>
      </main>
      <Toast key={toastId} message={toast} />
      <footer>
        <a href="#/" className="wordmark">Affordly.</a>
        <p>Planning tool, not medical or dietary advice.</p>
        <a href="#/creators">Creators: get Plus free</a>
      </footer>
      <>
          <BottomBar hash={hash} />
          {!landing && !discover && !assistant && !recipe && paywall === null && <Button
            className="ask-float"
            onClick={() => setAssistant(true)}
            aria-label="Ask Affordly"
          >
            Ask
          </Button>}
      </>
      {assistant
        &&
        <AssistantDrawer
          messages={messages}
          setMessages={setMessages}
          close={() => setAssistant(false)}
          open={open}
          go={go}
        />
      }
      {paywall !== null
        &&
        <Overlay
          title="Affordly Plus"
          onClose={() => setPaywall(null)}
        >
          <Paywall
            message={paywall}
            unlocked={() => setPaywall(null)}
          />
        </Overlay>
      }
      {recipe
        &&
        <RecipeDialog
          recipe={recipe.recipe}
          servings={recipe.servings}
          close={() => setRecipe(null)}
        />
      }
    </>
  );
}
