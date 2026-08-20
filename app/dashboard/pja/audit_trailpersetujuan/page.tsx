'use client';

import { useMemo, useState } from 'react';
import {
  ShieldCheck, Search, Filter, Download, X, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, RefreshCcw, Send, ClipboardEdit, Calendar, CalendarDays,
  ListFilter, LayoutList, GitCommitVertical, User, MapPin, FileText, Hash,
  ArrowUpDown, Info, Fingerprint, PauseCircle, PlayCircle, ChevronUp,
  Users, Building2, ShieldAlert, Rows3, ListTree, Eye,
} from 'lucide-react';

/* ============================================================
   TYPES (dummy)
============================================================ */

type Aksi = 
  | 'submit' | 'approve' | 'reject' 
  | 'ajukan_ulang' | 'ajukan_revalidasi' | 'setuju_revalidasi' 
  | 'minta_revisi' | 'suspend' | 'aktifkan_kembali' | 'verifikasi';

type Dokumen = 'sika' | 'jsa' | 'perubahan' | 'revalidasi' | 'dokumen_pja';

type Peran = 'pemohon' | 'pemberi' | 'pja';

interface AuditEntry {
  id: string;
  submissionId: string;
  timestamp: string;
  aksi: Aksi;
  dokumen: Dokumen;
  oleh: string;
  jabatan: string;
  peran: Peran;
  namaProgram: string;
  noSIKA: string;
  lokasi: string;
  alasan?: string | null;
  dokumenPJA?: { nama: string; jenis: 'remobilisasi' | 'mobilisasi' }[];
}

/* ============================================================
   DUMMY DATA GENERATOR
============================================================ */

const LOKASI_LIST = [
  'Operation Rokan Area', 'Operation Dumai Area', 'Operation Central Sumatera Area',
  'Operation South Sumatera Area', 'Operation West Java Area', 'Kantor Pusat',
  'Operation Kalimantan Area', 'Project Management',
];

const PROGRAM_LIST = [
  { nama: 'Perbaikan Pipa Gas Distrik 4', noSIKA: 'ROK-0142' },
  { nama: 'Maintenance Kompresor Unit 2', noSIKA: 'DUM-0087' },
  { nama: 'Penggantian Valve Header Utama', noSIKA: 'CSM-0219' },
  { nama: 'Inspeksi Tangki Timbun T-105', noSIKA: 'SSM-0033' },
  { nama: 'Instalasi Kabel Bawah Tanah', noSIKA: 'WJV-0155' },
  { nama: 'Pengelasan Sambungan Pipa 12"', noSIKA: 'ROK-0198' },
  { nama: 'Pembersihan Scrubber Gas', noSIKA: 'KPT-0061' },
  { nama: 'Kalibrasi Instrumen Metering', noSIKA: 'KAL-0044' },
  { nama: 'Penggalian Jalur Pipa Baru', noSIKA: 'PMJ-0077' },
  { nama: 'Overhaul Generator Darurat', noSIKA: 'DUM-0112' },
];

const PETUGAS_PJA = [
  { nama: 'Ir. Hendra Wijaya', jabatan: 'Asset Holder (IA)', peran: 'pja' as Peran },
  { nama: 'Ratna Kusuma, S.T.', jabatan: 'Issuing Authority', peran: 'pja' as Peran },
  { nama: 'Drs. Ahmad Fauzi', jabatan: 'Senior Asset Manager', peran: 'pja' as Peran },
  { nama: 'Ir. Budi Santoso', jabatan: 'Field Asset Supervisor', peran: 'pja' as Peran },
  { nama: 'Dewi Lestari, S.T.', jabatan: 'Asset Integrity Engineer', peran: 'pja' as Peran },
];

