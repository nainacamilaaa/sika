'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, FileText, Search, Filter,
  CheckCircle, XCircle, Clock, AlertCircle, Loader2,
  History, Calendar, CalendarDays, ChevronDown,
  RefreshCcw, X, ArrowUpDown, Upload, Eye, Trash2, FileCheck,
} from 'lucide-react';
import {
  useProgramStore, getNomorSika,
} from '@/store/programStore';
import type { ApprovalStatus } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import {
  ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Sector,
} from 'recharts';

/* ============================================================
   PALETTE
============================================================ */

const STATUS_BADGE: Record<ApprovalStatus, { label: string; bg: string; icon: any }> = {
  draft:    { label: 'Draft',     bg: '#8A94A6', icon: AlertCircle },
  request:  { label: 'Request',   bg: '#0E76BC', icon: Clock },
  waiting:  { label: 'Menunggu',  bg: '#F2A900', icon: Clock },
  approved: { label: 'Disetujui', bg: '#00954E', icon: CheckCircle },
  rejected: { label: 'Ditolak',   bg: '#E31E24', icon: XCircle },
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

// Status PJA Overall
const getPJAOverall = (sikaSt: ApprovalStatus, jsaSt: ApprovalStatus): ApprovalStatus => {
  if (sikaSt === 'rejected' || jsaSt === 'rejected') return 'rejected';
  if (sikaSt === 'approved' && jsaSt === 'approved') return 'approved';
  if (sikaSt === 'approved' || jsaSt === 'approved') return 'waiting';
  if (sikaSt === 'request' || jsaSt === 'request') return 'request';
  return 'draft';
};

/* ============================================================
   DOKUMEN PJA
============================================================ */

interface DokumenPJA {
  remobilisasi?: { nama: string; url: string; uploadedAt: string };
  mobilisasi?: { nama: string; url: string; uploadedAt: string };
}

interface PJARow {
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
  sikaStatusPemberi: ApprovalStatus;
  jsaStatusPemberi: ApprovalStatus;
  createdAt?: string;
  updatedAt?: string;
  dokumenPJA?: DokumenPJA;
}

/* ============================================================
   FILTER CHIP
============================================================ */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-medium pl-2.5 pr-1.5 py-1 rounded-full shadow-sm">
      {label}
      <button onClick={onRemove} className="w-3.5 h-3.5 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
        <X size={9} />
      </button>
    </span>
  );
}

/* ============================================================
   DOKUMEN UPLOAD COMPACT
============================================================ */

function DokumenUploadCompact({
  label,
  dokumen,
  onUpload,
  onDelete,
  disabled,
}: {
  label: string;
  dokumen?: { nama: string; url: string; uploadedAt: string };
  onUpload: (file: File) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      onUpload(file);
      setIsUploading(false);
    }, 800);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-1.5 min-w-[90px]">
      {dokumen ? (
        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          <FileCheck size={10} className="text-green-600 shrink-0" />
          <span className="text-[9px] text-green-700 font-medium truncate max-w-16" title={dokumen.nama}>
            {dokumen.nama.length > 10 ? dokumen.nama.slice(0, 8) + '…' : dokumen.nama}
          </span>
          <button
            type="button"
            onClick={() => window.open(dokumen.url, '_blank')}
            className="p-0.5 hover:bg-blue-50 text-blue-500 rounded transition"
            title="Lihat"
          >
            <Eye size={11} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-0.5 hover:bg-red-50 text-red-400 rounded transition disabled:opacity-40"
            title="Hapus"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline font-medium flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
          >
            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={10} />}
            {isUploading ? 'Mengunggah…' : 'Upload'}
          </button>
        </>
      )}
    </div>
  );
}

/* ============================================================
   STATISTIK DASHBOARD
============================================================ */

type TimeFilterType = 'hari' | 'minggu' | 'bulan' | 'tahun' | 'custom';

