'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '../lib/auth-client';

function authError(message?: string) {
  const normalized=(message||'').toLowerCase();
  if(normalized.includes('invalid email or password')||normalized.includes('invalid password')) return 'Email hoặc mật khẩu không chính xác.';
  if(normalized.includes('user already exists')||normalized.includes('already registered')) return 'Email này đã được đăng ký.';
  if(normalized.includes('too many')) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  return message||'Không thể xác thực. Vui lòng thử lại.';
}

export function AuthForm({mode}:{mode:'login'|'register'}){const router=useRouter(),params=useSearchParams(),[error,setError]=useState(''),[loading,setLoading]=useState(false);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError('');const data=new FormData(e.currentTarget),email=String(data.get('email')),password=String(data.get('password')),name=String(data.get('name')||'');const result=mode==='register'?await authClient.signUp.email({email,password,name}):await authClient.signIn.email({email,password});setLoading(false);if(result.error){setError(authError(result.error.message));return}router.push(params.get('returnTo')||'/tai-khoan');router.refresh()}return <form className="auth-form" onSubmit={submit}>{mode==='register'&&<label>Họ và tên<input name="name" required minLength={2} autoComplete="name"/></label>}<label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Mật khẩu<input name="password" type="password" required minLength={mode==='register'?12:8} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'}/><small>{mode==='register'?'Tối thiểu 12 ký tự.':'Nhập mật khẩu hiện tại của bạn.'}</small></label>{params.get('changed')==='1'&&<p className="form-success" role="status">Đã đổi mật khẩu. Vui lòng đăng nhập lại.</p>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="form-submit" disabled={loading}>{loading?'Đang xử lý…':mode==='register'?'Tạo tài khoản':'Đăng nhập'}</button>{mode==='login'&&<a className="forgot-link" href="/quen-mat-khau">Quên mật khẩu?</a>}<p>{mode==='register'?'Đã có tài khoản?':'Chưa có tài khoản?'} <a href={mode==='register'?'/dang-nhap':'/dang-ky'}>{mode==='register'?'Đăng nhập':'Đăng ký'}</a></p></form>}
