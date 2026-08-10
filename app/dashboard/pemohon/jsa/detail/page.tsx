'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ChevronLeft, Check } from 'lucide-react';
import { useProgramStore, getOverallStatus } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/* =========================================================================
 * Small "printed form" building blocks
 * These mimic the layout language of the physical SIKA form (label : value
 * rows, checkbox lists, D/D/M/M/Y/Y date boxes, colored side rails) instead
 * of the previous card/pill web style.
 * ======================================================================= */

// "Label : value" line, the basic unit of the printed form.
function FormField({
  label,
  value,
  labelWidth = 'w-40',
}: {
  label: string;
  value?: string;
  labelWidth?: string;
}) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className={`${labelWidth} shrink-0 text-gray-700`}>{label}</span>
      <span className="text-gray-400">:</span>
      <span className="flex-1 font-medium text-gray-900 wrap-break-word">{value || '-'}</span>
    </div>
  );
}

// Renders selected values as checked boxes — for genuinely open-ended data
// (PIC names, worker names) where there is no fixed master list to compare
// against, so only the values actually entered are shown.
function CheckList({ items, columns = 2 }: { items?: string[]; columns?: number }) {
  if (!items?.length) return <span className="text-gray-400 text-xs italic">Belum dipilih</span>;
  return (
    <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5 text-[11px]">
          <span className="w-3.5 h-3.5 mt-0.5 border border-gray-800 bg-blue-600 flex items-center justify-center shrink-0">
            <Check size={10} className="text-white" strokeWidth={3} />
          </span>
          <span className="text-gray-800">{item}</span>
        </div>
      ))}
    </div>
  );
}