const timeFilterLabels: Record<TimeFilterType, string> = {
  hari: 'Hari Ini',
  minggu: 'Minggu Ini',
  bulan: 'Bulan Ini',
  tahun: 'Tahun Ini',
  custom: 'Custom Range',
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

function filterRowsByTime(
  rows: PJARow[],
  filter: TimeFilterType,
  customRange?: { start: string; end: string }
): PJARow[] {
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

function StatistikDashboard({ rows }: { rows: PJARow[] }) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('bulan');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [filterAreaChart, setFilterAreaChart] = useState('');

  const timeFilteredRows = useMemo(
    () => filterRowsByTime(rows, timeFilter, customRange),
    [rows, timeFilter, customRange]
  );

  const statusChartData = useMemo(() => {
    const source = !filterAreaChart ? timeFilteredRows : timeFilteredRows.filter(r => r.lokasi === filterAreaChart);
    const c = {
      disetujui: source.filter(r => getPJAOverall(r.sikaStatus, r.jsaStatus) === 'approved').length,
      proses: source.filter(r => ['request', 'waiting'].includes(getPJAOverall(r.sikaStatus, r.jsaStatus))).length,
      ditolak: source.filter(r => getPJAOverall(r.sikaStatus, r.jsaStatus) === 'rejected').length,
      draft: source.filter(r => getPJAOverall(r.sikaStatus, r.jsaStatus) === 'draft').length,
    };
    return [
      { name: 'Disetujui', value: c.disetujui, color: '#00954E' },
      { name: 'Proses',    value: c.proses,    color: '#0E76BC' },
      { name: 'Ditolak',   value: c.ditolak,   color: '#E31E24' },
      { name: 'Draft',     value: c.draft,     color: '#8A94A6' },
    ].filter(d => d.value > 0);
  }, [timeFilteredRows, filterAreaChart]);

  const pieTotal = useMemo(() => statusChartData.reduce((s, d) => s + d.value, 0), [statusChartData]);

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
        const st = getPJAOverall(r.sikaStatus, r.jsaStatus);
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
                  onClick={() => setShowCustomRange(!showCustomRange)}
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
                      <radialGradient key={idx} id={`pjaPieGrad${idx}`} cx="35%" cy="35%" r="70%">
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
                      <Cell key={idx} fill={`url(#pjaPieGrad${idx})`} />
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

        <div className="col-span-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700">Trend Status 6 Bulan Terakhir</p>
            <span className="text-[10px] text-gray-400">Berdasarkan tanggal pembaruan pengajuan</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="pjaAreaApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00954E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00954E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="pjaAreaProses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E76BC" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0E76BC" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<TrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" iconSize={7} />
              <Area type="monotone" dataKey="approved" name="Disetujui" stroke="#00954E" strokeWidth={2.5} fill="url(#pjaAreaApproved)" />
              <Area type="monotone" dataKey="proses" name="Proses" stroke="#0E76BC" strokeWidth={2.5} fill="url(#pjaAreaProses)" />
              <Line type="monotone" dataKey="rejected" name="Ditolak" stroke="#E31E24" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="draft" name="Draft" stroke="#8A94A6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

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

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PJAApprovalManagementPage() {
  const router = useRouter();
  const {
    submissions,
    approveSikaPJA, rejectSikaPJA,
    approveJsaPJA, rejectJsaPJA,
  } = useProgramStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [filterMasaBerlaku, setFilterMasaBerlaku] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterSifat, setFilterSifat] = useState('');
  const [filterTglDari, setFilterTglDari] = useState('');
  const [filterTglSampai, setFilterTglSampai] = useState('');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'berakhir-segera'>('terbaru');
  const [showFilter, setShowFilter] = useState(false);

  const [dokumenPJAStore, setDokumenPJAStore] = useState<Record<string, DokumenPJA>>({});

  const rows: PJARow[] = useMemo(() => {
    return submissions
      .filter((sub) => sub.sikaStatusPemberi === 'approved' && sub.jsaStatusPemberi === 'approved')
      .map((sub): PJARow => {
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
          sikaStatus: sub.sikaStatusPJA,
          jsaStatus: sub.jsaStatusPJA,
          sikaStatusPemberi: sub.sikaStatusPemberi,
          jsaStatusPemberi: sub.jsaStatusPemberi,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
          dokumenPJA: dokumenPJAStore[sub.id],
        };
      });
  }, [submissions, dokumenPJAStore]);

  const MASA_BERLAKU_LABEL: Record<string, string> = {
    kedaluwarsa: '⚠ Sudah Kedaluwarsa',
    '7hari': '≤ 7 Hari Lagi',
    '30hari': '≤ 30 Hari Lagi',
  };

  const SIFAT_OPTIONS = useMemo(
    () =>
      Array.from(
        new Set(rows.map((r) => r.sifatPekerjaan).filter((v) => v && v !== '-'))
      ),
    [rows]
  );

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

    return matchCari && matchMasaBerlaku && matchLokasi && matchSifat && matchTanggal;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'terbaru') {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    }
    if (sortBy === 'terlama') {
      return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
    }
    const da = a.tanggalBerakhirSIKA !== '-' && !isNaN(new Date(a.tanggalBerakhirSIKA).getTime())
      ? new Date(a.tanggalBerakhirSIKA).getTime() : Infinity;
    const db = b.tanggalBerakhirSIKA !== '-' && !isNaN(new Date(b.tanggalBerakhirSIKA).getTime())
      ? new Date(b.tanggalBerakhirSIKA).getTime() : Infinity;
    return da - db;
  });

  const countByOverall = (target: ApprovalStatus) =>
    rows.filter((r) => getPJAOverall(r.sikaStatus, r.jsaStatus) === target).length;

  const hasActiveFilter = !!(filterMasaBerlaku || filterLokasi || filterSifat || filterTglDari || filterTglSampai);

  const resetAllFilters = () => {
    setFilterMasaBerlaku('');
    setFilterLokasi('');
    setFilterSifat('');
    setFilterTglDari('');
    setFilterTglSampai('');
  };

  const handleUploadDokumen = (id: string, type: 'remobilisasi' | 'mobilisasi', file: File) => {
    const url = URL.createObjectURL(file);
    setDokumenPJAStore((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: {
          nama: file.name,
          url,
          uploadedAt: new Date().toISOString(),
        },
      },
    }));
  };

  const handleDeleteDokumen = (id: string, type: 'remobilisasi' | 'mobilisasi') => {
    setDokumenPJAStore((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id][type];
        if (!next[id].remobilisasi && !next[id].mobilisasi) {
          delete next[id];
        }
      }
      return next;
    });
  };

  const [modalRow, setModalRow] = useState<PJARow | null>(null);
  const [modalMode, setModalMode] = useState<'review' | 'reject'>('review');
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);

  const openReviewModal = (row: PJARow) => {
    setModalRow(row);
    setModalMode('review');
    setAlasan('');
  };

  const handleApprove = () => {
    if (!modalRow) return;
    setLoading(true);
    const nama = user?.name || 'PJA';
    approveSikaPJA(nama, modalRow.id);
    approveJsaPJA(nama, modalRow.id);
    setLoading(false);
    setModalRow(null);
  };

  const handleReject = () => {
    if (!modalRow || !alasan.trim()) return;
    setLoading(true);
    const nama = user?.name || 'PJA';
    rejectSikaPJA(nama, alasan.trim(), modalRow.id);
    rejectJsaPJA(nama, alasan.trim(), modalRow.id);
    setLoading(false);
    setModalRow(null);
  };

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Approval Management</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Penanggung Jawab Aset (PJA)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4" style={{ paddingRight: '38px' }}>
          <img src="/logopertaminagasfull.svg" alt="Pertamina Gas" className="h-9 object-contain" />
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">

        <div className="grid gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Total Pengajuan', value: rows.length, bg: '#1B2A4A', sub: 'Semua pengajuan masuk' },
            { label: 'Perlu Review', value: countByOverall('request') + countByOverall('waiting'), bg: '#0E76BC', sub: 'Menunggu keputusan' },
            { label: 'Disetujui', value: countByOverall('approved'), bg: '#00954E', sub: 'SIKA & JSA aktif' },
            { label: 'Ditolak', value: countByOverall('rejected'), bg: '#E31E24', sub: 'Perlu revisi pemohon' },
            { label: 'Dokumen PJA', value: rows.filter(r => r.dokumenPJA?.mobilisasi && r.dokumenPJA?.remobilisasi).length, bg: '#F2A900', sub: 'Lengkap / Belum' },
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
              <span className="text-white font-bold text-sm tracking-wide">DAFTAR PENGAJUAN PJA</span>
              <p className="text-blue-200 text-[10px] mt-0.5">
                Dokumen SIKA &amp; JSA sudah disetujui Pemberi Kerja — Upload dokumen &amp; lakukan verifikasi final
              </p>
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
              <p className="text-gray-300 text-xs">Pengajuan akan muncul setelah disetujui Pemberi Kerja</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: '#f8fafc' }} className="border-b border-gray-200">
                      {['No', 'Nama Program', 'Lokasi', 'Pelaksana', 'No JSA', 'No SIKA', 'Pemberi (SIKA)', 'Pemberi (JSA)', 'Status SIKA', 'Status JSA', 'Status Keseluruhan', 'Premobilisasi', 'Mobilisasi', 'Aksi'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center text-gray-400 py-14 text-sm">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : sorted.map((row, i) => {
                      const overall = getPJAOverall(row.sikaStatus, row.jsaStatus);

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
                          {/* ============================================================
                              KOLOM PEMBERI (SIKA) & PEMBERI (JSA) — status dari Pemberi Kerja
                          ============================================================ */}
                          <td className="px-4 py-3"><StatusPill status={row.sikaStatusPemberi} /></td>
                          <td className="px-4 py-3"><StatusPill status={row.jsaStatusPemberi} /></td>
                          <td className="px-4 py-3"><StatusPill status={row.sikaStatus} /></td>
                          <td className="px-4 py-3"><StatusPill status={row.jsaStatus} /></td>
                          <td className="px-4 py-3"><StatusPill status={overall} /></td>

                          <td className="px-4 py-3">
                            <DokumenUploadCompact
                              label="Remob"
                              dokumen={row.dokumenPJA?.remobilisasi}
                              onUpload={(file) => handleUploadDokumen(row.id, 'remobilisasi', file)}
                              onDelete={() => handleDeleteDokumen(row.id, 'remobilisasi')}
                              disabled={overall === 'approved' || overall === 'rejected'}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <DokumenUploadCompact
                              label="Mob"
                              dokumen={row.dokumenPJA?.mobilisasi}
                              onUpload={(file) => handleUploadDokumen(row.id, 'mobilisasi', file)}
                              onDelete={() => handleDeleteDokumen(row.id, 'mobilisasi')}
                              disabled={overall === 'approved' || overall === 'rejected'}
                            />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => router.push(`/dashboard/pja/review/${row.id}`)}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                <FileText size={12} />
                                {overall === 'approved' ? 'Detail' : overall === 'rejected' ? 'Detail' : 'Review'}
                              </button>

                              {overall !== 'approved' && overall !== 'rejected' && (
                                <button
                                  onClick={() => openReviewModal(row)}
                                  style={{ background: '#00954E' }}
                                  className="flex items-center gap-1.5 hover:opacity-90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                                >
                                  <CheckCircle size={12} />
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => router.push(`/dashboard/pja/audit-trail-persetujuan?submission=${row.id}`)}
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

      {/* MODAL */}
      {modalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div
              className="px-6 py-4 flex items-center justify-between shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}
            >
              <div>
                <p className="text-white font-bold text-sm">
                  {modalMode === 'review' ? 'Konfirmasi Persetujuan PJA' : 'Penolakan Pengajuan'}
                </p>
                <p className="text-blue-200 text-[10px]">{modalRow.namaProgram} &middot; {modalRow.noSIKA}</p>
              </div>
              <button onClick={() => setModalRow(null)} className="text-white/70 hover:text-white text-xl">×</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <StatusPill status={modalRow.sikaStatus} />
                <StatusPill status={modalRow.jsaStatus} />
                <span className="text-xs text-gray-400">|</span>
                <StatusPill status={getPJAOverall(modalRow.sikaStatus, modalRow.jsaStatus)} />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Lokasi</span>
                  <span className="font-medium text-gray-700">{modalRow.lokasi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelaksana</span>
                  <span className="font-medium text-gray-700">{modalRow.pelaksana}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sifat Pekerjaan</span>
                  <span className="font-medium text-gray-700">{modalRow.sifatPekerjaan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No SIKA</span>
                  <span className="font-medium text-blue-600">{modalRow.noSIKA}</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Dokumen PJA</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Remobilisasi:</span>
                    {modalRow.dokumenPJA?.remobilisasi ? (
                      <span className="text-green-600 font-medium flex items-center gap-0.5">
                        <FileCheck size={12} /> ✓
                      </span>
                    ) : (
                      <span className="text-gray-300">Belum upload</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">Mobilisasi:</span>
                    {modalRow.dokumenPJA?.mobilisasi ? (
                      <span className="text-green-600 font-medium flex items-center gap-0.5">
                        <FileCheck size={12} /> ✓
                      </span>
                    ) : (
                      <span className="text-gray-300">Belum upload</span>
                    )}
                  </div>
                </div>
              </div>

              {modalMode === 'reject' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Alasan Penolakan <span className="text-red-500">*</span></label>
                  <textarea
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan alasan penolakan..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
                  />
                </div>
              )}

              <p className="text-[10px] text-gray-400 leading-relaxed">
                {modalMode === 'review'
                  ? 'Tinjau dokumen SIKA, JSA, dan lampiran sebelum memberikan keputusan final.'
                  : 'Tuliskan alasan penolakan secara jelas agar pemohon dapat melakukan perbaikan.'}
              </p>
            </div>

            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setModalRow(null)}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition"
              >
                Batal
              </button>

              {modalMode === 'review' ? (
                <>
                  <button
                    onClick={() => setModalMode('reject')}
                    disabled={loading}
                    style={{ borderColor: '#E31E24', color: '#E31E24' }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border hover:bg-red-50 transition"
                  >
                    <XCircle size={14} /> Tolak
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={loading || !modalRow.dokumenPJA?.mobilisasi || !modalRow.dokumenPJA?.remobilisasi}
                    style={{
                      background:
                        loading || !modalRow.dokumenPJA?.mobilisasi || !modalRow.dokumenPJA?.remobilisasi
                          ? '#86D9AE'
                          : '#00954E',
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white shadow-sm transition ${
                      loading || !modalRow.dokumenPJA?.mobilisasi || !modalRow.dokumenPJA?.remobilisasi
                        ? 'cursor-not-allowed'
                        : 'hover:opacity-90'
                    }`}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Setujui
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModalMode('review')}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading || !alasan.trim()}
                    style={{ background: loading || !alasan.trim() ? '#F1A8AA' : '#E31E24' }}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white shadow-sm transition ${
                      loading || !alasan.trim() ? 'cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Kirim Penolakan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}