import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { BarChart3, ChevronDown, Clock3, LayoutDashboard, LogOut, Menu, MessagesSquare, Mic2, Sun, X } from 'lucide-react';
import { Brand } from './components/Brand';
import { Toast } from './components/Toast';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PracticePage } from './pages/PracticePage';
import { DebatePage } from './pages/DebatePage';
import { SpeakingReportPage } from './pages/SpeakingReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { View } from './types';
import { debateService } from './services/debateService';

const LazyAnalyticsPage = React.lazy(() =>
  import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })),
);

const nav: [View, string, React.ComponentType<{size?:number}>][] = [
  ['dashboard','Dashboard',LayoutDashboard],['practice','Practice',Mic2],['debate','AI Debate',MessagesSquare],['history','History',Clock3],['analytics','Analytics',BarChart3],
];
function routeState(){const path=window.location.pathname;const speaking=path.match(/^\/speaking\/([^/]+)$/);const debate=path.match(/^\/debate\/([^/]+)$/);if(speaking)return {view:'speaking-report' as View,id:decodeURIComponent(speaking[1]),auth:false,mode:'login' as const};if(debate)return {view:'debate-report' as View,id:decodeURIComponent(debate[1]),auth:false,mode:'login' as const};const route:Record<string,View>={'/dashboard':'dashboard','/practice':'practice','/debate':'debate','/history':'history','/analytics':'analytics','/profile':'profile'};const mode=(path==='/signup'?'signup':'login') as 'login'|'signup';return {view:route[path]||'dashboard',id:null,auth:path==='/login'||path==='/signup',mode};}

