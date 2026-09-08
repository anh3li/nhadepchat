/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Better Auth client responses are narrowed at runtime.
'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Camera, LogOut, ShieldCheck } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';
import { optimizeImageToWebp } from '../lib/image-optimization';
import { SafeImage } from './SafeImage';

type Props={name:string;email:string;role:string;seller?:boolean;avatarUrl?:string|null};

export function AccountPanel({name,email,role,seller=false,avatarUrl}:Props){
  const router=useRouter(),input=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState(avatarUrl||''),[avatarFile,setAvatarFile]=useState<File|null>(null),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const initials=name.split(' ').filter(Boolean).slice(-2).map(x=>x[0]).join('').toUpperCase()||'TK';
  async function chooseAvatar(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(!file)return;setBusy(true);setError('');try{const optimized=await optimizeImageToWebp(file,{maxDimension:640,maxBytes:512*1024,quality:.84});setAvatarFile(optimized);setPreview(current=>{if(current.startsWith('blob:'))URL.revokeObjectURL(current);return URL.createObjectURL(optimized)})}catch(reason){setError(reason instanceof Error?reason.message:'Không thể xử lý ảnh đại diện.')}finally{setBusy(false)}}
  async function update(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setMessage('');try{const data=new FormData(event.currentTarget),result=await authClient.updateUser({name:String(data.get('name')).trim()});if(result.error)throw new Error(result.error.message||'Không thể cập nhật tên hiển thị.');if(avatarFile){const form=new FormData();form.set('avatar',avatarFile);const response=await fetch('/api/marketplace/avatar',{method:'POST',body:form}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'Không thể cập nhật ảnh đại diện.');setAvatarFile(null);setPreview(current=>{if(current.startsWith('blob:'))URL.revokeObjectURL(current);return `${payload.url}?v=${Date.now()}`})}setMessage('Đã lưu thay đổi tài khoản.');router.refresh()}catch(reason){setError(reason instanceof Error?reason.message:'Không thể cập nhật tài khoản.')}finally{setBusy(false)}}
  async function logout(){await authClient.signOut();router.push('/');router.refresh()}
  return <section className="account-card content-card">
    <div className="account-intro"><div className="account-avatar">{preview?<SafeImage src={preview} alt="Ảnh đại diện"/>:<span>{initials}</span>}<button type="button" onClick={()=>input.current?.click()} aria-label="Chọn ảnh đại diện" title="Chọn ảnh đại diện"><Camera size={17}/></button></div><div><h2>Thông tin cá nhân</h2><p>Cập nhật tên và ảnh hiển thị trên hồ sơ KTS/người bán.</p><input ref={input} hidden type="file" accept=".jpg,.jpeg,.png,.webp" onChange={chooseAvatar}/><button type="button" className="avatar-change" disabled={busy} onClick={()=>input.current?.click()}>{busy?'Đang tối ưu ảnh…':'Đổi ảnh đại diện'}</button><small>Ảnh tự động nén và chuyển sang WEBP · ảnh gốc tối đa 20MB</small></div></div>
    <form className="account-form" onSubmit={update}><label>Tên hiển thị<input name="name" defaultValue={name} required minLength={2} maxLength={80}/></label><label>Email tài khoản<input value={email} disabled/><small>Email đăng nhập không thể đổi tại đây.</small></label>{error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}<button className="form-submit" disabled={busy}>{busy?'Đang lưu…':'Lưu thay đổi'}</button></form>
    <div className="account-actions"><div><span className="role-badge"><ShieldCheck size={16}/>{role==='admin'?'Quản trị viên':seller?'Người bán':'Thành viên'}</span><p>Các mục hồ sơ, bản vẽ đã lưu, bảo mật và khu vực bán hàng được quản lý thống nhất trong menu bên trái.</p></div></div>
    <div className="account-danger"><div><b>Đăng xuất khỏi tài khoản</b><span>Bạn sẽ cần đăng nhập lại để tiếp tục quản lý hồ sơ.</span></div><button type="button" onClick={logout}><LogOut size={17}/>Đăng xuất</button></div>
  </section>;
}
