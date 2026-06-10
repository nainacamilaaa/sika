'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function TablePagination({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <ChevronLeft size={14} className="cursor-pointer hover:text-gray-700" />
        <ChevronRight size={14} className="cursor-pointer hover:text-gray-700" />
        <select className="border border-gray-300 rounded px-2 py-1 text-xs ml-1 focus:outline-none">
          <option>10</option><option>20</option><option>40</option>
        </select>
        <span className="text-gray-400">per halaman</span>
      </div>
    </div>
  );
}

export default function ReviewJSAPJAPage() {
  const router = useRouter();
  const { program, jsa, aktivitasList } = useProgramStore();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveDate, setApproveDate] = useState('');

  const handleApprove = () => {
    setShowApproveModal(false);
    setApproveDate('');
    router.push('/dashboard/pja/data-management');
  };

  const handleReject = () => {
    setShowRejectModal(false);
    router.push('/dashboard/pja/data-management');
  };

  const programData = program ?? {
    namaPaket: 'TRIAL - Pemasangan Hydrant di Offtake Sunyaragi',
    noKontrak: 'PMO-2019-0015',
    tanggalKontrak: '01-08-2019',
    satKerjaPemberi: 'TEST - PMO Infrastructure',
    picPemberi: 'TEST PIC PMO',
    satKerjaPenanggung: 'Gas Distribution Regional I',
    picPenanggung: 'Test Level Pekerja 2',
    pelaksanaPerusahaan: 'PGAS Solution CA JBB (Eksternal)',
    pelaksanaJenis: 'Eksternal',
  };

  const jsaData = jsa ?? {
    jsaNo: 'JSA/2019/08/GDM1T/0001',
    kontraktor: 'PGAS Solution',
    lokasi: 'Area Cirebon',
    tanggalJSA: '2019-08-02',
    namaJSA: 'Pemasangan Hydrant',
    dokumen: [
      '04_PO Job Safety Analysis_O-008-0.38_25 Agustus 2011.pdf',
      '03_PO Proces Hazard Analysis_O-007-0.38_25 Agustus 2011.pdf',
    ],
  };

  const risikoList = aktivitasList.length > 0 ? aktivitasList : [
    { no: 1, aktivitasPekerjaan: 'Mobilisasi Peralatan', potensiBahaya: 'Ergonomi/Ergonomic (Postur Tubuh)', tingkatResiko: 'Risiko Rendah', spesifikHazard: 'Postur Tubuh saat mengangkat peralatan', pengendalian: 'Prosedur Kerja', level: 'Rendah' },
    { no: 2, aktivitasPekerjaan: 'Pemasangan Genset', potensiBahaya: 'Fisika/Physics (Tekanan)', tingkatResiko: 'Risiko Tinggi', spesifikHazard: 'Terjepit Saat Pemasangan Genset', pengendalian: 'Prosedur Kerja dan APD', level: 'Tinggi' },
  ];

  const getTingkatColor = (tingkat: string | undefined): string => {
    if (!tingkat) return 'text-gray-600';
    const t = tingkat.toLowerCase();
    if (t.includes('rendah')) return 'text-green-700 font-semibold';
    if (t.includes('sedang')) return 'text-yellow-600 font-semibold';
    if (t.includes('tinggi')) return 'text-red-600 font-semibold';
    return 'text-gray-600';
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
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => router.push('/dashboard/pja/data-management')}>DATA MANAGEMENT (JSA)</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 cursor-pointer hover:underline">REVIEW JSA</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">REPORT</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">

        {/* ─── ROW 1: 2 KOLOM ─── */}
        <div className="grid grid-cols-2 gap-6">

          {/* Kiri: Data Pemberi Pekerjaan */}
          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">DATA PEMBERI PEKERJAAN</span>
            </div>
            <div className="px-6 py-5">
              <table className="text-sm">
                <tbody>
                  {[
                    ['Nama Paket Pekerjaan (Kontrak)', programData.namaPaket],
                    ['No Kontrak',                     programData.noKontrak],
                    ['Tanggal Kontrak',                programData.tanggalKontrak],
                    ['Satuan Kerja',                   programData.satKerjaPemberi],
                    ['Reviewer',                       programData.picPemberi],
                    ['Satuan Kerja (Penanggung Jawab Aset)', programData.satKerjaPenanggung],
                    ['PIC (Penanggung Jawab Aset)',    programData.picPenanggung],
                    ['Pelaksana',                      programData.pelaksanaPerusahaan],
                  ].map(([label, value]) => (
                    <tr key={label} className="align-top">
                      <td className="py-1.5 pr-4 text-gray-600 font-medium whitespace-nowrap">{label}</td>
                      <td className="py-1.5 text-gray-400 pr-4">:</td>
                      <td className="py-1.5 text-gray-800">{value ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kanan: Data JSA */}
          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200 flex items-center justify-between">
              <span className="text-blue-700 font-semibold text-sm">DATA JSA / ANALISA</span>
              <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded transition">
                ✏ Edit
              </button>
            </div>
            <div className="px-6 py-5">
              <table className="text-sm">
                <tbody>
                  {[
                    ['JSA No.',        jsaData.jsaNo],
                    ['Kontraktor',     jsaData.kontraktor],
                    ['Lokasi',         jsaData.lokasi],
                    ['Tanggal',        jsaData.tanggalJSA],
                    ['Nama Pekerjaan', jsaData.namaJSA],
                  ].map(([label, value]) => (
                    <tr key={label} className="align-top">
                      <td className="py-1.5 pr-4 text-gray-600 font-medium whitespace-nowrap">{label}</td>
                      <td className="py-1.5 text-gray-400 pr-4">:</td>
                      <td className="py-1.5 text-gray-800">{value ?? '-'}</td>
                    </tr>
                  ))}
                  <tr className="align-top">
                    <td className="py-1.5 pr-4 text-gray-600 font-medium whitespace-nowrap">Lampiran</td>
                    <td className="py-1.5 text-gray-400 pr-4">:</td>
                    <td className="py-1.5 space-y-1.5">
                      {Array.isArray(jsaData.dokumen) && jsaData.dokumen.map((file) => (
                        <div key={file}>
                          <a href="#" className="inline-block bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-1.5 rounded transition max-w-xs truncate" title={file}>
                            {file}
                          </a>
                        </div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── RISIKO AKTIFITAS PEKERJAAN ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">RISIKO AKTIFITAS PEKERJAAN</span>
          </div>
          <div className="px-5 py-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-2 py-3 w-8" />
                    {['No', 'Aktivitas Pekerjaan', 'Potensi Bahaya', 'Tingkat Resiko', 'Spesifik Hazard', 'Tindakan Pencegahan', 'Aksi'].map((h) => (
                      <th key={h} className="text-left text-white font-semibold px-3 py-3 whitespace-nowrap text-xs tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {risikoList.map((r) => (
                    <tr key={r.no} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-500 hover:bg-blue-600 text-white transition">
                          <Plus size={12} />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{r.no}</td>
                      <td className="px-3 py-3 text-gray-800 font-medium">{r.aktivitasPekerjaan}</td>
                      <td className="px-3 py-3 text-gray-700">{r.potensiBahaya}</td>
                      <td className={`px-3 py-3 ${getTingkatColor(r.tingkatResiko)}`}>{r.tingkatResiko}</td>
                      <td className="px-3 py-3 text-gray-700">{r.spesifikHazard}</td>
                      <td className="px-3 py-3 text-gray-700">{r.pengendalian}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition">✏ Edit</button>
                          <button className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition">🗑 Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <TablePagination label={`1 – ${risikoList.length} dari ${risikoList.length} data`} />
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex justify-end gap-3 pb-4">
          <button onClick={() => setShowApproveModal(true)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-2 rounded transition">
            ✔ APPROVE
          </button>
          <button onClick={() => setShowRejectModal(true)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2 rounded transition">
            ✖ REJECT
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded transition">
            ⧉ Copy JSA
          </button>
          <button onClick={() => router.push('/dashboard/pja/data-management')} className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold px-6 py-2 rounded transition">
            Kembali
          </button>
        </div>

      </div>

      {/* ─── MODAL APPROVE ─── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded border-2 border-blue-400 shadow-xl w-full max-w-lg mx-4">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">APPROVAL</span>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Tanggal</label>
                <span className="text-gray-400">:</span>
                <input
                  type="date"
                  value={approveDate}
                  onChange={(e) => setApproveDate(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowApproveModal(false)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-8 py-2 rounded transition">
                  Batal
                </button>
                <button onClick={handleApprove} disabled={!approveDate} className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-8 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL REJECT ─── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded border-2 border-blue-400 shadow-xl w-full max-w-sm mx-4">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">KONFIRMASI REJECT</span>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 mb-3">Berikan alasan penolakan JSA ini:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Tuliskan alasan reject..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 mb-5"
              />
              <div className="flex justify-center gap-3">
                <button onClick={() => setShowRejectModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold px-8 py-2 rounded transition">
                  Batal
                </button>
                <button onClick={handleReject} disabled={!rejectReason.trim()} className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-8 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Ya, Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}