function App(){
  const {user,loading,login,register,logout}=useAuth();
  const {toast,notify}=useToast();
  const [view,setView]=useState<View>(()=>routeState().view);
  const [authOpen,setAuthOpen]=useState(()=>routeState().auth);
  const [authMode,setAuthMode]=useState<'login'|'signup'>(()=>routeState().mode);
  const [mobileNav,setMobileNav]=useState(false);
  const [dark,setDark]=useState(false);
  const [reportId,setReportId]=useState<string|null>(()=>routeState().id);
  React.useEffect(()=>{const sync=()=>{const route=routeState();setView(route.view);setReportId(route.id);setAuthMode(route.mode);setAuthOpen(route.auth);};window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
  const navigate=(next:View)=>{const paths:Record<View,string>={dashboard:'/dashboard',practice:'/practice','speaking-report':reportId?'/speaking/'+encodeURIComponent(reportId):'/history',debate:'/debate','debate-report':reportId?'/debate/'+encodeURIComponent(reportId):'/history',history:'/history',analytics:'/analytics',profile:'/profile'};window.history.pushState({},'',paths[next]);setView(next);setMobileNav(false);};
  const openReport=(kind:'speaking'|'debate',id:string)=>{setReportId(id);const path=kind==='speaking'?'/speaking/'+encodeURIComponent(id):'/debate/'+encodeURIComponent(id);window.history.pushState({},'',path);setView(kind==='speaking'?'speaking-report':'debate-report');};
  const openAuth=(mode:'login'|'signup')=>{window.history.pushState({},'',mode==='login'?'/login':'/signup');setAuthMode(mode);setAuthOpen(true);};
  const closeAuth=()=>{window.history.pushState({},'','/');setAuthOpen(false);};
  const onAuthDone=()=>{setAuthOpen(false);navigate('dashboard');notify('Welcome to SpeakWell');};
  const onLogout=async()=>{try{await logout();notify('You have signed out');}catch(e){notify(e instanceof Error?e.message:'Could not sign out. Try again.');}finally{window.history.pushState({},'','/');setView('dashboard');}};
  if(loading)return <div className="startup-loading"><LoadingSpinner label="Loading SpeakWell…"/></div>;
  if(!user){const requiresAuth=window.location.pathname!=='/'&&!authOpen;return <><LandingPage onEnter={()=>openAuth('signup')} onLogin={()=>openAuth('login')}/>{(authOpen||requiresAuth)&&<AuthPage initialMode={authOpen?authMode:'login'} onClose={closeAuth} onDone={onAuthDone} onLogin={login} onRegister={register}/>}</>;}
  return <div className={dark?'app dark':'app'}>
    <aside className={mobileNav?'sidebar open':'sidebar'}><Brand/><div className="workspace"><div className="avatar">{user.name.slice(0,1).toUpperCase()}</div><div><b>{user.name}'s workspace</b><small>Student account</small></div><ChevronDown size={15}/></div><nav>{nav.map(([id,label,Icon])=><button key={id} className={view===id?'active':''} onClick={()=>navigate(id)}><Icon size={18}/>{label}{id==='practice'&&<i>New</i>}</button>)}</nav><div className="upgrade"><span className="eyebrow">YOUR NEXT STEP</span><b>Build your speaking habit</b><p>Every practice session adds to your progress.</p><button onClick={()=>navigate('analytics')}>View progress <BarChart3 size={14}/></button></div><button className="profile-nav" onClick={()=>navigate('profile')}><div className="avatar small">{user.name.slice(0,2).toUpperCase()}</div><span>{user.name}<small>View profile</small></span><ChevronDown size={14}/></button></aside>
    <main><header><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav?<X/>:<Menu/>}</button><div><span className="eyebrow">{view==='dashboard'?'Your personal practice space':'SpeakWell workspace'}</span><h1>{viewTitle(view)}</h1></div><div className="header-actions"><button className="icon-btn" onClick={()=>setDark(!dark)} aria-label="Toggle color theme"><Sun size={18}/></button><div className="avatar">{user.name.slice(0,2).toUpperCase()}</div><button className="icon-btn" onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div></header>
      {view==='dashboard'&&<DashboardPage user={user} onNavigate={navigate} notify={notify} onOpenSpeaking={id=>openReport('speaking',id)} onOpenDebate={id=>openReport('debate',id)}/>}
      {view==='practice'&&<PracticePage user={user} notify={notify} onComplete={id=>openReport('speaking',id)}/>}
      {view==='debate'&&<DebatePage user={user} notify={notify} onComplete={id=>openReport('debate',id)}/>}
      {view==='speaking-report'&&<SpeakingReportPage sessionId={reportId} onBack={()=>navigate('history')} onRetry={()=>navigate('practice')}/>}
      {view==='debate-report'&&<DebateReportPage sessionId={reportId} onBack={()=>navigate('history')} onRetry={()=>navigate('debate')}/>}
      {view==='history'&&<HistoryPage onOpenSpeaking={id=>openReport('speaking',id)} onOpenDebate={id=>openReport('debate',id)}/>}
      {view==='analytics'&&<React.Suspense fallback={<div className="content"><LoadingSpinner label="Opening analytics…"/></div>}><LazyAnalyticsPage/></React.Suspense>}
      {view==='profile'&&<ProfilePage user={user}/>}
    </main>
    {mobileNav&&<button className="nav-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}{toast&&<Toast message={toast}/>}
  </div>;
}

function viewTitle(view:View){return ({dashboard:'Dashboard',practice:'Speaking practice','speaking-report':'Speaking report',debate:'AI debate arena','debate-report':'Debate report',history:'Session history',analytics:'Your analytics',profile:'Profile settings'} as Record<View,string>)[view];}

function DebateReportPage({sessionId,onBack,onRetry}:{sessionId:string|null;onBack:()=>void;onRetry:()=>void}){
 const [data,setData]=React.useState<any>(null),[error,setError]=React.useState(''),[loading,setLoading]=React.useState(true);
 React.useEffect(()=>{let active=true;if(!sessionId){setError('No debate selected.');setLoading(false);return;}setLoading(true);debateService.getById(sessionId).then(r=>{if(active)setData(r.session);}).catch(e=>{if(active)setError(e.message||'Could not load debate report.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[sessionId]);
 if(loading)return <div className="content"><LoadingSpinner label="Loading debate report…"/></div>;
 if(error||!data)return <div className="content"><section className="panel report-section"><h3>Report unavailable</h3><p>{error}</p><button className="secondary" onClick={onBack}>Back to history</button></section></div>;
 return <div className="content"><section className="report-hero"><span className="eyebrow">DEBATE REPORT · {data.position}</span><div className="report-score-circle">{data.report?.overall_score||data.score||'—'}</div><h2 style={{fontSize:22}}>Debate complete</h2><p style={{color:'#9998a9',fontSize:13}}>{data.topic}</p><p className="report-feedback">{data.report?.feedback||data.feedback||'Your debate was saved. Keep supporting your claims with specific examples and clear rebuttals.'}</p></section>{data.report&&<section className="panel report-section"><h3>Performance breakdown</h3>{[['Argument quality',data.report.argument_quality],['Relevance',data.report.relevance],['Rebuttal quality',data.report.rebuttal_quality],['Clarity',data.report.clarity]].map(([label,value]:any)=><div className="debate-metric" key={label}><span>{label}</span><b>{value}/100</b></div>)}<div className="debate-feedback-lists"><div><h3>Strengths</h3>{data.report.strengths?.map((x:string,i:number)=><p key={i}>✓ {x}</p>)}</div><div><h3>Suggestions</h3>{data.report.suggestions?.map((x:string,i:number)=><p key={i}>↗ {x}</p>)}</div></div></section>}<section className="panel report-section"><h3>Round by round</h3>{(data.rounds||[]).map((r:any)=><div className="argument student" key={r.id}><div><span>ROUND {r.round_number}</span><p><b>Prompt:</b> {r.prompt}</p><p><b>Your response:</b> {r.student_response}</p>{r.ai_response&&<p><b>Counterargument:</b> {r.ai_response}</p>}</div></div>)}</section><div className="report-actions"><button className="secondary" onClick={onBack}>Back to history</button><button className="primary" onClick={onRetry}>Debate again</button></div></div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
