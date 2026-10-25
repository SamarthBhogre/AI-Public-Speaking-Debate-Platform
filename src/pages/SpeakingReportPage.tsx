import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ArrowUpRight, Clock, BookOpen } from 'lucide-react';
import { speakingService } from '../services/speakingService';
import { SpeakingSession } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { ScoreBar } from '../components/ScoreBar';
import { formatDuration, formatDate } from '../lib/utils';

interface SpeakingReportPageProps {
  sessionId: string | null;
  onBack: () => void;
  onRetry: () => void;
}

export function SpeakingReportPage({ sessionId, onBack, onRetry }: SpeakingReportPageProps) {
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!sessionId) { setError('No session selected.'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    speakingService.getById(sessionId)
      .then(res => setSession(res.session))
      .catch(err => setError(err.message || 'Failed to load session.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sessionId]);

  if (loading) return <div className="content"><LoadingSpinner label="Loading your report…" /></div>;
  if (error || !session) return (
    <div className="content">
      <ErrorState message={error || 'Session not found.'} onRetry={load} />
    </div>
  );

  const report = session.report;

  return (
    <div className="content">
      <div className="report-hero">
        <span className="eyebrow">SPEAKING REPORT</span>
        <div className="report-score-circle">
          {report?.overall_score ?? '—'}
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>
          {report ? 'AI Evaluation Complete' : 'Session Saved'}
        </h2>
        <p style={{ color: '#9998a9', fontSize: 13, maxWidth: 420, margin: '0 auto' }}>
          {session.topic}
        </p>
        <div className="report-meta">
          <span><Clock size={13} />{formatDuration(session.duration_seconds)}</span>
          <span><BookOpen size={13} />{session.word_count} words</span>
          <span>{formatDate(session.created_at)}</span>
        </div>
      </div>

      {report && (
        <div className="report-grid">
          <section className="panel report-section">
            <h3>Score Breakdown</h3>
            <ScoreBar label="Fluency" value={report.fluency} />
            <ScoreBar label="Clarity" value={report.clarity} />
            <ScoreBar label="Vocabulary" value={report.vocabulary} color="#9b91ff" />
            <ScoreBar label="Content Relevance" value={report.content_relevance} color="#68aa88" />

            {report.feedback && (
              <>
                <h3 style={{ marginTop: 20 }}>Overall Feedback</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#555' }}>{report.feedback}</p>
              </>
            )}
          </section>

          <section className="panel report-section">
            {report.strengths?.length > 0 && (
              <>
                <h3>Strengths</h3>
                <ul className="report-list">
                  {report.strengths.map((s, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} style={{ color: '#68aa88', flexShrink: 0 }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {report.improvements?.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>Areas to Improve</h3>
                <ul className="report-list">
                  {report.improvements.map((item, i) => (
                    <li key={i}>
                      <ArrowUpRight size={16} style={{ color: '#e18f4c', flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}

      {session.transcript && (
        <section className="panel report-section" style={{ marginTop: 18 }}>
          <h3>Your Transcript</h3>
          <div className="report-transcript">{session.transcript}</div>
        </section>
      )}

      <div className="report-actions">
        <button className="secondary" onClick={onBack}>
          Back to history
        </button>
        <button className="primary" onClick={onRetry}>
          Practice again <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
