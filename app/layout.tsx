import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIKA – Sistem Informasi Kerja',
  description: 'Platform digital HSSE untuk pengelolaan JSA, Work Permit, dan monitoring aktivitas kerja.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}