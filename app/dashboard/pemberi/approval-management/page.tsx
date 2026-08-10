'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, FileText, Search, Filter,
  CheckCircle, XCircle, Clock, AlertCircle, ClipboardCheck, Loader2,
  History, Calendar, CalendarDays, ChevronDown,
  RefreshCcw, X, ArrowUpDown,
} from 'lucide-react';
import { useProgramStore, getNomorSika } from '@/store/programStore';
import type { ApprovalStatus, PerubahanStatus } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import {
  ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Sector,
} from 'recharts';

/* ============================================================
   BOLD PERTAMINA GAS PALETTE
   merah #E31E24 · kuning emas #F2A900 · hijau #00954E
   biru #0E76BC · navy #1B2A4A · abu #4B5568 / #8A94A6
============================================================ */

const STATUS_BADGE: Record<ApprovalStatus, { label: string; bg: string; icon: any }> = {
  draft:    { label: 'Draft',        bg: '#8A94A6', icon: AlertCircle },
  request:  { label: 'Perlu Review', bg: '#0E76BC', icon: Clock },
  waiting:  { label: 'Menunggu',     bg: '#F2A900', icon: Clock },
  approved: { label: 'Disetujui',    bg: '#00954E', icon: CheckCircle },
  rejected: { label: 'Ditolak',      bg: '#E31E24', icon: XCircle },
};

function StatusPill({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.draft;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center h-5 leading-none gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      <Icon size={10} strokeWidth={3} className="shrink-0" />
      {cfg.label}
    </span>
  );
}

// Status gabungan dari SUDUT PANDANG PEMBERI saja (SIKA + JSA yang mereka
// putuskan sendiri). Sengaja dinamai beda dari getOverallStatus di
// programStore.ts (yang menggabungkan Pemberi + PJA, dipakai di sisi
// pemohon) supaya tidak tertukar — dua-duanya sama-sama valid, cuma beda
// sudut pandang.
const getPemberiStatus = (sikaSt: ApprovalStatus, jsaSt: ApprovalStatus): ApprovalStatus => {
  if (sikaSt === 'rejected' || jsaSt === 'rejected') return 'rejected';
  if (sikaSt === 'approved' && jsaSt === 'approved') return 'approved';
  if (sikaSt === 'approved' || jsaSt === 'approved') return 'waiting';
  if (sikaSt === 'request' || jsaSt === 'request') return 'request';
  return 'draft';
};

