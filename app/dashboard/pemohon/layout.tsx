'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, FileText, ClipboardList, ChevronRight, LogOut, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  {
    section: 'MENU UTAMA',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard/pemohon' },
    ],
  },
  {
    section: 'PENGAJUAN',
    items: [
      { icon: FileText, label: 'Entry Data', href: '/dashboard/pemohon/program/new' },
      { icon: ClipboardList, label: 'Data Management', href: '/dashboard/pemohon/data-management' },
    ],
  },
];

export default function PemohonLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isHydrated) return null;
  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>

      <style>{`
        .pemohon-nav-scroll::-webkit-scrollbar { width: 5px; }
        .pemohon-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .pemohon-nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 10px; }
        .pemohon-nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        .pemohon-nav-item:hover .pemohon-nav-icon { transform: scale(1.06); }
      `}</style>

      {/* ─── SIDEBAR BACKDROP ─── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* ─── SIDEBAR PANEL ─── */}
      <aside
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
          height: 'calc(100vh - 20px)',
          width: '276px',
          background: 'linear-gradient(190deg, #14295a 0%, #0f2044 55%, #0c1a37 100%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.06)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(calc(-100% - 20px))',
          transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: sidebarOpen
            ? '8px 0 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)'
            : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(160deg, #3b7bf5 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: '0.95rem',
              boxShadow: '0 3px 10px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}>S</div>
            <div style={{ lineHeight: 1.25 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>SIKA</p>
              <p style={{
                color: '#5d9dfa', fontSize: '0.6rem', margin: 0,
                fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                Surat Izin Kerja Aman
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 9,
              padding: '7px', cursor: 'pointer', color: '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* User Info */}
        <div style={{
          margin: '14px 14px 6px',
          padding: '12px 13px',
          borderRadius: 13,
          background: 'rgba(255,255,255,0.045)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(160deg, #2c4a82 0%, #1e3a6e 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7db4ff', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 0 0 2px #2563EB, 0 0 0 4px rgba(37,99,235,0.18)',
            }}>
              {user.name?.charAt(0) ?? 'U'}
            </div>
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #142a57',
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.jabatan}
            </p>
          </div>
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Bell size={15} color="#64748b" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="pemohon-nav-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navItems.map((group) => (
            <div key={group.section} style={{ marginBottom: '8px' }}>
              <p style={{
                color: '#3a4a6b', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.12em', padding: '10px 22px 6px', margin: 0,
              }}>
                {group.section}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 12px' }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.label}
                      className="pemohon-nav-item"
                      onClick={() => { setSidebarOpen(false); router.push(item.href); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '9px 12px',
                        borderRadius: 11,
                        background: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
                        boxShadow: isActive ? '0 0 0 1px rgba(59,123,245,0.3), 0 4px 14px rgba(37,99,235,0.18)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: isActive ? '#a8c8ff' : '#8b96ab',
                        fontSize: '0.83rem', fontWeight: isActive ? 600 : 500,
                        textAlign: 'left',
                        transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#8b96ab';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span
                        className="pemohon-nav-icon"
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          background: isActive ? 'linear-gradient(160deg, #3b7bf5 0%, #2563EB 100%)' : 'transparent',
                          color: isActive ? '#fff' : 'inherit',
                          transition: 'transform 0.18s ease',
                        }}
                      >
                        <item.icon size={15} />
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {isActive && <ChevronRight size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px 12px' }}>
          <button
            onClick={() => { setSidebarOpen(false); router.push('#'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: 11, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#8b96ab', fontSize: '0.83rem', fontWeight: 500, textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b96ab'; }}
          >
            <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={15} />
            </span> 
            <span>Pengaturan</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: 11, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#f87171', fontSize: '0.83rem', fontWeight: 500, textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171'; }}
          >
            <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={15} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── TRIGGER BUTTON (global, floating) ─── */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          top: 14,
          left: 16,
          zIndex: 30,
          background: '#fff',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: 9,
          color: '#475569',
          display: sidebarOpen ? 'none' : 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          transition: 'background 0.15s, box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; }}
      >
        <Menu size={20} />
      </button>

      {/* ─── PAGE CONTENT ─── */}
      {children}
    </div>
  );
}