// Renders EVERY master-list option (checked or not) — the way the physical
// SIKA form prints the full checklist and marks whichever ones apply.
// `selected` marks which of `options` were actually checked in the SIKA/JSA
// input forms; unselected options still print, just visually muted.
function FullCheckList({ options, selected, columns = 2 }: { options: string[]; selected?: string[]; columns?: number }) {
  return (
    <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => {
        const checked = !!selected?.includes(opt);
        return (
          <div key={opt} className="flex items-start gap-1.5 text-[11px]">
            <span
              className={`w-3.5 h-3.5 mt-0.5 border flex items-center justify-center shrink-0 ${
                checked ? 'border-gray-800 bg-blue-600' : 'border-gray-400 bg-white'
              }`}
            >
              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
            </span>
            <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-400'}>{opt}</span>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
 * Master option lists — copied verbatim from the "Pengisian SIKA"
 * (sika/new) and "Pengisian JSA" (jsa/new) input pages, so the printed
 * detail page shows the exact same full checklist those forms use, with
 * whatever the applicant actually checked marked on top of it.
 * ======================================================================= */

const ISOLASI_OPTIONS = [
  'Electrical Circuits', 'Gas Valve', 'Water Valves',
  'Air Instrument Valves', 'Mekanik', 'Pneumatic/Hydraulic',
];

const LAMPIRAN_OPTIONS = [
  'JSA', 'TKO, TKI, TKPA', 'P&ID, Underground Maps',
  'Koordinator PLN', 'Koordinator Telcom', 'Koordinator PDAM',
  'Koordinator BPJN', 'BA Sosialisasi', 'Perizinan Lahan',
];

const IDENTIFIKASI_OPTIONS = [
  'Gas Lemas, mudah terbakar/beracun', 'Kekurangan Oksigen',
  'Nyala Api/Kebakaran/Ledakan', 'Bising',
  'Bahan berbahaya dan beracun', 'Peralatan jalan/listrik hidup/tersengat',
  'Mesin bergetar/berputar',
  'Cairan/gas bertekanan', 'Longsoran',
  'Benda bergerak/mesin yang berputar', 'Pengangkatan benda berat',
  'Kerja di ketinggian', 'Radiasi radioaktif', 'Kontaminasi tanah',
  'Temperatur ekstrim (dingin/panas)', 'Pengangkatan manual/alat angkat',
  'Ruang terbatas/kekurangan oksigen', 'Bahaya pencemaran lingkungan',
  'Faktor ergonomis', 'Paparan debu', 'Dampak visual',
  'Biohazard', 'Iritasi mata/kulit', 'Gangguan pernapasan',
  'Faktor fisik/biologis', 'Gangguan keamanan', 'Pencurian',
];

const PENGENDALIAN_OPTIONS = [
  'HSE Plan', 'Topi/Sepatu/Coverall keselamatan',
  'Kacamata keselamatan yang sesuai', 'Pelindung telinga yang sesuai',
  'Sarung tangan keselamatan', 'Harness/tali pengaman',
  'Masker debu/gas', 'Masker kimia', 'Tali pembatas daerah', 'Absoren',
  'Peralatan disolasi/dilepas', 'Pengetesan gas sebelum mulai kerja (LEL, O2, Toxic)',
  'Tanda Keselamatan', 'Tambahan lampu penerangan',
  'Scaffolding/perancah/tangga', 'Pos Pemeriksaan (barang dan data pribadi)',
  'Pengetesan HC gas secara teratur', 'Alat anti percikan api (Anti Sparks Tool)',
  'Tanda peringatan/rintangan', 'Peralatan tanpa tekanan',
  'Peralatan dikosongkan/dibersihkan(flushing)', 'Tempat kerja di-ventilasi',
  'PPE sand blasting', 'Alat bantu pernapasan udara tekan',
  'Tirai pelindung semprotan pasir', 'PPE bahan kimia',
  'Alat penampung cairan B3', 'Lapor kepada petugas keamanan',
  'Lapisan penahan percikan las', 'Tirai pelindung percikan las',
  'Tirai air di perlukan', 'Peralatan di-purging dengan N₂',
  'Bebas dari endapan yang eksplosif/toxic',
  'Didinginkan secara mekanis',
  'Memenuhi persyaratan sertifikat kerja',
];

const SERTIFIKAT_OPTIONS = [
  'Sertifikat Kerja Panas (SKP)',
  'Sertifikat Kerja Dingin (SKD)',
  'Sertifikat Kerja Ruang Terbatas (SKRT)',
  'Sertifikat Kerja Radiografi (SKR)',
  'Sertifikat Kerja Isolasi Listrik (SKL)',
  'Sertifikat Kerja Penggalian (SKG)',
  'Sertifikat Kerja Pengangkatan (SKA)',
  'Sertifikat Kerja Di Ketinggian (SKK)',
  'Sertifikat Kerja Pengambilan Fotografi (SKPF)',
];

const SIFAT_OPTIONS = ['Normal', 'Proyek', 'T/A', 'Emergency'];

const PPE_OPTIONS = [
  'Safety Helmet', 'Goggles / Face Shield', 'Leather / Chemical Gloves', 'Safety Sign',
  'Safety Shoes', 'Earplug / Earmuff', 'Safety Harness / Lifelines', 'SIKA',
  'Safety Glasses', 'Dust / Welding Mask', 'Life Vest', 'Radio Communication',
  'Coveralls', 'Catridge / Filter Mask', 'Fire Extinguisher', 'Others :',
];

// Six-box D D / M M / Y Y date entry, matching the physical SIKA form.
function DateBoxes({ digits }: { digits?: string[] }) {
  const cells = digits && digits.length === 6 ? digits : Array(6).fill('');
  const labels = ['D', 'D', 'M', 'M', 'Y', 'Y'];
  return (
    <div className="flex gap-0.5">
      {cells.map((d, i) => (
        <div key={i} className={`flex flex-col items-center ${i === 1 || i === 3 ? 'mr-1' : ''}`}>
          <span className="text-[8px] text-gray-400 leading-none mb-0.5">{labels[i]}</span>
          <div className="w-4 h-5 border border-gray-800 flex items-center justify-center text-[11px] font-semibold bg-white">
            {d || ''}
          </div>
        </div>
      ))}
    </div>
  );
}

// Vertical colored sidebar label running top-to-bottom, e.g. "PERMINTAAN".
function SectionRail({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ width: 26, background: color }}>
      <span
        className="text-white text-[11px] font-bold tracking-widest"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {text}
      </span>
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-blue-50 border-y border-gray-300 px-4 py-2.5">
      <span className="text-[12px] font-bold text-blue-900 tracking-wide">{title}</span>
      {right}
    </div>
  );
}

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-blue-700 text-[11px] font-semibold hover:underline"
    >
      <Pencil size={10} /> Edit
    </button>
  );
}