// Selisih hari dari hari ini ke tanggal berakhir SIKA. Negatif = sudah lewat.
// null = tidak ada tanggal berlaku yang valid untuk dihitung.
// Dipakai oleh filter "Masa Berlaku SIKA" — jauh lebih relevan untuk Pemberi
// Kerja daripada filter status (yang sudah tercakup lewat tab Semua/Pending)
// karena ini membantu menangkap SIKA yang mau/sudah kedaluwarsa sebelum jadi masalah.
const getDaysUntilExpiry = (tanggalBerakhirSIKA: string): number | null => {
  if (!tanggalBerakhirSIKA || tanggalBerakhirSIKA === '-' || isNaN(new Date(tanggalBerakhirSIKA).getTime())) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(tanggalBerakhirSIKA);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const MASA_BERLAKU_LABEL: Record<string, string> = {
  kedaluwarsa: 'Sudah Kedaluwarsa',
  '7hari': '≤ 7 Hari Lagi',
  '30hari': '≤ 30 Hari Lagi',
};

const OPSI_LOKASI = [
  'Kantor Pusat',
  'Operation North Sumatera Area',
  'Operation Rokan Area',
  'Operation Dumai Area',
  'Operation Central Sumatera Area',
  'Operation South Sumatera Area',
  'Operation West Java Area',
  'Operation East Java Area',
  'Operation Kalimantan Area',
  'Project Management',
];

const SIFAT_OPTIONS = ['Normal', 'Proyek', 'T/A', 'Emergency'];

/* ============================================================
   REVALIDASI MASUK
   Pengajuan perubahan data (sertifikat/pekerja baru, dll) yang dikirim
   pemohon lewat "Kirim Konfirmasi Revalidasi" di Detail Program, dan
   perlu ditinjau Pemberi Kerja. Datanya diambil langsung dari
   submission.perubahanStatus / catatanPerubahan di store — bukan state
   lokal — supaya approve/revisi di sini benar-benar tersimpan dan
   terlihat balik di sisi pemohon.

   Proses approval revalidasi HANYA ada di halaman ini (Approval
   Management) — sengaja tidak diduplikasi di halaman Review per-submission
   (/dashboard/pemberi/review/[id]), supaya cuma ada satu tempat untuk
   memutuskan.
============================================================ */

const REVALIDASI_BADGE: Record<PerubahanStatus, { label: string; bg: string; icon: any } | null> = {
  none:      null,
  menunggu:  { label: 'Menunggu Review', bg: '#F2A900', icon: Clock },
  disetujui: { label: 'Disetujui',       bg: '#00954E', icon: CheckCircle },
  // Bukan "Ditolak" — perubahan dikembalikan ke pemohon untuk dilengkapi
  // lagi, bukan ditutup permanen. Ikonnya juga sengaja RefreshCcw (bukan
  // XCircle) supaya kebaca sebagai "perlu diputar ulang", bukan "selesai/mati".
  revisi:    { label: 'Perlu Revisi',    bg: '#E31E24', icon: RefreshCcw },
};

interface PemberiRow {
  id: string;
  namaProgram: string;
  satKerja: string;
  noJSA: string;
  tanggalJSA: string;
  noSIKA: string;
  tanggalBerakhirSIKA: string;
  lokasi: string;
  pelaksana: string;
  sifatPekerjaan: string;
  sikaStatus: ApprovalStatus;
  jsaStatus: ApprovalStatus;
  perubahanStatus: PerubahanStatus;
  catatanRevisiPerubahan: string | null;
  catatanPerubahan: string | null;
  updatedAt?: string;
}

function RevalidasiCell({
  row,
  onReview,
}: {
  row: PemberiRow;
  onReview: () => void;
}) {
  if (row.perubahanStatus === 'none') {
    return <span className="text-[10px] text-gray-300 italic">Belum ada</span>;
  }
  const cfg = REVALIDASI_BADGE[row.perubahanStatus]!;
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col gap-1 items-start">
      <span
        className="inline-flex items-center h-5 leading-none gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-white shadow-sm"
        style={{ background: cfg.bg }}
      >
        <Icon size={10} strokeWidth={3} className="shrink-0" />
        {cfg.label}
      </span>
      {row.perubahanStatus === 'menunggu' && (
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-2.5 py-1 transition shadow-sm"
        >
          <ClipboardCheck size={11} /> Review
        </button>
      )}
      {row.perubahanStatus !== 'menunggu' && (
        <button
          onClick={onReview}
          className="text-[10px] font-medium text-blue-600 hover:underline"
        >
          Lihat detail
        </button>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: PerubahanStatus }) {
  const cfg = REVALIDASI_BADGE[status];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center h-5 leading-none gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      <Icon size={10} strokeWidth={3} className="shrink-0" />
      {cfg.label}
    </span>
  );
}

function RevalidasiMasukModal({
  row,
  onClose,
  onSetujui,
  onRevisi,
}: {
  row: PemberiRow;
  onClose: () => void;
  onSetujui: () => void;
  onRevisi: (catatan: string) => void;
}) {
  const [mode, setMode] = useState<'lihat' | 'revisi'>('lihat');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  const tanggalLabel = row.updatedAt
    ? new Date(row.updatedAt).toLocaleDateString('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : '-';

  const handleSetujui = () => {
    setLoading(true);
    onSetujui();
  };

  const handleKirimRevisi = () => {
    if (!catatan.trim()) return;
    setLoading(true);
    onRevisi(catatan.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}
        >
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">Review Konfirmasi Revalidasi</p>
            <p className="text-[10px] text-white/70 font-medium">
              {row.namaProgram} &middot; {tanggalLabel}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="px-6 py-4 space-y-4">

            <div className="flex items-center gap-2">
              <StatusChip status={row.perubahanStatus} />
              <span className="text-xs font-semibold text-blue-600">{row.noSIKA}</span>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-bold mb-1.5">
                Catatan dari Pemohon
              </p>
              <div className="border border-gray-100 rounded-xl bg-gray-50/60 px-4 py-3 text-xs text-gray-700 leading-relaxed">
                {row.catatanPerubahan?.trim() ? row.catatanPerubahan : (
                  <span className="text-gray-400 italic">Tidak ada catatan tambahan.</span>
                )}
              </div>
            </div>

            {row.perubahanStatus === 'revisi' && row.catatanRevisiPerubahan && (
              <div>
                <p className="text-[11px] uppercase tracking-wide font-bold mb-1.5" style={{ color: '#946200' }}>
                  Catatan Revisi Sebelumnya
                </p>
                <div className="border rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ borderColor: '#F2A90055', background: '#F2A90014', color: '#7a5200' }}>
                  {row.catatanRevisiPerubahan}
                </div>
              </div>
            )}

            {mode === 'revisi' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  Catatan Revisi
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan apa yang perlu dilengkapi/diperbaiki pemohon..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 resize-none"
                  style={{ borderColor: '#F2A90080' }}
                />
              </div>
            )}

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Tinjau perubahan data (sertifikat/pekerja baru, dll) yang diajukan pemohon lewat halaman
              Detail Program sebelum menyetujui. Data lengkap SIKA &amp; JSA yang sudah diperbarui bisa
              dilihat lewat tombol "Review" di baris pengajuan ini.
              Kalau ada yang perlu dilengkapi, kirim catatan revisi agar pemohon bisa menindaklanjuti —
              SIKA &amp; JSA yang sudah aktif tidak terpengaruh selama proses ini.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/60 shrink-0">
          {mode === 'lihat' && row.perubahanStatus === 'menunggu' && (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition disabled:opacity-40"
              >
                Tutup
              </button>
              <button
                onClick={() => setMode('revisi')}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition border disabled:opacity-40"
                style={{ borderColor: '#F2A900', color: '#946200' }}
              >
                <RefreshCcw size={13} strokeWidth={2.5} />
                Minta Revisi
              </button>
              <button
                onClick={handleSetujui}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition text-white shadow-sm disabled:opacity-60"
                style={{ background: '#00954E' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} strokeWidth={2.5} />}
                Setujui Revalidasi
              </button>
            </>
          )}
          {mode === 'revisi' && (
            <>
              <button
                onClick={() => setMode('lihat')}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition disabled:opacity-40"
              >
                Kembali
              </button>
              <button
                onClick={handleKirimRevisi}
                disabled={loading || !catatan.trim()}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition text-white shadow-sm ${
                  !catatan.trim() ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{ background: '#F2A900' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} strokeWidth={2.5} />}
                Kirim Catatan Revisi
              </button>
            </>
          )}
          {mode === 'lihat' && row.perubahanStatus !== 'menunggu' && (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RIWAYAT / MONITORING TIMELINE
   Direkonstruksi dari field status yang sudah ada di submission
   (bukan log kejadian per-detik). Kalau butuh jejak audit lengkap
   (siapa & kapan tepatnya tiap perubahan terjadi), lihat halaman
   Audit Trail Persetujuan (memakai approvalHistory dari store).
============================================================ */

type TimelineState = 'done' | 'current' | 'rejected' | 'revisi' | 'pending';

function timelineForRow(row: PemberiRow) {
  const steps: { label: string; done: boolean; state: TimelineState }[] = [];
  const overall = getPemberiStatus(row.sikaStatus, row.jsaStatus);

  steps.push({ label: 'Pengajuan dibuat (Draft)', done: true, state: 'done' });

  steps.push({
    label: 'Diajukan untuk Review',
    done: overall !== 'draft',
    state: overall === 'draft' ? 'pending' : 'done',
  });

  if (overall === 'rejected') {
    steps.push({ label: 'Ditolak Pemberi Kerja', done: true, state: 'rejected' });
  } else {
    steps.push({
      label: 'Menunggu Keputusan SIKA/JSA',
      done: overall === 'waiting' || overall === 'approved',
      state: overall === 'request' ? 'current' : overall === 'draft' ? 'pending' : 'done',
    });
    steps.push({
      label: 'Disetujui Penuh (SIKA & JSA)',
      done: overall === 'approved',
      state: overall === 'approved' ? 'done' : overall === 'waiting' ? 'current' : 'pending',
    });
  }

  if (row.perubahanStatus !== 'none') {
    steps.push({
      label:
        row.perubahanStatus === 'menunggu'
          ? 'Revalidasi diajukan, menunggu review'
          : row.perubahanStatus === 'disetujui'
          ? 'Revalidasi disetujui'
          : 'Revalidasi perlu direvisi',
      done: row.perubahanStatus !== 'menunggu',
      state:
        row.perubahanStatus === 'menunggu'
          ? 'current'
          : row.perubahanStatus === 'revisi'
          ? 'revisi'
          : 'done',
    });
  }

  return steps;
}

function TimelineDot({ state }: { state: TimelineState }) {
  const map = {
    done: { bg: '#00954E', ring: '#00954E33' },
    current: { bg: '#0E76BC', ring: '#0E76BC33' },
    rejected: { bg: '#E31E24', ring: '#E31E2433' },
    revisi: { bg: '#F2A900', ring: '#F2A90033' },
    pending: { bg: '#C7CDD6', ring: '#C7CDD633' },
  } as const;
  const cfg = map[state];
  return (
    <span
      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
      style={{ background: cfg.bg, boxShadow: `0 0 0 4px ${cfg.ring}` }}
    />
  );
}

function RiwayatModal({ row, onClose }: { row: PemberiRow; onClose: () => void }) {
  const steps = timelineForRow(row);
  const tanggalLabel = row.updatedAt
    ? new Date(row.updatedAt).toLocaleDateString('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2c3e63 100%)' }}
        >
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">Riwayat &amp; Monitoring Status</p>
            <p className="text-[10px] text-white/70 font-medium">
              {row.namaProgram} &middot; {row.noSIKA}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <TimelineDot state={s.state} />
                  {i < steps.length - 1 && (
                    <span className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: 18 }} />
                  )}
                </div>
                <div className="pb-1">
                  <p
                    className={`text-xs font-semibold ${
                      s.state === 'pending' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {s.label}
                  </p>
                  {s.state === 'current' && (
                    <p className="text-[10px] text-blue-500 mt-0.5">Sedang berjalan</p>
                  )}
                  {s.state === 'revisi' && (
                    <p className="text-[10px] mt-0.5" style={{ color: '#946200' }}>Menunggu pemohon melengkapi</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
            Terakhir diperbarui: {tanggalLabel}. Timeline ini disusun dari status SIKA, JSA, dan
            revalidasi yang tercatat saat ini. Untuk jejak audit lengkap per-kejadian (siapa & kapan
            persisnya), lihat halaman Audit Trail Persetujuan.
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end bg-gray-50/60 shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER CHIP — dipakai di baris "Filter aktif" supaya pemberi bisa
   lihat sekilas filter apa yang lagi nyala dan hapus satu-satu, tanpa
   harus buka ulang panel filter. Pola umum di tabel data corporate.
============================================================ */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-medium pl-2.5 pr-1.5 py-1 rounded-full shadow-sm">
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
      >
        <X size={9} />
      </button>
    </span>
  );
}

/* ============================================================
   STATISTIK & TREN
   NOTE: Pie "Distribusi Status" dan tren 6 bulan SENGAJA masih pakai
   data dummy untuk sekarang (biar bentuk chart-nya bisa dicek dulu).
   Rincian per lokasi di bawahnya tetap pakai data asli dari
   submissions. Kalau sudah siap, ganti statusChartData & trendData
   balik ke agregasi dari `rows`/`scopedRows` seperti pola yang dipakai
   di rincian lokasi.
============================================================ */

type TimeFilterType = 'hari' | 'minggu' | 'bulan' | 'tahun' | 'custom';

const timeFilterLabels: Record<TimeFilterType, string> = {
  hari: 'Hari Ini',
  minggu: 'Minggu Ini',
  bulan: 'Bulan Ini',
  tahun: 'Tahun Ini',
  custom: 'Custom Range',
};

function filterRowsByTime(
  rows: PemberiRow[],
  filter: TimeFilterType,
  customRange?: { start: string; end: string }
): PemberiRow[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return rows.filter((row) => {
    if (!row.updatedAt) return true;
    const date = new Date(row.updatedAt);
    if (isNaN(date.getTime())) return true;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (filter) {
      case 'hari':
        return d.getTime() === today.getTime();
      case 'minggu': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
      }
      case 'bulan':
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      case 'tahun':
        return d.getFullYear() === today.getFullYear();
      case 'custom': {
        if (!customRange?.start || !customRange?.end) return true;
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59);
        return d >= start && d <= end;
      }
      default:
        return true;
    }
  });
}

const renderActiveSlice = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius} outerRadius={outerRadius + 7}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} cornerRadius={6}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))' }}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 9} outerRadius={outerRadius + 11}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} opacity={0.35}
      />
    </g>
  );
};

function PieTooltip({ active, payload, total }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
  return (
    <div className="bg-white/95 backdrop-blur px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 min-w-30">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.color }} />
        <span className="text-xs font-bold text-gray-800">{d.name}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-lg font-extrabold text-gray-900">{d.value}</span>
        <span className="text-[10px] text-gray-400 font-medium">· {pct}%</span>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="bg-white/95 backdrop-blur px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 min-w-37.5">
      <p className="text-xs font-extrabold text-gray-800 mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.filter((p: any) => p.value > 0).map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-bold text-gray-800">{p.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
        <span className="text-gray-400 font-medium">Total</span>
        <span className="font-extrabold text-gray-900">{total}</span>
      </div>
    </div>
  );
}

function StatistikDashboard({ rows }: { rows: PemberiRow[] }) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('bulan');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [filterAreaChart, setFilterAreaChart] = useState('');

  const timeFilteredRows = useMemo(
    () => filterRowsByTime(rows, timeFilter, customRange),
    [rows, timeFilter, customRange]
  );

  // DUMMY sementara — lihat catatan di atas komponen ini.
  const statusChartData = useMemo(() => {
    return [
      { name: 'Disetujui', value: 14, color: '#00954E' },
      { name: 'Proses',    value: 6,  color: '#0E76BC' },
      { name: 'Ditolak',   value: 2,  color: '#E31E24' },
      { name: 'Draft',     value: 3,  color: '#8A94A6' },
    ];
  }, []);

  const pieTotal = useMemo(() => statusChartData.reduce((s, d) => s + d.value, 0), [statusChartData]);

  // DUMMY sementara — lihat catatan di atas komponen ini.
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonth = new Date().getMonth();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      data.push({
        month: months[idx],
        approved: Math.floor(Math.random() * 20) + 5,
        proses: Math.floor(Math.random() * 15) + 3,
        rejected: Math.floor(Math.random() * 8) + 1,
        draft: Math.floor(Math.random() * 10) + 2,
      });
    }
    return data;
  }, []);

  const lokasiListData = useMemo(() => {
    const scope = filterAreaChart ? [filterAreaChart] : OPSI_LOKASI;
    return scope.map((l) => {
      const rowsDiArea = timeFilteredRows.filter((r) => r.lokasi === l);
      const base = { lokasi: l, approved: 0, proses: 0, rejected: 0, draft: 0, total: rowsDiArea.length };
      rowsDiArea.forEach((r) => {
        const st = getPemberiStatus(r.sikaStatus, r.jsaStatus);
        if (st === 'approved') base.approved++;
        else if (st === 'request' || st === 'waiting') base.proses++;
        else if (st === 'rejected') base.rejected++;
        else base.draft++;
      });
      return base;
    }).filter((d) => d.total > 0 || filterAreaChart === d.lokasi);
  }, [timeFilteredRows, filterAreaChart]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100" style={{ background: 'linear-gradient(90deg, #ffffff 0%, #f4f9fb 100%)' }}>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-9 rounded-full" style={{ background: 'linear-gradient(180deg, #E31E24 0%, #F2A900 50%, #00954E 100%)' }} />
          <div>
            <span className="text-gray-900 font-bold text-base tracking-tight">Statistik &amp; Tren Pengajuan</span>
            {filterAreaChart && (
              <p className="text-[11px] mt-0.5 font-semibold" style={{ color: '#1B75BC' }}>{filterAreaChart}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white hover:bg-gray-50 transition shadow-sm"
            >
              <Calendar size={14} />
              {timeFilterLabels[timeFilter]}
              {timeFilter === 'custom' && customRange.start && customRange.end && (
                <span className="text-[10px] text-blue-600 font-medium">
                  {customRange.start} s/d {customRange.end}
                </span>
              )}
              <ChevronDown size={12} className="text-gray-400" />
            </button>
            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                {(['hari', 'minggu', 'bulan', 'tahun'] as TimeFilterType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setTimeFilter(key); setIsTimeDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition flex items-center gap-2 ${
                      timeFilter === key ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600'
                    }`}
                  >
                    <CalendarDays size={14} />
                    {timeFilterLabels[key]}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setShowCustomRange(!showCustomRange); setIsTimeDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition flex items-center gap-2 text-gray-600"
                >
                  <Calendar size={14} />
                  Custom Range
                </button>
                {showCustomRange && (
                  <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                    />
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => { setTimeFilter('custom'); setShowCustomRange(false); setIsTimeDropdownOpen(false); }}
                      className="w-full bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      Terapkan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <select
            value={filterAreaChart}
            onChange={(e) => setFilterAreaChart(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-sky-300 w-48 shadow-sm"
          >
            <option value="">Semua Area</option>
            {OPSI_LOKASI.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6 grid grid-cols-4 gap-6">
        {/* Pie 1/4 */}
        <div className="col-span-1 border border-gray-100 rounded-xl p-4 flex flex-col bg-linear-to-b from-white to-gray-50/40">
          <p className="text-xs font-bold text-gray-700 mb-1">Distribusi Status</p>
          <p className="text-[10px] text-gray-400 mb-2">{filterAreaChart || 'Total keseluruhan pengajuan'}</p>
          {statusChartData.length === 0 ? (
            <div className="flex-1 h-52 flex items-center justify-center text-xs text-gray-300">Belum ada data</div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {statusChartData.map((entry, idx) => (
                      <radialGradient key={idx} id={`pemberiPieGrad${idx}`} cx="35%" cy="35%" r="70%">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={72}
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="#fff"
                    strokeWidth={2}
                    activeShape={renderActiveSlice}
                    animationBegin={0}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {statusChartData.map((entry, idx) => (
                      <Cell key={idx} fill={`url(#pemberiPieGrad${idx})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip total={pieTotal} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -4 }}>
                <span className="text-xl font-extrabold text-gray-800">{pieTotal}</span>
                <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide">Total</span>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-1">
                {statusChartData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1 text-[9px] font-semibold text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                    {d.name} <span className="text-gray-800">{d.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trend 3/4 */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700">Trend Status 6 Bulan Terakhir</p>
            <span className="text-[10px] text-gray-400">Berdasarkan tanggal pembaruan pengajuan</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="pemberiAreaApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00954E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00954E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="pemberiAreaProses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E76BC" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0E76BC" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<TrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={7} />
              <Area type="monotone" dataKey="approved" name="Disetujui" stroke="#00954E" strokeWidth={2.5} fill="url(#pemberiAreaApproved)" />
              <Area type="monotone" dataKey="proses" name="Proses" stroke="#0E76BC" strokeWidth={2.5} fill="url(#pemberiAreaProses)" />
              <Line type="monotone" dataKey="rejected" name="Ditolak" stroke="#E31E24" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="draft" name="Draft" stroke="#8A94A6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rincian per lokasi — data ASLI (bukan dummy) */}
      <div className="px-6 pb-6 space-y-2.5">
        {lokasiListData.length === 0 ? (
          <p className="text-gray-300 text-xs text-center py-4">Belum ada rincian untuk ditampilkan</p>
        ) : (
          lokasiListData.map((d) => (
            <div key={d.lokasi} className="flex items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl px-4 py-3 flex-wrap gap-y-2 hover:bg-gray-50 transition">
              <span className="text-gray-800 text-xs font-bold min-w-32 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #E31E24, #F2A900, #00954E)' }} />
                {d.lokasi}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#1B2A4A' }}>Total {d.total}</span>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#00954E' }}>Disetujui {d.approved}</span>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#0E76BC' }}>Proses {d.proses}</span>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#E31E24' }}>Ditolak {d.rejected}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================ */

export default function PemberiApprovalManagementPage() {
  const router = useRouter();
  const {
    submissions,
    approvePerubahanRevalidasi,
    mintaRevisiPerubahan,
  } = useProgramStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [filterMasaBerlaku, setFilterMasaBerlaku] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterSifat, setFilterSifat] = useState('');
  const [filterRevalidasi, setFilterRevalidasi] = useState('');
  const [filterTglDari, setFilterTglDari] = useState('');
  const [filterTglSampai, setFilterTglSampai] = useState('');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'berakhir-segera'>('terbaru');
  const [showFilter, setShowFilter] = useState(false);
  const [revalidasiModalRowId, setRevalidasiModalRowId] = useState<string | null>(null);
  const [riwayatModalRowId, setRiwayatModalRowId] = useState<string | null>(null);

  // Satu baris per submission yang sudah di-"Request Review" oleh pemohon
  // (submitToPemberi di store) — bisa banyak baris, bukan cuma satu.
  const rows: PemberiRow[] = useMemo(() => {
    return submissions.map((sub): PemberiRow => {
      const validBerlakuHingga = (sub.sika.berlakuHingga || []).filter(
        (v: string) => !!v && !isNaN(new Date(v).getTime())
      );
      const tanggalBerakhirSIKA = validBerlakuHingga.length > 0
        ? validBerlakuHingga.reduce((latest: string, cur: string) =>
            new Date(cur) > new Date(latest) ? cur : latest
          )
        : '-';

      return {
        id: sub.id,
        namaProgram: sub.program.namaPaket || '-',
        satKerja: sub.program.satKerjaPemberi || '-',
        noJSA: sub.jsa.jsaNo || '-',
        tanggalJSA: sub.jsa.tanggalJSA || '-',
        noSIKA: getNomorSika(sub.sika),
        tanggalBerakhirSIKA,
        lokasi: sub.program.lokasiKerja || '-',
        pelaksana: sub.program.pelaksanaPerusahaan || '-',
        sifatPekerjaan: sub.sika.sifatPekerjaan || '-',
        sikaStatus: sub.sikaStatusPemberi,
        jsaStatus: sub.jsaStatusPemberi,
        perubahanStatus: sub.perubahanStatus,
        catatanRevisiPerubahan: sub.catatanRevisiPerubahan,
        catatanPerubahan: sub.catatanPerubahan,
        updatedAt: sub.updatedAt,
      };
    });
  }, [submissions]);

  const filtered = rows.filter((r) => {
    const matchCari = !search ||
      r.namaProgram.toLowerCase().includes(search.toLowerCase()) ||
      r.noJSA.toLowerCase().includes(search.toLowerCase()) ||
      r.noSIKA.toLowerCase().includes(search.toLowerCase());
    const matchMasaBerlaku = (() => {
      if (!filterMasaBerlaku) return true;
      const days = getDaysUntilExpiry(r.tanggalBerakhirSIKA);
      if (days === null) return false;
      if (filterMasaBerlaku === 'kedaluwarsa') return days < 0;
      if (filterMasaBerlaku === '7hari') return days >= 0 && days <= 7;
      if (filterMasaBerlaku === '30hari') return days >= 0 && days <= 30;
      return true;
    })();
    const matchLokasi = !filterLokasi || r.lokasi === filterLokasi;
    const matchSifat = !filterSifat || r.sifatPekerjaan === filterSifat;
    const matchRevalidasi = !filterRevalidasi || r.perubahanStatus === filterRevalidasi;
    const matchTanggal = (() => {
      if (!filterTglDari && !filterTglSampai) return true;
      if (r.tanggalBerakhirSIKA === '-' || isNaN(new Date(r.tanggalBerakhirSIKA).getTime())) return false;
      const tgl = new Date(r.tanggalBerakhirSIKA);
      if (filterTglDari && tgl < new Date(filterTglDari)) return false;
      if (filterTglSampai) {
        const sampai = new Date(filterTglSampai);
        sampai.setHours(23, 59, 59);
        if (tgl > sampai) return false;
      }
      return true;
    })();
    return matchCari && matchMasaBerlaku && matchLokasi && matchSifat && matchRevalidasi && matchTanggal;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'terbaru') {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    }
    if (sortBy === 'terlama') {
      return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
    }
    // berakhir-segera: yang tanpa tanggal valid ditaruh paling belakang
    const da = a.tanggalBerakhirSIKA !== '-' && !isNaN(new Date(a.tanggalBerakhirSIKA).getTime())
      ? new Date(a.tanggalBerakhirSIKA).getTime() : Infinity;
    const db = b.tanggalBerakhirSIKA !== '-' && !isNaN(new Date(b.tanggalBerakhirSIKA).getTime())
      ? new Date(b.tanggalBerakhirSIKA).getTime() : Infinity;
    return da - db;
  });

  const countByOverall = (target: ApprovalStatus | 'pending') =>
    rows.filter((r) => {
      const overall = getPemberiStatus(r.sikaStatus, r.jsaStatus);
      if (target === 'pending') return overall === 'request' || overall === 'waiting';
      return overall === target;
    }).length;

  const countRevalidasiMenunggu = rows.filter((r) => r.perubahanStatus === 'menunggu').length;

  const revalidasiModalRow = revalidasiModalRowId ? rows.find((r) => r.id === revalidasiModalRowId) : undefined;
  const riwayatModalRow = riwayatModalRowId ? rows.find((r) => r.id === riwayatModalRowId) : undefined;

  const hasActiveFilter = !!(filterMasaBerlaku || filterLokasi || filterSifat || filterRevalidasi || filterTglDari || filterTglSampai);

  const resetAllFilters = () => {
    setFilterMasaBerlaku('');
    setFilterLokasi('');
    setFilterSifat('');
    setFilterRevalidasi('');
    setFilterTglDari('');
    setFilterTglSampai('');
  };

  const handleSetujuiRevalidasi = () => {
    if (!revalidasiModalRowId) return;
    approvePerubahanRevalidasi(user?.name || 'Pemberi Kerja', revalidasiModalRowId);
    setRevalidasiModalRowId(null);
  };

  const handleRevisiRevalidasi = (catatan: string) => {
    if (!revalidasiModalRowId) return;
    mintaRevisiPerubahan(user?.name || 'Pemberi Kerja', catatan, revalidasiModalRowId);
    setRevalidasiModalRowId(null);
  };

  const revalidasiFilterLabel: Record<string, string> = {
    none: 'Belum Ada',
    menunggu: 'Menunggu Review',
    disetujui: 'Disetujui',
    revisi: 'Perlu Revisi',
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Approval Management</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Pemberi Kerja
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-6">
          <img
            src="/logopertaminagasfull.svg"
            alt="Pertamina Gas"
            className="h-9 object-contain"
          />
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">

        <div className="grid gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Total Pengajuan', value: rows.length, bg: '#1B2A4A', sub: 'Semua pengajuan masuk' },
            { label: 'Perlu Review', value: countByOverall('pending'), bg: '#0E76BC', sub: 'Menunggu keputusan' },
            { label: 'Disetujui', value: countByOverall('approved'), bg: '#00954E', sub: 'SIKA & JSA aktif' },
            { label: 'Ditolak', value: countByOverall('rejected'), bg: '#E31E24', sub: 'Perlu revisi pemohon' },
            { label: 'Revalidasi Masuk', value: countRevalidasiMenunggu, bg: '#F2A900', sub: 'Menunggu review harian' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-3.5 shadow-md"
              style={{ background: `linear-gradient(135deg, ${s.bg} 0%, ${s.bg}dd 100%)` }}
            >
              <p className="text-xs text-white/80 font-medium mb-0.5">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <StatistikDashboard rows={rows} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">DAFTAR PENGAJUAN MASUK</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Klik "Review" untuk melihat detail dan melakukan approval</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  showFilter || hasActiveFilter
                    ? 'bg-white text-blue-700 border-white'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Filter size={12} />
                Filter {hasActiveFilter ? '(aktif)' : ''}
              </button>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                {sorted.length} pengajuan
              </span>
            </div>
          </div>

          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama program, No JSA, No SIKA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-gray-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                <option value="terbaru">Terbaru diperbarui</option>
                <option value="terlama">Terlama diperbarui</option>
                <option value="berakhir-segera">Akan berakhir segera</option>
              </select>
            </div>
            <div className="text-[10px] text-gray-400">
              {sorted.length} dari {rows.length} pengajuan
            </div>
          </div>

          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/40 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Masa Berlaku SIKA</label>
                <select
                  value={filterMasaBerlaku}
                  onChange={(e) => setFilterMasaBerlaku(e.target.value)}
                  className={`border rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-48 ${
                    filterMasaBerlaku === 'kedaluwarsa'
                      ? 'border-red-200 text-red-600 font-semibold'
                      : filterMasaBerlaku === '7hari'
                      ? 'border-amber-200 text-amber-700 font-semibold'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <option value="">Semua Masa Berlaku</option>
                  <option value="kedaluwarsa">⚠ Sudah Kedaluwarsa</option>
                  <option value="7hari">≤ 7 Hari Lagi</option>
                  <option value="30hari">≤ 30 Hari Lagi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Lokasi / Area</label>
                <select
                  value={filterLokasi}
                  onChange={(e) => setFilterLokasi(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-56"
                >
                  <option value="">Semua Area</option>
                  {OPSI_LOKASI.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Sifat Pekerjaan</label>
                <select
                  value={filterSifat}
                  onChange={(e) => setFilterSifat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-40"
                >
                  <option value="">Semua Sifat</option>
                  {SIFAT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Status Revalidasi</label>
                <select
                  value={filterRevalidasi}
                  onChange={(e) => setFilterRevalidasi(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-44"
                >
                  <option value="">Semua</option>
                  <option value="none">Belum Ada</option>
                  <option value="menunggu">Menunggu Review</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="revisi">Perlu Revisi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Berlaku Hingga Dari</label>
                <input
                  type="date"
                  value={filterTglDari}
                  onChange={(e) => setFilterTglDari(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Sampai</label>
                <input
                  type="date"
                  value={filterTglSampai}
                  onChange={(e) => setFilterTglSampai(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
              <button
                onClick={resetAllFilters}
                className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5"
              >
                Reset filter
              </button>
            </div>
          )}

          {hasActiveFilter && (
            <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide shrink-0">Filter aktif:</span>
              {filterMasaBerlaku && (
                <FilterChip
                  label={`Masa Berlaku: ${MASA_BERLAKU_LABEL[filterMasaBerlaku] ?? filterMasaBerlaku}`}
                  onRemove={() => setFilterMasaBerlaku('')}
                />
              )}
              {filterLokasi && (
                <FilterChip label={`Area: ${filterLokasi}`} onRemove={() => setFilterLokasi('')} />
              )}
              {filterSifat && <FilterChip label={`Sifat: ${filterSifat}`} onRemove={() => setFilterSifat('')} />}
              {filterRevalidasi && (
                <FilterChip
                  label={`Revalidasi: ${revalidasiFilterLabel[filterRevalidasi] ?? filterRevalidasi}`}
                  onRemove={() => setFilterRevalidasi('')}
                />
              )}
              {(filterTglDari || filterTglSampai) && (
                <FilterChip
                  label={`Berlaku: ${filterTglDari || '…'} s/d ${filterTglSampai || '…'}`}
                  onRemove={() => { setFilterTglDari(''); setFilterTglSampai(''); }}
                />
              )}
              <button
                onClick={resetAllFilters}
                className="text-[10px] text-red-500 hover:underline font-semibold ml-1"
              >
                Hapus semua
              </button>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FileText size={40} className="text-gray-300" />
              <p className="text-gray-400 text-sm font-medium">Belum ada pengajuan masuk</p>
              <p className="text-gray-300 text-xs">Pengajuan yang sudah disubmit pemohon akan muncul di sini</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: '#f8fafc' }} className="border-b border-gray-200">
                      {['No', 'Nama Program', 'Lokasi', 'Pelaksana', 'No JSA', 'No SIKA', 'Status SIKA', 'Status JSA', 'Status Keseluruhan', 'Revalidasi', 'Aksi'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center text-gray-400 py-14 text-sm">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : sorted.map((row, i) => {
                      const overall = getPemberiStatus(row.sikaStatus, row.jsaStatus);
                      return (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-400 font-medium text-center">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-xs text-gray-800">{row.namaProgram}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{row.satKerja}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{row.lokasi}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{row.pelaksana}</td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-semibold text-blue-600">{row.noJSA}</div>
                            <div className="text-xs text-gray-400">{row.tanggalJSA}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-semibold text-blue-600">{row.noSIKA}</div>
                            <div className="text-xs text-gray-400">
                              {row.tanggalBerakhirSIKA !== '-' ? `s/d ${row.tanggalBerakhirSIKA}` : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusPill status={row.sikaStatus} /></td>
                          <td className="px-4 py-3"><StatusPill status={row.jsaStatus} /></td>
                          <td className="px-4 py-3"><StatusPill status={overall} /></td>
                          <td className="px-4 py-3">
                            <RevalidasiCell
                              row={row}
                              onReview={() => setRevalidasiModalRowId(row.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => router.push(`/dashboard/pemberi/review/${row.id}`)}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                <FileText size={12} />
                                Review
                              </button>
                              <button
                                onClick={() => setRiwayatModalRowId(row.id)}
                                title="Riwayat & monitoring status"
                                className="flex items-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                              >
                                <History size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                <span>1 – {sorted.length} dari {rows.length} pengajuan</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded-lg border border-gray-200 hover:bg-white transition">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">1</span>
                  <button className="p-1 rounded-lg border border-gray-200 hover:bg-white transition">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {revalidasiModalRow && (
        <RevalidasiMasukModal
          row={revalidasiModalRow}
          onClose={() => setRevalidasiModalRowId(null)}
          onSetujui={handleSetujuiRevalidasi}
          onRevisi={handleRevisiRevalidasi}
        />
      )}

      {riwayatModalRow && (
        <RiwayatModal
          row={riwayatModalRow}
          onClose={() => setRiwayatModalRowId(null)}
        />
      )}
    </div>
  );
}