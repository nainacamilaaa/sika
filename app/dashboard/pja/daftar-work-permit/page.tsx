'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function formatDate(dateString: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Approved':
      return <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Approved</span>;
    case 'Rejected':
      return <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Rejected</span>;
    case 'Open':
      return <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Open</span>;
    case 'Draft':
      return <span className="bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Draft</span>;
    default:
      return <span className="bg-gray-400 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">{status}</span>;
  }
}

export default function DaftarWorkPermitPJAPage() {
  const router = useRouter();
  const { program, jsa, jsaStatus, workPermitList } = useProgramStore();
  const [expanded, setExpanded] = useState<number | null>(1);

  const allApproved =
    workPermitList.length > 0 &&
    workPermitList.every((w) => w.status === 'Approved');

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
          <span className="text-blue-800 cursor-pointer hover:underline">DAFTAR WORK PERMIT</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">REPORT</span>
        </div>
      </div>

      <div className="px-6 py-8">

        {/* ─── JOB SAFETY ANALYSIS ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">JOB SAFETY ANALYSIS</span>
          </div>

          <div className="px-5 py-5">
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
                    <>
                      <tr
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === 1 ? null : 1)}
                      >
                        <td className="px-2 py-3 text-center">
                          <button className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold transition">
                            {expanded === 1 ? '−' : '+'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-gray-500">1</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">
                          <div className="text-blue-600 font-medium">{jsa.jsaNo || 'JSA/2019/08/GDM1T/0001'}</div>
                          <div className="text-gray-400 mt-0.5">{jsa.tanggalJSA}</div>
                        </td>
                        <td className="px-3 py-3 text-gray-800 font-medium">{jsa.namaJSA || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{jsa.lokasi || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{program?.pelaksanaPerusahaan || '-'}</td>
                        <td className="px-3 py-3">
                          {jsaStatus === 'approved'
                            ? <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Approved</span>
                            : <span className="bg-orange-400 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Request Approval</span>
                          }
                        </td>
                        <td className="px-3 py-3">
                          {allApproved
                            ? <span className="bg-teal-500 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">🔖 WP Sudah Dirilis</span>
                            : workPermitList.length > 0
                              ? <span className="bg-orange-400 text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap">Menunggu Approval WP</span>
                              : <span className="text-gray-400 text-xs">-</span>
                          }
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pja/review-jsa'); }}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                            >
                              Detail
                            </button>
                            {allApproved && (
                              <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition">
                                ⬇ Report
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ─── SUB TABLE WORK PERMIT ─── */}
                      {expanded === 1 && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50 border-b border-gray-200">
                            <div className="px-8 py-5">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Daftar Work Permit</span>
                              </div>
                              <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="bg-blue-600 text-white">
                                      {['No', 'No. WP', 'Jenis WP', 'Tanggal Pekerjaan', 'Status', 'Action'].map((h) => (
                                        <th key={h} className="text-left text-white font-semibold px-4 py-3 whitespace-nowrap text-xs tracking-wide">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {workPermitList.length > 0 ? (
                                      workPermitList.map((wp) => (
                                        <tr key={wp.no} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                          <td className="px-4 py-3 text-gray-500">{wp.no}</td>
                                          <td className="px-4 py-3 text-blue-600 font-medium">{wp.noWP}</td>
                                          <td className="px-4 py-3 text-gray-800">{wp.jenisWP}</td>
                                          <td className="px-4 py-3 text-gray-700 text-xs">
                                            <div>{formatDate(wp.tanggalMulai)}</div>
                                            <div className="text-gray-400 mt-0.5">s/d {formatDate(wp.tanggalSelesai)}</div>
                                          </td>
                                          <td className="px-4 py-3"><StatusBadge status={wp.status} /></td>
                                          <td className="px-4 py-3">
                                            <button
                                              onClick={() => router.push(`/dashboard/pja/review-work-permit?no=${wp.noWP}`)}
                                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                                            >
                                              Detail
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                                          Belum ada Work Permit yang diajukan.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada JSA yang tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── PAGINATION ─── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <span>{jsa ? '1 – 1 dari 1 data' : '0 data'}</span>
            <div className="flex items-center gap-2">
              <ChevronLeft size={14} className="cursor-pointer hover:text-gray-700" />
              <ChevronRight size={14} className="cursor-pointer hover:text-gray-700" />
              <select className="border border-gray-300 rounded px-2 py-1 text-xs ml-1 focus:outline-none">
                <option>10</option><option>20</option><option>40</option>
              </select>
              <span className="text-gray-400">per halaman</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}