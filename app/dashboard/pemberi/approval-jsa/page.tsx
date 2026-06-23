'use client';

import { useRouter } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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

export default function ApprovalJSAPage() {
  const router = useRouter();
  const { program, jsa, jsaStatus, reset } = useProgramStore();

  const handleEdit = () => router.push('/dashboard/pemberi/review-jsa');

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus JSA ini? Tindakan ini tidak dapat dibatalkan.')) {
      reset();
      router.push('/dashboard/pemberi/data-management');
    }
  };

  const detailItems = [
    { label: 'Nama Paket Pekerjaan (Kontrak)',       value: program?.namaPaket },
    { label: 'Tanggal Kontrak',                      value: program?.tanggalKontrak },
    { label: 'Reviewer', value: program?.picPemberiList?.join(', ') }, 
    { label: 'Satuan Kerja (Penanggung Jawab Aset)', value: program?.satKerjaPenanggung },
    { label: 'Pelaksana',                            value: `${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})` },
    { label: 'No Kontrak',                           value: program?.noKontrak },
    { label: 'Satuan Kerja',                         value: program?.satKerjaPemberi },
    { label: 'Perusahaan (Penanggung Jawab Aset)',   value: program?.pelaksanaPerusahaan },
   { label: 'PIC (Penanggung Jawab Aset)', value: program?.picPenanggungList?.join(', ') }
  ];

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

      <div className="px-6 py-8 space-y-8">

        {/* ─── DETAIL PEKERJAAN / KONTRAK ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">DETAIL PEKERJAAN / KONTRAK</span>
          </div>
          <div className="px-6 py-6">
            <table className="text-sm">
              <tbody>
                {detailItems.map((item) => (
                  <tr key={item.label} className="align-top">
                    <td className="py-1.5 text-gray-600 font-medium whitespace-nowrap pr-4 w-72">{item.label}</td>
                    <td className="py-1.5 text-gray-400 pr-4">:</td>
                    <td className="py-1.5 text-gray-800">{item.value || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── JOB SAFETY ANALYSIS ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">JOB SAFETY ANALYSIS</span>
          </div>

          <div className="px-5 py-5">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition mb-5">
              <Plus size={16} />
              Tambah JSA
            </button>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-2 py-3 w-8" />
                    {['No', 'NO. JSA', 'Nama JSA', 'Lokasi', 'Pelaksana', 'Status', 'Work Permit', 'Action'].map((h) => (
                      <th key={h} className="text-left text-white font-semibold px-3 py-3 whitespace-nowrap text-xs tracking-wide">
                        <span className="flex items-center gap-1">
                          {h}
                          {!['No', 'Work Permit', 'Action'].includes(h) && (
                            <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 10l5 5 5-5z" />
                            </svg>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jsa ? (
                    <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-300 hover:bg-gray-400 text-white text-xs font-bold transition">
                          +
                        </button>
                      </td>
                      <td className="px-3 py-3 text-gray-500">1</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">
                        <div>{jsa.tanggalJSA}</div>
                        <div className="text-blue-600 font-medium mt-0.5">{jsa.jsaNo || 'JSA/2019/08/GDM1T/0001'}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-800 font-medium">{jsa.namaJSA || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{jsa.lokasi || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{program?.pelaksanaPerusahaan || '-'}</td>
                      <td className="px-3 py-3"><StatusBadge status={jsaStatus} /></td>
                      <td className="px-3 py-3 text-gray-400 text-xs">-</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push('/dashboard/pemberi/review-jsa')}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                            </svg>
                            Detail
                          </button>
                          <button onClick={handleEdit} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition">
                            ✏ Edit
                          </button>
                          <button onClick={handleDelete} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition">
                            🗑 Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada JSA yang diapprove.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <TablePagination label={jsa ? '1 – 1 dari 1 data' : '0 data'} />
        </div>

      </div>
    </div>
  );
}