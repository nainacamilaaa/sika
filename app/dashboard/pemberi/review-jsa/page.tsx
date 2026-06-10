'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Pencil, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function ResikoBadge({ resiko }: { resiko: string }) {
  const colorMap: Record<string, string> = {
    'Risiko Rendah':  'text-green-700 font-bold',
    'Risiko Sedang':  'text-orange-500 font-bold',
    'Risiko Tinggi':  'text-red-600 font-bold',
    'Risiko Ekstrim': 'text-red-800 font-bold',
  };
  return <span className={colorMap[resiko] || 'text-gray-700'}>{resiko}</span>;
}

function ViewTindakLanjutPanel({ rtl }: { rtl: {
  potensiBahayaSebelum: string; konsekuensiSebelum: string;
  kemungkinanSebelum: string; tingkatResikoSebelum: string;
  potensiBahayaSetelah: string; konsekuensiSetelah: string;
  kemungkinanSetelah: string; tingkatResikoSetelah: string;
}}) {
  return (
    <tr>
      <td colSpan={8} className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Sebelum Tindakan</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Potensi Bahaya</span> : {rtl.potensiBahayaSebelum || '-'}</p>
              <p><span className="font-medium">Konsekuensi</span> : {rtl.konsekuensiSebelum}</p>
              <p><span className="font-medium">Kemungkinan</span> : {rtl.kemungkinanSebelum}</p>
              <p><span className="font-medium">Tingkat Resiko</span> : <ResikoBadge resiko={rtl.tingkatResikoSebelum} /></p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Setelah Tindakan</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Potensi Bahaya</span> : {rtl.potensiBahayaSetelah || '-'}</p>
              <p><span className="font-medium">Konsekuensi</span> : {rtl.konsekuensiSetelah}</p>
              <p><span className="font-medium">Kemungkinan</span> : {rtl.kemungkinanSetelah}</p>
              <p><span className="font-medium">Tingkat Resiko</span> : <ResikoBadge resiko={rtl.tingkatResikoSetelah} /></p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function ReviewJSAPage() {
  const router = useRouter();
  const { program, jsa, aktivitasList, rtlList, setJsaStatus, setApproveDate: saveApproveDate } = useProgramStore();
  const [expandedNo, setExpandedNo] = useState<number | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveDate, setApproveDate] = useState('');

  const mergedList = aktivitasList.map((a) => ({
    ...a,
    rtl: rtlList.find((r) => r.aktivitasNo === a.no),
  }));

  const isHighRisk = (resiko: string) =>
    resiko === 'Risiko Tinggi' || resiko === 'Risiko Ekstrim';

  const toggleExpand = (no: number) =>
    setExpandedNo((prev) => (prev === no ? null : no));

  const handleApprove = () => {
  const today = new Date().toISOString().split('T')[0];
  setJsaStatus('approved');
  saveApproveDate(today);
  setShowApproveModal(false);
  router.push('/dashboard/pemberi/approval-jsa');
};

  const handleReject  = () => {
    alert('JSA telah di-REJECT.');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '30px' }}>
          <div className="flex items-center gap-2">
            <img
              src="/logosika.svg"
              alt="SIKA"
              className="h-7 object-contain"
            />
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY</span>
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            DATA MANAGEMENT (JSA)
          </span>
          <span className="text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            REPORT
          </span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* ─── ROW 1: DETAIL PROGRAM + JSA ─── */}
        <div className="grid grid-cols-2 gap-4">

          {/* DETAIL DATA PROGRAM */}
          <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
            <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-bold text-sm">DETAIL DATA PROGRAM</span>
            </div>
            <div className="px-5 py-4 space-y-2.5 text-sm">
              {[
                { label: 'Nama Paket Pekerjaan (Kontrak)', value: program?.namaPaket },
                { label: 'No Kontrak',                     value: program?.noKontrak },
                { label: 'tanggal Kontrak',                value: program?.tanggalKontrak },
                { label: 'Satuan Kerja',                   value: program?.satKerjaPemberi },
                { label: 'Reviewer',                       value: program?.picPemberi },
                { label: 'Perusahaan',                     value: program?.pelaksanaPerusahaan },
                { label: '(Penanggung Jawab Aset) Satuan Kerja', value: program?.satKerjaPenanggung },
                { label: '(Penanggung Jawab Aset) PIC',   value: program?.picPenanggung },
                { label: 'Pelaksana',                      value: `${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})` },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="w-52 text-gray-600 flex-shrink-0">{item.label}</span>
                  <span className="text-gray-400 flex-shrink-0">:</span>
                  <span className="text-gray-800">{item.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JOB SAFETY ANALYSIS */}
          <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
            <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-bold text-sm">JOB SAFETY ANALYSIS</span>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-32 text-gray-600 flex-shrink-0">JSA No.</span>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <span className="text-gray-800 flex-1">{jsa?.jsaNo || 'JSA/2024/001'}</span>
                <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded transition">
                  <Pencil size={12} /> Edit
                </button>
              </div>
              {[
                { label: 'Lokasi',         value: jsa?.lokasi },
                { label: 'Tanggal',        value: jsa?.tanggalJSA },
                { label: 'Nama Pekerjaan', value: jsa?.namaJSA },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="w-32 text-gray-600 flex-shrink-0">{item.label}</span>
                  <span className="text-gray-400 flex-shrink-0">:</span>
                  <span className="text-gray-800">{item.value || '-'}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="w-32 text-gray-600 flex-shrink-0">Lampiran</span>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <div className="flex-1 space-y-2">
                  {jsa?.dokumen?.length ? (
                    jsa.dokumen.map((doc, i) => (
                      <div key={i} className="bg-teal-500 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-teal-600 transition truncate">
                        {doc}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada lampiran</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RISIKO AKTIFITAS PEKERJAAN ─── */}
        <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
          <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-sm">RISIKO AKTIFITAS PEKERJAAN</span>
          </div>

          <div className="px-5 py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-2 py-2 w-8" />
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">No</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Aktivitas Pekerjaan</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Potensi Bahaya</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Tingkat Resiko</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Spesifik Hazard</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Tindakan Pencegahan</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada aktivitas dari Pemohon.
                      </td>
                    </tr>
                  ) : (
                    mergedList.map((row) => {
                      const high     = isHighRisk(row.tingkatResiko);
                      const hasRTL   = !!row.rtl;
                      const expanded = expandedNo === row.no;

                      return (
                        <>
                          <tr
                            key={`row-${row.no}`}
                            className={`border-b border-gray-200 ${high ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                          >
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => hasRTL && toggleExpand(row.no)}
                                className={`inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold
                                  ${high ? 'bg-red-400' : 'bg-gray-300'}
                                  ${hasRTL ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                              >
                                {expanded ? '−' : '+'}
                              </button>
                            </td>
                            <td className="px-3 py-3 text-gray-600">{row.no}</td>
                            <td className="px-3 py-3 text-gray-800 font-medium">{row.aktivitasPekerjaan}</td>
                            <td className="px-3 py-3 text-gray-700">{row.potensiBahaya}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <ResikoBadge resiko={row.tingkatResiko} />
                            </td>
                            <td className="px-3 py-3 text-gray-700">{row.spesifikHazard}</td>
                            <td className="px-3 py-3 text-gray-700">{row.pengendalian}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-col gap-1.5 items-start">
                                {hasRTL && (
                                  <button
                                    onClick={() => toggleExpand(row.no)}
                                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded transition whitespace-nowrap"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Tindak Lanjut
                                  </button>
                                )}
                                <div className="flex gap-1">
                                  <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded transition">
                                    <Pencil size={10} /> Edit
                                  </button>
                                  <button className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded transition">
                                    <X size={10} /> Hapus
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {expanded && row.rtl && (
                            <ViewTindakLanjutPanel key={`rtl-${row.no}`} rtl={row.rtl} />
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-3 text-gray-400">
              <ChevronLeft size={18} className="cursor-pointer hover:text-gray-600" />
              <ChevronRight size={18} className="cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>

        {/* ─── BOTTOM BUTTONS ─── */}
        <div className="flex justify-end gap-2 pb-4">
          <button
            onClick={() => setShowApproveModal(true)}
            className="flex items-center gap-1.5 text-white text-sm font-semibold px-5 py-2 rounded transition" 
            style={{ backgroundColor: '#10b981' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            APPROVE
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            REJECT
          </button>
          <button className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy JSA
          </button>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition"
          >
            <ChevronLeft size={14} /> Kembali
          </button>
        </div>

      </div>

      {/* ─── MODAL APPROVE ─── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Approve</h3>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin <span className="text-green-600 font-semibold">menyetujui</span> JSA ini?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 text-sm text-white font-semibold rounded transition"
                style={{ backgroundColor: '#10b981' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Ya, Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}