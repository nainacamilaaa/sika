'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, FileText, ClipboardList, Shield, ChevronRight, LogOut, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  {
    section: 'MENU UTAMA',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard/pja' },
    ],
  },
  {
    section: 'WORK PERMIT',
    items: [
      { icon: FileText, label: 'Daftar Work Permit', href: '/dashboard/pja/daftar-work-permit' },
      { icon: ClipboardList, label: 'Review Work Permit', href: '/dashboard/pja/review-work-permit' },
    ],
  },
  {
    section: 'REVIEW',
    items: [
      { icon: Shield, label: 'Review JSA', href: '/dashboard/pja/review-jsa' },
      { icon: FileText, label: 'Data Management', href: '/dashboard/pja/data-management' },
    ],
  },
];

export default function PJALayout({ children }: { children: React.ReactNode }) {
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
          }}
        />
      )}

      {/* ─── SIDEBAR PANEL ─── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          backgroundColor: '#0f2044',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: sidebarOpen ? '4px 0 32px rgba(0,0,0,0.35)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              backgroundColor: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#fff', fontSize: '0.9rem',
            }}>S</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>SIKA</p>
              <p style={{ color: '#60a5fa', fontSize: '0.65rem', margin: 0 }}>Sistem Informasi Kerja</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6,
              padding: '6px', cursor: 'pointer', color: '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* User Info */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: '#1e3a6e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem',
            border: '2px solid #2563EB',
          }}>
            {user.name?.charAt(0) ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0 }}>{user.jabatan}</p>
          </div>
          <Bell size={15} color="#64748b" style={{ cursor: 'pointer', flexShrink: 0 }} />
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {navItems.map((group) => (
            <div key={group.section} style={{ marginBottom: '4px' }}>
              <p style={{
                color: '#334155', fontSize: '0.62rem', fontWeight: 700,
                letterSpacing: '0.1em', padding: '8px 20px 4px', margin: 0,
              }}>
                {group.section}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.label}
                    onClick={() => { setSidebarOpen(false); router.push(item.href); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 20px',
                      background: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                      cursor: 'pointer',
                      color: isActive ? '#60a5fa' : '#94a3b8',
                      fontSize: '0.83rem', fontWeight: isActive ? 600 : 400,
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <ChevronRight size={13} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 0' }}>
          <button
            onClick={() => { setSidebarOpen(false); router.push('#'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 20px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#94a3b8', fontSize: '0.83rem', textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            <Settings size={16} />
            <span>Pengaturan</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 20px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#f87171', fontSize: '0.83rem', textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fca5a5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#f87171')}
          >
            <LogOut size={16} />
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
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: 6,
          color: '#4b5563',
          display: sidebarOpen ? 'none' : 'flex',
          alignItems: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <Menu size={22} />
      </button>

      {/* ─── PAGE CONTENT ─── */}
      {children}
    </div>
  );
}
