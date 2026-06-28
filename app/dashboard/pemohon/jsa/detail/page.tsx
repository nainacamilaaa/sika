'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ChevronLeft } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

function ChipGroup({ label, items }: { label: string; items?: string[] }) {
  return (
    <div>
      <span className="text-gray-600 font-medium block mb-1.5">{label}</span>
      {items?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Belum dipilih</span>
      )}
    </div>
  );
}

export default function DetailProgramPage() {
  const router = useRouter();
  const { program, jsa, sika, setJsaStatus } = useProgramStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
    else if (!sika) router.replace('/dashboard/pemohon/sika/new');
    else if (!jsa) router.replace('/dashboard/pemohon/jsa/new');
  }, [program, sika, jsa]);

  const handleRequestReview = () => {
    const hasLangkah = jsa?.sections?.some((sec) =>
      sec.rows.some((row) => row.langkah.trim() !== '')
    );
    if (!hasLangkah) {
      alert('Lengkapi form JSA (langkah kerja) terlebih dahulu sebelum mengajukan review.');
      return;
    }
    setJsaStatus('request_review');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div ref={contentRef} className="bg-gray-100">

        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
            <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-gray-800">Detail Program</span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Surat Izin Kerja (SIKA) &amp; Job Safety Analysis (JSA)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0">
            {[
              { label: 'Program', active: false },
              { label: 'Pengisian SIKA', active: false },
              { label: 'Pengisian JSA', active: false },
              { label: 'Detail Program', active: true },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2 px-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-medium ${step.active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="w-8 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
                <div>
                  <span className="text-white font-bold text-sm tracking-wide">DETAIL DATA PROGRAM</span>
                  <p className="text-blue-200 text-[10px] mt-0.5">Informasi paket pekerjaan</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/pemohon/program/new')}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {[
                  { label: 'Nama Paket Pekerjaan (Kontrak)', value: program?.namaPaket },
                  { label: 'No Kontrak', value: program?.noKontrak },
                  { label: 'Tanggal Kontrak', value: program?.tanggalKontrak },
                  { label: 'Satuan Kerja (Pemberi Kerja)', value: program?.satKerjaPemberi },
                  { label: 'PIC (Pemberi Kerja)', value: program?.picPemberiList?.[0] },
                  { label: '(Penanggung Jawab Aset) Satuan Kerja', value: program?.satKerjaPenanggung },
                  { label: '(Penanggung Jawab Aset) PIC', value: program?.picPenanggungList?.[0] },
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

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
                <div>
                  <span className="text-white font-bold text-sm tracking-wide">JOB SAFETY ANALYSIS</span>
                  <p className="text-blue-200 text-[10px] mt-0.5">Informasi JSA pekerjaan</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/pemohon/jsa/new')}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {[
                  { label: 'No. SIKA', value: jsa?.jsaNo },
                  { label: 'Judul Pekerjaan', value: jsa?.judulPekerjaan },
                  { label: 'Tanggal', value: jsa?.tanggalJSA },
                  { label: 'Lokasi', value: jsa?.lokasi },
                  { label: 'Halaman', value: jsa?.halaman ? `${jsa.halaman} dari ${jsa.totalHalaman}` : undefined },
                  { label: 'Status', value: jsa?.status === 'revisi' ? 'Revisi' : jsa?.status === 'baru' ? 'Baru' : undefined },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="w-32 text-gray-600 shrink-0 font-medium">{item.label}</span>
                    <span className="text-gray-400 shrink-0">:</span>
                    <span className="text-gray-800">{item.value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
                <div>
                  <span className="text-white font-bold text-sm tracking-wide">SIKA - JENIS PEKERJAAN</span>
                  <p className="text-blue-200 text-[10px] mt-0.5">Informasi pekerjaan &amp; pekerja</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/pemohon/sika/new')}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {[
                  { label: 'Fungsi / Perusahaan', value: sika?.fungsiPerusahaan },
                  { label: 'Lokasi / Instalasi', value: sika?.lokasiInstalasi },
                  { label: 'Peralatan / No. Identitas', value: sika?.peralatanNoIdentitas },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="w-44 text-gray-600 shrink-0 font-medium">{item.label}</span>
                    <span className="text-gray-400 shrink-0">:</span>
                    <span className="text-gray-800">{item.value || '-'}</span>
                  </div>
                ))}
                <div className="flex gap-3">
                  <span className="w-44 text-gray-600 shrink-0 font-medium">Uraian Pekerjaan</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 flex-1">{sika?.uraianPekerjaan || '-'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-44 text-gray-600 shrink-0 font-medium">Peralatan Digunakan</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 flex-1">{sika?.peralatanDigunakan || '-'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="w-44 text-gray-600 shrink-0 font-medium">Jumlah Pekerja</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800">{sika?.pekerjaList?.length || 0} orang</span>
                </div>
                {!!sika?.pekerjaList?.length && (
                  <div className="flex gap-3">
                    <span className="w-44 text-gray-600 shrink-0 font-medium">Nama Pekerja</span>
                    <span className="text-gray-400 shrink-0">:</span>
                    <div className="flex-1 flex flex-wrap gap-1.5">
                      {sika.pekerjaList.map((p, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
                <div>
                  <span className="text-white font-bold text-sm tracking-wide">PEMERIKSAAN SIKA</span>
                  <p className="text-blue-200 text-[10px] mt-0.5">Isolasi, identifikasi &amp; pengendalian bahaya</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/pemohon/sika/pemeriksaan')}
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full transition"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="px-5 py-4 space-y-4 text-sm max-h-105 overflow-y-auto">
                <ChipGroup label="Isolasi Peralatan" items={sika?.isolasi} />
                <ChipGroup label="Lampiran" items={sika?.lampiran} />
                <ChipGroup label="Identifikasi Bahaya" items={sika?.identifikasi} />
                {sika?.identifikasiTambahan && (
                  <div className="flex gap-3">
                    <span className="w-36 text-gray-600 shrink-0 font-medium">Identifikasi Tambahan</span>
                    <span className="text-gray-400 shrink-0">:</span>
                    <span className="text-gray-800">{sika.identifikasiTambahan}</span>
                  </div>
                )}
                <ChipGroup label="Pengendalian Bahaya" items={sika?.pengendalian} />
                {sika?.permintaanTambahan && (
                  <div className="flex gap-3">
                    <span className="w-36 text-gray-600 shrink-0 font-medium">Permintaan Tambahan</span>
                    <span className="text-gray-400 shrink-0">:</span>
                    <span className="text-gray-800">{sika.permintaanTambahan}</span>
                  </div>
                )}
                <ChipGroup label="Sertifikat Dipilih" items={sika?.sertifikat} />
                <div className="flex items-center gap-3">
                  <span className="w-36 text-gray-600 shrink-0 font-medium">Sifat Pekerjaan</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  {sika?.sifatPekerjaan ? (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      sika.sifatPekerjaan === 'Emergency'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {sika.sifatPekerjaan}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-2 pb-4 px-6 bg-gray-100">
        <button
          onClick={handleRequestReview}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md shadow-green-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Request Review
        </button>
        <button
          onClick={handleCopyJSA}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md shadow-blue-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {isExporting ? 'Mengexport...' : 'Copy JSA'}
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md shadow-red-200"
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>
    </div>
  );
}