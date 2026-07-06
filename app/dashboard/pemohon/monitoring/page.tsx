'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, FileText, MapPin,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Filter
} from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import type { ApprovalStatus } from '@/store/programStore';

type TabType = 'semua' | 'aktif' | 'pending' | 'ditolak' | 'closed';

interface SIKARow {
  id: string;
  namaProgram: string;
  noSIKA: string;
  lokasi: string;
  pelaksana: string;
  tanggalKontrak: string;
  sertifikatList: string[];
  sikaStatusPemberi: ApprovalStatus;
  jsaStatusPemberi: ApprovalStatus;
  sikaStatusPJA: ApprovalStatus;
  jsaStatusPJA: ApprovalStatus;
  alasanTolakSika?: string | null;
  alasanTolakJsa?: string | null;
  sifatPekerjaan: string;
  identifikasiBahaya: string[];
}

const getOverallStatus = (
  sikaP: ApprovalStatus,
  jsaP: ApprovalStatus,
  sikaPJA: ApprovalStatus,
  jsaPJA: ApprovalStatus
): 'aktif' | 'pending' | 'ditolak' | 'closed' | 'draft' => {
  if (sikaP === 'rejected' || jsaP === 'rejected' || sikaPJA === 'rejected' || jsaPJA === 'rejected') return 'ditolak';
  if (sikaPJA === 'approved' && jsaPJA === 'approved') return 'closed';
  if (sikaP === 'approved' && jsaP === 'approved') return 'aktif';
  if (sikaP === 'request' || jsaP === 'request') return 'pending';
  return 'draft';
};

