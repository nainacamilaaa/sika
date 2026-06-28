'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

type StatusJSA = 'draft' | 'request' | 'approved' | 'rejected';
type StatusSIKA = 'draft' | 'request' | 'approved' | 'rejected';

interface PengajuanRow {
  id: string;
  namaProgram: string;
  satKerja: string;
  noJSA: string;
  tanggalJSA: string;
  noSIKA: string;
  tanggalSIKA: string;
  pemberiKerja: string;
  pja: string;
  statusJSA: StatusJSA;
  statusSIKA: StatusSIKA;
  alasanTolakJSA?: string;
  alasanTolakSIKA?: string;
}

const mapJsaStatus = (status: string | null): StatusJSA => {
  if (status === 'request_review' || status === 'request_approval') return 'request';
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'draft';
};

const StatusBadge = ({ status }: { status: StatusJSA | StatusSIKA }) => {
  const map: Record<string, { label: string; className: string }> = {
    draft:    { label: 'Draft',    className: 'bg-gray-100 text-gray-500 border border-gray-200' },
    request:  { label: 'Request',  className: 'bg-blue-50 text-blue-600 border border-blue-200' },
    approved: { label: 'Approved', className: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Ditolak',  className: 'bg-red-50 text-red-600 border border-red-200' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.className}`}>
      {s.label}
    </span>
  );
};

function TablePagination({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <button className="p-1 rounded-lg border border-gray-200 hover:bg-white transition">
          <ChevronLeft size={13} />
        </button>
        <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">1</span>
        <button className="p-1 rounded-lg border border-gray-200 hover:bg-white transition">
          <ChevronRight size={13} />
        </button>
        <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
          <option>10</option><option>20</option><option>40</option>
        </select>
        <span className="text-gray-400">per halaman</span>
      </div>
    </div>
  );
}

export default function DataManagementPemohonPage() {
  const router = useRouter();

  const {
    program,
    jsa,
    sika,
    jsaStatus,
    sikaStatus,
    alasanTolakJSA,
    alasanTolakSIKA,
  } = useProgramStore();

  const [filterProgram, setFilterProgram]   = useState('');
  const [filterSatKerja, setFilterSatKerja] = useState('');
  const [filterMulai, setFilterMulai]       = useState('');
  const [filterAkhir, setFilterAkhir]       = useState('');
  const [filterCari, setFilterCari]         = useState('');
  const [activeFilter, setActiveFilter]     = useState({ program: '', satKerja: '', cari: '' });
  const [inlineFilter, setInlineFilter]     = useState({
    namaProgram: '', noJSA: '', noSIKA: '', pemberi: '', pja: '',
  });

  const dataFromStore: PengajuanRow[] = program && jsa ? [
    {
      id: 'store-1',
      namaProgram: program.namaPaket || '-',
      satKerja: program.satKerjaPemberi || '-',
      noJSA: jsa.jsaNo || '-',
      tanggalJSA: jsa.tanggalJSA || '-',
      noSIKA: sika?.noSIKA || '',
      tanggalSIKA: sika?.tanggalSIKA || '',
      pemberiKerja: program.picPemberiList?.[0] || '-',
      pja: program.pimpinanPelaksanaList?.[0] || '-',
      statusJSA: mapJsaStatus(jsaStatus),
      statusSIKA: mapJsaStatus(sikaStatus),
      alasanTolakJSA: alasanTolakJSA || undefined,
      alasanTolakSIKA: alasanTolakSIKA || undefined,
    },
  ] : [];

  const filteredData = dataFromStore.filter((row) => {
    const matchProgram  = activeFilter.program === '' || row.namaProgram === activeFilter.program;
    const matchSatKerja = activeFilter.satKerja === '' || row.satKerja === activeFilter.satKerja;
    const matchCari     = activeFilter.cari === '' ||
      row.noJSA.toLowerCase().includes(activeFilter.cari.toLowerCase()) ||
      row.noSIKA.toLowerCase().includes(activeFilter.cari.toLowerCase());
    const matchInlineProgram = inlineFilter.namaProgram === '' ||
      row.namaProgram.toLowerCase().includes(inlineFilter.namaProgram.toLowerCase());
    const matchInlineJSA  = inlineFilter.noJSA === '' ||
      row.noJSA.toLowerCase().includes(inlineFilter.noJSA.toLowerCase());
    const matchInlineSIKA = inlineFilter.noSIKA === '' ||
      row.noSIKA.toLowerCase().includes(inlineFilter.noSIKA.toLowerCase());
    const matchInlinePemberi = inlineFilter.pemberi === '' ||
      row.pemberiKerja.toLowerCase().includes(inlineFilter.pemberi.toLowerCase());
    const matchInlinePJA  = inlineFilter.pja === '' ||
      row.pja.toLowerCase().includes(inlineFilter.pja.toLowerCase());

    return matchProgram && matchSatKerja && matchCari &&
      matchInlineProgram && matchInlineJSA && matchInlineSIKA &&
      matchInlinePemberi && matchInlinePJA;
  });

  const handleCari = () => {
    setActiveFilter({ program: filterProgram, satKerja: filterSatKerja, cari: filterCari });
  };

  const handleReset = () => {
    setFilterProgram('');
    setFilterSatKerja('');
    setFilterMulai('');
    setFilterAkhir('');
    setFilterCari('');
    setActiveFilter({ program: '', satKerja: '', cari: '' });
    setInlineFilter({ namaProgram: '', noJSA: '', noSIKA: '', pemberi: '', pja: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Monitoring Approval</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              SIKA &amp; JSA
            </span>
          </div>
        </div>

        <div className="flex items-center pr-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/pemohon')}
            className="flex items-center gap-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full pl-2 pr-4 py-1.5 transition-colors shadow-sm"
          >
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <LayoutDashboard size={13} className="text-white" />
            </span>
            <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">
              Data Management
            </span>
          </button>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col gap-6">

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <span className="text-white font-bold text-sm tracking-wide">FILTER</span>
            <p className="text-blue-200 text-[10px] mt-0.5">Cari dan saring data pengajuan</p>
          </div>
          <div className="px-6 py-5 flex flex-wrap gap-4 items-end">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Nama Program</label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 shadow-sm"
              >
                <option value="">Semua Program</option>
                {dataFromStore.map((item) => (
                  <option key={item.id} value={item.namaProgram}>{item.namaProgram}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Satuan Kerja</label>
              <select
                value={filterSatKerja}
                onChange={(e) => setFilterSatKerja(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-52 shadow-sm"
              >
                <option value="">Semua Satuan Kerja</option>
                {dataFromStore.map((item) => (
                  <option key={item.id} value={item.satKerja}>{item.satKerja}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Tanggal Mulai</label>
              <input
                type="text"
                placeholder="Pilih tanggal"
                value={filterMulai}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                onChange={(e) => setFilterMulai(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-40 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
              <input
                type="text"
                placeholder="Pilih tanggal"
                value={filterAkhir}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                onChange={(e) => setFilterAkhir(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 w-40 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">No JSA / SIKA</label>
              <input
                type="text"
                placeholder="Cari nomor..."
                value={filterCari}
                onChange={(e) => setFilterCari(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCari()}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 w-44 shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCari}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm shadow-blue-200"
              >
                Cari
              </button>
              <button
                onClick={handleReset}
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
              <span className="text-white font-bold text-sm tracking-wide">DAFTAR PENGAJUAN</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Daftar seluruh pengajuan JSA dan SIKA</p>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              {filteredData.length} data
            </span>
          </div>

          {dataFromStore.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-sm font-medium">Belum ada pengajuan</p>
              <p className="text-gray-300 text-xs">Buat pengajuan baru dari dashboard</p>
              <button
                onClick={() => router.push('/dashboard/pemohon/program/new')}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Buat Pengajuan Baru
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '44px' }} />
                    <col style={{ width: '17%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>

                  <thead>
                    <tr style={{ background: '#f8fafc' }} className="border-b border-gray-200">
                      {['No', 'Nama Program', 'No JSA', 'No SIKA', 'Pemberi Kerja', 'PJA', 'Status JSA', 'Status SIKA', 'Aksi'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-700 text-xs tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td className="px-4 py-2" />
                      {(['namaProgram', 'noJSA', 'noSIKA', 'pemberi', 'pja'] as const).map((k) => (
                        <td key={k} className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Cari..."
                            value={inlineFilter[k]}
                            onChange={(e) => setInlineFilter((prev) => ({ ...prev, [k]: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white shadow-sm"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-gray-400 py-14 text-sm">
                          Tidak ada data yang sesuai filter.
                        </td>
                      </tr>
                    ) : filteredData.map((row, i) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs font-medium text-center">{i + 1}</td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-xs text-gray-800 leading-tight">{row.namaProgram}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{row.satKerja}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-blue-600">{row.noJSA}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{row.tanggalJSA}</div>
                        </td>

                        <td className="px-4 py-3">
                          {row.noSIKA ? (
                            <>
                              <div className="text-xs font-semibold text-blue-600">{row.noSIKA}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{row.tanggalSIKA}</div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Belum diajukan</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-700">{row.pemberiKerja}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{row.pja}</td>
                        <td className="px-4 py-3"><StatusBadge status={row.statusJSA} /></td>
                        <td className="px-4 py-3"><StatusBadge status={row.statusSIKA} /></td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            {row.statusJSA === 'rejected' && (
                              <div>
                                <button
                                  onClick={() => router.push('/dashboard/pemohon/jsa/new')}
                                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition w-full whitespace-nowrap shadow-sm shadow-red-100"
                                >
                                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Revisi JSA
                                </button>
                                {row.alasanTolakJSA && (
                                  <div className="mt-1 text-xs text-red-500 bg-red-50 rounded-lg px-2 py-1 border border-red-100 leading-relaxed">
                                    "{row.alasanTolakJSA}"
                                  </div>
                                )}
                              </div>
                            )}

                            {row.statusSIKA === 'rejected' && (
                              <div>
                                <button
                                  onClick={() => router.push('/dashboard/pemohon/sika/new')}
                                  className="flex items-center gap-1.5 bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition w-full whitespace-nowrap shadow-sm shadow-orange-100"
                                >
                                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Revisi SIKA
                                </button>
                                {row.alasanTolakSIKA && (
                                  <div className="mt-1 text-xs text-orange-500 bg-orange-50 rounded-lg px-2 py-1 border border-orange-100 leading-relaxed">
                                    "{row.alasanTolakSIKA}"
                                  </div>
                                )}
                              </div>
                            )}

                            {row.statusJSA !== 'rejected' && row.statusSIKA !== 'rejected' && (
                              <button
                                onClick={() => router.push('/dashboard/pemohon/jsa/detail')}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition w-full whitespace-nowrap shadow-sm shadow-blue-100"
                              >
                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Detail
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination label={`1 – ${filteredData.length} dari ${dataFromStore.length} data`} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}