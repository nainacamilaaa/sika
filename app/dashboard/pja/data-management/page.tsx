'use client';

import { useRouter } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'approved':
      return <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Approved</span>;
    case 'request_approval':
      return <span className="bg-orange-400 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Request Approval</span>;
    case 'request_review':
      return <span className="bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Request Review</span>;
    default:
      return <span className="bg-gray-400 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Draft</span>;
  }
}

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

export default function DataManagementPJAPage() {
  const router = useRouter();
  const { program, jsa, jsaStatus } = useProgramStore();

  const handleEditProgram = () => router.push('/dashboard/pja/program/edit');

  const handleDeleteProgram = () => {
    if (confirm('Apakah Anda yakin ingin menghapus Program ini? Tindakan ini tidak dapat dibatalkan.')) {
      alert('Program berhasil dihapus');
    }
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
          <span className="text-blue-400 cursor-pointer hover:underline">PROGRAM</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 cursor-pointer hover:underline">DATA MANAGEMENT (JSA)</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">REPORT</span>
        </div>
      </div>

      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ─── FILTER ─── */}
        <div style={{ background: '#fff', borderRadius: '0', border: '2px solid #60a5fa', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">FILTER</span>
          </div>
          <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
            <select className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-36">
              <option>TEST</option>
              <option>TEST 2</option>
              <option>TEST 3</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-56">
              <option>TEST - PMO Infrastructure</option>
              <option>TEST - PMO 2</option>
            </select>
            <input
              type="text"
              placeholder="Cari No JSA"
              className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 w-48"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded transition">
              Cari
            </button>
          </div>
        </div>

        {/* ─── DAFTAR TUGAS ─── */}
        <div style={{ background: '#fff', borderRadius: '0', border: '2px solid #60a5fa', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">DAFTAR TUGAS</span>
          </div>
          <div className="px-5 py-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  {['No', 'Nama Program', 'No. JSA', 'Nama JSA', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="px-4 py-2" />
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="px-4 py-2">
                      <input className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
                    </td>
                  ))}
                  <td className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {jsa ? (
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">1</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{program?.namaPaket || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <div>{jsa.tanggalJSA}</div>
                      <div className="text-blue-600 font-medium mt-0.5">{jsa.jsaNo || 'JSA/2024/001'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{jsa.namaJSA || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={jsaStatus} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push('/dashboard/pja/review-jsa')}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                        </svg>
                        Detail
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-10 text-sm">
                      Belum ada JSA yang dikirim untuk review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination label={jsa ? '1 – 1 dari 1 data' : '0 data'} />
        </div>

        {/* ─── DAFTAR PROGRAM ─── */}
        <div style={{ background: '#fff', borderRadius: '0', border: '2px solid #60a5fa', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">DAFTAR PROGRAM</span>
          </div>
          <div className="px-5 py-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  {['No.', 'Tanggal Kontrak', 'Nama Paket Pekerjaan (Kontrak)', 'No Kontrak', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {program ? (
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">1</td>
                    <td className="px-4 py-3 text-gray-700">{program.tanggalKontrak || '-'}</td>
                    <td className="px-4 py-3 font-medium text-orange-600">{program.namaPaket || '-'}</td>
                    <td className="px-4 py-3 text-orange-500">{program.noKontrak || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => router.push('/dashboard/pja/review-jsa')}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                          </svg>
                          Detail
                        </button>
                        <button
                          onClick={handleEditProgram}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                        >
                          ✏ Edit
                        </button>
                        <button
                          onClick={handleDeleteProgram}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                        >
                          🗑 Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-10 text-sm">
                      Belum ada program yang disubmit oleh Pemohon.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination label={program ? '1 – 1 dari 1 data' : '0 data'} />
        </div>

      </div>
    </div>
  );
}