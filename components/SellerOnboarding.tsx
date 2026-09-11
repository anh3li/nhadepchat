'use client';
import {useSiteRouter} from './useSiteRouter';

import { FormEvent, useState } from 'react';

import { optimizeImageToWebp } from '../lib/image-optimization';

type ApiResult = { error?: string };

export function SellerOnboarding({ defaultName }: { defaultName: string }) {
  const router = useSiteRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const avatar = form.get('avatar');
    form.delete('avatar');
    let avatarUpload:File|null=null;
    if(avatar instanceof File&&avatar.size){try{avatarUpload=await optimizeImageToWebp(avatar,{maxDimension:640,maxBytes:512*1024,quality:.84})}catch(reason){setLoading(false);setError(reason instanceof Error?reason.message:'Không thể xử lý avatar.');return}}
    const entries = Object.fromEntries(form.entries());
    const body: Record<string, unknown> = {
      ...entries,
      experienceYears: entries.experienceYears ? Number(entries.experienceYears) : null,
    };
    const response = await fetch('/api/marketplace/profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json() as ApiResult;
    if (!response.ok) {
      setLoading(false);
      setError(data.error || 'Không thể tạo hồ sơ.');
      return;
    }
    if (avatarUpload) {
      const avatarForm = new FormData();
      avatarForm.set('avatar', avatarUpload);
      const avatarResponse = await fetch('/api/marketplace/avatar', { method: 'POST', body: avatarForm });
      if (!avatarResponse.ok) {
        const avatarData = await avatarResponse.json() as ApiResult;
        setLoading(false);
        setError(avatarData.error || 'Hồ sơ đã tạo nhưng chưa thể tải avatar.');
        return;
      }
    }
    router.push('/dashboard');
  }

  return <form className="onboarding-form" onSubmit={submit}>
    <div className="form-grid">
      <label className="wide">Avatar<input name="avatar" type="file" accept=".jpg,.jpeg,.png,.webp" /><small>Tự động nén và chuyển sang WEBP.</small></label>
      <label>Tên hiển thị<input name="displayName" defaultValue={defaultName} required /></label>
      <label>Bạn là ai?<select name="sellerType" required><option value="architect">Kiến trúc sư</option><option value="engineer">Kỹ sư</option><option value="interior_designer">Thiết kế nội thất</option><option value="contractor">Nhà thầu</option><option value="student">Sinh viên</option><option value="other">Khác</option></select></label>
      <label>Chức danh<input name="professionalTitle" placeholder="KTS chủ trì, Kỹ sư kết cấu…" required /></label>
      <label>Số năm kinh nghiệm<input name="experienceYears" type="number" min="0" max="80" /></label>
      <label>Đơn vị công tác<input name="company" /></label>
      <label>Tỉnh/thành<input name="location" /></label>
      <label className="wide">Website/portfolio<input name="website" type="url" placeholder="https://" /></label>
      <label className="wide">Giới thiệu<textarea name="bio" minLength={20} rows={6} required /></label>
    </div>
    {error && <p className="form-error">{error}</p>}
    <button className="form-submit" disabled={loading}>{loading ? 'Đang tạo hồ sơ…' : 'Hoàn thành và vào dashboard'}</button>
  </form>;
}
