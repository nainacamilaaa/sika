'use client';

import { useRouter } from 'next/navigation';
import { Menu, ChevronLeft } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function StatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'approved':
      return (
        <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded">
          Approved
        </span>
      );
    case 'request_approval':
      return (
        <span className="bg-orange-400 text-white text-xs font-medium px-2.5 py-1 rounded">
          Request Approval
        </span>
      );
    default:
      return (
        <span className="bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded">
          {status || 'Draft'}
        </span>
      );
  }
}

export default function ApprovalDetailPage() {
  const router = useRouter();
  const { program, jsa, jsaStatus } = useProgramStore();

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

      <div className="px-6 py-5">
        {/* ─── DETAIL PEKERJAAN / KONTRAK ─── */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-5 py-2 border-b border-blue-100">
            <span className="text-blue-700 font-bold text-sm">DETAIL PEKERJAAN / KONTRAK</span>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-x-16 gap-y-2.5 text-sm">
            {[
              { label: 'Nama Paket Pekerjaan (Kontrak)', value: program?.namaPaket },
              { label: 'No Kontrak', value: program?.noKontrak },
              { label: 'Tanggal Kontrak', value: program?.tanggalKontrak },
              { label: 'Satuan Kerja', value: program?.satKerjaPemberi },
              { label: 'Reviewer', value: program?.picPemberi },
              { label: 'Perusahaan (Penanggung Jawab Aset)', value: program?.pelaksanaPerusahaan },
              { label: 'Satuan Kerja (Penanggung Jawab Aset)', value: program?.satKerjaPenanggung },
              { label: 'PIC (Penanggung Jawab Aset)', value: program?.picPenanggung },
              { label: 'Pelaksana', value: `${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})` },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <span className="w-56 text-gray-600 flex-shrink-0">{item.label}</span>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <span className="text-gray-800">{item.value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── JOB SAFETY ANALYSIS ─── */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden mt-4">
          <div className="bg-blue-50 px-5 py-2 border-b border-blue-100">
            <span className="text-blue-700 font-bold text-sm">JOB SAFETY ANALYSIS</span>
          </div>

          <div className="px-5 py-4">
            {/* Tabel JSA */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-2 py-2 w-8" />
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">No</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">NO. JSA</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Nama JSA</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Lokasi</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Pelaksana</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Status</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Work Permit</th>
                    <th className="text-left text-gray-600 font-semibold px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jsa ? (
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-3 text-center">
                        <button className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-300 text-white text-xs font-bold">
                          +
                        </button>
                      </td>
                      <td className="px-3 py-3 text-gray-600">1</td>
                      <td className="px-3 py-3 text-gray-700 text-xs">
                        <div>{jsa.tanggalJSA}</div>
                        <div>{jsa.jsaNo || 'JSA/2019/08/GDM1T/0001'}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-800">{jsa.namaJSA || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{jsa.lokasi || '-'}</td>
                      <td className="px-3 py-3 text-gray-700">{program?.pelaksanaPerusahaan || '-'}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={jsaStatus} />
                      </td>
                      <td className="px-3 py-3 text-gray-400 text-xs">-</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                            </svg>
                            Detail
                          </button>
                          <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded">
                            ✏ Edit
                          </button>
                          <button className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded">
                            🗑 Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada JSA.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── BUTTON BACK ─── */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => router.push('/dashboard/pemberi/data-management')}
            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition"
          >
            <ChevronLeft size={14} /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}