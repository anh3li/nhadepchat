'use client';
import {useSiteRouter} from './useSiteRouter';

import { FormEvent, useState } from 'react';

import { authClient } from '../lib/auth-client';

export function ChangePasswordForm() {
  const router = useSiteRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get('currentPassword') || '');
    const newPassword = String(form.get('newPassword') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (newPassword.length < 12) return setError('Mật khẩu mới phải có ít nhất 12 ký tự.');
    if (newPassword.length > 128) return setError('Mật khẩu mới không được vượt quá 128 ký tự.');
    if (newPassword === currentPassword) return setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
    if (newPassword !== confirmPassword) return setError('Hai lần nhập mật khẩu mới chưa khớp.');

    setBusy(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.');
      return;
    }

    await authClient.signOut();
    router.replace('/dang-nhap?changed=1&returnTo=%2Ftai-khoan');
  }

  return <form className="auth-form compact" onSubmit={submit}>
    <label>Mật khẩu hiện tại
      <input name="currentPassword" type="password" required minLength={8} maxLength={128} autoComplete="current-password" disabled={busy}/>
    </label>
    <label>Mật khẩu mới
      <input name="newPassword" type="password" required minLength={12} maxLength={128} autoComplete="new-password" disabled={busy}/>
      <small>Tối thiểu 12 ký tự. Nên dùng mật khẩu riêng và trình quản lý mật khẩu.</small>
    </label>
    <label>Nhập lại mật khẩu mới
      <input name="confirmPassword" type="password" required minLength={12} maxLength={128} autoComplete="new-password" disabled={busy}/>
    </label>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="form-submit" disabled={busy}>{busy?'Đang đổi mật khẩu…':'Đổi mật khẩu'}</button>
  </form>;
}
