import React from 'react';
import { UserRound } from 'lucide-react';
import { User } from '../types';
export function ProfilePage({user}:{user:User}){return <div className="content"><section className="panel profile-card"><div className="profile-avatar">{user.name.slice(0,2).toUpperCase()}</div><h2>{user.name}</h2><p>{user.email}</p><div className="profile-details"><span>Account type</span><b>Student</b><span>Member since</span><b>{new Date(user.created_at).toLocaleDateString()}</b></div><button className="secondary" type="button"><UserRound size={16}/> Account details</button></section></div>}
