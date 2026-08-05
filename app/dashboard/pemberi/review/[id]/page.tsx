'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, FileText, History, Check } from 'lucide-react';
import { useProgramStore, getNomorSika } from '@/store/programStore';
import type { ApprovalStatus, ApprovalLogEntry, PerubahanStatus } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';

/* =========================================================================
 * Printed-form building blocks — sama persis dengan yang dipakai di halaman
 * Detail Program milik Pemohon, supaya bentuk dokumennya konsisten. Bagian
 * approval (setuju/tolak SIKA & JSA) tetap fungsi khusus Pemberi Kerja.
 * ======================================================================= */

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

const getRiskBadgeStyle = (value: string) => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return { bg: '#f1f5f9', text: '#94a3b8' };
  if (v.includes('tinggi') || v.includes('high')) return { bg: '#fef2f2', text: '#b91c1c' };
  if (v.includes('sedang') || v.includes('medium') || v.includes('med')) return { bg: '#fefce8', text: '#a16207' };
  if (v.includes('rendah') || v.includes('low')) return { bg: '#f0fdf4', text: '#15803d' };
  return { bg: '#f1f5f9', text: '#64748b' };
};

/* =========================================================================
 * PROSES APPROVAL — gaya "dashboard" (kartu rounded-xl pastel, pill badge)
 * seperti versi lama. Perubahan Data (Revalidasi) mengikuti bahasa visual
 * yang sama supaya konsisten dengan kartu SIKA & JSA di sampingnya.
 * ======================================================================= */

const statusIcon = (status: string) => {
  if (status === 'approved' || status === 'disetujui') return <CheckCircle size={16} className="text-green-500" />;
  if (status === 'rejected') return <XCircle size={16} className="text-red-500" />;
  return <Clock size={16} className="text-yellow-500" />;
};

const statusLabel: Record<string, string> = {
  draft: 'Belum Direview',
  request: 'Perlu Direview',
  waiting: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  menunggu: 'Menunggu Review',
  disetujui: 'Disetujui',
  // Bukan "Ditolak" — perubahan dikembalikan ke pemohon untuk dilengkapi
  // lagi, bukan ditutup permanen. Lihat programStore.ts: PerubahanStatus.
  revisi: 'Perlu Revisi',
};

/* ========================================================================= */

type ModalType =
  | 'approve-sika' | 'reject-sika'
  | 'approve-jsa' | 'reject-jsa'
  | 'approve-perubahan' | 'reject-perubahan'
  | null;

