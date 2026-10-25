import React, { useState, useEffect, useRef } from 'react';
import { Mic2, Play, ArrowRight, Sparkles, Mic, MicOff } from 'lucide-react';
import { speakingService } from '../services/speakingService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { User, View } from '../types';
import { formatDuration, countWords } from '../lib/utils';

interface PracticePageProps {
  user: User;
  notify: (msg: string) => void;
  onComplete: (sessionId: string) => void;
}

const CATEGORIES = ['Technology', 'Education', 'Society', 'Environment', 'Career'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export function PracticePage({ user: _user, notify, onComplete }: PracticePageProps) {
  const [category, setCategory] = useState('Technology');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [topic, setTopic] = useState('');
  const [topicCategory, setTopicCategory] = useState('Technology');
  const [topicDifficulty, setTopicDifficulty] = useState('Intermediate');
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [started, setStarted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<number | null>(null);

  const {
    isSupported,
    isListening,
    transcript: speechTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Merge speech transcript into typed text
  useEffect(() => {
    if (speechTranscript) {
      setTypedText(prev => (prev + ' ' + speechTranscript).trim());
      resetTranscript();
    }
  }, [speechTranscript, resetTranscript]);

  useEffect(() => {
    if (started) {
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  const handleGenerateTopic = async () => {
    setLoadingTopic(true);
    try {
      const res = await speakingService.getTopic(category, difficulty);
      setTopic(res.topic);
      setTopicCategory(res.category);
      setTopicDifficulty(res.difficulty);
      notify('Topic ready for your practice');
    } catch {
      notify('Could not fetch topic. Using a sample.');
      setTopic('Is technology making us more connected or more alone?');
      setTopicCategory(category);
      setTopicDifficulty(difficulty);
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleStart = () => {
    if (!topic) {
      setTopic('Is technology making us more connected or more alone?');
      setTopicCategory(category);
      setTopicDifficulty(difficulty);
    }
    setStarted(true);
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSubmit = async () => {
    const combinedText = typedText.trim();
    if (!combinedText) {
      notify('Add a transcript before submitting');
      return;
    }
    if (isListening) stopListening();
    setSubmitting(true);
    try {
      const res = await speakingService.createSession({
        topic: topic || 'Open speaking practice',
        category: topicCategory,
        difficulty: topicDifficulty,
        transcript: combinedText,
        durationSeconds: seconds,
        wordCount: countWords(combinedText),
      });
      if (timerRef.current) clearInterval(timerRef.current);
      setStarted(false);
      setTypedText('');
      setSeconds(0);
      setTopic('');
      notify(`Session saved — evaluating your response…`);
      onComplete(res.session.id);
    } catch (err: any) {
      notify(err.message || 'Failed to save session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content practice-layout">
      <section className="panel practice-card">
        <div className="practice-top">
          <div>
            <span className="eyebrow">SPEAKING LAB · AI POWERED</span>
            <h2>Find your voice.</h2>
            <p>
              Choose a topic, start the timer, and speak or type your response. Your
              session is evaluated by AI.
            </p>
          </div>
          <div className="practice-number">01</div>
        </div>
        <div className="filters">
          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={started}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Difficulty
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={started}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          <button
            className="secondary"
            onClick={handleGenerateTopic}
            disabled={loadingTopic || started}
          >
            <Sparkles size={16} />
            {loadingTopic ? 'Generating…' : 'Generate topic'}
          </button>
        </div>

        {topic && (
          <div className="topic-box">
            <span className="topic-label">YOUR TOPIC</span>
            <h3>{topic}</h3>
            <span className="difficulty">{topicDifficulty.toUpperCase()}</span>
          </div>
        )}

        <div className="record-box">
          {!started ? (
            <>
              <div className="mic-circle">
                <Mic2 />
              </div>
              <h3>Ready when you are</h3>
              <p>
                Click start to begin your timed session. Speak or type your response.
              </p>
              <button className="primary" onClick={handleStart}>
                <Play size={16} fill="currentColor" /> Start timer
              </button>
            </>
          ) : (
            <>
              <div className="recording">
                <span />
                Practice timer{' '}
                <b>{formatDuration(seconds)}</b>
              </div>

              {!isSupported && (
                <div className="speech-unsupported">
                  ⚠ Speech recognition is not supported in this browser. Please type your response below.
                </div>
              )}

              {isSupported && (
                <div className="speech-controls">
                  <button
                    className={`mic-btn ${isListening ? 'listening' : 'idle'}`}
                    onClick={handleMicToggle}
                    title={isListening ? 'Stop recording' : 'Start recording'}
                    type="button"
                  >
                    {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  <span style={{ fontSize: 12, color: '#888' }}>
                    {isListening ? 'Listening… click to stop' : 'Click to start speaking'}
                  </span>
                </div>
              )}

              {speechError && (
                <p style={{ color: '#e07272', fontSize: 12, textAlign: 'center', margin: '6px 0' }}>{speechError}</p>
              )}

              {(interimTranscript) && (
                <div className="transcript-live">
                  <span className="transcript-interim">{interimTranscript}</span>
                </div>
              )}

              <textarea
                autoFocus={!isSupported}
                placeholder="Type or edit your response here…"
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                style={{ minHeight: 90 }}
              />
              <small className="word-counter">
                {countWords(typedText)} words
              </small>
              <button className="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Evaluating…' : 'Stop & evaluate session'} <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </section>

      <aside className="practice-aside">
        <div className="tip-card">
          <Sparkles size={18} />
          <h3>A little tip</h3>
          <p>
            Don't aim for perfect. Aim for clear. Take a breath before you begin
            and let your ideas land.
          </p>
        </div>
        <div className="panel mini-panel">
          <span className="eyebrow">THIS SESSION</span>
          <div>
            <b>2 min</b>
            <small>suggested duration</small>
          </div>
          <div>
            <b>∞</b>
            <small>retakes available</small>
          </div>
        </div>
      </aside>
    </div>
  );
}
