'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, FileText, MapPin,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Filter,
  CalendarDays, Calendar, ChevronDown,
  TrendingUp, TrendingDown, Activity, ClipboardCheck,
  Loader2
} from 'lucide-react';
import { useProgramStore, getNomorSika, getOverallStatus } from '@/store/programStore';
import type { ApprovalStatus, OverallStatus } from '@/store/programStore';
import {
  ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Sector,
  AreaChart, Area
} from 'recharts';

type TabType = 'semua' | 'aktif' | 'pending' | 'ditolak' | 'closed';
type TimeFilterType = 'hari' | 'minggu' | 'bulan' | 'tahun' | 'custom';

interface SIKARow {
  id: string;
  namaProgram: string;
  noSIKA: string;
  lokasi: string;
  pelaksana: string;
  tanggalKontrak: string;
  tanggalBerakhirSIKA: string;
  sertifikatList: string[];
  sikaStatusPemberi: ApprovalStatus;
  jsaStatusPemberi: ApprovalStatus;
  sikaStatusPJA: ApprovalStatus;
  jsaStatusPJA: ApprovalStatus;
  alasanTolakSika?: string | null;
  alasanTolakJsa?: string | null;
  sifatPekerjaan: string;
  identifikasiBahaya: string[];
  // Tanggal-tanggal (YYYY-MM-DD) revalidasi harian yang sudah dikonfirmasi
  // untuk submission ini — datang dari store, bukan state lokal, supaya
  // tidak hilang saat reload.
  riwayatRevalidasi: string[];
  // Status perubahan data (sertifikat/pekerja baru dll) yang diajukan lewat
  // "Kirim Konfirmasi Revalidasi" di Detail Program — terpisah dari status
  // approval utama, lihat programStore.ts.
  perubahanStatus: 'none' | 'menunggu' | 'disetujui' | 'ditolak';
  alasanTolakPerubahan?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// OverallStatus & getOverallStatus sekarang diimpor dari store (lihat import
// di atas) supaya Data Management dan Detail Program pakai logika status
// yang persis sama, tidak ada risiko dua definisi yang diam-diam beda.

/* ============================================================
   BOLD PERTAMINA GAS PALETTE
   merah #E31E24 · kuning emas #F2A900 · hijau #00954E
   biru #0E76BC · navy #1B2A4A · abu #4B5568 / #8A94A6
============================================================ */

const STATUS_CONFIG: Record<OverallStatus, { label: string; bg: string; icon: any }> = {
  aktif:   { label: 'Aktif',   bg: '#00954E', icon: CheckCircle },
  pending: { label: 'Pending', bg: '#0E76BC', icon: Clock },
  ditolak: { label: 'Ditolak', bg: '#E31E24', icon: XCircle },
  closed:  { label: 'Closed',  bg: '#4B5568', icon: CheckCircle },
  draft:   { label: 'Draft',   bg: '#8A94A6', icon: AlertCircle },
};

const APPROVAL_BADGE: Record<ApprovalStatus, { label: string; bg: string }> = {
  draft:    { label: 'Draft',     bg: '#8A94A6' },
  request:  { label: 'Review',    bg: '#0E76BC' },
  waiting:  { label: 'Menunggu',  bg: '#F2A900' },
  approved: { label: 'Disetujui', bg: '#00954E' },
  rejected: { label: 'Ditolak',   bg: '#E31E24' },
};

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const cfg = APPROVAL_BADGE[status];
  return (
    <span
      className="inline-flex items-center h-5 leading-none text-[10px] font-medium px-2 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: OverallStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center h-5 leading-none gap-1 text-[10px] font-medium px-2 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      <Icon size={10} strokeWidth={3} className="shrink-0" />
      {cfg.label}
    </span>
  );
}

const renderActiveSlice = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
        style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 9}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.35}
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

