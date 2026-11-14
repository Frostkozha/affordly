import { CreatorRules } from './CreatorRules';
import { creatorsBase } from '../lib/creatorsApi';
import { CreatorForm } from './CreatorForm';
import './Creators.css';
export function CreatorsPage() {
  return <div className="creators-layout">
    <section className="creator-intro"><span className="eyebrow">Creators</span>
      <h1>Post real weeks. Get Plus free.</h1>
      <p className="hero-sub">If you post 4 videos a month about a real week planned with Affordly,
        your Plus plan is free for as long as you keep posting.</p>
    </section>
    <CreatorRules />
    <section className="creator-about"><h2>Who this is for</h2>
      <p>People who already talk about budgets, groceries, meal prep or money. Small accounts are welcome.
        You do not need a following, you need real weeks.</p>
      <h2>How it works</h2><ol className="number-steps creator-steps">
        <li><h3>Apply.</h3><p>Tell us where you post.</p></li>
        <li><h3>We review it by hand.</h3><p>We read every application. This is an early programme,
          so spots are limited.</p></li>
        <li><h3>Plan, post, repeat.</h3><p>We switch on Plus. You post 4 real weeks a month.</p></li>
      </ol>
    </section>
    <div className="creator-application">
      <p>Applications are reviewed by hand. This is an early programme, so we may be slow
        and we cannot take everyone.</p>
      {creatorsBase ? <CreatorForm /> : <div className="card">
        <h2>Applications are closed in this build.</h2>
        <p>The application service is not connected. You can still explore Discover.</p>
        <a className="btn" href="#/discover">Back to Discover</a></div>}
    </div>
  </div>;
}