const STATUS_CONFIG = {
  aktif:   { label: 'Aktif',    bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: CheckCircle,   dot: 'bg-green-500'  },
  pending: { label: 'Pending',  bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   icon: Clock,         dot: 'bg-blue-500'   },
  ditolak: { label: 'Ditolak',  bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    icon: XCircle,       dot: 'bg-red-500'    },
  closed:  { label: 'Closed',   bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200',   icon: CheckCircle,   dot: 'bg-gray-400'   },
  draft:   { label: 'Draft',    bg: 'bg-gray-50',   text: 'text-gray-400',   border: 'border-gray-100',   icon: AlertCircle,   dot: 'bg-gray-300'   },
};

const APPROVAL_BADGE: Record<ApprovalStatus, { label: string; className: string }> = {
  draft:    { label: 'Draft',     className: 'bg-gray-100 text-gray-400 border border-gray-200' },
  request:  { label: 'Review',    className: 'bg-blue-50 text-blue-600 border border-blue-200' },
  waiting:  { label: 'Menunggu',  className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  approved: { label: 'Disetujui', className: 'bg-green-50 text-green-700 border border-green-200' },
  rejected: { label: 'Ditolak',   className: 'bg-red-50 text-red-600 border border-red-200' },
};

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const cfg = APPROVAL_BADGE[status];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof getOverallStatus> }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function PemohonMonitoringPage() {
  const router = useRouter();
  const {
    program, jsa, sika,
    sikaStatusPemberi, jsaStatusPemberi,
    sikaStatusPJA, jsaStatusPJA,
    alasanTolakSikaPemberi, alasanTolakJsaPemberi,
    sertifikatData,
  } = useProgramStore();

  const [activeTab, setActiveTab] = useState<TabType>('semua');
  const [search, setSearch] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterSertifikat, setFilterSertifikat] = useState('');
  const [filterSifat, setFilterSifat] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const rows: SIKARow[] = useMemo(() => {
    if (!program || !sika) return [];
    return [{
      id: 'store-1',
      namaProgram: program.namaPaket || '-',
      noSIKA: sika.noSIKA || '-',
      lokasi: program.lokasiKerja || '-',
      pelaksana: program.pelaksanaPerusahaan || '-',
      tanggalKontrak: program.tanggalKontrak || '-',
      sertifikatList: sika.sertifikat || [],
      sikaStatusPemberi,
      jsaStatusPemberi,
      sikaStatusPJA,
      jsaStatusPJA,
      alasanTolakSika: alasanTolakSikaPemberi,
      alasanTolakJsa: alasanTolakJsaPemberi,
      sifatPekerjaan: sika.sifatPekerjaan || '-',
      identifikasiBahaya: sika.identifikasi || [],
    }];
  }, [program, sika, sikaStatusPemberi, jsaStatusPemberi, sikaStatusPJA, jsaStatusPJA]);

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

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const overall = getOverallStatus(r.sikaStatusPemberi, r.jsaStatusPemberi, r.sikaStatusPJA, r.jsaStatusPJA);

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
  }, [rows, activeTab, search, filterLokasi, filterSertifikat, filterSifat]);

  const counts = useMemo(() => ({
    semua: rows.length,
    aktif: rows.filter(r => getOverallStatus(r.sikaStatusPemberi, r.jsaStatusPemberi, r.sikaStatusPJA, r.jsaStatusPJA) === 'aktif').length,
    pending: rows.filter(r => ['pending', 'draft'].includes(getOverallStatus(r.sikaStatusPemberi, r.jsaStatusPemberi, r.sikaStatusPJA, r.jsaStatusPJA))).length,
    ditolak: rows.filter(r => getOverallStatus(r.sikaStatusPemberi, r.jsaStatusPemberi, r.sikaStatusPJA, r.jsaStatusPJA) === 'ditolak').length,
    closed: rows.filter(r => getOverallStatus(r.sikaStatusPemberi, r.jsaStatusPemberi, r.sikaStatusPJA, r.jsaStatusPJA) === 'closed').length,
  }), [rows]);

  const TABS: { key: TabType; label: string; color: string }[] = [
    { key: 'semua',   label: 'Semua',   color: 'text-gray-700' },
    { key: 'aktif',   label: 'Aktif',   color: 'text-green-600' },
    { key: 'pending', label: 'Pending', color: 'text-blue-600' },
    { key: 'ditolak', label: 'Ditolak', color: 'text-red-600' },
    { key: 'closed',  label: 'Closed',  color: 'text-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

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
        <button
          onClick={() => router.push('/dashboard/pemohon')}
          className="flex items-center gap-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full pl-2 pr-4 py-1.5 transition-colors shadow-sm mr-6"
        >
          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <LayoutDashboard size={13} className="text-white" />
          </span>
          <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">Dashboard</span>
        </button>
      </div>

      <div className="px-6 py-6 space-y-4">

        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total SIKA', value: counts.semua, bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200', sub: 'Semua pengajuan' },
            { label: 'Aktif',      value: counts.aktif,   bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-100', sub: 'Disetujui Pemberi' },
            { label: 'Pending',    value: counts.pending, bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-100',  sub: 'Menunggu review' },
            { label: 'Ditolak',    value: counts.ditolak, bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-100',   sub: 'Perlu revisi' },
            { label: 'Closed',     value: counts.closed,  bg: 'bg-gray-100',  text: 'text-gray-600',  border: 'border-gray-200',  sub: 'Selesai diproses' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border ${s.border} px-4 py-3.5 shadow-sm`}>
              <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

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
                  {counts[tab.key]}
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
                onClick={() => router.push('/dashboard/pemohon/program/new')}
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
                    {['No', 'Nama Program', 'Lokasi / Area', 'No SIKA', 'Sertifikat', 'Sifat', 'Pemberi (SIKA)', 'Pemberi (JSA)', 'PJA (SIKA)', 'PJA (JSA)', 'Status', 'Aksi'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 font-medium text-gray-600 text-xs tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const overall = getOverallStatus(row.sikaStatusPemberi, row.jsaStatusPemberi, row.sikaStatusPJA, row.jsaStatusPJA);
                    const hasTolak = row.alasanTolakSika || row.alasanTolakJsa;
                    const sertifikatIsi = row.sertifikatList
                      .map(s => {
                        const kode = s.match(/\(([^)]+)\)/)?.[1];
                        return kode || s.substring(0, 4);
                      });

                    return (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-3 text-xs text-gray-400 text-center">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-xs text-gray-800 max-w-36 truncate">{row.namaProgram}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{row.pelaksana}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <span className="max-w-32 truncate">{row.lokasi}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-blue-600">
                          {row.noSIKA !== '-' ? row.noSIKA : <span className="text-gray-300 font-normal italic">Belum diisi</span>}
                        </td>
                        <td className="px-3 py-3">
                          {sertifikatIsi.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sertifikatIsi.map((k) => (
                                <span key={k} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  sertifikatData?.[row.sertifikatList.find(s => s.includes(k)) || '']
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                  {k}
                                  {sertifikatData?.[row.sertifikatList.find(s => s.includes(k)) || ''] && (
                                    <span className="ml-0.5">✓</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {row.sifatPekerjaan && row.sifatPekerjaan !== '-' ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              row.sifatPekerjaan === 'Emergency'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {row.sifatPekerjaan}
                            </span>
                          ) : <span className="text-[10px] text-gray-300">-</span>}
                        </td>
                        <td className="px-3 py-3"><ApprovalBadge status={row.sikaStatusPemberi} /></td>
                        <td className="px-3 py-3"><ApprovalBadge status={row.jsaStatusPemberi} /></td>
                        <td className="px-3 py-3"><ApprovalBadge status={row.sikaStatusPJA} /></td>
                        <td className="px-3 py-3"><ApprovalBadge status={row.jsaStatusPJA} /></td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <StatusBadge status={overall} />
                            {hasTolak && (
                              <div className="text-[10px] text-red-500 leading-tight max-w-28">
                                {row.alasanTolakSika || row.alasanTolakJsa}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => router.push('/dashboard/pemohon/jsa/detail')}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition"
                          >
                            Detail <ChevronRight size={10} />
                          </button>
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
    </div>
  );
}