function BarTooltip({ active, payload, label }: any) {
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

const MAX_HARI_REVALIDASI = 7;

function hitungSisaHari(tanggalBerakhir: string): number | null {
  if (!tanggalBerakhir || tanggalBerakhir === '-') return null;
  const berakhir = new Date(tanggalBerakhir);
  if (isNaN(berakhir.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  berakhir.setHours(0, 0, 0, 0);
  const msPerHari = 1000 * 60 * 60 * 24;
  return Math.round((berakhir.getTime() - today.getTime()) / msPerHari);
}

function filterByTime(rows: SIKARow[], filter: TimeFilterType, customRange?: { start: string; end: string }): SIKARow[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return rows.filter(row => {
    const date = row.createdAt ? new Date(row.createdAt) : new Date(row.tanggalKontrak);
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
      case 'bulan': {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }
      case 'tahun': {
        return d.getFullYear() === today.getFullYear();
      }
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

/* ============================================================
   REVALIDASI — sehari sekali, maksimal 7 hari sejak tanggal
   pengajuan. Begitu hari ini sudah divalidasi, aksi terkunci
   sampai hari berikutnya (locking berbasis tanggal kalender,
   otomatis reset saat berganti hari).
============================================================ */

type RevalidasiDayStatus = 'validated' | 'due' | 'missed' | 'upcoming';

interface RevalidasiDay {
  date: string;
  dayNumber: number;
  status: RevalidasiDayStatus;
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function getHariKeIni(tanggalPengajuan: string): number {
  const start = new Date(tanggalPengajuan);
  if (isNaN(start.getTime())) return 1;
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerHari = 1000 * 60 * 60 * 24;
  return Math.round((today.getTime() - start.getTime()) / msPerHari) + 1;
}

function getRevalidasiDays(tanggalPengajuan: string, validatedDates: string[]): RevalidasiDay[] {
  const start = new Date(tanggalPengajuan);
  if (isNaN(start.getTime())) return [];
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: RevalidasiDay[] = [];
  for (let i = 0; i < MAX_HARI_REVALIDASI; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = toDateKey(d);
    let status: RevalidasiDayStatus;
    if (validatedDates.includes(key)) status = 'validated';
    else if (d.getTime() === today.getTime()) status = 'due';
    else if (d.getTime() < today.getTime()) status = 'missed';
    else status = 'upcoming';
    days.push({ date: key, dayNumber: i + 1, status });
  }
  return days;
}

const REVALIDASI_SEGMENT_COLOR: Record<RevalidasiDayStatus, string> = {
  validated: '#00954E',
  due: '#E31E24',
  missed: '#00954E',
  upcoming: '#E2E5EA',
};

function RevalidasiCell({
  row,
  baseStatus,
  validatedDates,
  onAjukan,
}: {
  row: SIKARow;
  baseStatus: OverallStatus;
  validatedDates: string[];
  onAjukan: (rowId: string) => void;
}) {
  if (baseStatus !== 'aktif' && baseStatus !== 'closed') {
    return <span className="text-[10px] text-gray-300 italic">Belum berlaku</span>;
  }

  const tanggalPengajuan = row.createdAt || row.tanggalKontrak;
  const days = getRevalidasiDays(tanggalPengajuan, validatedDates);
  if (days.length === 0) {
    return <span className="text-[10px] text-gray-300 italic">-</span>;
  }

  const hariKe = getHariKeIni(tanggalPengajuan);
  const sudahLewatBatas = hariKe > MAX_HARI_REVALIDASI;
  const hariKeDitampilkan = Math.min(Math.max(hariKe, 1), MAX_HARI_REVALIDASI);
  const hariIni = days.find(d => d.dayNumber === hariKeDitampilkan);
  const sudahValidasiHariIni = hariIni?.status === 'validated';
  const perubahanMenunggu = row.perubahanStatus === 'menunggu';

  const perluAksi = baseStatus === 'aktif' && !sudahLewatBatas && !sudahValidasiHariIni && !perubahanMenunggu;

  return (
    <div className="flex flex-col gap-1.5 w-40">
      {/* Baris atas: progres hari + status singkat */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-600">
          Hari {sudahLewatBatas ? MAX_HARI_REVALIDASI : hariKeDitampilkan}
          <span className="font-medium text-gray-300">/{MAX_HARI_REVALIDASI}</span>
        </span>
        {sudahValidasiHariIni && !sudahLewatBatas && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold" style={{ color: '#00954E' }}>
            <CheckCircle size={9} strokeWidth={3} /> Tervalidasi
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 p-0.5 rounded-full bg-gray-100">
  {days.map((d) => (
    <span
      key={d.date}
      title={`Hari ke-${d.dayNumber} · ${formatDateID(d.date)}`}
      className="flex-1 h-2 rounded-full"
      style={{
        background: REVALIDASI_SEGMENT_COLOR[d.status],
      }}
    />
  ))}
</div>

      {perluAksi && (
        <button
          onClick={() => onAjukan(row.id)}
          className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-2.5 py-1.5 transition shadow-sm w-fit"
        >
          <ClipboardCheck size={11} /> Validasi Sekarang
        </button>
      )}

      {perubahanMenunggu && (
        <p className="text-[10px] font-medium leading-snug" style={{ color: '#F2A900' }}>
          Menunggu persetujuan perubahan dari Pemberi Kerja.
        </p>
      )}

      {!perubahanMenunggu && sudahValidasiHariIni && !sudahLewatBatas && (
        <p className="text-[10px] text-gray-400 leading-snug">
          Validasi berikutnya dibuka besok.
        </p>
      )}

      {sudahLewatBatas && (
        <p className="text-[10px] font-medium leading-snug" style={{ color: '#E31E24' }}>
          Batas 7 hari terlampaui &mdash; ajukan SIKA baru.
        </p>
      )}
    </div>
  );
}

function RevalidasiModal({
  row,
  onClose,
  onSubmit,
}: {
  row: SIKARow;
  onClose: () => void;
  onSubmit: (data: { catatan: string }) => void;
}) {
  const router = useRouter();
  const { openSubmission } = useProgramStore();
  const [confirmasi, setConfirmasi] = useState({
    kondisiArea: false,
    identifikasiBahaya: false,
    personelSertifikat: false,
  });
  const [catatan, setCatatan] = useState('');
  const [perluTambahan, setPerluTambahan] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const semuaTerkonfirmasi = confirmasi.kondisiArea && confirmasi.identifikasiBahaya && confirmasi.personelSertifikat;
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const toggle = (key: keyof typeof confirmasi) =>
    setConfirmasi((prev) => ({ ...prev, [key]: !prev[key] }));

  // Jika pemohon menandai perlu menambah sertifikat/pekerja baru dll, muat
  // dulu data submission ini ke draft aktif (openSubmission) supaya form
  // Program/SIKA/JSA terisi dengan data yang SUDAH ADA — pemohon tinggal
  // melengkapi/mengubah bagian yang perlu, bukan mengisi dari kosong.
  // Setelah selesai di halaman Detail Program, tombol "Kirim Konfirmasi
  // Revalidasi" di sana yang mengirim perubahan ini ke Pemberi Kerja.
  // Sekali dicentang, pilihan ini terkunci (tidak bisa di-uncheck) karena
  // pengguna akan segera berpindah halaman.
  const handleTogglePerluTambahan = () => {
    if (perluTambahan || redirecting) return;
    setPerluTambahan(true);
    setRedirecting(true);
    openSubmission(row.id);
    router.push('/dashboard/pemohon/program/new');
  };

  const ITEMS: { key: keyof typeof confirmasi; label: string }[] = [
    { key: 'kondisiArea', label: 'Kondisi area kerja masih aman dan sesuai dengan JSA yang telah disetujui.' },
    { key: 'identifikasiBahaya', label: 'Tidak ada perubahan identifikasi bahaya sejak SIKA diterbitkan.' },
    { key: 'personelSertifikat', label: 'Personel dan sertifikat yang terlibat masih sesuai data terdaftar.' },
  ];

  const jumlahTerkonfirmasi = Object.values(confirmasi).filter(Boolean).length;
  const tanggalPengajuan = row.createdAt || row.tanggalKontrak;
  const hariKe = Math.min(Math.max(getHariKeIni(tanggalPengajuan), 1), MAX_HARI_REVALIDASI);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

        {/* HEADER */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}
        >
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">Revalidasi Harian SIKA</p>
            <p className="text-[10px] text-white/70 font-medium">Hari ke-{hariKe} dari {MAX_HARI_REVALIDASI}</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          {/* INFO PROGRAM */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{row.namaProgram}</p>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{row.noSIKA}</p>
              </div>
              <span className="shrink-0 text-[10px] font-medium text-gray-400 text-right">{todayLabel}</span>
            </div>
            <div className="flex items-center gap-0.5 mt-3">
              {Array.from({ length: MAX_HARI_REVALIDASI }).map((_, idx) => (
                <span
                  key={idx}
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: idx < hariKe - 1 ? '#00954E' : idx === hariKe - 1 ? '#E31E24' : '#E2E5EA' }}
                />
              ))}
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <fieldset
              disabled={redirecting}
              className={`space-y-4 transition-opacity duration-200 ${redirecting ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* CHECKLIST KONFIRMASI */}
<div>
  <div className="flex items-center justify-between mb-2">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-bold">
      Konfirmasi Kondisi Lapangan
    </p>
    <span className="text-[10px] font-semibold text-gray-400">{jumlahTerkonfirmasi}/{ITEMS.length}</span>
  </div>
  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
    {ITEMS.map((item) => {
      const checked = confirmasi[item.key];
      return (
        <label
          key={item.key}
          className={`flex items-start gap-3 text-xs px-4 py-2.5 cursor-pointer transition ${
            checked ? 'bg-[#00954E]/[0.14]' : 'bg-white hover:bg-gray-50'
          }`}
          style={{ borderLeft: `4px solid ${checked ? '#00954E' : 'transparent'}` }}
        >
          <span
            className={`mt-0.5 w-4.5 h-4.5 rounded-md border shrink-0 flex items-center justify-center transition ${
              checked ? 'bg-[#00954E] border-[#00954E]' : 'border-gray-300 bg-white'
            }`}
          >
            {checked && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggle(item.key)}
            className="sr-only"
          />
          <span className={`leading-relaxed ${checked ? 'text-gray-700' : 'text-gray-600'}`}>
            {item.label}
          </span>
        </label>
      );
    })}
  </div>
</div>

{/* PERUBAHAN TAMBAHAN */}
<div
  className={`border rounded-xl overflow-hidden transition-colors ${
    perluTambahan ? '' : 'border-gray-200'
  }`}
  style={perluTambahan ? { borderColor: '#F2A900', background: '#F2A90014' } : undefined}
>
  <label className="flex items-start gap-3 text-xs px-4 py-2.5 cursor-pointer border-l-4 border-transparent">
    <span
      className={`mt-0.5 w-4.5 h-4.5 rounded-md border shrink-0 flex items-center justify-center transition ${
        perluTambahan ? '' : 'border-gray-300 bg-white'
      }`}
      style={perluTambahan ? { background: '#F2A900', borderColor: '#F2A900' } : undefined}
    >
      {perluTambahan && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
    </span>
    <input
      type="checkbox"
      checked={perluTambahan}
      onChange={handleTogglePerluTambahan}
      className="sr-only"
    />
    <div className="flex-1 min-w-0 space-y-1.5">
      <span className="font-semibold text-gray-700 leading-relaxed block break-words">
        Perlu menambah sertifikat, pekerja baru, atau perubahan lain?
      </span>
      <p className="text-[10px] font-normal text-gray-500 leading-relaxed break-words">
        Kamu akan diarahkan ke form pengajuan SIKA baru untuk melengkapi perubahan ini,
        dari pengisian data sampai persetujuan selesai.
      </p>
      {redirecting && (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
          <Loader2 size={11} className="animate-spin shrink-0" />
          Mengarahkan ke form pengajuan baru...
        </div>
      )}
    </div>
  </label>
</div>

              {/* CATATAN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  Catatan <span className="font-normal normal-case text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Tidak ada perubahan kondisi lapangan hari ini..."
                  className={`border rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none transition ${
                    catatan.trim() ? 'border-blue-300 bg-blue-50/60' : 'border-gray-200 bg-white'
                  }`}
                />
              </div>
            </fieldset>

            <p className="text-[10px] text-gray-400 leading-relaxed">
            Revalidasi harian bertujuan memastikan kondisi pekerjaan masih sesuai dengan SIKA dan JSA yang telah disetujui. 
            Wajib dilakukan <span className="font-semibold text-gray-500">sekali sehari</span>, paling lambat{' '}
            <span className="font-semibold text-gray-500">{MAX_HARI_REVALIDASI} hari</span> sejak tanggal pengajuan. 
            Jika melewati batas tersebut, Anda harus mengajukan SIKA baru.
          </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/60 shrink-0">
          <button
            onClick={onClose}
            disabled={redirecting}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            disabled={!semuaTerkonfirmasi || redirecting}
            onClick={() => semuaTerkonfirmasi && onSubmit({ catatan })}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition ${
              semuaTerkonfirmasi && !redirecting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={13} strokeWidth={2.5} />
            Konfirmasi Revalidasi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */

export default function PemohonMonitoringPage() {
  const router = useRouter();
  const {
    submissions,
    sertifikatData,
    catatRevalidasi,
    startNewDraft,
    openSubmission,
  } = useProgramStore();

  const [activeTab, setActiveTab] = useState<TabType>('semua');
  const [search, setSearch] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterSertifikat, setFilterSertifikat] = useState('');
  const [filterSifat, setFilterSifat] = useState('');
  const [filterAreaChart, setFilterAreaChart] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);
  const [revalidasiModalRowId, setRevalidasiModalRowId] = useState<string | null>(null);

  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('bulan');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Satu baris per submission yang sudah di-"Request Review" oleh pemohon
  // (lihat submitToPemberi di store). Draft yang belum pernah disubmit
  // sengaja tidak muncul di sini.
  const rows: SIKARow[] = useMemo(() => {
    return submissions.map((sub): SIKARow => {
      // Ambil tanggal BERLAKU HINGGA yang paling akhir/terjauh di antara semua
      // isian valid, bukan sekadar entri terakhir dalam array — supaya tidak
      // tergantung urutan array di store.
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
        noSIKA: getNomorSika(sub.sika),
        lokasi: sub.program.lokasiKerja || '-',
        pelaksana: sub.program.pelaksanaPerusahaan || '-',
        tanggalKontrak: sub.program.tanggalKontrak || '-',
        tanggalBerakhirSIKA,
        sertifikatList: sub.sika.sertifikat || [],
        sikaStatusPemberi: sub.sikaStatusPemberi,
        jsaStatusPemberi: sub.jsaStatusPemberi,
        sikaStatusPJA: sub.sikaStatusPJA,
        jsaStatusPJA: sub.jsaStatusPJA,
        // Digabung dari sisi Pemberi & PJA supaya alasan penolakan tetap
        // tampil walau yang menolak PJA, bukan cuma Pemberi Kerja.
        alasanTolakSika: sub.alasanTolakSikaPemberi || sub.alasanTolakSikaPJA,
        alasanTolakJsa: sub.alasanTolakJsaPemberi || sub.alasanTolakJsaPJA,
        sifatPekerjaan: sub.sika.sifatPekerjaan || '-',
        identifikasiBahaya: sub.sika.identifikasi || [],
        riwayatRevalidasi: sub.riwayatRevalidasi,
        perubahanStatus: sub.perubahanStatus,
        alasanTolakPerubahan: sub.alasanTolakPerubahan,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    });
  }, [submissions]);

  const getFinalStatus = (row: SIKARow): OverallStatus =>
    getOverallStatus(row.sikaStatusPemberi, row.jsaStatusPemberi, row.sikaStatusPJA, row.jsaStatusPJA);

  const timeFilteredRows = useMemo(() => {
    return filterByTime(rows, timeFilter, customRange);
  }, [rows, timeFilter, customRange]);

  const filtered = useMemo(() => {
    return timeFilteredRows.filter(r => {
      const overall = getFinalStatus(r);

      const matchTab =
        activeTab === 'semua' ? true :
        activeTab === 'aktif' ? overall === 'aktif' :
        activeTab === 'pending' ? overall === 'pending' || overall === 'draft' :
        activeTab === 'ditolak' ? overall === 'ditolak' :
        activeTab === 'closed' ? overall === 'closed' : true;

      const matchSearch = !search ||
        r.namaProgram.toLowerCase().includes(search.toLowerCase()) ||
        r.noSIKA.toLowerCase().includes(search.toLowerCase()) ||
        r.lokasi.toLowerCase().includes(search.toLowerCase());

      const matchLokasi = !filterLokasi || r.lokasi === filterLokasi;
      const matchSertifikat = !filterSertifikat || r.sertifikatList.includes(filterSertifikat);
      const matchSifat = !filterSifat || r.sifatPekerjaan === filterSifat;

      return matchTab && matchSearch && matchLokasi && matchSertifikat && matchSifat;
    });
  }, [timeFilteredRows, activeTab, search, filterLokasi, filterSertifikat, filterSifat]);

  const counts = useMemo(() => ({
    semua: timeFilteredRows.length,
    aktif: timeFilteredRows.filter(r => getFinalStatus(r) === 'aktif').length,
    pending: timeFilteredRows.filter(r => ['pending', 'draft'].includes(getFinalStatus(r))).length,
    ditolak: timeFilteredRows.filter(r => getFinalStatus(r) === 'ditolak').length,
    closed: timeFilteredRows.filter(r => getFinalStatus(r) === 'closed').length,
  }), [timeFilteredRows]);

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

  const allSertifikat = [...new Set(rows.flatMap(r => r.sertifikatList))];
  const allSifat = [...new Set(rows.map(r => r.sifatPekerjaan).filter(s => s && s !== '-'))];

  const statusChartData = useMemo(() => {
    const source = !filterAreaChart
      ? timeFilteredRows
      : timeFilteredRows.filter(r => r.lokasi === filterAreaChart);

    const c = {
      aktif: source.filter(r => getFinalStatus(r) === 'aktif').length,
      pending: source.filter(r => ['pending', 'draft'].includes(getFinalStatus(r))).length,
      ditolak: source.filter(r => getFinalStatus(r) === 'ditolak').length,
      closed: source.filter(r => getFinalStatus(r) === 'closed').length,
    };

    return [
      { name: 'Aktif',   value: c.aktif,   color: '#00954E' },
      { name: 'Pending', value: c.pending, color: '#0E76BC' },
      { name: 'Ditolak', value: c.ditolak, color: '#E31E24' },
      { name: 'Closed',  value: c.closed,  color: '#8A94A6' },
    ].filter(d => d.value > 0);
  }, [timeFilteredRows, filterAreaChart]);

  const pieTotal = useMemo(() => statusChartData.reduce((s, d) => s + d.value, 0), [statusChartData]);

  const trendData = useMemo(() => {
    // NOTE: masih dummy/random by design (statistik contoh) — lihat
    // pembahasan sebelumnya. Ganti ke agregasi asli dari `submissions`
    // per bulan kalau nanti sudah siap dipakai produksi.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonth = new Date().getMonth();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      data.push({
        month: months[idx],
        aktif: Math.floor(Math.random() * 20) + 5,
        pending: Math.floor(Math.random() * 15) + 3,
        ditolak: Math.floor(Math.random() * 8) + 1,
        closed: Math.floor(Math.random() * 10) + 2,
      });
    }
    return data;
  }, []);

  const lokasiChartData = useMemo(() => {
    return OPSI_LOKASI
      .filter(l => !filterAreaChart || l === filterAreaChart)
      .map(l => {
        const rowsDiArea = timeFilteredRows.filter(r => r.lokasi === l);
        const base = {
          lokasi: l.replace('Operation ', '').replace(' Area', ''),
          lokasiFull: l,
          aktif: 0, pending: 0, ditolak: 0, closed: 0, total: rowsDiArea.length,
        };
        rowsDiArea.forEach(r => {
          const st = getFinalStatus(r);
          if (st === 'aktif') base.aktif++;
          else if (st === 'pending' || st === 'draft') base.pending++;
          else if (st === 'ditolak') base.ditolak++;
          else if (st === 'closed') base.closed++;
        });
        return base;
      });
  }, [timeFilteredRows, filterAreaChart]);

  const lokasiListData = useMemo(() => {
    if (filterAreaChart) {
      return lokasiChartData.filter(d => d.lokasiFull === filterAreaChart);
    }
    const totalSemua = lokasiChartData.reduce((acc, d) => ({
      lokasi: 'Semua Area',
      lokasiFull: '',
      aktif: acc.aktif + d.aktif,
      pending: acc.pending + d.pending,
      ditolak: acc.ditolak + d.ditolak,
      closed: acc.closed + d.closed,
      total: acc.total + d.total,
    }), { lokasi: 'Semua Area', lokasiFull: '', aktif: 0, pending: 0, ditolak: 0, closed: 0, total: 0 });
    return [totalSemua];
  }, [lokasiChartData, filterAreaChart]);

  const TABS: { key: TabType; label: string; color: string }[] = [
    { key: 'semua',   label: 'Semua',   color: 'text-gray-700' },
    { key: 'aktif',   label: 'Aktif',   color: 'text-green-600' },
    { key: 'pending', label: 'Pending', color: 'text-blue-600' },
    { key: 'ditolak', label: 'Ditolak', color: 'text-red-600' },
    { key: 'closed',  label: 'Closed',  color: 'text-gray-500' },
  ];

  const revalidasiModalRow = revalidasiModalRowId ? rows.find(r => r.id === revalidasiModalRowId) : undefined;

  const handleSubmitRevalidasi = (_data: { catatan: string }) => {
    if (!revalidasiModalRowId) return;
    const todayKey = toDateKey(new Date());
    catatRevalidasi(revalidasiModalRowId, todayKey);
    setRevalidasiModalRowId(null);
  };

  const handleBuatPengajuanBaru = () => {
    // Kosongkan draft aktif dulu supaya form Program tidak ke-prefill data
    // pengajuan yang baru saja disubmit, dan supaya pengajuan baru ini
    // tidak menimpa submission yang sudah ada di riwayat.
    startNewDraft();
    router.push('/dashboard/pemohon/program/new');
  };

  const handleLihatDetail = (rowId: string) => {
    // Muat snapshot submission ini ke draft aktif supaya halaman Detail
    // Program (yang membaca program/sika/jsa langsung dari store) otomatis
    // menampilkan data pengajuan ini.
    openSubmission(rowId);
    router.push('/dashboard/pemohon/jsa/detail');
  };

  const timeFilterLabels = {
    hari: 'Hari Ini',
    minggu: 'Minggu Ini',
    bulan: 'Bulan Ini',
    tahun: 'Tahun Ini',
    custom: 'Custom Range',
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Monitoring SIKA</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Status &amp; Tracking Dokumen
            </span>
          </div>
        </div>
        <img
          src="/logopertaminagasfull.svg"
          alt="Pertamina Gas"
          className="h-10 object-contain mr-6"
        />
      </div>

      <div className="px-6 py-6 space-y-4">

        {/* STATISTIK - SEJAJAR 5 KOLOM (BOLD PERTAMINA GAS) */}
        <div className="grid gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Total SIKA', value: counts.semua,   bg: '#1B2A4A', sub: 'Semua pengajuan' },
            { label: 'Aktif',      value: counts.aktif,   bg: '#00954E', sub: 'Disetujui Pemberi' },
            { label: 'Pending',    value: counts.pending, bg: '#0E76BC', sub: 'Menunggu review' },
            { label: 'Ditolak',    value: counts.ditolak, bg: '#E31E24', sub: 'Perlu revisi' },
            { label: 'Closed',     value: counts.closed,  bg: '#4B5568', sub: 'Selesai diproses' },
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

        {/* DASHBOARD CHARTS - FULL WIDTH */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100" style={{ background: 'linear-gradient(90deg, #ffffff 0%, #f4f9fb 100%)' }}>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-9 rounded-full" style={{ background: 'linear-gradient(180deg, #E31E24 0%, #F2A900 50%, #00954E 100%)' }} />
              <div>
                <span className="text-gray-900 font-bold text-base tracking-tight">Dashboard Monitoring SIKA</span>
                {filterAreaChart && (
                  <p className="text-[11px] mt-0.5 font-semibold" style={{ color: '#1B75BC' }}>{filterAreaChart}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Filter Dropdown */}
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
                          onClick={() => {
                            setTimeFilter('custom');
                            setShowCustomRange(false);
                            setIsTimeDropdownOpen(false);
                          }}
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

          {/* Charts Grid: Pie 1/4 + Line 3/4 */}
          <div className="p-6 grid grid-cols-4 gap-6">
            {/* Pie Chart - 1/4 */}
            <div className="col-span-1 border border-gray-100 rounded-xl p-4 flex flex-col bg-linear-to-b from-white to-gray-50/40">
              <p className="text-xs font-bold text-gray-700 mb-1">Distribusi Status</p>
              <p className="text-[10px] text-gray-400 mb-2">
                {filterAreaChart || 'Total keseluruhan SIKA'}
              </p>
              {statusChartData.length === 0 ? (
                <div className="flex-1 h-52 flex items-center justify-center text-xs text-gray-300">Belum ada data</div>
              ) : (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <defs>
                        {statusChartData.map((entry, idx) => (
                          <radialGradient key={idx} id={`pieGrad${idx}`} cx="35%" cy="35%" r="70%">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                          </radialGradient>
                        ))}
                      </defs>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={3}
                        cornerRadius={6}
                        stroke="#fff"
                        strokeWidth={2}
                        activeShape={renderActiveSlice}
                        onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                        onMouseLeave={() => setActivePieIndex(undefined)}
                        animationBegin={0}
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        {statusChartData.map((entry, idx) => (
                          <Cell key={idx} fill={`url(#pieGrad${idx})`} />
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

            {/* Line Chart - 3/4 */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-700">Trend Status 6 Bulan Terakhir</p>
                <span className="text-[10px] text-gray-400">Berdasarkan waktu pengajuan</span>
              </div>
              {trendData.length === 0 ? (
                <div className="h-70 flex items-center justify-center text-xs text-gray-300">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaAktif" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00954E" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00954E" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="areaPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0E76BC" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0E76BC" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      width={25}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                      iconType="circle"
                      iconSize={7}
                    />
                    <Area
                      type="monotone"
                      dataKey="aktif"
                      name="Aktif"
                      stroke="#00954E"
                      strokeWidth={2.5}
                      fill="url(#areaAktif)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      name="Pending"
                      stroke="#0E76BC"
                      strokeWidth={2.5}
                      fill="url(#areaPending)"
                    />
                    <Line
                      type="monotone"
                      dataKey="ditolak"
                      name="Ditolak"
                      stroke="#E31E24"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="closed"
                      name="Closed"
                      stroke="#8A94A6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      strokeDasharray="3 3"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Lokasi breakdown - BOLD PERTAMINA GAS */}
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
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#00954E' }}>Aktif {d.aktif}</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#0E76BC' }}>Pending {d.pending}</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#E31E24' }}>Ditolak {d.ditolak}</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: '#4B5568' }}>Closed {d.closed}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">MONITORING SIKA</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Pantau status seluruh dokumen SIKA &amp; JSA yang diajukan</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  showFilter || filterLokasi || filterSertifikat || filterSifat
                    ? 'bg-white text-blue-700 border-white'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Filter size={12} />
                Filter {(filterLokasi || filterSertifikat || filterSifat) ? '(aktif)' : ''}
              </button>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                {filtered.length} data
              </span>
            </div>
          </div>

          <div className="border-b border-gray-100 px-6 flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? `border-blue-600 ${tab.color}`
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {counts[tab.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama program, No SIKA, lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              />
            </div>
            <div className="text-[10px] text-gray-400">
              {timeFilterLabels[timeFilter]} · {filtered.length} dari {timeFilteredRows.length} data
            </div>
          </div>

          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/40 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Lokasi / Area</label>
                <select
                  value={filterLokasi}
                  onChange={(e) => setFilterLokasi(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-48"
                >
                  <option value="">Semua Area</option>
                  {OPSI_LOKASI.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Jenis Sertifikat</label>
                <select
                  value={filterSertifikat}
                  onChange={(e) => setFilterSertifikat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-56"
                >
                  <option value="">Semua Sertifikat</option>
                  {allSertifikat.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Sifat Pekerjaan</label>
                <select
                  value={filterSifat}
                  onChange={(e) => setFilterSifat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-40"
                >
                  <option value="">Semua</option>
                  {allSifat.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={() => { setFilterLokasi(''); setFilterSertifikat(''); setFilterSifat(''); }}
                className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5"
              >
                Reset filter
              </button>
            </div>
          )}

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FileText size={40} className="text-gray-300" />
              <p className="text-gray-400 text-sm font-medium">Belum ada SIKA yang diajukan</p>
              <p className="text-gray-300 text-xs">Data akan muncul setelah kamu mengisi dan mengajukan dokumen SIKA</p>
              <button
                onClick={handleBuatPengajuanBaru}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Buat Pengajuan Baru
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">
              Tidak ada data yang sesuai filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: '#f8fafc' }} className="border-b border-gray-200">
                    {['No', 'Nama Program', 'Lokasi / Area', 'No SIKA', 'Sertifikat', 'Sifat', 'Premobilisasi', 'Mobilisasi', 'Pemberi (SIKA)', 'Pemberi (JSA)', 'Revalidasi', 'Status', 'Aksi'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 font-medium text-gray-600 text-xs tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const baseStatus = getOverallStatus(row.sikaStatusPemberi, row.jsaStatusPemberi, row.sikaStatusPJA, row.jsaStatusPJA);
                    const overall = getFinalStatus(row);
                    const hasTolak = row.alasanTolakSika || row.alasanTolakJsa;
                    const sisaHari = hitungSisaHari(row.tanggalBerakhirSIKA);
                    const sertifikatIsi = row.sertifikatList
                      .map(s => {
                        const kode = s.match(/\(([^)]+)\)/)?.[1];
                        return kode || s.substring(0, 4);
                      });

                    return (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-3 align-top text-xs text-gray-400 text-center">{i + 1}</td>
                        <td className="px-3 py-3 align-top">
                          <div className="font-semibold text-xs text-gray-800 max-w-36 truncate">{row.namaProgram}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{row.pelaksana}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <span className="max-w-32 truncate">{row.lokasi}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top text-xs font-semibold text-blue-600">
                          {row.noSIKA !== '-' ? row.noSIKA : <span className="text-gray-300 font-normal italic">Belum diisi</span>}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {sertifikatIsi.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sertifikatIsi.map((k) => {
                                const checked = sertifikatData?.[row.sertifikatList.find(s => s.includes(k)) || ''];
                                return (
                                  <span
                                    key={k}
                                    title={checked ? `${k} — sudah dilengkapi` : `${k} — belum dilengkapi`}
                                    className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                      checked
                                        ? 'text-white shadow-sm'
                                        : 'text-gray-400 bg-gray-50 border border-gray-200'
                                    }`}
                                    style={checked ? { background: '#00954E' } : undefined}
                                  >
                                    {k}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {row.sifatPekerjaan && row.sifatPekerjaan !== '-' ? (
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                              style={{ background: row.sifatPekerjaan === 'Emergency' ? '#E31E24' : '#0E76BC' }}
                            >
                              {row.sifatPekerjaan}
                            </span>
                          ) : <span className="text-[10px] text-gray-300">-</span>}
                        </td>
                        <td className="px-3 py-3 align-top"><ApprovalBadge status={row.sikaStatusPJA} /></td>
                        <td className="px-3 py-3 align-top"><ApprovalBadge status={row.jsaStatusPJA} /></td>
                        <td className="px-3 py-3 align-top"><ApprovalBadge status={row.sikaStatusPemberi} /></td>
                        <td className="px-3 py-3 align-top"><ApprovalBadge status={row.jsaStatusPemberi} /></td>
                        <td className="px-3 py-3 align-top">
                          <RevalidasiCell
                            row={row}
                            baseStatus={baseStatus}
                            validatedDates={row.riwayatRevalidasi}
                            onAjukan={(rowId) => setRevalidasiModalRowId(rowId)}
                          />
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="space-y-1">
                            <StatusBadge status={overall} />
                            {hasTolak && (
                              <div className="text-[10px] text-red-500 leading-tight max-w-28">
                                {row.alasanTolakSika || row.alasanTolakJsa}
                              </div>
                            )}
                            {row.perubahanStatus === 'menunggu' && (
                              <div className="text-[10px] leading-tight max-w-28" style={{ color: '#F2A900' }}>
                                Perubahan menunggu approval Pemberi
                              </div>
                            )}
                            {row.perubahanStatus === 'ditolak' && (
                              <div className="text-[10px] text-red-500 leading-tight max-w-28">
                                Perubahan ditolak{row.alasanTolakPerubahan ? `: ${row.alasanTolakPerubahan}` : ''}
                              </div>
                            )}
                            {sisaHari !== null && sisaHari <= 7 && (baseStatus === 'aktif' || baseStatus === 'closed') && (
                              <div className={`text-[10px] leading-tight ${sisaHari <= 2 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                                {sisaHari < 0
                                  ? `Berakhir ${Math.abs(sisaHari)} hari lalu`
                                  : sisaHari === 0
                                  ? 'Berakhir hari ini'
                                  : `Berakhir dalam ${sisaHari} hari`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-col gap-1.5 items-start">
                            <button
                              onClick={() => handleLihatDetail(row.id)}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition"
                            >
                              Detail <ChevronRight size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {revalidasiModalRow && (
        <RevalidasiModal
          row={revalidasiModalRow}
          onClose={() => setRevalidasiModalRowId(null)}
          onSubmit={handleSubmitRevalidasi}
        />
      )}
    </div>
  );
}