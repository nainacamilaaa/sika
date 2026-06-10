'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

// ─── Types ───────────────────────────────────────────────────────────────────

type WPStatus = 'Draft' | 'Open';

interface WorkPermitRow {
  no: number;
  noWP: string;
  jenisWP: string;
  tanggalPekerjaan: string;
  status: WPStatus;
  filled: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateWPNo(index: number, tanggal: string): string {
  const parts = tanggal ? tanggal.split('-') : [];
  const y = parts[0] ?? new Date().getFullYear();
  const m = parts[1] ?? String(new Date().getMonth() + 1).padStart(2, '0');
  return `PTW/${y}/${m}///000${index + 1}`;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Draft':            'bg-green-500',
    'Open':             'bg-blue-500',
    'Approved':         'bg-green-500',
    'Rejected':         'bg-red-500',
    'Request Approval': 'bg-orange-400',
    'Request Review':   'bg-yellow-400',
  };
  return (
    <span className={`${map[status] ?? 'bg-gray-400'} text-white text-xs font-medium px-2.5 py-1 rounded whitespace-nowrap`}>
      {status}
    </span>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon() {
  return (
    <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataManagementJSAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { program, jsa, savedWPs } = useProgramStore();

  // Inisialisasi WP rows dari savedWPs — stabil, tidak direset tiap render
  const [wpRows, setWpRows] = useState<WorkPermitRow[]>(() =>
    (savedWPs ?? []).map((jenisWP, i) => ({
      no: i + 1,
      noWP: generateWPNo(i, jsa?.tanggalJSA ?? ''),
      jenisWP,
      tanggalPekerjaan: jsa?.tanggalJSA ?? '-',
      status: 'Draft' as WPStatus,
      filled: false,
    }))
  );

  const [expandedJSA, setExpandedJSA] = useState(true);

  // Saat kembali dari DraftWorkPermitPage dengan ?filled=<noWP>
  // → tandai WP tersebut sebagai filled & ubah status jadi Open
  useEffect(() => {
    const filledNo = searchParams.get('filled');
    if (!filledNo) return;
    setWpRows((prev) =>
      prev.map((wp) =>
        wp.noWP === decodeURIComponent(filledNo)
          ? { ...wp, filled: true, status: 'Open' as WPStatus }
          : wp
      )
    );
  }, [searchParams]);

  // Semua WP filled = semua sudah Open
  const filledCount = wpRows.filter((w) => w.filled).length;
  const allFilled   = wpRows.length > 0 && filledCount === wpRows.length;

  // Navigasi ke Draft WP — kirim noWP sebagai param
  const handleDraftWP = (wp: WorkPermitRow) => {
    router.push(
      `/dashboard/pemohon/work-permit/draft?no=${encodeURIComponent(wp.noWP)}&wp=${encodeURIComponent(wp.jenisWP)}`
    );
  };

  const detailItems = [
    { label: 'Nama Paket Pekerjaan (Kontrak)',        value: program?.namaPaket },
    { label: 'No Kontrak',                            value: program?.noKontrak },
    { label: 'Tanggal Kontrak',                       value: program?.tanggalKontrak },
    { label: 'Satuan Kerja',                          value: program?.satKerjaPemberi },
    { label: 'Reviewer',                              value: program?.picPemberi },
    { label: 'Perusahaan (Penanggung Jawab Aset)',    value: program?.pelaksanaPerusahaan },
    { label: 'Satuan Kerja (Penanggung Jawab Aset)',  value: program?.satKerjaPenanggung },
    { label: 'PIC (Penanggung Jawab Aset)',           value: program?.picPenanggung },
    { label: 'Pelaksana',                             value: program?.pelaksanaPerusahaan
        ? `${program.pelaksanaPerusahaan} (${program.pelaksanaJenis ?? 'Eksternal'})`
        : '-' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span
              onClick={() => router.push('/dashboard/pemohon/program/new')}
              className="font-bold text-gray-800 text-sm tracking-wide cursor-pointer hover:text-gray-600"
            >
              ENTRY DATA
            </span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-800 cursor-pointer hover:underline">DATA MANAGEMENT</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">REPORT</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-8 space-y-8">

        {/* ─── DETAIL PROGRAM ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">DETAIL PROGRAM</span>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-3 py-3 w-8" />
                    {['No', 'NO. JSA', 'Nama JSA', 'Lokasi', 'Pelaksana', 'Status', 'Work Permit', 'Action'].map((h) => (
                      <th key={h} className="text-left text-white font-semibold px-3 py-3 whitespace-nowrap text-xs tracking-wide">
                        <span className="flex items-center gap-1">
                          {h}
                          {!['No', 'Work Permit', 'Action'].includes(h) && <SortIcon />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jsa ? (
                    <>
                      {/* ─── JSA Row ─── */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => setExpandedJSA((p) => !p)}
                            className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-300 hover:bg-gray-400 text-white text-xs font-bold transition"
                          >
                            {expandedJSA ? '−' : '+'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-gray-500">1</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">
                          <div>{jsa.tanggalJSA || '-'}</div>
                          <div className="text-blue-600 font-medium mt-0.5">{jsa.jsaNo || 'JSA/2024/08/0001'}</div>
                        </td>
                        <td className="px-3 py-3 text-gray-800 font-medium">{jsa.namaJSA || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{jsa.lokasi || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{program?.pelaksanaPerusahaan || '-'}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status="Approved" />
                        </td>
                        <td className="px-3 py-3">
                          {wpRows.length > 0 && (
                            allFilled ? (
                              // Semua WP sudah Open → tampilkan info sedang direview
                              <div className="border border-red-400 rounded px-3 py-1.5 text-xs text-gray-700 whitespace-nowrap">
                                Sedang direview oleh penanggung jawab aset
                              </div>
                            ) : (
                              // Masih ada WP yang Draft → tombol expand
                              <button
                                onClick={() => setExpandedJSA(true)}
                                className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition whitespace-nowrap"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Draft Work Permit ({filledCount}/{wpRows.length} selesai)
                              </button>
                            )
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push('/dashboard/pemohon/jsa/detail')}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                              </svg>
                              Detail
                            </button>
                            <button
                              onClick={() => {
                                const reportData = `JSA Report\nNo: ${jsa.jsaNo}\nNama: ${jsa.namaJSA}\nLokasi: ${jsa.lokasi}\nTanggal: ${jsa.tanggalJSA}`;
                                const element = document.createElement('a');
                                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportData));
                                element.setAttribute('download', `JSA_Report_${jsa.jsaNo}.txt`);
                                element.style.display = 'none';
                                document.body.appendChild(element);
                                element.click();
                                document.body.removeChild(element);
                              }}
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Report
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ─── Expanded WP sub-rows ─── */}
                      {expandedJSA && wpRows.length > 0 && (
                        <tr>
                          <td colSpan={9} className="p-0 border-b border-gray-200">
                            <div className="mx-4 my-3 overflow-hidden">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-blue-600 text-white">
                                    {['No', 'No. WP', '', 'Jenis WP', 'Tanggal Pekerjaan', 'Status', 'Action'].map((h, i) => (
                                      <th key={i} className="text-left text-white font-semibold px-3 py-3 whitespace-nowrap text-xs tracking-wide">
                                        <span className="flex items-center gap-1">
                                          {h}
                                          {!['', 'Action'].includes(h) && <SortIcon />}
                                        </span>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {wpRows.map((wp, idx) => (
                                    <tr key={wp.no} className="border-b border-gray-100 bg-white hover:bg-blue-50 transition-colors">
                                      <td className="px-3 py-3 text-gray-500">{wp.no}</td>
                                      <td className="px-3 py-3 text-xs">
                                        <div className="text-blue-600 font-medium">{wp.noWP}</div>
                                      </td>
                                      <td className="px-2 py-3 text-center w-8">
                                        {idx === 0 && (
                                          <svg className="w-4 h-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                          </svg>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 text-gray-800 font-medium">{wp.jenisWP}</td>
                                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                                        {wp.filled && wp.tanggalPekerjaan !== '-'
                                          ? `${wp.tanggalPekerjaan} s/d ${wp.tanggalPekerjaan}`
                                          : '-'}
                                      </td>
                                      <td className="px-3 py-3">
                                        {/* Status: Draft → Open setelah diisi */}
                                        <StatusBadge status={wp.status} />
                                      </td>
                                      <td className="px-3 py-3">
                                        {!wp.filled ? (
                                          // Belum diisi → tombol Draft Work Permit
                                          <button
                                            onClick={() => handleDraftWP(wp)}
                                            className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition whitespace-nowrap"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Draft Work Permit
                                          </button>
                                        ) : allFilled ? (
                                          // Semua WP sudah Open → Review Work Permit
                                          <button
                                            onClick={() => router.push(`/dashboard/pemohon/work-permit/review?no=${encodeURIComponent(wp.noWP)}`)}
                                            className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium px-2.5 py-1.5 rounded transition whitespace-nowrap"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Review Work Permit
                                          </button>
                                        ) : (
                                          // WP ini sudah diisi tapi ada WP lain yang belum → disabled
                                          <button
                                            disabled
                                            className="flex items-center gap-1 bg-blue-400 text-white text-xs font-medium px-2.5 py-1.5 rounded whitespace-nowrap cursor-not-allowed opacity-80"
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Menunggu WP Lain Terisi
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada data JSA.
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