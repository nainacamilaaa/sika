'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, FileText } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import type { ApprovalStatus } from '@/store/programStore';

const getStatusBadge = (status: ApprovalStatus) => {
  const map: Record<string, { label: string; className: string }> = {
    draft:    { label: 'Draft',        className: 'bg-gray-100 text-gray-500 border border-gray-200' },
    request:  { label: 'Perlu Review', className: 'bg-blue-50 text-blue-600 border border-blue-200' },
    waiting:  { label: 'Menunggu',     className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    approved: { label: 'Disetujui',    className: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Ditolak',      className: 'bg-red-50 text-red-600 border border-red-200' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.className}`}>
      {s.label}
    </span>
  );
};

const getOverallStatus = (sikaSt: ApprovalStatus, jsaSt: ApprovalStatus): ApprovalStatus => {
  if (sikaSt === 'rejected' || jsaSt === 'rejected') return 'rejected';
  if (sikaSt === 'approved' && jsaSt === 'approved') return 'approved';
  if (sikaSt === 'approved' || jsaSt === 'approved') return 'waiting';
  if (sikaSt === 'request' || jsaSt === 'request') return 'request';
  return 'draft';
};

export default function PemberiDataManagementPage() {
  const router = useRouter();
  const {
    program, jsa, sika,
    sikaStatusPemberi, jsaStatusPemberi,
  } = useProgramStore();

  const [filterCari, setFilterCari] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeFilter, setActiveFilter] = useState({ cari: '', status: '' });

  const hasSubmission = !!(program && jsa && sika && sikaStatusPemberi !== 'draft');

  const rows = hasSubmission ? [{
    id: 'store-1',
    namaProgram: program!.namaPaket || '-',
    satKerja: program!.satKerjaPemberi || '-',
    noJSA: jsa!.jsaNo || '-',
    tanggalJSA: jsa!.tanggalJSA || '-',
    noSIKA: sika!.noSIKA || '-',
    lokasi: program!.lokasiKerja || '-',
    pelaksana: program!.pelaksanaPerusahaan || '-',
    sikaStatus: sikaStatusPemberi,
    jsaStatus: jsaStatusPemberi,
  }] : [];

  const filtered = rows.filter((r) => {
    const overall = getOverallStatus(r.sikaStatus, r.jsaStatus);
    const matchCari = activeFilter.cari === '' ||
      r.namaProgram.toLowerCase().includes(activeFilter.cari.toLowerCase()) ||
      r.noJSA.toLowerCase().includes(activeFilter.cari.toLowerCase()) ||
      r.noSIKA.toLowerCase().includes(activeFilter.cari.toLowerCase());
    const matchStatus = activeFilter.status === '' || overall === activeFilter.status;
    return matchCari && matchStatus;
  });

  const countByOverall = (target: ApprovalStatus | 'pending') =>
    rows.filter((r) => {
      const overall = getOverallStatus(r.sikaStatus, r.jsaStatus);
      if (target === 'pending') return overall === 'request' || overall === 'waiting';
      return overall === target;
    }).length;

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
        <div className="flex items-center pr-6">
          <button
            onClick={() => router.push('/dashboard/pemberi')}
            className="flex items-center gap-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full pl-2 pr-4 py-1.5 transition-colors shadow-sm"
          >
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <LayoutDashboard size={13} className="text-white" />
            </span>
            <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">Dashboard</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Pengajuan', value: rows.length, color: 'text-gray-800', bg: 'bg-white' },
            { label: 'Perlu Review', value: countByOverall('pending'), color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Disetujui', value: countByOverall('approved'), color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Ditolak', value: countByOverall('rejected'), color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-200 px-5 py-4 shadow-sm`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <span className="text-white font-bold text-sm tracking-wide">FILTER</span>
            <p className="text-blue-200 text-[10px] mt-0.5">Cari dan saring pengajuan masuk</p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Cari Program / No JSA / No SIKA</label>
              <input
                type="text"
                placeholder="Ketik untuk mencari..."
                value={filterCari}
                onChange={(e) => setFilterCari(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveFilter({ cari: filterCari, status: filterStatus })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 w-72 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 shadow-sm"
              >
                <option value="">Semua Status</option>
                <option value="request">Perlu Review</option>
                <option value="waiting">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter({ cari: filterCari, status: filterStatus })}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm"
              >
                Cari
              </button>
              <button
                onClick={() => { setFilterCari(''); setFilterStatus(''); setActiveFilter({ cari: '', status: '' }); }}
                className="border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">DAFTAR PENGAJUAN MASUK</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Klik "Review" untuk melihat detail dan melakukan approval</p>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              {filtered.length} pengajuan
            </span>
          </div>

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
                      {['No', 'Nama Program', 'Lokasi', 'Pelaksana', 'No JSA', 'No SIKA', 'Status SIKA', 'Status JSA', 'Status Keseluruhan', 'Aksi'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-700 text-xs tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-400 py-14 text-sm">
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
                          <td className="px-4 py-3 text-xs font-semibold text-blue-600">{row.noSIKA}</td>
                          <td className="px-4 py-3">{getStatusBadge(row.sikaStatus)}</td>
                          <td className="px-4 py-3">{getStatusBadge(row.jsaStatus)}</td>
                          <td className="px-4 py-3">{getStatusBadge(overall)}</td>
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
    </div>
  );
}