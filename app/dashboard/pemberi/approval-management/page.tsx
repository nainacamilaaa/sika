'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // tambahkan useEffect
import {
  ChevronLeft, ChevronRight, FileText, Search, Filter,
  CheckCircle, XCircle, Clock, AlertCircle, ClipboardCheck, Loader2,
} from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import type { ApprovalStatus } from '@/store/programStore';

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

const getOverallStatus = (sikaSt: ApprovalStatus, jsaSt: ApprovalStatus): ApprovalStatus => {
  if (sikaSt === 'rejected' || jsaSt === 'rejected') return 'rejected';
  if (sikaSt === 'approved' && jsaSt === 'approved') return 'approved';
  if (sikaSt === 'approved' || jsaSt === 'approved') return 'waiting';
  if (sikaSt === 'request' || jsaSt === 'request') return 'request';
  return 'draft';
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

/* ============================================================
   REVALIDASI MASUK
   Pengajuan revalidasi harian yang dikirim pemohon dan perlu
   ditinjau oleh Pemberi Kerja. Data disimpan lokal per baris
   (demo) — begitu ada pengajuan yang statusnya sudah aktif,
   revalidasi hari berjalan dianggap "masuk" dan menunggu review.
============================================================ */

type RevalidasiStatus = 'tidak_ada' | 'menunggu' | 'disetujui' | 'ditolak';

interface RevalidasiMasuk {
  rowId: string;
  tanggal: string;
  catatan: string;
  status: RevalidasiStatus;
}

const REVALIDASI_BADGE: Record<RevalidasiStatus, { label: string; bg: string; icon: any } | null> = {
  tidak_ada: null,
  menunggu:  { label: 'Menunggu Review', bg: '#F2A900', icon: Clock },
  disetujui: { label: 'Disetujui',       bg: '#00954E', icon: CheckCircle },
  ditolak:   { label: 'Ditolak',         bg: '#E31E24', icon: XCircle },
};

function RevalidasiCell({
  data,
  onReview,
}: {
  data: RevalidasiMasuk | undefined;
  onReview: () => void;
}) {
  if (!data || data.status === 'tidak_ada') {
    return <span className="text-[10px] text-gray-300 italic">Belum ada</span>;
  }
  const cfg = REVALIDASI_BADGE[data.status]!;
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
      {data.status === 'menunggu' && (
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-2.5 py-1 transition shadow-sm"
        >
          <ClipboardCheck size={11} /> Review
        </button>
      )}
      {data.status !== 'menunggu' && (
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

function RevalidasiMasukModal({
  data,
  onClose,
  onSetujui,
  onTolak,
}: {
  data: RevalidasiMasuk;
  onClose: () => void;
  onSetujui: () => void;
  onTolak: (alasan: string) => void;
}) {
  const [mode, setMode] = useState<'lihat' | 'tolak'>('lihat');
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);

  const tanggalLabel = new Date(data.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleSetujui = () => {
    setLoading(true);
    onSetujui();
  };

  const handleKirimTolak = () => {
    if (!alasan.trim()) return;
    setLoading(true);
    onTolak(alasan.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}
        >
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">Review Revalidasi Harian</p>
            <p className="text-[10px] text-white/70 font-medium">Pengajuan dari pemohon &middot; {tanggalLabel}</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="px-6 py-4 space-y-4">

            <div className="flex items-center gap-2">
              {REVALIDASI_BADGE[data.status] && (
                <StatusChip status={data.status} />
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-bold mb-1.5">
                Catatan dari Pemohon
              </p>
              <div className="border border-gray-100 rounded-xl bg-gray-50/60 px-4 py-3 text-xs text-gray-700 leading-relaxed">
                {data.catatan?.trim() ? data.catatan : (
                  <span className="text-gray-400 italic">Tidak ada catatan tambahan.</span>
                )}
              </div>
            </div>

            {mode === 'tolak' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  Alasan Penolakan
                </label>
                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan alasan revalidasi ini ditolak..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
                />
              </div>
            )}

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Tinjau kondisi lapangan yang dilaporkan pemohon sebelum menyetujui revalidasi harian ini.
              Jika kondisi tidak sesuai, tolak dan sertakan alasannya agar pemohon dapat menindaklanjuti.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/60 shrink-0">
          {mode === 'lihat' && data.status === 'menunggu' && (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition disabled:opacity-40"
              >
                Tutup
              </button>
              <button
                onClick={() => setMode('tolak')}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition border disabled:opacity-40"
                style={{ borderColor: '#E31E24', color: '#E31E24' }}
              >
                <XCircle size={13} strokeWidth={2.5} />
                Tolak
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
          {mode === 'tolak' && (
            <>
              <button
                onClick={() => setMode('lihat')}
                disabled={loading}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded-lg transition disabled:opacity-40"
              >
                Kembali
              </button>
              <button
                onClick={handleKirimTolak}
                disabled={loading || !alasan.trim()}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition text-white shadow-sm ${
                  !alasan.trim() ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{ background: '#E31E24' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} strokeWidth={2.5} />}
                Kirim Penolakan
              </button>
            </>
          )}
          {mode === 'lihat' && data.status !== 'menunggu' && (
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

function StatusChip({ status }: { status: RevalidasiStatus }) {
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

/* ============================================================ */

export default function PemberiDataManagementPage() {
  const router = useRouter();
  const {
    program, jsa, sika,
    sikaStatusPemberi, jsaStatusPemberi,
  } = useProgramStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterTglDari, setFilterTglDari] = useState('');
  const [filterTglSampai, setFilterTglSampai] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [revalidasiModalRowId, setRevalidasiModalRowId] = useState<string | null>(null);

  const hasSubmission = !!(program && jsa && sika && sikaStatusPemberi !== 'draft');
  const overallAktif = hasSubmission && sikaStatusPemberi === 'approved' && jsaStatusPemberi === 'approved';

  // === PERBAIKAN: inisialisasi revalidasiMasuk via useEffect ===
  const [revalidasiMasuk, setRevalidasiMasuk] = useState<Record<string, RevalidasiMasuk>>({});

  useEffect(() => {
    if (overallAktif) {
      setRevalidasiMasuk((prev) => {
        if (!prev['store-1']) {
          return {
            ...prev,
            'store-1': {
              rowId: 'store-1',
              tanggal: new Date().toISOString(),
              catatan: 'Kondisi area kerja masih aman, tidak ada perubahan identifikasi bahaya sejak SIKA diterbitkan.',
              status: 'menunggu',
            },
          };
        }
        return prev;
      });
    }
  }, [overallAktif]);

  const validBerlakuHingga = ((sika as any)?.berlakuHingga || []).filter(
    (v: string) => !!v && !isNaN(new Date(v).getTime())
  );
  const tanggalBerakhirSIKA = validBerlakuHingga.length > 0
    ? validBerlakuHingga.reduce((latest: string, cur: string) =>
        new Date(cur) > new Date(latest) ? cur : latest
      )
    : '-';

  const rows = hasSubmission ? [{
    id: 'store-1',
    namaProgram: program!.namaPaket || '-',
    satKerja: program!.satKerjaPemberi || '-',
    noJSA: jsa!.jsaNo || '-',
    tanggalJSA: jsa!.tanggalJSA || '-',
    noSIKA: sika!.noSIKA || '-',
    tanggalBerakhirSIKA,
    lokasi: program!.lokasiKerja || '-',
    pelaksana: program!.pelaksanaPerusahaan || '-',
    sikaStatus: sikaStatusPemberi,
    jsaStatus: jsaStatusPemberi,
  }] : [];

  const filtered = rows.filter((r) => {
    const overall = getOverallStatus(r.sikaStatus, r.jsaStatus);
    const matchCari = !search ||
      r.namaProgram.toLowerCase().includes(search.toLowerCase()) ||
      r.noJSA.toLowerCase().includes(search.toLowerCase()) ||
      r.noSIKA.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || overall === filterStatus;
    const matchLokasi = !filterLokasi || r.lokasi === filterLokasi;
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
    return matchCari && matchStatus && matchLokasi && matchTanggal;
  });

  const countByOverall = (target: ApprovalStatus | 'pending') =>
    rows.filter((r) => {
      const overall = getOverallStatus(r.sikaStatus, r.jsaStatus);
      if (target === 'pending') return overall === 'request' || overall === 'waiting';
      return overall === target;
    }).length;

  const countRevalidasiMenunggu = Object.values(revalidasiMasuk).filter(r => r.status === 'menunggu').length;

  const revalidasiModalData = revalidasiModalRowId ? revalidasiMasuk[revalidasiModalRowId] : undefined;

  const handleSetujuiRevalidasi = () => {
    if (!revalidasiModalRowId) return;
    setRevalidasiMasuk((prev) => ({
      ...prev,
      [revalidasiModalRowId]: { ...prev[revalidasiModalRowId], status: 'disetujui' },
    }));
    setRevalidasiModalRowId(null);
  };

  const handleTolakRevalidasi = (alasan: string) => {
    if (!revalidasiModalRowId) return;
    setRevalidasiMasuk((prev) => ({
      ...prev,
      [revalidasiModalRowId]: { ...prev[revalidasiModalRowId], status: 'ditolak', catatan: prev[revalidasiModalRowId].catatan },
    }));
    setRevalidasiModalRowId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Review Pengajuan</span>
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
                  showFilter || filterStatus || filterLokasi || filterTglDari || filterTglSampai
                    ? 'bg-white text-blue-700 border-white'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Filter size={12} />
                Filter {(filterStatus || filterLokasi || filterTglDari || filterTglSampai) ? '(aktif)' : ''}
              </button>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                {filtered.length} pengajuan
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
            <div className="text-[10px] text-gray-400">
              {filtered.length} dari {rows.length} pengajuan
            </div>
          </div>

          {showFilter && (
            <div className="px-6 py-3 border-b border-gray-100 bg-blue-50/40 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Status Keseluruhan</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 w-48"
                >
                  <option value="">Semua Status</option>
                  <option value="request">Perlu Review</option>
                  <option value="waiting">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
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
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Tanggal SIKA Dari</label>
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
                onClick={() => { setFilterStatus(''); setFilterLokasi(''); setFilterTglDari(''); setFilterTglSampai(''); }}
                className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1.5"
              >
                Reset filter
              </button>
            </div>
          )}

          {!hasSubmission ? (
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center text-gray-400 py-14 text-sm">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : filtered.map((row, i) => {
                      const overall = getOverallStatus(row.sikaStatus, row.jsaStatus);
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
                              data={revalidasiMasuk[row.id]}
                              onReview={() => setRevalidasiModalRowId(row.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/dashboard/pemberi/review/${row.id}`)}
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                            >
                              <FileText size={12} />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                <span>1 – {filtered.length} dari {rows.length} pengajuan</span>
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

      {revalidasiModalData && (
        <RevalidasiMasukModal
          data={revalidasiModalData}
          onClose={() => setRevalidasiModalRowId(null)}
          onSetujui={handleSetujuiRevalidasi}
          onTolak={handleTolakRevalidasi}
        />
      )}
    </div>
  );
}