// Turns the 6-digit [D,D,M,M,Y,Y] arrays used in the SIKA form back into a
// readable "DD/MM/20YY" string when needed as plain text.
function formatDigitDate(digits?: string[]): string {
  if (!digits || digits.length !== 6 || digits.some((d) => !d)) return '-';
  const [d1, d2, m1, m2, y1, y2] = digits;
  return `${d1}${d2}/${m1}${m2}/20${y1}${y2}`;
}

const getRiskBadgeStyle = (value: string) => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return { bg: '#f1f5f9', text: '#94a3b8' };
  if (v.includes('tinggi') || v.includes('high')) return { bg: '#fef2f2', text: '#b91c1c' };
  if (v.includes('sedang') || v.includes('medium') || v.includes('med')) return { bg: '#fefce8', text: '#a16207' };
  if (v.includes('rendah') || v.includes('low')) return { bg: '#f0fdf4', text: '#15803d' };
  return { bg: '#f1f5f9', text: '#64748b' };
};

export default function DetailProgramPage() {
  const router = useRouter();
  const {
    program, jsa, sika,
    setJsaStatus, submitToPemberi,
    sikaStatusPemberi, jsaStatusPemberi,
    sikaStatusPJA, jsaStatusPJA,
    activeSubmissionId, catatRevalidasi,
    submissions, ajukanPerubahanRevalidasi,
  } = useProgramStore();
  const { user } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [catatanRevalidasi, setCatatanRevalidasi] = useState('');

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
    else if (!sika) router.replace('/dashboard/pemohon/sika/new');
    else if (!jsa) router.replace('/dashboard/pemohon/jsa/new');
  }, [program, sika, jsa]);

  const alreadySubmitted = sikaStatusPemberi !== 'draft' || jsaStatusPemberi !== 'draft';

  // Status gabungan submission yang sedang dibuka. Kalau ini sudah pernah
  // 'aktif' (disetujui Pemberi) atau 'closed' (disetujui Pemberi + PJA) dan
  // pemohon kembali ke halaman ini — biasanya karena masuk lewat "Perlu
  // menambah sertifikat, pekerja baru, atau perubahan lain?" di modal
  // Revalidasi (Data Management) — maka yang relevan bukan "Request Review"
  // (itu untuk pengajuan yang belum pernah disetujui), melainkan mengirim
  // ulang data yang sudah diperbarui sebagai konfirmasi revalidasi.
  const overallStatus = getOverallStatus(sikaStatusPemberi, jsaStatusPemberi, sikaStatusPJA, jsaStatusPJA);
  const isRevalidasiUpdate = overallStatus === 'aktif' || overallStatus === 'closed';

  // Submission yang sedang aktif dibuka, buat cek apakah perubahan yang
  // barusan dikirim masih menunggu keputusan Pemberi (mencegah double-submit
  // & kasih label yang jelas di tombol).
  const activeSubmission = submissions.find((s) => s.id === activeSubmissionId);
  const perubahanMenunggu = activeSubmission?.perubahanStatus === 'menunggu';

  const handleRequestReview = () => {
    const hasLangkah = jsa?.sections?.some((sec) =>
      sec.rows.some((row) => row.langkah.trim() !== '')
    );
    if (!hasLangkah) {
      alert('Lengkapi form JSA (langkah kerja) terlebih dahulu sebelum mengajukan review.');
      return;
    }
    setJsaStatus('request_review');
    submitToPemberi(user?.name || 'Pemohon');
    alert('SIKA dan JSA berhasil diajukan ke Pemberi Kerja untuk direview.');
    router.push('/dashboard/pemohon/data-management');
  };

  // Kirim ulang data yang sudah diperbarui (sertifikat/pekerja baru/dll) ke
  // Pemberi Kerja sebagai konfirmasi revalidasi — bukan pengajuan baru dari
  // nol. Sengaja memakai ajukanPerubahanRevalidasi (bukan submitToPemberi):
  // itu hanya mengubah `perubahanStatus`, tidak menyentuh sikaStatusPemberi/
  // jsaStatusPemberi, jadi SIKA yang sedang berjalan TETAP berstatus
  // 'aktif'/'closed' selama menunggu Pemberi meninjau perubahan ini —
  // bukan balik jadi "Belum berlaku" di Data Management.
  const handleKirimRevalidasi = () => {
    const hasLangkah = jsa?.sections?.some((sec) =>
      sec.rows.some((row) => row.langkah.trim() !== '')
    );
    if (!hasLangkah) {
      alert('Lengkapi form JSA (langkah kerja) terlebih dahulu sebelum mengirim konfirmasi revalidasi.');
      return;
    }
    if (!activeSubmissionId) return;
    ajukanPerubahanRevalidasi(user?.name || 'Pemohon', catatanRevalidasi.trim() || undefined);
    catatRevalidasi(activeSubmissionId, new Date().toISOString().split('T')[0]);
    setCatatanRevalidasi('');
    alert('Konfirmasi revalidasi & perubahan data berhasil dikirim ke Pemberi Kerja untuk direview.');
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

  const hasLangkahKerja = jsa?.sections?.some((sec) => sec.rows.some((r) => r.langkah.trim() !== ''));

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Detail Program</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Surat Izin Kerja (SIKA) &amp; Job Safety Analysis (JSA)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0">
            {[
              { label: 'Program', active: false },
              { label: 'Pengisian SIKA', active: false },
              { label: 'Pengisian JSA', active: false },
              { label: 'Detail Program', active: true },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2 px-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-medium ${step.active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-2" style={{ paddingRight: '1px' }}>
            <img
              src="/logopertaminagasfull.svg"
              alt="Pertamina Gas"
              className="h-8 object-contain"
            />
          </div>
        </div>
      </div>

      <div ref={contentRef} className="bg-gray-100">
        {/* ================= DOCUMENT BODY (didesain ulang seperti form cetak) ================= */}
        <div className="px-4 sm:px-8 lg:px-14 xl:px-20 py-8">
          <div
            className="mx-auto w-full bg-white border-2 border-gray-900 text-[13px] text-gray-800 shadow-[0_4px_28px_rgba(15,23,42,0.10)]"
            style={{ maxWidth: '1680px' }}
          >
            {/* ---- Judul dokumen: Nomor SIKA | Judul | Logo ---- */}
            <div className="grid grid-cols-[300px_1fr_260px] border-b-2 border-gray-900">
              <div className="border-r-2 border-gray-900 p-4">
                <span className="font-bold text-[13px]">Nomor SIKA :</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="border border-gray-500 bg-gray-50 px-2.5 py-1.5 text-[11px] text-center flex-1 truncate">
                    {sika?.noSikaAreaFungsi || '-'}
                  </div>
                  <span className="text-[11px]">-</span>
                  <div className="border border-gray-500 bg-gray-50 px-2.5 py-1.5 text-[11px] text-center flex-1 truncate">
                    {sika?.noSikaNomorUrut || '-'}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                  <span className="shrink-0 text-gray-600">Lanjutan dari SIKA No</span>
                  <span className="border-b border-gray-400 flex-1 text-center font-medium">
                    {sika?.lanjutanDariSika || ''}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-3">
                <h1 className="font-bold text-xl tracking-wide text-center">SURAT IZIN KERJA AMAN</h1>
                <span className="text-sm font-bold tracking-widest mt-0.5">( SIKA )</span>
              </div>
              <div className="flex items-center justify-center p-3">
                <img src="/logopertaminagasfull.svg" alt="Pertamina Gas" className="h-10 object-contain" />
              </div>
            </div>

            {/* ---- Bagian 1: tanggal terbit / jam kerja / berlaku hingga ---- */}
            <div className="flex items-center gap-8 flex-wrap border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
              <span className="font-bold text-[12px]">BAGIAN 1 - TANGGAL TERBIT</span>
              <DateBoxes digits={sika?.tanggalTerbit} />
              <span className="font-bold text-[12px] ml-2">JAM KERJA</span>
              <span className="text-[12px]">{sika?.jamKerjaMulai || '-'} s/d {sika?.jamKerjaSelesai || '-'}</span>
              <span className="font-bold text-[12px] ml-2">W.I</span>
              <span className="text-[12px]">{sika?.waktuIsolasi || '-'}</span>
              <span className="font-bold text-[12px] ml-auto">BERLAKU HINGGA</span>
              <DateBoxes digits={sika?.berlakuHingga} />
            </div>

            {/* ---- Body utama: kolom kiri (rail berwarna) + kolom kanan (formulir) ---- */}
            <div className="grid grid-cols-[1fr_320px]">
              {/* ===================== KOLOM KIRI ===================== */}
              <div className="border-r-2 border-gray-900">

                {/* --- Rail: PROGRAM --- */}
                <div className="flex">
                  <SectionRail color="#334155" text="PROGRAM" />
                  <div className="flex-1">
                    <SectionHeader
                      title="DATA PROGRAM / KONTRAK"
                      right={<EditLink onClick={() => router.push('/dashboard/pemohon/program/new')} />}
                    />
                    <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                      <FormField label="Lokasi Kerja" value={program?.lokasiKerja} labelWidth="w-52" />
                      <FormField label="Nama Paket Pekerjaan" value={program?.namaPaket} labelWidth="w-52" />
                      <FormField label="No Kontrak" value={program?.noKontrak} labelWidth="w-52" />
                      <FormField label="Tanggal Kontrak" value={program?.tanggalKontrak} labelWidth="w-52" />
                      <FormField label="Fungsi (Penanggung Jawab Pekerjaan)" value={program?.satKerjaPemberi} labelWidth="w-52" />
                      <FormField label="Fungsi (Penanggung Jawab Aset)" value={program?.satKerjaPenanggung} labelWidth="w-52" />
                      <FormField label="Fungsi IA (Issuing Authority)" value={program?.fungsiIA} labelWidth="w-52" />
                      <FormField
                        label="Pelaksana (Penanggung Jawab Aset)"
                        value={`${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})`}
                        labelWidth="w-52"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-6 px-4 pb-4">
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">PA / PIC (Pemberi Kerja)</span>
                        <CheckList items={program?.picPemberiList?.filter(Boolean)} columns={1} />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">Pimpinan Pelaksana (PPA)</span>
                        <CheckList items={program?.pimpinanPelaksanaList?.filter(Boolean)} columns={1} />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">PIC IA (Penanggung Jawab Aset)</span>
                        <CheckList items={program?.picPenanggungList?.filter(Boolean)} columns={1} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Rail: PERMINTAAN (Bagian 2 - Jenis Pekerjaan) --- */}
                <div className="flex border-t-2 border-gray-900">
                  <SectionRail color="#2563eb" text="PERMINTAAN" />
                  <div className="flex-1">
                    <SectionHeader
                      title="BAGIAN 2 - JENIS PEKERJAAN"
                      right={<span className="text-[10px] text-red-600 font-semibold">Diisi oleh Pelaksana Pekerjaan (PA)</span>}
                    />
                    <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                      <FormField label="Fungsi / Perusahaan" value={sika?.fungsiPerusahaan} />
                      <FormField label="Lokasi / Instalasi" value={sika?.lokasiInstalasi} />
                      <FormField label="Peralatan / No. Identitas" value={sika?.peralatanNoIdentitas} />
                      <FormField label="Jumlah Pekerja" value={`${sika?.pekerjaList?.length || 0} orang`} />
                    </div>
                    <div className="px-4 pb-3">
                      <FormField label="Uraian Pekerjaan" value={sika?.uraianPekerjaan} />
                      <FormField label="Peralatan yang digunakan" value={sika?.peralatanDigunakan} />
                    </div>
                    {!!sika?.pekerjaList?.length && (
                      <div className="px-4 pb-4">
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">Nama Pekerja</span>
                        <CheckList items={sika.pekerjaList} columns={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Rail: PERSIAPAN (Bagian 3 - Pemeriksaan) --- */}
                <div className="flex border-t-2 border-gray-900">
                  <SectionRail color="#ca8a04" text="PERSIAPAN" />
                  <div className="flex-1">
                    <SectionHeader
                      title="BAGIAN 3 - PEMERIKSAAN"
                      right={
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sika?.diisiPA ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {sika?.diisiPA ? '✓' : '—'} Diisi PA
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sika?.diperiksaIA ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {sika?.diperiksaIA ? '✓' : '—'} Diperiksa IA
                          </span>
                        </div>
                      }
                    />
                    <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-4">
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">Isolasi Peralatan</span>
                        <FullCheckList options={ISOLASI_OPTIONS} selected={sika?.isolasi} columns={2} />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-600 mb-1">Lampiran (Mandatory)</span>
                        <FullCheckList options={LAMPIRAN_OPTIONS} selected={sika?.lampiran} columns={3} />
                      </div>
                    </div>
                    <div className="px-4 pb-3">
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Identifikasi Bahaya</span>
                      <FullCheckList options={IDENTIFIKASI_OPTIONS} selected={sika?.identifikasi} columns={4} />
                      {sika?.identifikasiTambahan && (
                        <div className="mt-1.5"><FormField label="Identifikasi Tambahan" value={sika.identifikasiTambahan} /></div>
                      )}
                    </div>
                    <div className="px-4 pb-4">
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Pengendalian Bahaya</span>
                      <FullCheckList options={PENGENDALIAN_OPTIONS} selected={sika?.pengendalian} columns={3} />
                      {sika?.permintaanTambahan && (
                        <div className="mt-1.5"><FormField label="Permintaan Tambahan" value={sika.permintaanTambahan} /></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- Rail: PELAKSANAAN (Bagian 4 - JSA) --- */}
                <div className="flex border-t-2 border-gray-900">
                  <SectionRail color="#16a34a" text="PELAKSANAAN" />
                  <div className="flex-1">
                    <SectionHeader
                      title="BAGIAN 4 - JOB SAFETY ANALYSIS (JSA)"
                      right={<EditLink onClick={() => router.push('/dashboard/pemohon/jsa/new')} />}
                    />
                    <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                      <FormField label="No. SIKA" value={jsa?.jsaNo} />
                      <FormField label="Judul Pekerjaan" value={jsa?.judulPekerjaan} />
                      <FormField label="Tanggal" value={jsa?.tanggalJSA} />
                      <FormField label="Lokasi" value={jsa?.lokasi} />
                      <FormField label="Halaman" value={jsa?.halaman ? `${jsa.halaman} dari ${jsa.totalHalaman}` : undefined} />
                      <FormField label="Status" value={jsa?.status === 'revisi' ? 'Revisi' : jsa?.status === 'baru' ? 'Baru' : undefined} />
                    </div>

                    <div className="px-4 pb-4">
                      <span className="block text-[11px] font-semibold text-blue-900 uppercase mb-1.5">Langkah Kerja</span>
                      {hasLangkahKerja ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-gray-400 px-1 py-1 w-6">No</th>
                                <th className="border border-gray-400 px-2 py-1 text-left">Langkah Pekerjaan</th>
                                <th className="border border-gray-400 px-2 py-1 text-left">Peralatan/Material</th>
                                <th className="border border-gray-400 px-2 py-1 text-left">Potensi Bahaya</th>
                                <th className="border border-gray-400 px-2 py-1">Tingkat Risiko</th>
                                <th className="border border-gray-400 px-2 py-1 text-left">Mitigasi</th>
                                <th className="border border-gray-400 px-2 py-1 text-left">Penanggungjawab</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jsa?.sections?.map((sec) => (
                                <Fragment key={sec.key}>
                                  <tr className="bg-blue-100">
                                    <td className="border border-gray-400 px-1 py-1 text-center font-bold">{sec.key}</td>
                                    <td colSpan={6} className="border border-gray-400 px-2 py-1 font-bold uppercase">{sec.label}</td>
                                  </tr>
                                  {sec.rows
                                    .filter((r) => r.langkah.trim() !== '' || r.potensiBahaya.trim() !== '')
                                    .map((row, i) => {
                                      const risk = getRiskBadgeStyle(row.tingkatRisiko);
                                      return (
                                        <tr key={row.id}>
                                          <td className="border border-gray-400 px-1 py-1 text-center text-gray-400">{i + 1}</td>
                                          <td className="border border-gray-400 px-2 py-1">{row.langkah || '-'}</td>
                                          <td className="border border-gray-400 px-2 py-1">{row.peralatan || '-'}</td>
                                          <td className="border border-gray-400 px-2 py-1">{row.potensiBahaya || '-'}</td>
                                          <td className="border border-gray-400 px-2 py-1 text-center">
                                            <span
                                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                              style={{ background: risk.bg, color: risk.text }}
                                            >
                                              {row.tingkatRisiko || '-'}
                                            </span>
                                          </td>
                                          <td className="border border-gray-400 px-2 py-1">{row.mitigasi || '-'}</td>
                                          <td className="border border-gray-400 px-2 py-1">{row.penanggungjawab || '-'}</td>
                                        </tr>
                                      );
                                    })}
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Belum diisi</span>
                      )}
                    </div>

                    <div className="px-4 pb-4 pt-3 border-t border-dashed border-gray-300">
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Peralatan Pelindung (APD) Digunakan</span>
                      <FullCheckList options={PPE_OPTIONS} selected={jsa?.checkedPPE} columns={4} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================== KOLOM KANAN: FORMULIR SIKA ===================== */}
              <div className="bg-sky-50 flex flex-col">
                <div className="bg-sky-500 text-white text-center font-bold text-sm py-2 tracking-wide">
                  FORMULIR SIKA
                </div>

                <div className="p-4">
                  <FullCheckList options={SERTIFIKAT_OPTIONS} selected={sika?.sertifikat} columns={1} />

                  <span className="block text-[11px] font-bold underline mt-4 mb-2">Sifat Pekerjaan</span>
                  <div className="space-y-1">
                    {SIFAT_OPTIONS.map((sifat) => {
                      const active = sika?.sifatPekerjaan === sifat;
                      return (
                        <div key={sifat} className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              active ? 'bg-blue-600 border-blue-600' : 'border-gray-500 bg-white'
                            }`}
                          >
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className={sifat === 'Emergency' ? 'text-red-600 font-semibold' : 'text-gray-800'}>
                            {sifat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Catatan opsional untuk Pemberi Kerja, khusus alur revalidasi-dengan-perubahan */}
      {isRevalidasiUpdate && !perubahanMenunggu && (
        <div className="px-6 pb-3 bg-gray-100 flex justify-end">
          <div className="w-full max-w-md">
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">
              Catatan untuk Pemberi Kerja (opsional)
            </label>
            <textarea
              value={catatanRevalidasi}
              onChange={(e) => setCatatanRevalidasi(e.target.value)}
              rows={2}
              placeholder="Jelaskan perubahan yang diajukan, mis. penambahan sertifikat/pekerja baru..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none bg-white"
            />
          </div>
        </div>
      )}

      {/* ================= ACTION BUTTONS (tidak diubah) ================= */}
      <div className="flex justify-end gap-2 pb-4 px-6 bg-gray-100">
        {isRevalidasiUpdate ? (
          <button
            onClick={handleKirimRevalidasi}
            disabled={perubahanMenunggu}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md shadow-green-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {perubahanMenunggu ? 'Menunggu Persetujuan Pemberi' : 'Kirim Konfirmasi Revalidasi'}
          </button>
        ) : (
          <button
            onClick={handleRequestReview}
            disabled={alreadySubmitted}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md shadow-green-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {alreadySubmitted ? 'Sudah Diajukan' : 'Request Review'}
          </button>
        )}
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