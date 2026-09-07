/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Better Auth client responses are narrowed at runtime.
'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Camera, LogOut, ShieldCheck } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';

type Props={name:string;email:string;role:string;seller?:boolean;avatarUrl?:string|null};

export function AccountPanel({name,email,role,seller=false,avatarUrl}:Props){
  const router=useRouter(),input=useRef<HTMLInputElement>(null);
  const [preview,setPreview]=useState(avatarUrl||''),[avatarFile,setAvatarFile]=useState<File|null>(null),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const initials=name.split(' ').filter(Boolean).slice(-2).map(x=>x[0]).join('').toUpperCase()||'TK';
  function chooseAvatar(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){setError('Ảnh đại diện tối đa 5MB.');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.');return}setError('');setAvatarFile(file);setPreview(URL.createObjectURL(file));}
  async function update(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');setMessage('');try{const data=new FormData(event.currentTarget),result=await authClient.updateUser({name:String(data.get('name')).trim()});if(result.error)throw new Error(result.error.message||'Không thể cập nhật tên hiển thị.');if(avatarFile){const form=new FormData();form.set('avatar',avatarFile);const response=await fetch('/api/marketplace/avatar',{method:'POST',body:form}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'Không thể cập nhật ảnh đại diện.');setAvatarFile(null);setPreview(`${payload.url}?v=${Date.now()}`)}setMessage('Đã lưu thay đổi tài khoản.');router.refresh()}catch(reason){setError(reason instanceof Error?reason.message:'Không thể cập nhật tài khoản.')}finally{setBusy(false)}}
  async function logout(){await authClient.signOut();router.push('/');router.refresh()}
  return <section className="account-card content-card">
    <div className="account-intro"><div className="account-avatar">{preview?<img src={preview} alt="Ảnh đại diện"/>:<span>{initials}</span>}<button type="button" onClick={()=>input.current?.click()} aria-label="Chọn ảnh đại diện" title="Chọn ảnh đại diện"><Camera size={17}/></button></div><div><h2>Thông tin cá nhân</h2><p>Cập nhật tên và ảnh hiển thị trên hồ sơ KTS/người bán.</p><input ref={input} hidden type="file" accept=".jpg,.jpeg,.png,.webp" onChange={chooseAvatar}/><button type="button" className="avatar-change" onClick={()=>input.current?.click()}>Đổi ảnh đại diện</button><small>JPG, PNG hoặc WEBP · tối đa 5MB</small></div></div>
    <form className="account-form" onSubmit={update}><label>Tên hiển thị<input name="name" defaultValue={name} required minLength={2} maxLength={80}/></label><label>Email tài khoản<input value={email} disabled/><small>Email đăng nhập không thể đổi tại đây.</small></label>{error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}<button className="form-submit" disabled={busy}>{busy?'Đang lưu…':'Lưu thay đổi'}</button></form>
    <div className="account-actions"><div><span className="role-badge"><ShieldCheck size={16}/>{role==='admin'?'Quản trị viên':seller?'Người bán':'Thành viên'}</span><p>Các mục hồ sơ, bản vẽ đã lưu, bảo mật và khu vực bán hàng được quản lý thống nhất trong menu bên trái.</p></div></div>
    <div className="account-danger"><div><b>Đăng xuất khỏi tài khoản</b><span>Bạn sẽ cần đăng nhập lại để tiếp tục quản lý hồ sơ.</span></div><button type="button" onClick={logout}><LogOut size={17}/>Đăng xuất</button></div>
  </section>;
}
