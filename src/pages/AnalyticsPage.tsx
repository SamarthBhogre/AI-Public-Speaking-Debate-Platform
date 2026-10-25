import React, { useEffect, useState } from 'react';
import { BarChart3, Clock3, Mic2, Trophy } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsService, SpeakingAnalytics } from '../services/analyticsService';
import { AnalyticsOverview } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

function Stat({label,value,note,icon}:{label:string;value:string;note:string;icon:React.ReactNode}){
  return <div className="stat"><div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div><strong>{value}</strong><small>{note}</small></div>;
}

export function AnalyticsPage(){
  const [overview,setOverview]=useState<AnalyticsOverview|null>(null);
  const [speaking,setSpeaking]=useState<SpeakingAnalytics|null>(null);
  const [debatePoints,setDebatePoints]=useState<{date:string;score:number}[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=()=>{
    setLoading(true);setError('');
    Promise.all([analyticsService.getOverview(),analyticsService.getSpeaking(),analyticsService.getDebate()])
      .then(([summary,speech,debate])=>{
        setOverview(summary);setSpeaking(speech);
        setDebatePoints(debate.scoreOverTime.map(p=>({date:new Date(p.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}),score:Number(p.avg_score)})));
      })
      .catch(e=>setError(e.message||'Could not load analytics.'))
      .finally(()=>setLoading(false));
  };
  useEffect(load,[]);
  if(loading)return <div className="content"><LoadingSpinner label="Calculating your progress…"/></div>;
  if(error)return <div className="content"><ErrorState message={error} onRetry={load}/></div>;
  if(!overview||!speaking)return null;
  const speechPoints=speaking.scoreOverTime.map(p=>({date:new Date(p.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}),score:Number(p.avg_score)}));
  const scoreChart=(data:{date:string;score:number}[],title:string,description:string)=>(
    <section className="panel chart-panel big-chart" key={title}>
      <div className="section-title"><div><span className="eyebrow">{title}</span><h3>{description}</h3></div></div>
      {data.length?<div style={{width:'100%',height:250,marginTop:20}}><ResponsiveContainer><AreaChart data={data}>
        <defs><linearGradient id={title==='SPEAKING PERFORMANCE'?'speechFill':'debateFill'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={title==='SPEAKING PERFORMANCE'?'#7066f5':'#e18f4c'} stopOpacity={0.24}/><stop offset="95%" stopColor={title==='SPEAKING PERFORMANCE'?'#7066f5':'#e18f4c'} stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeef4"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#999'}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:11,fill:'#999'}} axisLine={false} tickLine={false}/><Tooltip/>
        <Area type="monotone" dataKey="score" stroke={title==='SPEAKING PERFORMANCE'?'#7066f5':'#e18f4c'} strokeWidth={3} fill={title==='SPEAKING PERFORMANCE'?'url(#speechFill)':'url(#debateFill)'}/>
      </AreaChart></ResponsiveContainer></div>:<EmptyState icon={BarChart3} title="Your chart is waiting" description="Complete a session to see your scores over time."/>}
    </section>
  );
  return <div className="content">
    <div className="analytics-grid">
      <Stat label="Average score" value={overview.totalSessions?String(Math.round(overview.averageScore)):'—'} note="Across completed sessions" icon={<BarChart3/>}/>
      <Stat label="Best score" value={overview.totalSessions?String(overview.bestScore):'—'} note="Personal best" icon={<Trophy/>}/>
      <Stat label="Total sessions" value={String(overview.totalSessions)} note="Speaking and debate" icon={<Clock3/>}/>
    </div>
    <div className="analytics-grid">
      <Stat label="Speaking average" value={overview.speakingAverage?String(Math.round(overview.speakingAverage)):'—'} note="Speaking sessions" icon={<Mic2/>}/>
      <Stat label="Debate average" value={overview.debateAverage?String(Math.round(overview.debateAverage)):'—'} note="Debate sessions" icon={<Trophy/>}/>
      <Stat label="Practice streak" value={overview.currentStreak?overview.currentStreak+' days':'—'} note={'Longest: '+overview.longestStreak+' days'} icon={<Clock3/>}/>
    </div>
    <div className="chart-stack">{scoreChart(speechPoints,'SPEAKING PERFORMANCE','Speaking score over time')}{scoreChart(debatePoints,'DEBATE PERFORMANCE','Debate score over time')}</div>
    <section className="panel breakdown-panel"><div className="section-title"><div><span className="eyebrow">PRACTICE MIX</span><h3>Performance by category</h3></div><span className="trend">Average speaking duration: {Math.floor(speaking.avgDuration/60)}m {speaking.avgDuration%60}s</span></div>
      {speaking.categoryBreakdown.length?<div className="breakdown-list">{speaking.categoryBreakdown.map(row=><div className="breakdown-row" key={row.category}><span>{row.category}</span><div className="breakdown-meter"><i style={{width:Math.max(4,Math.min(100,row.avg_score))+'%'}}/></div><b>{row.avg_score} avg · {row.count} {row.count===1?'session':'sessions'}</b></div>)}</div>:<EmptyState icon={Mic2} title="No speaking data yet" description="Complete a speaking session to see your category breakdown."/>}
      {speaking.difficultyBreakdown.length>0&&<div className="difficulty-breakdown"><h3>By difficulty</h3>{speaking.difficultyBreakdown.map(row=><div className="difficulty-chip" key={row.difficulty}><b>{row.difficulty}</b><span>{row.avg_score} average · {row.count} sessions</span></div>)}</div>}
    </section>
  </div>;
}
