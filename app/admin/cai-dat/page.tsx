import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { AdminMetricsSettings } from '../../../components/AdminMetricsSettings';
import { DashboardShell } from '../../../components/DashboardShell';
import { getWorkspaceAccess, requireAdmin } from '../../../lib/server-auth';

export const metadata: Metadata = {
  title: 'Cài đặt số liệu | Nhà Đẹp Chất',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminMetricsPage() {
  const session = await requireAdmin('/admin/cai-dat');
  const access = await getWorkspaceAccess(session.user.id);
  return <DashboardShell name={session.user.name} admin seller={access.seller}>
    <div className="dashboard-heading metrics-page-heading">
      <div>
        <p className="eyebrow">QUẢN TRỊ</p>
        <h1>Cài đặt số liệu</h1>
        <p>Chọn số thống kê thật hoặc số hiển thị thủ công ngoài website.</p>
      </div>
      <BarChart3 aria-hidden />
    </div>
    <AdminMetricsSettings />
  </DashboardShell>;
}
