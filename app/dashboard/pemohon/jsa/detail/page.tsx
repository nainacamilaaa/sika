'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Pencil, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Aktivitas {
  no: number;
  aktivitasPekerjaan: string;
  potensiBahaya: string;
  intensitas: string;
  historyKerjadian: string;
  kapabilitas: string;
  level: string;
  tingkatKeparahan: string;
  tingkatResiko: string;
  spesifikHazard: string;
  pengendalian: string;
}

// ─── Options ─────────────────────────────────────────────────────────────────

const INTENSITAS_OPTIONS = [
  '(1) Terjadi diatas 6 Bulan sekali',
  '(2) Terjadi 3-6 Bulan sekali',
  '(3) Terjadi 1-3 Bulan sekali',
  '(4) Terjadi beberapa kali sebulan',
  '(5) Terjadi setiap hari',
];

const HISTORY_OPTIONS = [
  '(1) Tidak pernah diperusahaan maupun sejenis',
  '(2) Pernah terjadi di perusahaan sejenis',
  '(3) Pernah terjadi di perusahaan ini',
  '(4) Terjadi beberapa kali di perusahaan ini',
  '(5) Terjadi sering di perusahaan ini',
];

const KAPABILITAS_OPTIONS = [
  '(1) Banyak lapisan kontrol eksisting sehingga b',
  '(2) Beberapa lapisan kontrol eksisting',
  '(3) Satu lapisan kontrol eksisting',
  '(4) Tidak ada kontrol eksisting',
  '(5) Kontrol tidak efektif',
];

