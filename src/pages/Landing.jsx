import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GerenteLogo from '../components/brand/GerenteLogo';
import useDocumentMeta from '../hooks/useDocumentMeta';
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  AUDIENCE,
  FAQ,
  FEATURES,
  ONE_LINER,
  REPO_URL,
  SITE_DESCRIPTION,
  STACK,
  STEPS,
} from '../constants/siteInfo';
import '../styles/landing.css';

// three.js is by far the heaviest dependency here, and nothing outside this
// page uses it. Loading it separately keeps it out of the task board's bundle;
// until it arrives, the fallback holds the scene's CSS gradient so the hero
// never flashes and nothing below it moves.
const LandingScene3D = lazy(() => import('../components/landing/LandingScene3D'));

/**
 * Captions for the scroll story. Each one is pinned over the matching beat of
 * the 3D scene, so the text explains exactly what the cards on screen are doing.
 */
const BEATS = [
  {
    label: 'The backlog',
    title: 'Everything you owe yourself, in one pile.',
    body: 'Assignments, errands, side-project ideas and the thing you promised to do last week — all mixed together, none of it ranked.',
  },
  {
    label: 'Workspaces',
    title: 'Split it into the parts of your life.',
    body: 'Personal, Work, School, Fitness and Other each get their own list and their own open count, so a busy week at work never buries everything else.',
  },
  {
    label: 'Focus',
    title: 'Then take exactly one card.',
    body: 'Start the Pomodoro timer against a single task. Twenty-five minutes, one thing, with the countdown mirrored into the browser tab title.',
  },
  {
    label: 'Done',
    title: 'Close it, and see the board settle.',
    body: 'The task is checked off, the summary bar updates, and what is genuinely left stays in front of you.',
  },
];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .5Z" />
  </svg>
);

const Caption = ({ beat, index }) => (
  <div className="story__caption">
    <p className="story__label">
      <span className="story__step">{index + 1} / {BEATS.length}</span>
      {beat.label}
    </p>
    <p className="story__title">{beat.title}</p>
    <p className="story__body">{beat.body}</p>
  </div>
);

export default function Landing() {
  useDocumentMeta({
    title: 'Gerente — Free task manager with workspaces and a Pomodoro timer',
    description: SITE_DESCRIPTION,
    path: '/',
  });

  const progressRef = useRef(0);
  const storyRef = useRef(null);
  const [beat, setBeat] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // The landing owns the page background while it is mounted.
  useEffect(() => {
    document.body.classList.add('landing-active');
    return () => document.body.classList.remove('landing-active');
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Scroll position drives both the 3D scene (via the ref, no re-render) and
  // the pinned caption (via state, which only changes four times per scroll).
  // Skipped under reduced motion, where every beat is shown at once instead.
  useEffect(() => {
    const story = storyRef.current;
    if (!story || reducedMotion) return undefined;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = story.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(Math.max(-rect.top / travel, 0), 1);
      progressRef.current = p;

      const next = Math.min(BEATS.length - 1, Math.floor(p * BEATS.length));
      setBeat((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reducedMotion]);

  return (
    <div className="landing">
      <a className="skip-link" href="#main">Skip to content</a>

      <Suspense fallback={<div className="landing-scene" aria-hidden="true" />}>
        <LandingScene3D progressRef={progressRef} />
      </Suspense>

      <nav className="landing-nav" aria-label="Primary">
        <Link to="/" className="landing-nav__brand" aria-label="Gerente home">
          <GerenteLogo size={26} variant="lockup" title="Gerente" />
        </Link>
        <ul className="landing-nav__links">
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li>
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              <GitHubIcon /> GitHub
            </a>
          </li>
        </ul>
        <Link to="/app" className="btn btn--primary btn--sm">
          Open Gerente <ArrowIcon />
        </Link>
      </nav>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Free · No account required · Works offline</p>
          <h1 id="hero-title">
            A focused task manager with a built-in <span className="accent">Pomodoro timer</span>
          </h1>
          <p className="hero__lead">{ONE_LINER}</p>
          <p className="hero__sub">{AUDIENCE}</p>
          <div className="hero__actions">
            <Link to="/app" className="btn btn--primary">
              Open Gerente <ArrowIcon />
            </Link>
            <a className="btn btn--ghost" href={REPO_URL} target="_blank" rel="noreferrer noopener">
              <GitHubIcon /> View source
            </a>
          </div>
          <p className="hero__scroll" aria-hidden="true">Scroll to see how it works</p>
        </section>

        {/* Tall scroll track: the 3D scene behind it is keyed to progress
            through this section, and the caption is pinned in the middle.
            Under reduced motion there is no track — all four beats are just
            listed, so the story is still readable without scrolling it. */}
        <section className="story" ref={storyRef} aria-labelledby="story-title">
          <h2 id="story-title" className="sr-only">How Gerente turns a backlog into finished work</h2>
          {reducedMotion ? (
            <div className="story__static">
              {BEATS.map((item, i) => <Caption key={item.label} beat={item} index={i} />)}
            </div>
          ) : (
            <div className="story__pin">
              <Caption key={beat} beat={BEATS[beat]} index={beat} />
              <ol className="story__dots" aria-hidden="true">
                {BEATS.map((item, i) => (
                  <li key={item.label} className={i === beat ? 'is-active' : undefined} />
                ))}
              </ol>
            </div>
          )}
        </section>

        <section className="panel" id="how-it-works" aria-labelledby="how-title">
          <h2 id="how-title">How Gerente works</h2>
          <p className="panel__lead">
            Three steps, in the order you actually do them. Nothing here needs an account.
          </p>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="steps__num" aria-hidden="true">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel" id="features" aria-labelledby="features-title">
          <h2 id="features-title">What is in it</h2>
          <p className="panel__lead">
            Gerente does a small number of things and tries to do each one completely.
          </p>
          <div className="cards">
            {FEATURES.map((feature) => (
              <article className="card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="stack" aria-labelledby="stack-title">
          <h2 id="stack-title">Built with</h2>
          <ul className="stack">
            {STACK.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="panel__note">
            The full source, architecture notes and decision log are on{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">GitHub</a>.
          </p>
        </section>

        <section className="panel" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Frequently asked questions</h2>
          {/* Plain headings + paragraphs, not <dl> — heading content is not
              allowed inside <dt>, and this is what the FAQPage JSON-LD mirrors. */}
          <div className="faq">
            {FAQ.map((item) => (
              <article className="faq__item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel--cta" aria-labelledby="cta-title">
          <h2 id="cta-title">Start with one task</h2>
          <p className="panel__lead">
            Gerente opens straight into an empty list. No sign-up, no tour, no sample data.
          </p>
          <Link to="/app" className="btn btn--primary btn--lg">
            Open Gerente <ArrowIcon />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <p>
          <Link to="/about">About</Link>
          <span aria-hidden="true"> · </span>
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener">Source</a>
          <span aria-hidden="true"> · </span>
          <a href="/llms.txt">llms.txt</a>
        </p>
        <p>
          Built by <a href={AUTHOR_URL} rel="author noopener" target="_blank">{AUTHOR_NAME}</a>
        </p>
      </footer>
    </div>
  );
}
