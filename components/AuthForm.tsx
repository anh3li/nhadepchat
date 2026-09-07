'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '../lib/auth-client';
import { authReturnPath } from '../lib/auth-return-path';
import Link from 'next/link';

function authError(message?: string) {
  const normalized = (message || '').toLowerCase();
  if (normalized.includes('invalid email or password') || normalized.includes('invalid password')) return 'Email hoặc mật khẩu không chính xác.';
  if (normalized.includes('already exists') || normalized.includes('already registered')) return 'Email này đã được đăng ký. Vui lòng đăng nhập.';
  if (normalized.includes('too many')) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  if (normalized.includes('password')) return 'Mật khẩu chưa đáp ứng yêu cầu. Vui lòng kiểm tra lại.';
  return 'Không thể xác thực. Vui lòng kiểm tra thông tin và thử lại.';
}

export function AuthForm({ mode, googleEnabled = false }: { mode: 'login' | 'register'; googleEnabled?: boolean }) {
  const router = useRouter(), params = useSearchParams();
  const [error, setError] = useState(''), [loading, setLoading] = useState(false), [visible, setVisible] = useState(false);
  const register = mode === 'register';
  async function googleLogin() {
    if (loading) return;
    setLoading(true); setError('');
    const target = authReturnPath(params.get('returnTo'));
    try {
      const result = await authClient.signIn.social({
        provider: 'google', callbackURL: target,
        errorCallbackURL: `/dang-nhap?socialError=1&returnTo=${encodeURIComponent(target)}`,
      });
      if (result.error) setError('Không thể mở đăng nhập Google. Vui lòng thử lại.');
    } catch { setError('Không kết nối được Google. Vui lòng kiểm tra mạng và thử lại.'); }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim(), password = String(data.get('password')), name = String(data.get('name') || '').trim();
    try {
      const result = register ? await authClient.signUp.email({ email, password, name }) : await authClient.signIn.email({ email, password });
      if (result.error) { setError(authError(result.error.message)); return; }
      const safeTarget = authReturnPath(params.get('returnTo'));
      router.push(safeTarget); router.refresh();
    } catch { setError('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.'); }
    finally { setLoading(false); }
  }
  return <form className="auth-form" onSubmit={submit} aria-busy={loading}>
    {googleEnabled && <><button type="button" className="google-signin" disabled={loading} onClick={googleLogin}>Tiếp tục với Google</button><div className="auth-divider"><span>hoặc dùng email</span></div></>}
    {params.get('socialError') === '1' && <p className="form-error" role="alert">Đăng nhập Google chưa hoàn tất. Nếu email đã được đăng ký nhưng chưa xác minh, hãy đăng nhập bằng mật khẩu hiện có; hệ thống không tự gộp tài khoản chưa xác minh.</p>}
    {register && <label>Họ và tên<input name="name" required minLength={2} autoComplete="name" /></label>}
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Mật khẩu<span className="password-field"><input name="password" type={visible ? 'text' : 'password'} required minLength={register ? 12 : 8} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'} aria-describedby="password-help" /><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span><small id="password-help">{register ? 'Tối thiểu 12 ký tự. Nên dùng mật khẩu riêng cho tài khoản này.' : 'Nhập mật khẩu hiện tại của bạn.'}</small></label>
    {params.get('changed') === '1' && <p className="form-success" role="status">Đã đổi mật khẩu. Vui lòng đăng nhập lại.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="form-submit" disabled={loading}>{loading ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
    {!register && <Link className="forgot-link" href="/quen-mat-khau">Quên mật khẩu?</Link>}
    <p>{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link href={register ? '/dang-nhap' : '/dang-ky'}>{register ? 'Đăng nhập' : 'Đăng ký'}</Link></p>
  </form>;
}
