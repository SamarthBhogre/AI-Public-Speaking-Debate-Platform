import React, { useEffect, useState } from 'react';
import { ArrowRight, MessagesSquare, Mic2, Clock3 } from 'lucide-react';
import { speakingService } from '../services/speakingService';
import { debateService } from '../services/debateService';
import { DebateSession, SpeakingSession } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatDuration } from '../lib/utils';

type Item = { id:string; kind:'speaking'|'debate'; topic:string; date:string; score:number; duration:string };
export function HistoryPage({onOpenSpeaking,onOpenDebate}:{onOpenSpeaking:(id:string)=>void;onOpenDebate:(id:string)=>void}){
  const [items,setItems]=useState<Item[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=()=>{setLoading(true);setError('');Promise.all([speakingService.getHistory(),debateService.getHistory()]).then(([s,d])=>{
    const combined:Item[]=[
      ...s.sessions.map((x:SpeakingSession)=>({id:x.id,kind:'speaking' as const,topic:x.topic,date:x.created_at,score:x.report?.overall_score||0,duration:formatDuration(x.duration_seconds)})),
      ...d.sessions.map((x:DebateSession)=>({id:x.id,kind:'debate' as const,topic:x.topic,date:x.created_at,score:x.score||0,duration:'—'})),
    ];
    combined.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());setItems(combined);
  }).catch(e=>setError(e.message||'Could not load your sessions.')).finally(()=>setLoading(false));};
  useEffect(load,[]);
  if(loading)return <div className="content"><LoadingSpinner label="Loading your session history…"/></div>;
  if(error)return <div className="content"><ErrorState message={error} onRetry={load}/></div>;
  return <div className="content"><div className="history-hero"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Every attempt<br/><em>counts.</em></h2></div><div className="history-count"><strong>{items.length}</strong><span>saved sessions</span></div></div><section className="panel recent history-panel"><div className="section-title"><h3>All sessions</h3><span className="trend">From your account</span></div>{!items.length?<EmptyState icon={Clock3} title="No sessions yet" description="Complete a speaking or debate practice and it will appear here."/>:<div className="session-list">{items.map(item=><button className="session history-row" key={item.kind+item.id} onClick={()=>item.kind==='speaking'?onOpenSpeaking(item.id):onOpenDebate(item.id)}><div className={'session-type '+(item.kind==='speaking'?'purple':'orange')}>{item.kind==='speaking'?<Mic2 size={17}/>:<MessagesSquare size={17}/>}</div><div className="session-info"><b>{item.topic}</b><small>{formatDate(item.date)} · {item.duration}</small></div><strong className="score">{item.score||'—'}</strong><span className="score-label">score</span><ArrowRight className="row-arrow" size={16}/></button>)}</div>}</section></div>;
}
