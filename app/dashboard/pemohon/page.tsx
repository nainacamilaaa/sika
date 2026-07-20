'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Phone, Printer, ChevronDown } from 'lucide-react';

export default function DashboardPemohon() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center" style={{ paddingLeft: '40px' }}>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition"
            >
              <div
                className="flex items-center justify-center rounded-full text-white text-sm font-semibold"
                style={{ width: 36, height: 36, backgroundColor: '#003DA5' }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500 leading-tight">{user.jabatan}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <img
            src="/logosika.svg"
            alt="SIKA"
            className="h-9 object-contain"
          />
          <div className="w-px h-8 bg-gray-200" />
          <img
            src="/logopertaminagasfull.svg"
            alt="Pertamina Gas"
            className="h-8 object-contain"
          />
        </div>
      </header>
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 64px)',
          backgroundImage: 'url(/dashboard.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          zIndex: 10,
        }}>
          <h1
            className="font-bold text-white mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            Selamat Datang, {user.name}!
          </h1>
          <p className="text-white" style={{ fontSize: '1.50rem', opacity: 0.92, marginBottom: '24px' }}>
            Kelola pengajuan pekerjaan Anda di sini.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/pemohon/program/new')}
              style={{
                padding: '12px 36px',
                borderRadius: '9999px',
                backgroundColor: '#2563EB',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #2563EB',
                minWidth: '160px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              Entry Data
            </button>
            <button
              onClick={() => router.push('/dashboard/pemohon/data-management')}
              style={{
                padding: '12px 36px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #fff',
                minWidth: '160px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.color = '#1d4ed8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#fff';
              }}
            >
              Data Management
            </button>
          </div>
        </div>
      </section>

      {/* Aksen garis atas footer */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #1a56b0 0%, #eab308 50%, #1a56b0 100%)' }} />

      <footer style={{ backgroundColor: '#1a56b0' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div
            style={{
              flex: 1,
              padding: '44px 40px 36px',
              display: 'grid',
              gridTemplateColumns: '1.4fr 0.8fr 1fr 1fr 1fr',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '0 0 10px' }}>
                Kantor Pusat
              </p>
              <p style={{ color: '#bfdbfe', fontSize: '0.82rem', lineHeight: '1.8', margin: 0 }}>
                Grha Pertamina,<br />
                Pertamax Tower, Lantai 20 – 23<br />
                Jl. Medan Merdeka Timur No. 11-13<br />
                Jakarta Pusat 10110
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '0 0 14px' }}>
                Kontak
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bfdbfe', fontSize: '0.82rem', marginBottom: '8px' }}>
                <Phone size={13} />
                <span>+62 21 31906825</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bfdbfe', fontSize: '0.82rem' }}>
                <Printer size={13} />
                <span>+62 21 31906831</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '0 0 14px' }}>
                Informasi
              </p>
              {['Tentang SIKA', 'Panduan Pengguna', 'FAQ'].map(item => (
                <a key={item} href="#" style={{ display: 'block', color: '#bfdbfe', fontSize: '0.82rem', marginBottom: '10px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bfdbfe')}
                >
                  {item}
                </a>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '0 0 14px' }}>
                Layanan
              </p>
              {['Job Safety Analysis (JSA)', 'Sistem Kerja (SIKA)', 'Monitoring Aktivitas'].map(item => (
                <a key={item} href="#" style={{ display: 'block', color: '#bfdbfe', fontSize: '0.82rem', marginBottom: '10px', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bfdbfe')}
                >
                  {item}
                </a>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '0 0 14px' }}>
                Dukungan
              </p>
              {[
                { label: 'support@pertaminagas.com', href: 'mailto:support@pertaminagas.com' },
                { label: 'Hubungi Kami', href: '#' },
                { label: 'Kebijakan Privasi', href: '#' },
              ].map(item => (
                <a key={item.label} href={item.href} style={{ display: 'block', color: '#bfdbfe', fontSize: '0.82rem', marginBottom: '10px', textDecoration: 'none', wordBreak: 'break-all' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bfdbfe')}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#005FA2',
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 32px',
            }}
          >
            <img
              src="/logopertaminagas.svg"
              alt="Pertamina Gas"
              style={{ width: '160px', objectFit: 'contain' }}
              onError={e => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.nextElementSibling as HTMLElement;
                if (fb) fb.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: 2 }}>PG</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1, textAlign: 'center' }}>PERTAMINA GAS</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }} />
        <div style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#bfdbfe', fontSize: '0.76rem', margin: 0 }}>
            © {new Date().getFullYear()} PT Pertamina Gas. Hak Cipta Dilindungi.
          </p>
          <p style={{ color: '#bfdbfe', fontSize: '0.76rem', margin: 0 }}>
            Sistem Izin Kerja (SIKA) - HSSE 
          </p>
        </div>
      </footer>
    </div>
  );
}