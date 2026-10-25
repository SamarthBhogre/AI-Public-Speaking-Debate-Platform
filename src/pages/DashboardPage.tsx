import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Mic2, MessagesSquare, Flame, Trophy,
} from 'lucide-react';
import { User, View, AnalyticsOverview, SpeakingSession, DebateSession } from '../types';
import { analyticsService } from '../services/analyticsService';
import { speakingService } from '../services/speakingService';
import { debateService } from '../services/debateService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatDuration } from '../lib/utils';

interface StatProps { label: string; value: string; note: string; icon: React.ReactNode; }
function Stat({ label, value, note, icon }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

interface SessionRowProps {
  type: 'speaking' | 'debate';
  topic: string;
  date: string;
  score: number;
  duration: string;
  onClick?: () => void;
}
function SessionRow({ type, topic, date, score, duration, onClick }: SessionRowProps) {
  return (
    <div className="session" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`session-type ${type === 'speaking' ? 'purple' : 'orange'}`}>
        {type === 'speaking' ? <Mic2 size={17} /> : <MessagesSquare size={17} />}
      </div>
      <div className="session-info">
        <b>{topic}</b>
        <small>{date} · {duration}</small>
      </div>
      <strong className="score">{score}</strong>
      <span className="score-label">score</span>
      <ArrowRight className="row-arrow" size={16} />
    </div>
  );
}

interface DashboardPageProps {
  user: User;
  onNavigate: (v: View) => void;
  notify: (msg: string) => void;
  onOpenSpeaking?: (id: string) => void;
  onOpenDebate?: (id: string) => void;
}

export function DashboardPage({ user, onNavigate, notify, onOpenSpeaking, onOpenDebate }: DashboardPageProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [recentSpeaking, setRecentSpeaking] = useState<SpeakingSession[]>([]);
  const [recentDebate, setRecentDebate] = useState<DebateSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [scorePoints, setScorePoints] = useState<{date:string;score:number}[]>([]);

  useEffect(() => {
    analyticsService.getOverview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));

    analyticsService.getSpeaking()
      .then(data => setScorePoints(data.scoreOverTime.map(point => ({
        date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: Number(point.avg_score),
      }))))
      .catch(() => setScorePoints([]));

    Promise.all([
      speakingService.getHistory().catch(() => ({ sessions: [] as SpeakingSession[] })),
      debateService.getHistory().catch(() => ({ sessions: [] as DebateSession[] })),
    ]).then(([sp, db]) => {
      setRecentSpeaking(sp.sessions.slice(0, 2));
      setRecentDebate(db.sessions.slice(0, 1));
    }).finally(() => setLoadingSessions(false));
  }, []);

  const avgScore = overview?.averageScore ?? 0;
  const totalSessions = overview?.totalSessions ?? 0;
  const streak = overview?.currentStreak ?? 0;
  const longestStreak = overview?.longestStreak ?? 0;
  const visiblePoints = scorePoints.slice(-8);
  const linePath = visiblePoints.map((point, index) => {
    const x = visiblePoints.length < 2 ? 300 : (index * 600) / (visiblePoints.length - 1);
    const y = 160 - (Math.max(0, Math.min(100, point.score)) * 1.4);
    return (index === 0 ? 'M' : 'L') + x + ' ' + y;
  }).join(' ');

  return (
    <div className="content">
      <section className="hero-card">
        <div>
          <span className="pill purple-pill">
            YOUR MOMENTUM <Flame size={13} />
          </span>
          <h2>
            Small practice.
            <br />
            <em>Big confidence.</em>
          </h2>
          <p>
            {user.name}, you're building a powerful speaking habit. Keep your streak
            going today.
          </p>
          <button className="primary" onClick={() => onNavigate('practice')}>
            Start a practice <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-art">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <span>✦</span>
        </div>
      </section>

      {loadingOverview ? (
        <LoadingSpinner label="Loading your stats..." />
      ) : (
        <div className="stats">
          <Stat
            label="Overall score"
            value={avgScore ? String(Math.round(avgScore)) : '—'}
            note="Based on all sessions"
            icon={<Trophy />}
          />
          <Stat
            label="Practice sessions"
            value={String(totalSessions)}
            note="Total practice & debate"
            icon={<Mic2 />}
          />
          <Stat
            label="Current streak"
            value={streak ? `${streak} days` : '—'}
            note={longestStreak ? `Best: ${longestStreak} days` : 'Keep going!'}
            icon={<Flame />}
          />
        </div>
      )}

      <div className="grid-main">
        <section className="panel chart-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">PERFORMANCE</span>
              <h3>Your speaking journey</h3>
            </div>
            <span className="trend">{visiblePoints.length ? 'Based on saved speaking reports' : 'No speaking scores yet'}</span>
          </div>
          <div className="chart">
            <div className="y-labels">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
            </div>
            <svg viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7066f5" stopOpacity=".2" />
                  <stop offset="1" stopColor="#7066f5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {visiblePoints.length > 0 && <path d={linePath + ' L600 180 L0 180Z'} fill="url(#fill)" />}
              {visiblePoints.length > 0 && <path d={linePath} fill="none" stroke="#7066f5" strokeWidth="3" />}
            </svg>
          </div>
          <div className="x-labels">
            {visiblePoints.length ? visiblePoints.filter((_,i)=>i===0||i===visiblePoints.length-1).map((p,i)=><span key={i}>{p.date}</span>) : <span>Complete a speaking session to start your chart</span>}
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">GET STARTED</span>
              <h3>What will you practice?</h3>
            </div>
          </div>
          <button className="action-card speak" onClick={() => onNavigate('practice')}>
            <div className="action-icon">
              <Mic2 />
            </div>
            <div>
              <b>Speaking practice</b>
              <p>Find your voice, one topic at a time.</p>
            </div>
            <ArrowRight />
          </button>
          <button className="action-card debate" onClick={() => onNavigate('debate')}>
            <div className="action-icon">
              <MessagesSquare />
            </div>
            <div>
              <b>Debate arena</b>
              <p>Sharpen your thinking in rounds.</p>
            </div>
            <ArrowRight />
          </button>
        </section>
      </div>

      <section className="panel recent">
        <div className="section-title">
          <div>
            <span className="eyebrow">RECENT ACTIVITY</span>
            <h3>Pick up where you left off</h3>
          </div>
          <button className="text-btn" onClick={() => onNavigate('history')}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="session-list">
          {loadingSessions ? (
            <LoadingSpinner label="Loading recent sessions..." />
          ) : (recentSpeaking.length === 0 && recentDebate.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: '20px 0' }}>
              No sessions yet — start your first practice!
            </p>
          ) : (
            <>
              {recentSpeaking.map(s => (
                <SessionRow
                  key={s.id}
                  type="speaking"
                  topic={s.topic}
                  date={formatDate(s.created_at)}
                  score={s.report?.overall_score ?? 0}
                  duration={formatDuration(s.duration_seconds)}
                  onClick={() => onOpenSpeaking?.(s.id)}
                />
              ))}
              {recentDebate.map(s => (
                <SessionRow
                  key={s.id}
                  type="debate"
                  topic={s.topic}
                  date={formatDate(s.created_at)}
                  score={s.score ?? 0}
                  duration="03:00"
                  onClick={() => onOpenDebate?.(s.id)}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