const PETUGAS_LAIN = [
  { nama: 'Ir. Bambang Sutrisno', jabatan: 'Manager Operation', peran: 'pemberi' as Peran },
  { nama: 'Andika Prasetyo', jabatan: 'Supervisor Pelaksana', peran: 'pemohon' as Peran },
  { nama: 'Siti Nurhaliza', jabatan: 'Admin Kontraktor', peran: 'pemohon' as Peran },
  { nama: 'M. Rizky Ramadhan', jabatan: 'PIC Kontrak', peran: 'pemberi' as Peran },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function generateDummyEntries(): AuditEntry[] {
  const entries: AuditEntry[] = [];
  const now = new Date();
  let idCounter = 1;

  PROGRAM_LIST.forEach((prog, pIdx) => {
    const submissionId = `sub-pja-${pIdx + 1}`;
    const lokasi = pick(LOKASI_LIST, pIdx + 3);
    const daysAgoStart = 2 + pIdx * 2;

    // Flow PJA: setelah Pemberi approve, PJA melakukan verifikasi
    const flow: { aksi: Aksi; dokumen: Dokumen; offsetHours: number; petugasIdx: number; alasan?: string; dokumenPJA?: { nama: string; jenis: 'remobilisasi' | 'mobilisasi' }[] }[] = [];

    // 1. SIKA & JSA masuk ke PJA (dari Pemberi)
    flow.push({ aksi: 'approve', dokumen: 'sika', offsetHours: 2, petugasIdx: 0 });
    flow.push({ aksi: 'approve', dokumen: 'jsa', offsetHours: 3, petugasIdx: 0 });

    // 2. PJA upload dokumen
    flow.push({
      aksi: 'verifikasi',
      dokumen: 'dokumen_pja',
      offsetHours: 8,
      petugasIdx: 1,
      dokumenPJA: [
        { nama: 'Remobilisasi_PJA_ROK0142_v1.pdf', jenis: 'remobilisasi' },
        { nama: 'Mobilisasi_PJA_ROK0142_v1.pdf', jenis: 'mobilisasi' },
      ],
    });

    // Branch berdasarkan index
    const branch = pIdx % 4;

    if (branch === 0) {
      // Disetujui penuh
      flow.push({ aksi: 'approve', dokumen: 'sika', offsetHours: 12, petugasIdx: 2 });
      flow.push({ aksi: 'approve', dokumen: 'jsa', offsetHours: 13, petugasIdx: 2 });
      flow.push({ aksi: 'approve', dokumen: 'perubahan', offsetHours: 14, petugasIdx: 2, alasan: 'Verifikasi dokumen lengkap dan sesuai prosedur.' });
    } else if (branch === 1) {
      // Ditolak - minta revisi
      flow.push({
        aksi: 'reject',
        dokumen: 'jsa',
        offsetHours: 10,
        petugasIdx: 1,
        alasan: 'Dokumen JSA belum mencantumkan prosedur darurat untuk area bertegangan tinggi.',
      });
      flow.push({
        aksi: 'ajukan_ulang',
        dokumen: 'jsa',
        offsetHours: 18,
        petugasIdx: 3,
        alasan: 'Revisi JSA telah dilengkapi dengan prosedur darurat.',
      });
      flow.push({ aksi: 'approve', dokumen: 'jsa', offsetHours: 22, petugasIdx: 2 });
      flow.push({ aksi: 'approve', dokumen: 'sika', offsetHours: 23, petugasIdx: 2 });
    } else if (branch === 2) {
      // Suspend karena masalah dokumen
      flow.push({
        aksi: 'suspend',
        dokumen: 'sika',
        offsetHours: 16,
        petugasIdx: 3,
        alasan: 'Ditemukan ketidaksesuaian antara dokumen mobilisasi dan kondisi lapangan saat inspeksi.',
      });
      flow.push({
        aksi: 'aktifkan_kembali',
        dokumen: 'sika',
        offsetHours: 28,
        petugasIdx: 4,
        alasan: 'Tindakan korektif telah dilakukan dan diverifikasi ulang.',
      });
      flow.push({ aksi: 'approve', dokumen: 'sika', offsetHours: 32, petugasIdx: 0 });
      flow.push({ aksi: 'approve', dokumen: 'jsa', offsetHours: 33, petugasIdx: 0 });
    } else {
      // Ajukan revalidasi dari PJA
      flow.push({
        aksi: 'ajukan_revalidasi',
        dokumen: 'perubahan',
        offsetHours: 20,
        petugasIdx: 4,
        alasan: 'Perubahan jadwal pelaksanaan karena penyesuaian cuaca.',
      });
      flow.push({
        aksi: 'setuju_revalidasi',
        dokumen: 'perubahan',
        offsetHours: 24,
        petugasIdx: 2,
      });
      flow.push({ aksi: 'approve', dokumen: 'sika', offsetHours: 26, petugasIdx: 0 });
      flow.push({ aksi: 'approve', dokumen: 'jsa', offsetHours: 27, petugasIdx: 0 });
    }

    flow.forEach((f) => {
      const petugas = f.petugasIdx < PETUGAS_PJA.length 
        ? PETUGAS_PJA[f.petugasIdx] 
        : PETUGAS_LAIN[f.petugasIdx - PETUGAS_PJA.length];
      const ts = new Date(now.getTime() - daysAgoStart * 86400000 + f.offsetHours * 3600000);
      entries.push({
        id: `log-pja-${idCounter++}`,
        submissionId,
        timestamp: ts.toISOString(),
        aksi: f.aksi,
        dokumen: f.dokumen,
        oleh: petugas.nama,
        jabatan: petugas.jabatan,
        peran: petugas.peran,
        namaProgram: prog.nama,
        noSIKA: prog.noSIKA,
        lokasi,
        alasan: f.alasan ?? null,
        dokumenPJA: f.dokumenPJA,
      });
    });
  });

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const DUMMY_ENTRIES = generateDummyEntries();

/* ============================================================
   HELPERS & CONFIG
============================================================ */

const AKSI_CONFIG: Record<Aksi, { label: string; bg: string; icon: any; verb: string; kategori: string }> = {
  submit:            { label: 'Pengajuan',            bg: '#0E76BC', icon: Send,          verb: 'Mengajukan',            kategori: 'Pengajuan' },
  approve:           { label: 'Persetujuan',          bg: '#00954E', icon: CheckCircle2,  verb: 'Menyetujui',            kategori: 'Keputusan Utama' },
  reject:            { label: 'Penolakan',            bg: '#E31E24', icon: XCircle,       verb: 'Menolak',               kategori: 'Keputusan Utama' },
  ajukan_ulang:      { label: 'Ajukan Ulang',         bg: '#0E76BC', icon: RefreshCcw,    verb: 'Mengajukan ulang',      kategori: 'Pengajuan' },
  ajukan_revalidasi: { label: 'Ajukan Revalidasi',    bg: '#0E76BC', icon: ClipboardEdit, verb: 'Mengajukan revalidasi', kategori: 'Revalidasi' },
  setuju_revalidasi: { label: 'Revalidasi Disetujui', bg: '#00954E', icon: CheckCircle2,  verb: 'Menyetujui revalidasi', kategori: 'Revalidasi' },
  minta_revisi:      { label: 'Minta Revisi',         bg: '#F2A900', icon: RefreshCcw,    verb: 'Meminta revisi',        kategori: 'Revalidasi' },
  suspend:           { label: 'Disuspend',            bg: '#9333EA', icon: PauseCircle,   verb: 'Men-suspend',           kategori: 'Status SIKA' },
  aktifkan_kembali:  { label: 'Diaktifkan Kembali',   bg: '#00954E', icon: PlayCircle,    verb: 'Mengaktifkan kembali',  kategori: 'Status SIKA' },
  verifikasi:        { label: 'Verifikasi Dokumen',   bg: '#1B2A4A', icon: ShieldCheck,   verb: 'Memverifikasi',         kategori: 'Dokumen PJA' },
};

const DOKUMEN_LABEL: Record<Dokumen, string> = {
  sika: 'SIKA',
  jsa: 'JSA',
  perubahan: 'Perubahan Data',
  revalidasi: 'Revalidasi',
  dokumen_pja: 'Dokumen PJA',
};

const PERAN_INFO: Record<Peran, { label: string; bg: string; icon: any; deskripsi: string }> = {
  pemohon: { label: 'Pemohon', bg: '#4B5568', icon: Users, deskripsi: 'Kontraktor / pelaksana pekerjaan' },
  pemberi: { label: 'Pemberi Kerja', bg: '#1B2A4A', icon: Building2, deskripsi: 'Fungsi penanggung jawab pekerjaan' },
  pja: { label: 'Penanggung Jawab Aset', bg: '#0E76BC', icon: ShieldAlert, deskripsi: 'Asset Holder / Issuing Authority' },
};

type TimeFilterType = 'semua' | 'hari' | 'minggu' | 'bulan' | 'custom';
type ViewMode = 'grup' | 'tabel' | 'timeline';
type SortMode = 'terbaru' | 'terlama';
type PeranTab = 'semua' | Peran;

const timeFilterLabels: Record<TimeFilterType, string> = {
  semua: 'Semua Waktu',
  hari: 'Hari Ini',
  minggu: '7 Hari Terakhir',
  bulan: '30 Hari Terakhir',
  custom: 'Rentang Kustom',
};

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB';
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function refHash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

/* ============================================================
   SUBCOMPONENTS
============================================================ */

function AksiBadge({ aksi }: { aksi: Aksi }) {
  const cfg = AKSI_CONFIG[aksi];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center h-5 leading-none gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      <Icon size={10} strokeWidth={3} className="shrink-0" />
      {cfg.label}
    </span>
  );
}

function PeranBadge({ peran, compact = false }: { peran: Peran; compact?: boolean }) {
  const cfg = PERAN_INFO[peran];
  return (
    <span
      className={`inline-flex items-center h-5 leading-none gap-1 text-[10px] font-medium rounded-full whitespace-nowrap text-white shadow-sm ${compact ? 'px-1.5' : 'px-2'}`}
      style={{ background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

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

function DokumenPJATag({ dokumen }: { dokumen: { nama: string; jenis: 'remobilisasi' | 'mobilisasi' }[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {dokumen.map((d, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
            d.jenis === 'remobilisasi' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          <FileText size={8} />
          {d.jenis === 'remobilisasi' ? 'Remob' : 'Mob'}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   DETAIL DRAWER
============================================================ */

function DetailDrawer({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const cfg = AKSI_CONFIG[entry.aksi];
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div
          className="px-6 py-5 flex items-start justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-white" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm">{cfg.label}</p>
              <p className="text-blue-200 text-[11px] mt-0.5">{DOKUMEN_LABEL[entry.dokumen]} &middot; {entry.noSIKA}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition shrink-0">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-1">Waktu Kejadian</p>
            <p className="text-sm font-semibold text-gray-800">{formatFullDate(entry.timestamp)}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">Petugas</p>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
              <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                {entry.oleh.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{entry.oleh}</p>
                <p className="text-[11px] text-gray-400 truncate">{entry.jabatan}</p>
              </div>
              <div className="ml-auto shrink-0">
                <PeranBadge peran={entry.peran} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">Program Terkait</p>
            <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <FileText size={12} className="text-gray-400 shrink-0" />
                <span className="font-medium">{entry.namaProgram}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Hash size={12} className="text-gray-400 shrink-0" />
                <span className="font-semibold text-blue-600">{entry.noSIKA}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={12} className="text-gray-400 shrink-0" />
                <span>{entry.lokasi}</span>
              </div>
            </div>
          </div>

          {entry.dokumenPJA && entry.dokumenPJA.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">Dokumen PJA</p>
              <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
                {entry.dokumenPJA.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <FileText size={12} className="text-blue-500 shrink-0" />
                    <span className="text-gray-700">{d.nama}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                      d.jenis === 'remobilisasi' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {d.jenis}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entry.alasan && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2">
                {entry.aksi === 'reject' ? 'Alasan Penolakan' : entry.aksi === 'minta_revisi' ? 'Catatan Revisi' : entry.aksi === 'suspend' ? 'Alasan Suspend' : 'Catatan'}
              </p>
              <div className="rounded-xl border px-4 py-3 text-xs leading-relaxed"
                style={{
                  borderColor: entry.aksi === 'reject' || entry.aksi === 'suspend' ? '#E31E2440' : '#F2A90050',
                  background: entry.aksi === 'reject' || entry.aksi === 'suspend' ? '#E31E2410' : '#F2A90012',
                  color: entry.aksi === 'reject' || entry.aksi === 'suspend' ? '#9f1d21' : '#7a5200',
                }}
              >
                {entry.alasan}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-dashed border-gray-200">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-2 flex items-center gap-1.5">
              <Fingerprint size={11} /> Integritas Log
            </p>
            <div className="rounded-xl bg-gray-900 text-gray-100 px-4 py-3 font-mono text-[11px] leading-relaxed space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Ref ID</span><span>#{refHash(entry.id)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Log ID</span><span>{entry.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submission</span><span>{entry.submissionId}</span></div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0 flex justify-end">
          <button onClick={onClose} className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ENTRY ROW
============================================================ */

function EntryRow({ e, onClick, showProgram }: { e: AuditEntry; onClick: () => void; showProgram: boolean }) {
  return (
    <tr onClick={onClick} className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors cursor-pointer">
      <td className="px-4 py-2.5 align-top whitespace-nowrap w-28">
        <div className="text-xs font-semibold text-gray-700">{formatShortDate(e.timestamp)}</div>
        <div className="text-[10px] text-gray-400">{formatTime(e.timestamp)}</div>
      </td>
      <td className="px-4 py-2.5 align-top w-40"><AksiBadge aksi={e.aksi} /></td>
      <td className="px-4 py-2.5 align-top text-xs text-gray-600 w-24">{DOKUMEN_LABEL[e.dokumen]}</td>
      {showProgram && (
        <td className="px-4 py-2.5 align-top">
          <div className="text-xs font-semibold text-gray-800 max-w-48 truncate">{e.namaProgram}</div>
          <div className="text-[10px] text-blue-600 font-medium">{e.noSIKA}</div>
        </td>
      )}
      <td className="px-4 py-2.5 align-top">
        <div className="text-xs font-medium text-gray-700 max-w-40 truncate">{e.oleh}</div>
        <div className="text-[10px] text-gray-400 truncate max-w-40">{e.jabatan}</div>
      </td>
      <td className="px-4 py-2.5 align-top w-36"><PeranBadge peran={e.peran} /></td>
      <td className="px-4 py-2.5 align-top">
        {e.dokumenPJA ? (
          <DokumenPJATag dokumen={e.dokumenPJA} />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-2.5 align-top text-xs text-gray-500 max-w-64 truncate">{e.alasan || '-'}</td>
      <td className="px-4 py-2.5 align-top text-right w-16">
        <span className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1 justify-end">
          <Eye size={12} /> Detail
        </span>
      </td>
    </tr>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PJAAuditTrailPage() {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grup');
  const [sortMode, setSortMode] = useState<SortMode>('terbaru');
  const [peranTab, setPeranTab] = useState<PeranTab>('pja');

  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('bulan');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [filterAksi, setFilterAksi] = useState<Aksi | ''>('');
  const [filterDokumen, setFilterDokumen] = useState<Dokumen | ''>('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterPetugas, setFilterPetugas] = useState('');

  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const GROUPS_PER_PAGE = 5;

  const allPetugas = useMemo(() => [...new Set(DUMMY_ENTRIES.map((e) => e.oleh))].sort(), []);
  const allLokasi = useMemo(() => [...new Set(DUMMY_ENTRIES.map((e) => e.lokasi))].sort(), []);

  const timeFiltered = useMemo(() => {
    if (timeFilter === 'semua') return DUMMY_ENTRIES;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return DUMMY_ENTRIES.filter((e) => {
      const d = new Date(e.timestamp);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (timeFilter === 'hari') return dOnly.getTime() === today.getTime();
      if (timeFilter === 'minggu') {
        const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
        return dOnly >= weekAgo && dOnly <= today;
      }
      if (timeFilter === 'bulan') {
        const monthAgo = new Date(today); monthAgo.setDate(today.getDate() - 29);
        return dOnly >= monthAgo && dOnly <= today;
      }
      if (timeFilter === 'custom') {
        if (!customRange.start || !customRange.end) return true;
        const start = new Date(customRange.start);
        const end = new Date(customRange.end); end.setHours(23, 59, 59);
        return d >= start && d <= end;
      }
      return true;
    });
  }, [timeFilter, customRange]);

  const preTabFiltered = useMemo(() => {
    return timeFiltered.filter((e) => {
      const matchSearch = !search ||
        e.namaProgram.toLowerCase().includes(search.toLowerCase()) ||
        e.noSIKA.toLowerCase().includes(search.toLowerCase()) ||
        e.oleh.toLowerCase().includes(search.toLowerCase());
      const matchAksi = !filterAksi || e.aksi === filterAksi;
      const matchDokumen = !filterDokumen || e.dokumen === filterDokumen;
      const matchLokasi = !filterLokasi || e.lokasi === filterLokasi;
      const matchPetugas = !filterPetugas || e.oleh === filterPetugas;
      return matchSearch && matchAksi && matchDokumen && matchLokasi && matchPetugas;
    });
  }, [timeFiltered, search, filterAksi, filterDokumen, filterLokasi, filterPetugas]);

  const tabCounts = useMemo(() => ({
    semua: preTabFiltered.length,
    pemohon: preTabFiltered.filter((e) => e.peran === 'pemohon').length,
    pemberi: preTabFiltered.filter((e) => e.peran === 'pemberi').length,
    pja: preTabFiltered.filter((e) => e.peran === 'pja').length,
  }), [preTabFiltered]);

  const filtered = useMemo(() => {
    return preTabFiltered.filter((e) => peranTab === 'semua' || e.peran === peranTab);
  }, [preTabFiltered, peranTab]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      return sortMode === 'terbaru' ? tb - ta : ta - tb;
    });
    return arr;
  }, [filtered, sortMode]);

  const stats = useMemo(() => {
    const persetujuan = filtered.filter((e) => e.aksi === 'approve' || e.aksi === 'setuju_revalidasi').length;
    const penolakan = filtered.filter((e) => e.aksi === 'reject').length;
    const suspend = filtered.filter((e) => e.aksi === 'suspend').length;
    const verifikasi = filtered.filter((e) => e.aksi === 'verifikasi').length;
    const petugasTerlibat = new Set(filtered.map((e) => e.oleh)).size;
    return { total: filtered.length, persetujuan, penolakan, suspend, verifikasi, petugasTerlibat };
  }, [filtered]);

  const hasActiveFilter = !!(filterAksi || filterDokumen || filterLokasi || filterPetugas);

  const resetFilters = () => {
    setFilterAksi(''); setFilterDokumen(''); setFilterLokasi(''); setFilterPetugas('');
  };

  const handleExportCSV = () => {
    const header = ['Waktu', 'Aksi', 'Dokumen', 'Program', 'No SIKA', 'Lokasi', 'Petugas', 'Jabatan', 'Peran', 'Dokumen PJA', 'Catatan'];
    const rows = sorted.map((e) => [
      formatFullDate(e.timestamp), AKSI_CONFIG[e.aksi].label, DOKUMEN_LABEL[e.dokumen],
      e.namaProgram, e.noSIKA, e.lokasi, e.oleh, e.jabatan, PERAN_INFO[e.peran].label,
      e.dokumenPJA ? e.dokumenPJA.map(d => `${d.jenis}:${d.nama}`).join('; ') : '',
      e.alasan ?? '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-pja_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const programGroups = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    sorted.forEach((e) => {
      if (!map.has(e.submissionId)) map.set(e.submissionId, []);
      map.get(e.submissionId)!.push(e);
    });
    const groups = [...map.entries()].map(([submissionId, entries]) => {
      const latest = entries.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
      return { submissionId, entries, latest };
    });
    groups.sort((a, b) => {
      const ta = new Date(a.latest.timestamp).getTime();
      const tb = new Date(b.latest.timestamp).getTime();
      return sortMode === 'terbaru' ? tb - ta : ta - tb;
    });
    return groups;
  }, [sorted, sortMode]);

  const totalGroupPages = Math.max(1, Math.ceil(programGroups.length / GROUPS_PER_PAGE));
  const currentGroupPage = Math.min(page, totalGroupPages);
  const paginatedGroups = programGroups.slice((currentGroupPage - 1) * GROUPS_PER_PAGE, currentGroupPage * GROUPS_PER_PAGE);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedFlat = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const timelineGroups = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    sorted.forEach((e) => {
      const key = dayKey(e.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return [...map.entries()];
  }, [sorted]);

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const PERAN_TABS: { key: PeranTab; label: string; icon: any }[] = [
    { key: 'semua', label: 'Semua Aktivitas', icon: Rows3 },
    { key: 'pemohon', label: 'Pemohon', icon: Users },
    { key: 'pemberi', label: 'Pemberi Kerja', icon: Building2 },
    { key: 'pja', label: 'Penanggung Jawab Aset', icon: ShieldAlert },
  ];

  const AKSI_GROUPS: { label: string; items: Aksi[] }[] = [
    { label: 'Pengajuan', items: ['submit', 'ajukan_ulang'] },
    { label: 'Keputusan Utama', items: ['approve', 'reject'] },
    { label: 'Revalidasi', items: ['ajukan_revalidasi', 'setuju_revalidasi', 'minta_revisi'] },
    { label: 'Status SIKA', items: ['suspend', 'aktifkan_kembali'] },
    { label: 'Dokumen PJA', items: ['verifikasi'] },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Audit Trail Persetujuan</span>
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

        {/* INTEGRITY BANNER */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-3.5">
          <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Log Terverifikasi.</span>{' '}
            Setiap aktivitas persetujuan, penolakan, revalidasi, dan verifikasi dokumen tercatat otomatis dan bersifat{' '}
            <span className="font-semibold">append-only</span> — tidak dapat diedit maupun dihapus. Halaman ini
            sedang menampilkan <span className="font-semibold">data contoh (dummy)</span> untuk keperluan pratinjau.
          </div>
        </div>

        {/* PERAN TABS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto">
          {PERAN_TABS.map((t) => {
            const Icon = t.icon;
            const active = peranTab === t.key;
            const bg = t.key === 'semua' ? '#1e40af' : PERAN_INFO[t.key as Peran].bg;
            return (
              <button
                key={t.key}
                onClick={() => { setPeranTab(t.key); setPage(1); }}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
                  active ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
                style={active ? { background: bg } : undefined}
              >
                <Icon size={14} />
                {t.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* STATS */}
        <div className="grid gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Total Aktivitas', value: stats.total, bg: '#1B2A4A', sub: peranTab === 'semua' ? 'Semua peran' : PERAN_INFO[peranTab as Peran].label, icon: LayoutList },
            { label: 'Persetujuan', value: stats.persetujuan, bg: '#00954E', sub: 'SIKA, JSA & revalidasi', icon: CheckCircle2 },
            { label: 'Penolakan', value: stats.penolakan, bg: '#E31E24', sub: 'Dikembalikan ke pemohon', icon: XCircle },
            { label: 'Suspend', value: stats.suspend, bg: '#9333EA', sub: 'Dibekukan sementara', icon: PauseCircle },
            { label: 'Verifikasi Dokumen', value: stats.verifikasi, bg: '#0E76BC', sub: 'Upload & verifikasi PJA', icon: ShieldCheck },
            { label: 'Petugas Terlibat', value: stats.petugasTerlibat, bg: '#1B2A4A', sub: timeFilterLabels[timeFilter], icon: User },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl px-4 py-3.5 shadow-md" style={{ background: `linear-gradient(135deg, ${s.bg} 0%, ${s.bg}dd 100%)` }}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs text-white/80 font-medium">{s.label}</p>
                  <Icon size={13} className="text-white/60" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">RIWAYAT AKTIVITAS APPROVAL</span>
              <p className="text-blue-200 text-[10px] mt-0.5">
                {peranTab === 'semua' ? 'Seluruh peran' : `Menampilkan aktivitas milik ${PERAN_INFO[peranTab as Peran].label}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/15 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('grup')}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition ${
                    viewMode === 'grup' ? 'bg-white text-blue-700' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <ListTree size={11} /> Per Program
                </button>
                <button
                  onClick={() => setViewMode('tabel')}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition ${
                    viewMode === 'tabel' ? 'bg-white text-blue-700' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <LayoutList size={11} /> Tabel
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition ${
                    viewMode === 'timeline' ? 'bg-white text-blue-700' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <GitCommitVertical size={11} /> Timeline
                </button>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-white/20 text-white border-white/30 hover:bg-white/30 transition"
              >
                <Download size={12} /> Export CSV
              </button>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  showFilter || hasActiveFilter
                    ? 'bg-white text-blue-700 border-white'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Filter size={12} /> Filter {hasActiveFilter ? '(aktif)' : ''}
              </button>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama program, No SIKA, atau nama petugas..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-white hover:bg-gray-50 transition shadow-sm"
              >
                <Calendar size={13} />
                {timeFilterLabels[timeFilter]}
                {timeFilter === 'custom' && customRange.start && customRange.end && (
                  <span className="text-[10px] text-blue-600 font-medium">{customRange.start} s/d {customRange.end}</span>
                )}
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                  {(['semua', 'hari', 'minggu', 'bulan'] as TimeFilterType[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setTimeFilter(key); setIsTimeDropdownOpen(false); setPage(1); }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition flex items-center gap-2 ${
                        timeFilter === key ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600'
                      }`}
                    >
                      <CalendarDays size={13} />
                      {timeFilterLabels[key]}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { setShowCustomRange(!showCustomRange); setIsTimeDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition flex items-center gap-2 text-gray-600"
                  >
                    <Calendar size={13} /> Rentang Kustom
                  </button>
                  {showCustomRange && (
                    <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                      <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs" />
                      <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs" />
                      <button
                        onClick={() => { setTimeFilter('custom'); setShowCustomRange(false); setIsTimeDropdownOpen(false); setPage(1); }}
                        className="w-full bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-blue-700 transition"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-gray-400 shrink-0" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                <option value="terbaru">Terbaru dahulu</option>
                <option value="terlama">Terlama dahulu</option>
              </select>
            </div>

            <div className="text-[10px] text-gray-400 ml-auto">
              Menampilkan {sorted.length} dari {preTabFiltered.length} aktivitas
            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/40 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Status / Aksi</label>
                <select
                  value={filterAksi}
                  onChange={(e) => { setFilterAksi(e.target.value as Aksi | ''); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-56"
                >
                  <option value="">Semua Status</option>
                  {AKSI_GROUPS.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.items.map((a) => <option key={a} value={a}>{AKSI_CONFIG[a].label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Jenis Dokumen</label>
                <select
                  value={filterDokumen}
                  onChange={(e) => { setFilterDokumen(e.target.value as Dokumen | ''); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-44"
                >
                  <option value="">Semua Dokumen</option>
                  {(Object.keys(DOKUMEN_LABEL) as Dokumen[]).map((d) => (
                    <option key={d} value={d}>{DOKUMEN_LABEL[d]}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Lokasi / Area</label>
                <select
                  value={filterLokasi}
                  onChange={(e) => { setFilterLokasi(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-56"
                >
                  <option value="">Semua Area</option>
                  {allLokasi.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Petugas</label>
                <select
                  value={filterPetugas}
                  onChange={(e) => { setFilterPetugas(e.target.value); setPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-56"
                >
                  <option value="">Semua Petugas</option>
                  {allPetugas.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5">
                Reset filter
              </button>
            </div>
          )}

          {/* ACTIVE FILTER CHIPS */}
          {hasActiveFilter && (
            <div className="px-6 py-2.5 border-b border-gray-100 bg-gray-50/60 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide shrink-0 flex items-center gap-1">
                <ListFilter size={11} /> Filter aktif:
              </span>
              {filterAksi && <FilterChip label={`Status: ${AKSI_CONFIG[filterAksi].label}`} onRemove={() => setFilterAksi('')} />}
              {filterDokumen && <FilterChip label={`Dokumen: ${DOKUMEN_LABEL[filterDokumen]}`} onRemove={() => setFilterDokumen('')} />}
              {filterLokasi && <FilterChip label={`Lokasi: ${filterLokasi}`} onRemove={() => setFilterLokasi('')} />}
              {filterPetugas && <FilterChip label={`Petugas: ${filterPetugas}`} onRemove={() => setFilterPetugas('')} />}
              <button onClick={resetFilters} className="text-[10px] text-red-500 hover:underline font-semibold ml-1">Hapus semua</button>
            </div>
          )}

          {/* CONTENT */}
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FileText size={40} className="text-gray-300" />
              <p className="text-gray-400 text-sm font-medium">Tidak ada aktivitas yang sesuai</p>
              <p className="text-gray-300 text-xs">Coba ubah tab peran, rentang waktu, atau filter yang digunakan</p>
            </div>

          ) : viewMode === 'grup' ? (
            <>
              <div className="divide-y divide-gray-100">
                {paginatedGroups.map(({ submissionId, entries, latest }) => {
                  const collapsed = collapsedGroups.has(submissionId);
                  const peranSet = [...new Set(entries.map((e) => e.peran))];
                  return (
                    <div key={submissionId}>
                      <button
                        onClick={() => toggleGroup(submissionId)}
                        className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/70 transition text-left"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-800 truncate">{latest.namaProgram}</span>
                            <span className="text-[10px] font-semibold text-blue-600">{latest.noSIKA}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <MapPin size={10} /> {latest.lokasi}
                            </span>
                            <span className="text-gray-300">&middot;</span>
                            <span className="text-[10px] text-gray-400">
                              Aktivitas terakhir: {formatShortDate(latest.timestamp)}, {formatTime(latest.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                          {peranSet.map((p) => <PeranBadge key={p} peran={p} compact />)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                          {entries.length} aktivitas
                        </span>
                        <span className="shrink-0">
                          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                        </span>
                      </button>

                      {!collapsed && (
                        <div className="px-6 pb-4">
                          <div className="rounded-lg border border-gray-100 overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  {['Waktu', 'Aksi', 'Dokumen', 'Petugas', 'Peran', 'Dokumen PJA', 'Catatan', ''].map((h) => (
                                    <th key={h} className="text-left px-4 py-2 font-medium text-gray-500 text-[10px] uppercase tracking-wide whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {entries
                                  .slice()
                                  .sort((a, b) => sortMode === 'terbaru'
                                    ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                                    : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                  .map((e) => (
                                    <EntryRow key={e.id} e={e} onClick={() => setSelectedEntry(e)} showProgram={false} />
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  {(currentGroupPage - 1) * GROUPS_PER_PAGE + 1}–{Math.min(currentGroupPage * GROUPS_PER_PAGE, programGroups.length)} dari {programGroups.length} program
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentGroupPage === 1}
                    className="p-1 rounded-lg border border-gray-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {currentGroupPage} / {totalGroupPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalGroupPages, p + 1))}
                    disabled={currentGroupPage === totalGroupPages}
                    className="p-1 rounded-lg border border-gray-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </>

          ) : viewMode === 'tabel' ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: '#f8fafc' }} className="border-b border-gray-200">
                      {['Waktu', 'Aksi', 'Dokumen', 'Program / No SIKA', 'Petugas', 'Peran', 'Dokumen PJA', 'Catatan', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFlat.map((e) => (
                      <EntryRow key={e.id} e={e} onClick={() => setSelectedEntry(e)} showProgram />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                <span>{(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, sorted.length)} dari {sorted.length} aktivitas</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg border border-gray-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft size={13} />
                  </button>
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">{currentPage} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded-lg border border-gray-200 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </>

          ) : (
            /* TIMELINE */
            <div className="px-6 py-6">
              <div className="space-y-8">
                {timelineGroups.map(([key, entries]) => (
                  <div key={key}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {formatShortDate(entries[0].timestamp)}
                      </span>
                      <span className="h-px flex-1 bg-gray-100" />
                      <span className="text-[10px] text-gray-400">{entries.length} aktivitas</span>
                    </div>
                    <div className="pl-2">
                      {entries.map((e, idx) => {
                        const cfg = AKSI_CONFIG[e.aksi];
                        const Icon = cfg.icon;
                        return (
                          <div key={e.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: cfg.bg }}>
                                <Icon size={14} className="text-white" strokeWidth={2.5} />
                              </span>
                              {idx < entries.length - 1 && <span className="w-px flex-1 bg-gray-200 my-1" style={{ minHeight: 24 }} />}
                            </div>
                            <button onClick={() => setSelectedEntry(e)} className="text-left flex-1 pb-6 group">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition">
                                  {cfg.verb} {DOKUMEN_LABEL[e.dokumen]}
                                  <span className="font-normal text-gray-400"> &middot; {e.namaProgram}</span>
                                </p>
                                <span className="text-[10px] text-gray-400 shrink-0">{formatTime(e.timestamp)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[10px] font-semibold text-blue-600">{e.noSIKA}</span>
                                <span className="text-gray-300">&middot;</span>
                                <span className="text-[10px] text-gray-500">{e.oleh}</span>
                                <PeranBadge peran={e.peran} compact />
                                {e.dokumenPJA && <DokumenPJATag dokumen={e.dokumenPJA} />}
                              </div>
                              {e.alasan && <p className="text-[11px] text-gray-500 italic mt-1.5 max-w-xl">"{e.alasan}"</p>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-[10px] text-gray-400 px-1">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>
            Menampilkan data contoh untuk keperluan pratinjau desain. Setelah disambungkan ke data asli, sumber log
            akan berasal dari <code className="bg-gray-200/60 px-1 rounded">approvalHistory</code> pada
            <code className="bg-gray-200/60 px-1 rounded ml-1">programStore.ts</code>. Fitur verifikasi dokumen PJA
            akan terintegrasi dengan halaman <code className="bg-gray-200/60 px-1 rounded ml-1">/dashboard/pja/approval-management</code>.
          </p>
        </div>
      </div>

      {selectedEntry && <DetailDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </div>
  );
}