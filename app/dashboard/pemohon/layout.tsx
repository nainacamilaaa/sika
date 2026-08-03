'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, Home, FileText, ClipboardList, ChevronRight, LogOut, Settings, Bell,
  CheckCircle2, XCircle, AlertTriangle, Info, Inbox, ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProgramStore } from '@/store/programStore';
import { getNotifications, type AppNotification, type NotifSeverity } from '@/lib/notifications';

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

const SEVERITY_STYLE: Record<NotifSeverity, { color: string; bg: string; icon: any }> = {
  success: { color: '#00954E', bg: '#ECFDF5', icon: CheckCircle2 },
  danger:  { color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
  warning: { color: '#B45309', bg: '#FFFBEB', icon: AlertTriangle },
  info:    { color: '#0E76BC', bg: '#EFF6FF', icon: Info },
};

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Kelompokkan notifikasi ke 3 keranjang waktu, urutan tetap terjaga (data
 * yang masuk sudah disortir terbaru dulu oleh getNotifications). */
function groupByDate(notifications: AppNotification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: { label: string; items: AppNotification[] }[] = [
    { label: 'Hari Ini', items: [] },
    { label: 'Kemarin', items: [] },
    { label: 'Lebih Awal', items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.timestamp);
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dOnly.getTime() === today.getTime()) groups[0].items.push(n);
    else if (dOnly.getTime() === yesterday.getTime()) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function PemohonLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const {
    submissions,
    approvalHistory,
    readNotificationIds,
    markNotificationRead,
    markAllNotificationsRead,
    openSubmission,
  } = useProgramStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'semua' | 'unread'>('semua');
  const notifPanelRef = useRef<HTMLDivElement>(null);

  // Halaman-halaman alur Entry Data (Program → SIKA → JSA → Detail) punya
  // header sendiri yang sudah padat (logo + step indicator), jadi bell
  // notifikasi fixed dari layout ini disembunyikan di sana — tidak
  // di-render sama sekali (bukan cuma display:none), jadi tidak bisa
  // diklik/muncul dengan cara apa pun selagi di halaman-halaman ini.
  const hideNotifBell =
    pathname.startsWith('/dashboard/pemohon/program/new') ||
    pathname.startsWith('/dashboard/pemohon/sika/new') ||
    pathname.startsWith('/dashboard/pemohon/jsa/new') ||
    pathname.startsWith('/dashboard/pemohon/jsa/detail');

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Tutup panel saat klik di luar area (backdrop transparan juga sudah
  // menangani ini, tapi ini jaga-jaga untuk keyboard/Escape).
  useEffect(() => {
    if (!notifOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [notifOpen]);

  const notifications = useMemo(
    () => getNotifications(submissions, approvalHistory),
    [submissions, approvalHistory]
  );
  const unreadCount = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;

  const visibleNotifications = useMemo(
    () =>
      notifTab === 'unread'
        ? notifications.filter((n) => !readNotificationIds.includes(n.id))
        : notifications,
    [notifications, notifTab, readNotificationIds]
  );
  const groupedNotifications = useMemo(() => groupByDate(visibleNotifications), [visibleNotifications]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleOpenNotification = (n: AppNotification) => {
    markNotificationRead(n.id);
    openSubmission(n.submissionId);
    setNotifOpen(false);
    setSidebarOpen(false);
    router.push('/dashboard/pemohon/jsa/detail');
  };

  const handleGoToDataManagement = () => {
    setNotifOpen(false);
    router.push('/dashboard/pemohon/data-management');
  };

  if (!isHydrated) return null;
  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>

      <style>{`
        .pemohon-nav-scroll::-webkit-scrollbar { width: 5px; }
        .pemohon-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .pemohon-nav-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        .pemohon-nav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        .pemohon-nav-item:hover .pemohon-nav-icon { transform: scale(1.06); }

        .pemohon-notif-scroll::-webkit-scrollbar { width: 5px; }
        .pemohon-notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .pemohon-notif-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 10px; }

        @keyframes pemohonNotifIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.25)',
            zIndex: 40, backdropFilter: 'blur(2px)',
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed', top: 10, left: 10,
          height: 'calc(100vh - 20px)', width: '276px',
          background: '#ffffff',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          borderRadius: 18, border: '1px solid #e5e7eb',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(calc(-100% - 20px))',
          transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: sidebarOpen ? '8px 0 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <img
              src="/logopertaminagasfull.svg"
              alt="Pertamina Gas"
              style={{ height: 50, objectFit: 'contain' }}
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 9,
              padding: '7px', cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{
          margin: '14px 14px 6px', padding: '12px 13px', borderRadius: 13,
          background: '#f8fafc', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(160deg, #2563EB 0%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 0 0 2px #fff, 0 0 0 4px rgba(37,99,235,0.15)',
            }}>
              {user.name?.charAt(0) ?? 'U'}
            </div>
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #ffffff',
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#0f172a', fontSize: '0.82rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.jabatan}
            </p>
          </div>
        </div>

        <nav className="pemohon-nav-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navItems.map((group) => (
            <div key={group.section} style={{ marginBottom: '8px' }}>
              <p style={{
                color: '#94a3b8', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.12em', padding: '10px 22px 6px', margin: 0,
              }}>
                {group.section}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 12px' }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <button
                      key={item.label}
                      className="pemohon-nav-item"
                      onClick={() => { setSidebarOpen(false); router.push(item.href); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '9px 12px', borderRadius: 11,
                        background: isActive ? '#eff6ff' : 'transparent',
                        boxShadow: isActive ? '0 0 0 1px #bfdbfe, 0 2px 8px rgba(37,99,235,0.08)' : 'none',
                        border: 'none', cursor: 'pointer',
                        color: isActive ? '#2563EB' : '#64748b',
                        fontSize: '0.83rem', fontWeight: isActive ? 600 : 500,
                        textAlign: 'left',
                        transition: 'background 0.18s ease, color 0.18s ease, transform 0.18s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#0f172a';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <span
                        className="pemohon-nav-icon"
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: isActive ? 'linear-gradient(160deg, #2563EB 0%, #1d4ed8 100%)' : '#f1f5f9',
                          color: isActive ? '#fff' : '#64748b',
                          transition: 'transform 0.18s ease',
                        }}
                      >
                        <item.icon size={15} />
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {isActive && <ChevronRight size={13} color="#2563EB" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #e5e7eb', padding: '10px 12px 12px' }}>
          <button
            onClick={() => { setSidebarOpen(false); router.push('#'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: 11, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#64748b', fontSize: '0.83rem', fontWeight: 500, textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#f1f5f9', borderRadius: 8, color: '#64748b' }}>
              <Settings size={15} />
            </span>
            <span>Pengaturan</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: 11, background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#ef4444', fontSize: '0.83rem', fontWeight: 500, textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
          >
            <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#fef2f2', borderRadius: 8, color: '#ef4444' }}>
              <LogOut size={15} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed', top: 18, left: 16, zIndex: 30,
          background: '#ffffff', border: '1px solid #e5e7eb', cursor: 'pointer',
          padding: '8px', borderRadius: 9, color: '#475569',
          display: sidebarOpen ? 'none' : 'flex', alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          transition: 'background 0.15s, box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; }}
      >
        <Menu size={20} />
      </button>

      {!hideNotifBell && (
        <div style={{ position: 'fixed', top: 20, right: 16, zIndex: 53 }}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifikasi"
            style={{
              position: 'relative',
              background: notifOpen ? '#eff6ff' : '#ffffff',
              border: `1px solid ${notifOpen ? '#bfdbfe' : '#e5e7eb'}`,
              cursor: 'pointer', padding: '8px', borderRadius: 9,
              color: notifOpen ? '#2563EB' : '#475569',
              display: 'flex', alignItems: 'center',
              boxShadow: notifOpen ? '0 2px 8px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.07)',
              transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                minWidth: 16, height: 16, borderRadius: 8,
                background: '#DC2626', color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', border: '2px solid #f1f5f9',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div
                onClick={() => setNotifOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: -1 }}
              />
              <div
                ref={notifPanelRef}
                style={{
                  position: 'absolute', top: 46, right: 0, width: 380,
                  maxHeight: '78vh', display: 'flex', flexDirection: 'column',
                  background: '#ffffff', borderRadius: 16, border: '1px solid #e5e7eb',
                  boxShadow: '0 20px 48px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.06)',
                  overflow: 'hidden', animation: 'pemohonNotifIn 0.16s ease-out',
                }}
              >
                {/* Header */}
                <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        Notifikasi
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                        {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(notifications.map((n) => n.id))}
                        style={{
                          background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
                          cursor: 'pointer', color: '#334155', fontSize: '0.68rem', fontWeight: 600,
                          padding: '6px 10px', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 12, background: '#f1f5f9', padding: 3, borderRadius: 9 }}>
                    {[
                      { key: 'semua' as const, label: 'Semua', count: notifications.length },
                      { key: 'unread' as const, label: 'Belum dibaca', count: unreadCount },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setNotifTab(t.key)}
                        style={{
                          flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                          cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          background: notifTab === t.key ? '#ffffff' : 'transparent',
                          color: notifTab === t.key ? '#0f172a' : '#64748b',
                          boxShadow: notifTab === t.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        {t.label}
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700,
                          color: notifTab === t.key ? '#2563EB' : '#94a3b8',
                          background: notifTab === t.key ? '#eff6ff' : '#e2e8f0',
                          borderRadius: 6, padding: '0 5px', minWidth: 16, textAlign: 'center',
                        }}>
                          {t.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* List */}
                <div className="pemohon-notif-scroll" style={{ overflowY: 'auto', flex: 1 }}>
                  {groupedNotifications.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '48px 20px', gap: 10,
                    }}>
                      <span style={{
                        width: 44, height: 44, borderRadius: 12, background: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
                      }}>
                        <Inbox size={20} />
                      </span>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                        {notifTab === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', maxWidth: 220 }}>
                        Pembaruan status SIKA/JSA dan pengingat revalidasi akan muncul di sini.
                      </p>
                    </div>
                  ) : (
                    groupedNotifications.map((group) => (
                      <div key={group.label}>
                        <p style={{
                          margin: 0, padding: '10px 18px 6px',
                          fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          background: '#fafbfc',
                        }}>
                          {group.label}
                        </p>
                        {group.items.map((n) => {
                          const isRead = readNotificationIds.includes(n.id);
                          const { color, bg, icon: Icon } = SEVERITY_STYLE[n.severity];
                          return (
                            <button
                              key={n.id}
                              onClick={() => handleOpenNotification(n)}
                              title={formatFullDate(n.timestamp)}
                              style={{
                                width: '100%', display: 'flex', gap: 11, textAlign: 'left',
                                padding: '11px 18px', border: 'none', borderBottom: '1px solid #f8fafc',
                                background: isRead ? '#ffffff' : '#f8fbff', cursor: 'pointer',
                                transition: 'background 0.12s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = isRead ? '#ffffff' : '#f8fbff'; }}
                            >
                              <span style={{
                                width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: bg, color,
                              }}>
                                <Icon size={15} />
                              </span>
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    fontSize: '0.79rem', fontWeight: isRead ? 500 : 700, color: '#0f172a',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>
                                    {n.title}
                                  </span>
                                  {!isRead && (
                                    <span style={{
                                      width: 6, height: 6, borderRadius: '50%',
                                      background: '#2563EB', flexShrink: 0,
                                    }} />
                                  )}
                                </span>
                                <span style={{
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden', fontSize: '0.72rem', color: '#64748b',
                                  marginTop: 2, lineHeight: 1.45,
                                }}>
                                  {n.message}
                                </span>
                                <span style={{ display: 'block', fontSize: '0.63rem', color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>
                                  {formatClock(n.timestamp)}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '10px 18px', borderTop: '1px solid #f1f5f9',
                  background: '#fafbfc',
                }}>
                  <button
                    onClick={handleGoToDataManagement}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#2563EB', fontSize: '0.74rem', fontWeight: 600, padding: '4px 0',
                    }}
                  >
                    Lihat semua di Data Management
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {children}
    </div>
  );
}