export default function PemberiReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuthStore();
  const {
    submissions,
    approveSikaPemberi, rejectSikaPemberi,
    approveJsaPemberi, rejectJsaPemberi,
    approvePerubahanRevalidasi, mintaRevisiPerubahan,
    approvalHistory,
  } = useProgramStore();

  // Cari submission berdasarkan id dari URL — bukan lagi hardcoded 'store-1'.
  // Setiap pengajuan yang sudah di-"Request Review" pemohon punya id sendiri
  // di submissions[] (lihat programStore.ts), jadi halaman ini sekarang bisa
  // dipakai untuk mereview pengajuan MANAPUN, bukan cuma satu.
  const record = submissions.find((s) => s.id === id);

  useEffect(() => {
    if (!record) {
      router.replace('/dashboard/pemberi/data-management');
    }
  }, [record, router]);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [alasan, setAlasan] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  if (!record) return null;

  const { program, sika, jsa } = record;
  const {
    sikaStatusPemberi, jsaStatusPemberi,
    alasanTolakSikaPemberi, alasanTolakJsaPemberi,
    perubahanStatus, catatanPerubahan, catatanRevisiPerubahan,
  } = record;

  const sikaApproved = sikaStatusPemberi === 'approved';
  const sikaRejected = sikaStatusPemberi === 'rejected';
  const jsaApproved = jsaStatusPemberi === 'approved';
  const jsaRejected = jsaStatusPemberi === 'rejected';
  const jsaLocked = sikaStatusPemberi !== 'approved';

  const noSikaGabungan = getNomorSika(sika);

  const openModal = (type: ModalType) => {
    setAlasan('');
    setAlasanError('');
    setModalType(type);
  };

  const handleConfirm = () => {
    const namaUser = user?.name || 'Pemberi Kerja';
    const isReject = modalType === 'reject-sika' || modalType === 'reject-jsa' || modalType === 'reject-perubahan';

    if (isReject && !alasan.trim()) {
      setAlasanError('Alasan penolakan wajib diisi.');
      return;
    }
    if (modalType === 'approve-sika') approveSikaPemberi(namaUser, id);
    if (modalType === 'reject-sika') rejectSikaPemberi(namaUser, alasan.trim(), id);
    if (modalType === 'approve-jsa') approveJsaPemberi(namaUser, id);
    if (modalType === 'reject-jsa') rejectJsaPemberi(namaUser, alasan.trim(), id);
    if (modalType === 'approve-perubahan') approvePerubahanRevalidasi(namaUser, id);
    if (modalType === 'reject-perubahan') mintaRevisiPerubahan(namaUser, alasan.trim(), id);
    setModalType(null);
  };

  // Riwayat khusus submission INI saja (dulu tidak difilter per-id sama
  // sekali — begitu ada 2+ pengajuan, riwayatnya akan tercampur).
  const relevantHistory = approvalHistory
    .filter((h) => h.submissionId === id && (h.peran === 'pemberi' || h.peran === 'pemohon'))
    .slice()
    .reverse();

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const hasLangkahKerja = jsa?.sections?.some((sec) => sec.rows.some((r) => r.langkah.trim() !== ''));

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEADER — tanpa tombol Riwayat & Kembali ================= */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Detail Review</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Pemberi Kerja — Approval SIKA &amp; JSA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-6">
          <img
            src="/logopertaminagasfull.svg"
            alt="Pertamina Gas"
            className="h-8 object-contain"
          />
        </div>
      </div>

      {/* ================= DOKUMEN — bentuk sama seperti Detail Program Pemohon ================= */}
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
                  <SectionHeader title="DATA PROGRAM / KONTRAK" />
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
                  <SectionHeader title="BAGIAN 4 - JOB SAFETY ANALYSIS (JSA)" />
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

      {/* ================= PROSES APPROVAL — fungsi khusus Pemberi Kerja ================= */}
      <div className="px-4 sm:px-8 lg:px-14 xl:px-20 pb-8">
        <div
          className="mx-auto w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          style={{ maxWidth: '1680px' }}
        >
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-xs tracking-wide">PROSES APPROVAL</span>
              <p className="text-blue-200 text-[10px] mt-0.5">
                Ref. No. SIKA: <span className="font-semibold">{noSikaGabungan}</span> &middot; SIKA harus disetujui terlebih dahulu sebelum JSA dapat diproses
              </p>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 rounded-full border border-white/40 text-white text-[10px] font-semibold px-3 py-1.5 hover:bg-white/10 transition"
            >
              <History size={12} /> Riwayat
            </button>
          </div>

          <div className="px-6 py-5 grid grid-cols-2 gap-6">

            <div className={`rounded-xl border-2 p-5 ${
              sikaApproved ? 'border-green-200 bg-green-50' :
              sikaRejected ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-bold text-gray-800">SIKA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusIcon(sikaStatusPemberi)}
                  <span className={`text-xs font-semibold ${
                    sikaApproved ? 'text-green-600' : sikaRejected ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {statusLabel[sikaStatusPemberi] ?? 'Belum Direview'}
                  </span>
                </div>
              </div>

              {sikaApproved && (
                <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-lg px-3 py-2 mb-4">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">
                    SIKA telah disetujui dan diteruskan ke Penanggung Jawab Aset. Keputusan ini bersifat final dan tidak dapat diubah dari halaman ini.
                  </p>
                </div>
              )}

              {sikaRejected && alasanTolakSikaPemberi && (
                <div className="mb-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-medium mb-0.5">Alasan Penolakan:</p>
                  <p className="text-xs text-red-700">{alasanTolakSikaPemberi}</p>
                  <p className="text-[10px] text-red-500 mt-1.5">
                    Menunggu pemohon mengajukan ulang setelah revisi.
                  </p>
                </div>
              )}

              {!sikaApproved && !sikaRejected && (
                <p className="text-xs text-gray-500 mb-4">Periksa dokumen SIKA di atas sebelum memberikan keputusan.</p>
              )}

              {!sikaApproved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('approve-sika')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <CheckCircle size={13} /> Setujui SIKA
                  </button>
                  <button
                    onClick={() => openModal('reject-sika')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <XCircle size={13} /> Tolak SIKA
                  </button>
                </div>
              )}
            </div>

            <div className={`rounded-xl border-2 p-5 ${
              jsaLocked ? 'border-gray-200 bg-gray-50 opacity-60' :
              jsaApproved ? 'border-green-200 bg-green-50' :
              jsaRejected ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className={jsaLocked ? 'text-gray-400' : 'text-blue-600'} />
                  <span className="text-sm font-bold text-gray-800">JSA</span>
                  {jsaLocked && (
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      Terkunci
                    </span>
                  )}
                </div>
                {!jsaLocked && (
                  <div className="flex items-center gap-1.5">
                    {statusIcon(jsaStatusPemberi)}
                    <span className={`text-xs font-semibold ${
                      jsaApproved ? 'text-green-600' : jsaRejected ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {statusLabel[jsaStatusPemberi] ?? 'Belum Direview'}
                    </span>
                  </div>
                )}
              </div>

              {jsaLocked && (
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                  <Clock size={13} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500">JSA baru dapat diproses setelah SIKA disetujui.</p>
                </div>
              )}

              {jsaApproved && (
                <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-lg px-3 py-2 mb-4">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">
                    JSA telah disetujui dan diteruskan ke Penanggung Jawab Aset. Keputusan ini bersifat final.
                  </p>
                </div>
              )}

              {jsaRejected && alasanTolakJsaPemberi && (
                <div className="mb-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-medium mb-0.5">Alasan Penolakan:</p>
                  <p className="text-xs text-red-700">{alasanTolakJsaPemberi}</p>
                  <p className="text-[10px] text-red-500 mt-1.5">
                    Menunggu pemohon mengajukan ulang setelah revisi.
                  </p>
                </div>
              )}

              {!jsaLocked && !jsaApproved && !jsaRejected && (
                <p className="text-xs text-gray-500 mb-4">Periksa dokumen JSA di atas sebelum memberikan keputusan.</p>
              )}

              {!jsaLocked && !jsaApproved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('approve-jsa')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <CheckCircle size={13} /> Setujui JSA
                  </button>
                  <button
                    onClick={() => openModal('reject-jsa')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <XCircle size={13} /> Tolak JSA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---- Persetujuan Perubahan Data (Revalidasi) — hanya tampil kalau ada pengajuan ---- */}
          {perubahanStatus !== 'none' && (
            <div className="px-6 pb-6">
              <div className={`rounded-xl border-2 p-5 ${
                perubahanStatus === 'disetujui' ? 'border-green-200 bg-green-50' :
                perubahanStatus === 'revisi' ? 'border-red-200 bg-red-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-yellow-600" />
                    <span className="text-sm font-bold text-gray-800">Perubahan Data (Revalidasi)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {statusIcon(perubahanStatus)}
                    <span className={`text-xs font-semibold ${
                      perubahanStatus === 'disetujui' ? 'text-green-600' :
                      perubahanStatus === 'revisi' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {statusLabel[perubahanStatus] ?? perubahanStatus}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Pemohon mengajukan perubahan data (sertifikat/pekerja baru, dll) pada SIKA yang sudah aktif.
                </p>

                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">Catatan dari Pemohon</p>
                  <div className="bg-white/70 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700">
                    {catatanPerubahan?.trim() ? catatanPerubahan : (
                      <span className="text-gray-400 italic">Tidak ada catatan tambahan.</span>
                    )}
                  </div>
                </div>

                {perubahanStatus === 'revisi' && catatanRevisiPerubahan && (
                  <div className="mb-3 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-600 font-medium mb-0.5">Catatan Revisi:</p>
                    <p className="text-xs text-red-700">{catatanRevisiPerubahan}</p>
                  </div>
                )}

                {perubahanStatus === 'disetujui' && (
                  <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle size={13} className="text-green-500 shrink-0" />
                    <p className="text-xs text-green-700">Perubahan telah disetujui. Data SIKA &amp; JSA di atas adalah versi terbaru.</p>
                  </div>
                )}

                {perubahanStatus === 'menunggu' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('approve-perubahan')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                    >
                      <CheckCircle size={13} /> Setujui Perubahan
                    </button>
                    <button
                      onClick={() => openModal('reject-perubahan')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                    >
                      <XCircle size={13} /> Minta Revisi
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <p className="text-white font-bold text-sm">
                {modalType === 'approve-sika' && 'Konfirmasi Persetujuan SIKA'}
                {modalType === 'reject-sika' && 'Penolakan SIKA'}
                {modalType === 'approve-jsa' && 'Konfirmasi Persetujuan JSA'}
                {modalType === 'reject-jsa' && 'Penolakan JSA'}
                {modalType === 'approve-perubahan' && 'Konfirmasi Persetujuan Perubahan'}
                {modalType === 'reject-perubahan' && 'Permintaan Revisi Perubahan'}
              </p>
              <p className="text-blue-200 text-xs mt-0.5">
                {modalType?.startsWith('approve')
                  ? 'Keputusan ini bersifat final dan tidak dapat diubah setelah disetujui.'
                  : 'Pemohon akan menerima notifikasi dan dapat melakukan revisi.'}
              </p>
            </div>

            <div className="px-6 py-5">
              {modalType?.startsWith('approve') ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <p className="text-sm text-green-700">
                    {modalType === 'approve-perubahan' ? (
                      <>Dengan menyetujui, perubahan data ini akan berlaku pada SIKA &amp; JSA aktif.</>
                    ) : (
                      <>Dengan menyetujui, dokumen {modalType === 'approve-sika' ? 'SIKA' : 'JSA'} akan diteruskan ke Penanggung Jawab Aset dan keputusan ini <strong>tidak dapat dibatalkan</strong>.</>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">
                      {modalType === 'reject-perubahan'
                        ? 'Perubahan data ini akan dikembalikan ke pemohon untuk direvisi. SIKA & JSA yang sudah aktif tidak terpengaruh.'
                        : `Dokumen ${modalType === 'reject-sika' ? 'SIKA' : 'JSA'} akan dikembalikan ke pemohon untuk direvisi.`}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium block mb-1.5">
                      {modalType === 'reject-perubahan' ? 'Catatan Revisi' : 'Alasan Penolakan'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={alasan}
                      onChange={(e) => { setAlasan(e.target.value); setAlasanError(''); }}
                      placeholder={
                        modalType === 'reject-perubahan'
                          ? 'Jelaskan apa yang perlu dilengkapi/diperbaiki pemohon...'
                          : 'Tuliskan alasan penolakan secara jelas dan detail...'
                      }
                      className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 resize-none ${
                        alasanError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                      }`}
                    />
                    {alasanError && <p className="text-red-500 text-xs mt-1">{alasanError}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition ${
                  modalType?.startsWith('approve')
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {modalType?.startsWith('approve') ? 'Ya, Setujui' : modalType === 'reject-perubahan' ? 'Kirim Catatan Revisi' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div>
                <p className="text-white font-bold text-sm">Riwayat Approval</p>
                <p className="text-blue-200 text-xs mt-0.5">SIKA, JSA &amp; Revalidasi &middot; Ref. {noSikaGabungan}</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 hover:bg-white/20 rounded-full flex items-center justify-center transition text-white"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {relevantHistory.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-10">Belum ada riwayat aktivitas.</p>
              ) : (
                <div className="space-y-3">
                  {relevantHistory.map((h) => {
                    const aksiLabel = h.aksi === 'approve' ? 'Menyetujui' : h.aksi === 'reject' ? 'Menolak' : 'Mengajukan ulang';
                    const aksiColor = h.aksi === 'approve' ? 'text-green-600' : h.aksi === 'reject' ? 'text-red-600' : 'text-blue-600';
                    const dokumenLabel = h.dokumen === 'sika' ? 'SIKA' : h.dokumen === 'jsa' ? 'JSA' : 'Perubahan Data';
                    return (
                      <div key={h.id} className="border border-gray-100 rounded-lg px-3 py-2.5 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${aksiColor}`}>
                            {aksiLabel} {dokumenLabel}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatTimestamp(h.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          oleh <span className="font-medium">{h.oleh}</span>
                          <span className="text-gray-400"> ({h.peran === 'pemberi' ? 'Pemberi Kerja' : 'Pemohon'})</span>
                        </p>
                        {h.alasan && (
                          <p className="text-xs text-gray-500 mt-1 italic">"{h.alasan}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}