const KEPARAHAN_OPTIONS = [
  '(1) Ringan',
  '(2) Sedang',
  '(3) Berat',
  '(4) Kritis',
  '(5) Fatal',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcLevel(intensitas: string, history: string, kapabilitas: string): string {
  const i = parseInt(intensitas.charAt(1)) || 0;
  const h = parseInt(history.charAt(1)) || 0;
  const k = parseInt(kapabilitas.charAt(1)) || 0;
  const total = i + h + k;
  if (total <= 5) return 'Jarang';
  if (total <= 9) return 'Kadang';
  if (total <= 12) return 'Sering';
  return 'Sangat Sering';
}

function calcResiko(level: string, keparahan: string): string {
  const k = parseInt(keparahan.charAt(1)) || 0;
  const levelMap: Record<string, number> = { 'Jarang': 1, 'Kadang': 2, 'Sering': 3, 'Sangat Sering': 4 };
  const score = (levelMap[level] || 1) * k;
  if (score <= 3) return 'Risiko Rendah';
  if (score <= 8) return 'Risiko Sedang';
  if (score <= 12) return 'Risiko Tinggi';
  return 'Risiko Ekstrim';
}

function isHighRisk(resiko: string) {
  return resiko === 'Risiko Tinggi' || resiko === 'Risiko Ekstrim';
}

// ─── Risiko Badge ─────────────────────────────────────────────────────────────

function ResikoBadge({ resiko }: { resiko: string }) {
  const colorMap: Record<string, string> = {
    'Risiko Rendah': 'text-green-700 font-bold',
    'Risiko Sedang': 'text-orange-500 font-bold',
    'Risiko Tinggi': 'text-red-600 font-bold',
    'Risiko Ekstrim': 'text-red-800 font-bold',
  };
  return <span className={colorMap[resiko] || 'text-gray-700'}>{resiko}</span>;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function TambahAktivitasModal({
  onClose,
  onSave,
  editingData,
}: {
  onClose: () => void;
  onSave: (data: Omit<Aktivitas, 'no'>) => void;
  editingData?: Aktivitas;
}) {
  const initLevel = calcLevel(INTENSITAS_OPTIONS[0], HISTORY_OPTIONS[0], KAPABILITAS_OPTIONS[0]);
  const initResiko = calcResiko(initLevel, KEPARAHAN_OPTIONS[0]);

  const [form, setForm] = useState({
    aktivitasPekerjaan: editingData?.aktivitasPekerjaan || '',
    potensiBahaya: editingData?.potensiBahaya || '',
    intensitas: editingData?.intensitas || INTENSITAS_OPTIONS[0],
    historyKerjadian: editingData?.historyKerjadian || HISTORY_OPTIONS[0],
    kapabilitas: editingData?.kapabilitas || KAPABILITAS_OPTIONS[0],
    level: editingData?.level || initLevel,
    tingkatKeparahan: editingData?.tingkatKeparahan || KEPARAHAN_OPTIONS[0],
    tingkatResiko: editingData?.tingkatResiko || initResiko,
    spesifikHazard: editingData?.spesifikHazard || '',
    pengendalian: editingData?.pengendalian || '',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const level = calcLevel(
        field === 'intensitas' ? value : next.intensitas,
        field === 'historyKerjadian' ? value : next.historyKerjadian,
        field === 'kapabilitas' ? value : next.kapabilitas
      );
      const tingkatResiko = calcResiko(
        level,
        field === 'tingkatKeparahan' ? value : next.tingkatKeparahan
      );
      return { ...next, level, tingkatResiko };
    });
  };

 return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

      {/* Header */}
      <div className="bg-blue-100 px-6 py-4 flex items-center justify-between border-b border-blue-200">
        <div>
          <p className="text-blue-700 font-bold text-base tracking-wide">Tambah Aktivitas</p>
          <p className="text-blue-500 text-xs">Risiko Aktivitas Pekerjaan</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 hover:bg-blue-200 rounded-full flex items-center justify-center transition">
          <X size={16} className="text-blue-500" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3 max-h-[75vh] overflow-y-auto">

        <div className="flex items-center gap-3">
          <label className="w-44 text-sm text-gray-700 shrink-0">Aktivitas Pekerjaan</label>
          <input type="text" value={form.aktivitasPekerjaan}
            onChange={(e) => update('aktivitasPekerjaan', e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-44 text-sm text-gray-700 shrink-0">Potensi Bahaya</label>
          <input type="text" value={form.potensiBahaya}
            onChange={(e) => update('potensiBahaya', e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>

        <div className="pt-1">
          <p className="text-sm font-medium text-gray-700 mb-3">Tingkat Kemungkinan</p>

          {[
            { label: 'Intensitas', field: 'intensitas', options: INTENSITAS_OPTIONS },
            { label: 'History Kerjadian', field: 'historyKerjadian', options: HISTORY_OPTIONS },
            { label: 'Kapabilitas', field: 'kapabilitas', options: KAPABILITAS_OPTIONS },
          ].map(({ label, field, options }) => (
            <div key={field} className="flex items-center gap-3 mb-3">
              <label className="w-44 text-sm text-gray-700 shrink-0">{label}</label>
              <div className="flex-1 relative">
                <select
                  value={form[field as keyof typeof form]}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 pr-7"
                >
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="w-44 text-sm text-gray-700 shrink-0">Level</label>
            <input type="text" value={form.level} readOnly
              className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 bg-gray-100 cursor-default" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 space-y-3">
          <div className="flex items-center gap-3">
            <label className="w-44 text-sm text-gray-700 shrink-0">Tingkat Keparahan</label>
            <div className="flex-1 relative">
              <select value={form.tingkatKeparahan} onChange={(e) => update('tingkatKeparahan', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 pr-7">
                {KEPARAHAN_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-44 text-sm text-gray-700 shrink-0">Tingkat Resiko</label>
            <input type="text" value={form.tingkatResiko} readOnly
              className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-500 bg-gray-100 cursor-default" />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-44 text-sm text-gray-700 shrink-0">Spesifik Hazard</label>
            <input type="text" value={form.spesifikHazard} onChange={(e) => update('spesifikHazard', e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-44 text-sm text-gray-700 shrink-0 leading-snug">Pengendalian yang sudah ada</label>
            <input type="text" value={form.pengendalian} onChange={(e) => update('pengendalian', e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-md shadow-red-200">
          Batal
        </button>
        <button onClick={() => { onSave(form); onClose(); }}
          className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition shadow-md shadow-green-200">
          Simpan
        </button>
      </div>

    </div>
  </div>
);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DetailJSAPage() {
  const router = useRouter();
  const { program, jsa, addAktivitas } = useProgramStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const [aktivitasList, setAktivitasList] = useState<Aktivitas[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAktivitas, setEditingAktivitas] = useState<Aktivitas | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = (data: Omit<Aktivitas, 'no'>) => {
    setAktivitasList((prev) => [...prev, { no: prev.length + 1, ...data }]);
    addAktivitas(data);
  };

  const handleEdit = (aktivitas: Aktivitas) => {
    setEditingAktivitas(aktivitas);
    setShowModal(true);
  };

  const handleHapus = (no: number) => {
    setAktivitasList((prev) =>
      prev.filter((a) => a.no !== no).map((a, i) => ({ ...a, no: i + 1 }))
    );
  };

  const handleRencanaTindakLanjut = (row: Aktivitas) => {
    const params = new URLSearchParams({
      potensiBahaya: row.potensiBahaya,
      intensitas: row.intensitas,
      history: row.historyKerjadian,
      kapabilitas: row.kapabilitas,
      keparahan: row.tingkatKeparahan,
      aktivitasNo: row.no.toString(),
    });
    router.push(`/dashboard/pemohon/jsa/rencana-tindak-lanjut?${params.toString()}`);
  };

  const handleRequestReview = () => {
    if (aktivitasList.length === 0) {
      alert('Tambahkan minimal satu aktivitas sebelum mengajukan review JSA.');
      return;
    }
    alert('JSA berhasil disubmit ke Pemberi Kerja untuk direview.');
    router.push('/dashboard/pemohon/data-management');
  };

  const handleCopyJSA = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f3f4f6',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res) => { img.onload = () => res(); });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (img.height * pdfWidth) / img.width;

      if (imgHeight > pageHeight) {
        let yOffset = 0;
        while (yOffset < imgHeight) {
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, -yOffset, pdfWidth, imgHeight);
          yOffset += pageHeight;
        }
      } else {
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
      }

      pdf.save(`JSA_${jsa?.jsaNo || 'export'}.pdf`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengexport PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '30px' }}>
          <div className="flex items-center gap-2">
            <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-400 cursor-pointer hover:underline">PROGRAM</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">JSA</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 cursor-pointer hover:underline">DETAIL JSA</span>
        </div>
      </div>

      {/* ─── KONTEN YANG AKAN DI-EXPORT ─── */}
      <div ref={contentRef} className="px-6 py-6 space-y-4">

        {/* ROW 1 */}
        <div className="grid grid-cols-2 gap-4">

          {/* DETAIL DATA PROGRAM */}
          <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
            <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-bold text-sm">DETAIL DATA PROGRAM</span>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              {[
                { label: 'Nama Paket Pekerjaan (Kontrak)', value: program?.namaPaket },
                { label: 'No Kontrak', value: program?.noKontrak },
                { label: 'Tanggal Kontrak', value: program?.tanggalKontrak },
                { label: 'Satuan Kerja (Pemberi Kerja)', value: program?.satKerjaPemberi },
                { label: 'PIC (Pemberi Kerja)', value: program?.picPemberi },
                { label: '(Penanggung Jawab Aset) Satuan Kerja', value: program?.satKerjaPenanggung },
                { label: '(Penanggung Jawab Aset) PIC', value: program?.picPenanggung },
                { label: '(Penanggung Jawab Aset) Pelaksana', value: `${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})` },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="w-52 text-gray-600 shrink-0 font-medium">{item.label}</span>
                  <span className="text-gray-400 shrink-0">:</span>
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
                <span className="w-32 text-gray-600 shrink-0 font-medium">JSA No.</span>
                <span className="text-gray-400 shrink-0">:</span>
                <span className="text-gray-800 flex-1">{jsa?.jsaNo || '-'}</span>
                <button
                  onClick={() => router.push('/dashboard/pemohon/jsa/new')}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded transition">
                  <Pencil size={12} /> Edit
                </button>
              </div>
              {[
                { label: 'Lokasi', value: jsa?.lokasi },
                { label: 'Tanggal', value: jsa?.tanggalJSA },
                { label: 'Nama Pekerjaan', value: jsa?.namaJSA },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="w-32 text-gray-600 shrink-0 font-medium">{item.label}</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800">{item.value || '-'}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="w-32 text-gray-600 shrink-0 font-medium">Lampiran</span>
                <span className="text-gray-400 shrink-0">:</span>
                <div className="flex-1 space-y-2">
                  {jsa?.dokumen?.length ? (
                    jsa.dokumen.map((doc, i) => (
                      <div key={i} className="bg-teal-500 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-teal-600 transition">{doc}</div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada lampiran</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: RISIKO AKTIFITAS */}
        <div className="bg-white rounded border-2 border-blue-300 overflow-hidden">
          <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-sm">RISIKO AKTIFITAS PEKERJAAN</span>
          </div>

          <div className="px-5 py-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition mb-4"
            >
              <Plus size={16} /> Tambah Aktivitas
            </button>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-2 py-2 w-8"></th>
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
                  {aktivitasList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-400 py-10 text-sm">
                        Belum ada aktivitas. Klik "+ Tambah Aktivitas" untuk menambahkan.
                      </td>
                    </tr>
                  ) : (
                    aktivitasList.map((row) => {
                      const high = isHighRisk(row.tingkatResiko);
                      return (
                        <tr
                          key={row.no}
                          className={`border-b border-gray-200 transition-colors ${high ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <td className="px-2 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold ${high ? 'bg-red-400' : 'bg-gray-300'}`}>
                              {high ? '−' : '+'}
                            </span>
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
                              {high && (
                                <button
                                  onClick={() => handleRencanaTindakLanjut(row)}
                                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded transition whitespace-nowrap"
                                >
                                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  Rencana Tindak Lanjut
                                </button>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded transition"
                                >
                                  <Pencil size={10} /> Edit
                                </button>
                                <button
                                  onClick={() => handleHapus(row.no)}
                                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded transition"
                                >
                                  <X size={10} /> Hapus
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 text-gray-400">
              <ChevronLeft size={18} className="cursor-pointer hover:text-gray-600" />
              <ChevronRight size={18} className="cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>

      </div>
      {/* ─── END KONTEN EXPORT ─── */}

      {/* BOTTOM BUTTONS */}
      <div className="flex justify-end gap-2 pb-4 px-6">
        <button
          onClick={handleRequestReview}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded transition shadow-md shadow-green-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Request Review
        </button>
        <button
          onClick={handleCopyJSA}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded transition shadow-md shadow-blue-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {isExporting ? 'Mengexport...' : 'Copy JSA'}
        </button>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded transition shadow-md shadow-red-200">
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <TambahAktivitasModal
          onClose={() => {
            setShowModal(false);
            setEditingAktivitas(null);
          }}
          onSave={handleSave}
          editingData={editingAktivitas || undefined}
        />
      )}

    </div>
  );
}