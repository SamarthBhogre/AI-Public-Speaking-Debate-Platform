import React, { useState } from 'react';
import { ArrowRight, Sparkles, Mic, MicOff, UserRound, MessagesSquare } from 'lucide-react';
import { debateService } from '../services/debateService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { User } from '../types';

interface DebatePageProps {
  user: User;
  notify: (msg: string) => void;
  onComplete: (sessionId: string) => void;
}

type DebatePhase = 'topic' | 'position' | 'round' | 'done';

export function DebatePage({ user: _user, notify, onComplete }: DebatePageProps) {
  const [phase, setPhase] = useState<DebatePhase>('topic');
  const [topic, setTopic] = useState('');
  const [forStance, setForStance] = useState('');
  const [againstStance, setAgainstStance] = useState('');
  const [position, setPosition] = useState<'FOR' | 'AGAINST' | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [round, setRound] = useState(1);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<{ prompt: string; ai: string }[]>([]);
  const [response, setResponse] = useState('');
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [awaitingEvaluation, setAwaitingEvaluation] = useState(false);

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

  // Merge speech into response
  React.useEffect(() => {
    if (speechTranscript) {
      setResponse(prev => (prev + ' ' + speechTranscript).trim());
      resetTranscript();
    }
  }, [speechTranscript, resetTranscript]);

  const handleGenerateTopic = async () => {
    setLoadingTopic(true);
    try {
      const res = await debateService.getTopic();
      setTopic(res.topic);
      setForStance(res.for_stance);
      setAgainstStance(res.against_stance);
      setPhase('position');
    } catch {
      // Fallback topic
      setTopic('Should AI be allowed to replace human teachers?');
      setForStance('AI can expand access and personalize learning.');
      setAgainstStance('Human connection is at the heart of teaching.');
      setPhase('position');
      notify('Using a sample debate topic.');
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleSelectPosition = async (pos: 'FOR' | 'AGAINST') => {
    setPosition(pos);
    setLoadingStart(true);
    try {
      const res = await debateService.startSession({ topic, position: pos });
      setSessionId(res.sessionId);
      setCurrentPrompt(res.openingPrompt);
      setRound(1);
      setAiResponses([]);
      setResponse('');
      setPhase('round');
    } catch (err: any) {
      notify(err.message || 'Failed to start debate session.');
      setPhase('position');
    } finally {
      setLoadingStart(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (awaitingEvaluation) { await completeEvaluation(); return; }
    if (!response.trim()) { notify('Write a response before continuing'); return; }
    if (isListening) stopListening();
    setLoadingResponse(true);
    try {
      const res = await debateService.respond({
        sessionId,
        roundNumber: round,
        studentResponse: response.trim(),
      });

      setAiResponses(prev => [...prev, { prompt: currentPrompt, ai: res.aiResponse }]);

      if (res.isLastRound) {
        setResponse('');
        setAwaitingEvaluation(true);
        await completeEvaluation();
      } else {
        setRound(r => r + 1);
        setCurrentPrompt(res.nextPrompt || '');
        setResponse('');
        notify(`Round ${round} done — develop your next point`);
      }
    } catch (err: any) {
      notify(err.message || 'Failed to submit response.');
    } finally {
      setLoadingResponse(false);
    }
  };

  const completeEvaluation = async () => {
    setLoadingResponse(true);
    try {
      await debateService.evaluate({ sessionId });
      notify('Debate evaluation complete');
      setPhase('done');
      onComplete(sessionId);
    } catch (err: any) {
      notify(err.message || 'Your rounds are saved. Retry the evaluation when ready.');
    } finally {
      setLoadingResponse(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const resetDebate = () => {
    setPhase('topic');
    setTopic('');
    setForStance('');
    setAgainstStance('');
    setPosition(null);
    setSessionId('');
    setRound(1);
    setAiResponses([]);
    setResponse('');
    setCurrentPrompt('');
    setAwaitingEvaluation(false);
  };

  return (
    <div className="content debate-layout">
      <section className="panel debate-main">
        <div className="debate-header">
          <div>
            <span className="eyebrow">
              {phase === 'topic' ? 'DEBATE ARENA' : `DEBATE ARENA · ROUND ${round} OF 3`}
            </span>
            <h2>{topic || 'AI Debate Arena'}</h2>
          </div>
          {phase === 'round' && (
            <div className="rounds">
              <i className={round >= 1 ? 'on' : ''} />
              <i className={round >= 2 ? 'on' : ''} />
              <i className={round >= 3 ? 'on' : ''} />
            </div>
          )}
        </div>

        {phase === 'topic' && (
          <div className="position-select">
            <h3>Ready to debate?</h3>
            <p>Generate a topic and choose your position to begin.</p>
            <div style={{ marginTop: 28 }}>
              <button className="primary" onClick={handleGenerateTopic} disabled={loadingTopic}>
                <Sparkles size={16} />
                {loadingTopic ? 'Generating topic…' : 'Generate debate topic'}
              </button>
            </div>
          </div>
        )}

        {phase === 'position' && (
          <div className="position-select">
            <h3>Choose your position</h3>
            <p>There are no wrong answers. Choose the side you want to defend.</p>
            {loadingStart ? (
              <p style={{ marginTop: 28, color: '#aaa', fontSize: 13 }}>Starting session…</p>
            ) : (
              <div>
                <button onClick={() => handleSelectPosition('FOR')}>
                  <span>FOR</span>
                  <b>{forStance}</b>
                  <ArrowRight />
                </button>
                <button onClick={() => handleSelectPosition('AGAINST')}>
                  <span>AGAINST</span>
                  <b>{againstStance}</b>
                  <ArrowRight />
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'round' && position && (
          <>
            <div className="position-pill">
              YOU ARE ARGUING <b>{position}</b>
            </div>

            {aiResponses.map((r, i) => (
              <div key={i}>
                <div className="argument ai">
                  <div className="bubble-icon"><Sparkles /></div>
                  <div>
                    <span>ROUND {i + 1} PROMPT</span>
                    <p>{r.prompt}</p>
                  </div>
                </div>
                <div className="argument ai" style={{ background: '#f9f8ff', marginTop: 8 }}>
                  <div className="bubble-icon" style={{ color: '#e18f4c', background: '#fff0e5' }}><Sparkles /></div>
                  <div>
                    <span style={{ color: '#e18f4c' }}>AI COUNTERARGUMENT</span>
                    <p>{r.ai}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="argument ai">
              <div className="bubble-icon"><Sparkles /></div>
              <div>
                <span>{round === 1 ? 'OPENING PROMPT' : `ROUND ${round} PROMPT`}</span>
                <p>{currentPrompt || 'Make your strongest case in one clear paragraph. Support your position with a practical example.'}</p>
              </div>
            </div>

            <div className="argument student">
              <div className="bubble-icon"><UserRound /></div>
              <div style={{ flex: 1 }}>
                <span>YOUR RESPONSE</span>

                {!awaitingEvaluation && !isSupported && (
                  <div className="speech-unsupported" style={{ marginTop: 10 }}>
                    ⚠ Speech recognition not supported. Type your response below.
                  </div>
                )}

                {!awaitingEvaluation && isSupported && (
                  <div className="speech-controls">
                    <button
                      className={`mic-btn ${isListening ? 'listening' : 'idle'}`}
                      onClick={handleMicToggle}
                      type="button"
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {isListening ? 'Listening…' : 'Click to speak'}
                    </span>
                  </div>
                )}

                {!awaitingEvaluation && speechError && <p style={{ color: '#e07272', fontSize: 11, margin: '4px 0' }}>{speechError}</p>}

                {!awaitingEvaluation && interimTranscript && (
                  <div className="transcript-live" style={{ marginTop: 8 }}>
                    <span className="transcript-interim">{interimTranscript}</span>
                  </div>
                )}

                {awaitingEvaluation ? <p style={{fontSize:12,color:'#777',margin:'14px 0'}}>All three rounds are saved. Generate your report when ready.</p> : <textarea
                  placeholder="Type your argument…"
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  disabled={loadingResponse}
                />}
                <button className="secondary" onClick={handleSubmitResponse} disabled={loadingResponse}>
                  <MessagesSquare size={16} />{' '}
                  {loadingResponse ? 'Working…' : (awaitingEvaluation ? 'Retry evaluation' : (round < 3 ? 'Submit response' : 'End debate & evaluate'))}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <aside className="debate-side">
        <div className="tip-card dark-tip">
          <MessagesSquare size={18} />
          <h3>Debate coach</h3>
          <p>
            Make one clear claim, support it with an example, then anticipate
            the other side.
          </p>
        </div>
        <div className="panel score-card">
          <span className="eyebrow">DEBATE ENERGY</span>
          <strong>
            {phase === 'round' ? `Round ${round} is live.` : phase === 'topic' ? 'Generate a topic to begin.' : 'Choose a position to begin.'}
          </strong>
          <div className="energy">
            <span style={{ width: `${phase === 'round' ? round * 33 : 0}%` }} />
          </div>
          <small>
            Three short rounds. Your work is saved after the final response.
          </small>
          {phase !== 'topic' && (
            <button className="secondary" style={{ marginTop: 12, fontSize: 11 }} onClick={resetDebate}>
              Start over
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
