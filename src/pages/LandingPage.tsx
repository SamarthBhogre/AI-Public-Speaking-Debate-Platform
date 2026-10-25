import React from 'react';
import { ArrowRight, Play, Mic2, MessagesSquare, BarChart3, Sparkles } from 'lucide-react';
import { Brand } from '../components/Brand';

interface LandingPageProps {
  onEnter: () => void;
  onLogin?: () => void;
}

export function LandingPage({ onEnter, onLogin }: LandingPageProps) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="landing-links">
          <a href="#features">How it works</a>
          <a href="#features">For students</a>
          <button className="login-btn" onClick={onLogin ?? onEnter}>
            Log in
          </button>
          <button className="primary" onClick={onEnter}>
            Get started <ArrowRight size={15} />
          </button>
        </div>
      </nav>
      <div className="landing-hero">
        <div className="landing-copy">
          <span className="pill purple-pill">THE CONFIDENCE PRACTICE LAB</span>
          <h2>
            Build confidence.
            <br />
            <em>Speak better.</em>
            <br />
            Debate smarter.
          </h2>
          <p>
            SpeakWell gives you a safe space to practice out loud, challenge
            your thinking, and see yourself improve — one session at a time.
          </p>
          <div className="landing-actions">
            <button className="primary" onClick={onEnter}>
              Start practicing <ArrowRight size={16} />
            </button>
            <button className="watch" onClick={onEnter}>
              <Play size={15} fill="currentColor" /> See how it works
            </button>
          </div>
          <div className="social-proof">
            <div className="proof-avatars">
              <i>AS</i>
              <i>RP</i>
              <i>MK</i>
            </div>
            <span>
              <b>Loved by 2,000+ learners</b>
              <small>Building their voice every day</small>
            </span>
          </div>
        </div>
        <div className="landing-visual">
          <div className="visual-ring" />
          <div className="visual-card">
            <span className="eyebrow">TODAY'S INSIGHT</span>
            <h3>
              Clarity is a<br />
              <em>superpower.</em>
            </h3>
            <div className="visual-wave">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <small>
              82 overall score <b>↗ 6%</b>
            </small>
          </div>
          <div className="float-tag tag-one">
            <Sparkles size={15} /> AI feedback
          </div>
          <div className="float-tag tag-two">
            <Mic2 size={15} /> Speak freely
          </div>
        </div>
      </div>
      <section className="features" id="features">
        <div>
          <span className="eyebrow">ONE SPACE TO GROW</span>
          <h3>Practice what matters.</h3>
        </div>
        <div className="feature-grid">
          <div>
            <Mic2 />
            <b>Speaking practice</b>
            <p>
              Find your voice with thoughtful prompts and a little room to
              breathe.
            </p>
          </div>
          <div>
            <MessagesSquare />
            <b>Debate arena</b>
            <p>
              Sharpen your thinking by seeing every side of the conversation.
            </p>
          </div>
          <div>
            <BarChart3 />
            <b>See your progress</b>
            <p>
              Turn every attempt into insight with feedback that moves you
              forward.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
