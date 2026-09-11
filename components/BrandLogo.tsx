import Image from 'next/image';
import Link from './SiteLink';

type BrandLogoProps = {
  className?: string;
  subtitle?: string;
};

export function BrandLogo({ className = '', subtitle = 'THƯ VIỆN BẢN VẼ NHÀ ĐẸP' }: BrandLogoProps) {
  return (
    <Link className={`logo brand-logo ${className}`.trim()} href="/" aria-label="Nhà Đẹp Chất — về trang chủ">
      <Image className="logo-mark" src="/brand-mark.png" width={48} height={48} alt="" aria-hidden />
      <span className="logo-image-copy">
        <Image className="logo-wordmark" src="/brand-wordmark-name.png" width={900} height={133} alt="" aria-hidden />
        <small>{subtitle}</small>
      </span>
    </Link>
  );
}
