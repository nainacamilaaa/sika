'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Users, Lock, CheckCircle } from 'lucide-react';

const checklistItems = [
  // KONDISI PERALATAN
  { section: 'KONDISI PERALATAN', items: [
    { label: 'Apakah objek yg bersangkutan/digali:', cols: [{ label: 'Berbahaya?', key: 'c1_berbahaya' }, { label: 'Rusak?/ Damaged?', key: 'c1_rusak' }] },
    { label: 'Tipe penggalian apakah yg diijinkan:', cols: [{ label: 'Mekanik?', key: 'c2_mekanik' }, { label: 'Manual?/ Hand digging?', key: 'c2_manual' }] },
    { label: 'Peralatan deteksi logam gg diperlukan:', cols: [{ label: 'Detektor logam?', key: 'c3_detektor' }, { label: 'Manual?/ Hand digging?', key: 'c3_manual' }] },
  ]},
];

// Flat single-column checklist items
const checklistSingle = [
  'Apakah sekitar lokasi pekerjaan dibatasi dengan jelas?',
  'Apakah penggunaan GPS diperlukan?',
  'Apakah jenis dan kondisi tanah teridentifikasi, diketahui dengan baik?',
  'Apakah resiko tumpahan/longsoran tanah galian terhadap personel dan stabilitas parit telah diperhitungkan?',
  'Apakah prosedur Penahan/ Penguat/ Tangga/ Jembatan tersedia dan dilampirkan dalam ijin kerja ini?',
  'Apakah sertifikat / pengujian alat-alat / perlengkapan penggalian tersedia / di-update?',
  'Apakah sertifikat personel yg menjalankan peralatan penggalian tersedia / di-update?',
  'Apakah palang pembatas/ penerangan malam / tanda peringatan dibutuhkan di tempat ini?',
  'Apakah pengalihan jalan/ rute dibutuhkan?',
  'Apakah diperlukan gambar/sket',
];

const depthOptions = ['< 0.5m', '0.5-1m', '1-2m', '> 2m'];

const verifikasiLapanganItems = [
  'Pemeriksaan jalur Pipa proses, pipa drainase, flow lines',
  'Pemeriksaan kabel dan listrik / telekomunikasi',
  'Jaringan Pipa Pemadam Kebakaran / Sistem terpasang tetap.',
];

const safetyNotes = [
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja group leader/pengawas pekerjaan.',
  'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk /bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing.',
  'Ingat bahaya-bahaya penggalian adalah dinding tanah galian runtuh, biss tertimbun galian, atau kejatuhan tumpukan tanah galian.',
  'Bahaya kekurangan oksigen untuk bernafas, atau gas beracun lainnya, sir ganguan atau karena sir banjir atau hujan deras.',
  'Bahaya dari rusaknya utilitas lain seperti kabel listrik, telekomunikasi atau pipa gas eksisting dan pipa air serta bahaya pekerjaan saat LOWERING PIPA.',
  'Untuk semua galian harus disediakan fasilitas akses, untuk keluar masuk ke lokasi galian dalam kondisi normal dan utamanya dalam keadaan darurat.',
  'Lokasi kerja/galian diberi barricade untuk menghindari orang terperosok.',
  'Pada saat ada kecelakaan / orang bekerja di dalam lokasi galian harus ada orang lain yang mengawasi dari luar.',
  'Letakkan material kerja pada posisi yang aman jauh dari tepi galian agar tidak jatuh kedalaman galian.',
  'Rencana penyelematan RESCUE harus dibuat untuk penggalian yang dalam.',
  'Pasang rambu-rambu peringatan disekitar lokasi kegiatan/penggalian.',
  'Lakukan koordinasi dan komunikasi yang efektif saat akan melakukan lowering pipa dan atau saat ada kegiatan yang dekat dengan fasilitas/utilitas eksisting yang terkena dampak.',
  'Beri tanda pembatas/safety line/barricade pada jarak yang aman agar kendaraan berat tidak melewati dekat lokasi galian.',
];

function ReadOnlyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <label className="w-44 text-sm text-gray-900 shrink-0 font-medium pt-1">{label}</label>
      <span className="text-gray-300 shrink-0 pt-1">|</span>
      {multiline ? (
        <p className="flex-1 text-sm text-gray-900 pt-0.5 leading-relaxed">{value || <span className="text-gray-300 italic">—</span>}</p>
      ) : (
        <p className="flex-1 text-sm text-gray-900 pt-0.5">{value || <span className="text-gray-300 italic">—</span>}</p>
      )}
    </div>
  );
}

function VerifikasiPanel({
  title, sub, namaKey, tanggalKey, canEdit, verifikasi, setVerifikasi,
}: {
  title: string; sub: string; namaKey: string; tanggalKey: string;
  canEdit: boolean; verifikasi: Record<string, string>;
  setVerifikasi: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className={`rounded border-2 overflow-hidden ${canEdit ? 'border-blue-400' : 'border-gray-200'}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${canEdit ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <div>
          <p className={`text-sm font-bold ${canEdit ? 'text-blue-700' : 'text-gray-400'}`}>{title}</p>
          <p className={`text-sm ${canEdit ? 'text-blue-400' : 'text-gray-300'}`}>{sub}</p>
        </div>
        {!canEdit && (
          <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded px-2.5 py-1">
            <Lock size={10} className="text-gray-400" />
            <span className="text-sm text-gray-400">Tidak dapat diakses</span>
          </div>
        )}
      </div>
      <div className="px-4 py-4 space-y-3">
        <div>
          <label className={`text-sm mb-1 block ${canEdit ? 'text-gray-600' : 'text-gray-300'}`}>Tanda Tangan</label>
          <div className={`border-2 border-dashed rounded h-16 flex items-center justify-center ${
            canEdit ? 'border-blue-200 bg-white cursor-pointer hover:bg-blue-50 transition' : 'border-gray-100 bg-gray-50'
          }`}>
            {canEdit ? <span className="text-sm text-blue-300">Klik untuk tanda tangan</span> : <Lock size={14} className="text-gray-200" />}
          </div>
        </div>
        <div>
          <label className={`text-sm mb-1 block ${canEdit ? 'text-gray-600' : 'text-gray-300'}`}>Nama</label>
          <input
            type="text"
            value={verifikasi[namaKey] || ''}
            onChange={(e) => canEdit && setVerifikasi((prev) => ({ ...prev, [namaKey]: e.target.value }))}
            disabled={!canEdit}
            className={`w-full border rounded px-3 py-2 text-sm transition ${
              canEdit ? 'border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400' : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
            }`}
            placeholder={canEdit ? 'Nama lengkap...' : '—'}
          />
        </div>
        <div>
          <label className={`text-sm mb-1 block ${canEdit ? 'text-gray-600' : 'text-gray-300'}`}>Tanggal</label>
          <input
            type="date"
            value={verifikasi[tanggalKey] || ''}
            onChange={(e) => canEdit && setVerifikasi((prev) => ({ ...prev, [tanggalKey]: e.target.value }))}
            disabled={!canEdit}
            className={`w-full border rounded px-3 py-2 text-sm transition ${
              canEdit ? 'border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400' : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

// Yes/No checkbox pair component
function YesNoCell({ val, onYes, onNo }: { val: 'yes' | 'no' | null; onYes: () => void; onNo: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <button onClick={onYes}
        className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all ${
          val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
        }`}>
        {val === 'yes' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>
      <button onClick={onNo}
        className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all ${
          val === 'no' ? 'bg-red-500 border-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
        }`}>
        {val === 'no' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
      </button>
    </div>
  );
}

export default function SKGPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled } = useProgramStore();
  const { user } = useAuthStore();

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  // Multi-column checklist state (kondisi peralatan)
  const [multiChecklist, setMultiChecklist] = useState<Record<string, 'yes' | 'no' | null>>({});
  const toggleMulti = (key: string, val: 'yes' | 'no') =>
    setMultiChecklist((prev) => ({ ...prev, [key]: prev[key] === val ? null : val }));

  // Single checklist state
  const [checklist, setChecklist] = useState<Record<number, 'yes' | 'no' | null>>(
    Object.fromEntries(checklistSingle.map((_, i) => [i, null]))
  );
  const toggleChecklist = (index: number, val: 'yes' | 'no') =>
    setChecklist((prev) => ({ ...prev, [index]: prev[index] === val ? null : val }));

  // Verifikasi lapangan checklist (Bagian 4)
  const [verLapChecklist, setVerLapChecklist] = useState<Record<number, { left: 'yes' | 'no' | null; right: 'yes' | 'no' | null }>>(
    Object.fromEntries(verifikasiLapanganItems.map((_, i) => [i, { left: null, right: null }]))
  );

  // Kedalaman penggalian
  const [kedalaman, setKedalaman] = useState<string | null>(null);
  const [kedalamanCustom, setKedalamanCustom] = useState('');

  // Item 15 — pencegahan lainnya
  const [pencegahanLain, setPencegahanLain] = useState('');

  // Keterangan tambahan (Bagian 4)
  const [keteranganTambahan, setKeteranganTambahan] = useState('');

  const [diisiOlehIA, setDiisiOlehIA] = useState(false);
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [berlakuHingga, setBerlakuHingga] = useState('');
  const [verifikasi, setVerifikasi] = useState<Record<string, string>>({
    paNama: '', paTanggal: '', iaNama: '', iaTanggal: '',
  });
  const [gasMonitoring, setGasMonitoring] = useState<'ya' | 'tidak' | null>(null);

  const yesCount = Object.values(checklist).filter(v => v === 'yes').length;
  const noCount = Object.values(checklist).filter(v => v === 'no').length;
  const totalFilled = yesCount + noCount;
  const totalItems = checklistSingle.length + 3 /* kondisi */ + 1 /* kedalaman */;

  // Handler untuk Simpan
  const handleSimpan = () => {
    // Tandai sertifikat sebagai terisi di store
    markSertifikatFilled('Sertifikat Kerja Penggalian (SKG)');
    
    // Tampilkan notifikasi sukses
    setShowSuccess(true);
    
    // Redirect setelah 1.5 detik
    setTimeout(() => {
      router.push('/dashboard/pemohon/sika/pemeriksaan');
    }, 1500);
  };

  // Handler untuk Save and Close
  const handleSaveAndClose = () => {
    // Tandai sertifikat sebagai terisi
    markSertifikatFilled('Sertifikat Kerja Penggalian (SKG)');
    router.push('/dashboard/pemohon/sika/pemeriksaan');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2" style={{ paddingLeft: '30px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => router.push('/dashboard/pemohon/sika/new')}>JENIS PEKERJAAN</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => router.push('/dashboard/pemohon/sika/pemeriksaan')}>PEMERIKSAAN</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 font-semibold">SKG</span>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja Penggalian (SKG) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* HERO HEADER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-012/B-003/PG0300/2026-S9</span>
          </div>
          <div className="flex border-t border-gray-200">
            <div className="flex items-center gap-3 px-5 py-4 border-r border-gray-200 shrink-0">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Rujukan SIKA No.</span>
              <input
                type="text"
                placeholder="..."
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 w-44 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
            {/* Brown/olive header for SKG */}
            <div style={{ flex: 3, backgroundColor: '#7B3F00', minHeight: '80px' }} className="flex items-center justify-center px-6 py-4">
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Sertifikat Kerja Penggalian
              </h1>
            </div>
            <div className="border-l border-gray-200 bg-white flex items-center justify-center px-4" style={{ flex: 1, minHeight: '80px' }}>
              <div className="w-full h-full" style={{
                backgroundImage: 'url(/logopertaminagas.svg)',
                backgroundSize: '100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
              }} />
              <span className="text-xs font-black text-gray-800 tracking-widest whitespace-nowrap">SKG</span>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center justify-end gap-2">
            <div className={`w-2 h-2 rounded-full ${totalFilled >= totalItems ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs text-gray-500">{totalFilled}/{checklistSingle.length} item checklist terisi</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SATU BORDER — Bagian 1 s/d Bagian 5
        ════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden divide-y divide-blue-200">

          {/* BAGIAN 1 — Tanggal, Jam, Berlaku */}
          <div className="flex items-stretch" style={{ minHeight: '48px' }}>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-5 py-2 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 1 — Tanggal Terbit</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input
                  type="date"
                  value={tanggalTerbit}
                  onChange={(e) => setTanggalTerbit(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            </div>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Jam Kerja</span>
              </div>
              <div className="flex items-center justify-center flex-1 gap-2 px-3">
                <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                <span className="text-sm text-gray-500 font-semibold shrink-0">s/d</span>
                <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Berlaku Hingga</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={berlakuHingga} onChange={(e) => setBerlakuHingga(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
          </div>

          <div className="h-3 bg-gray-100" />

          {/* BAGIAN 2 — Jenis Pekerjaan */}
          <div>
            <div className="bg-blue-100 px-5 py-4 border-b border-blue-200 flex items-center justify-between">
              <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 2 — Jenis Pekerjaan</span>
              <span className="text-xs text-blue-400 italic">Dilengkapi oleh Pelaksana Pekerjaan (PA)</span>
            </div>
            <div className="divide-y divide-gray-100">
              <ReadOnlyField label="Fungsi / Perusahaan"       value={sika?.fungsiPerusahaan || ''} />
              <ReadOnlyField label="Lokasi / Instalasi"        value={sika?.lokasiInstalasi || ''} />
              <ReadOnlyField label="Peralatan / No. Identitas" value={sika?.peralatanNoIdentitas || ''} />
              <ReadOnlyField label="Jumlah Pekerja"            value={sika?.pekerjaList?.length ? `${sika.pekerjaList.length} orang` : ''} />
              <ReadOnlyField label="Uraian Pekerjaan"          value={sika?.uraianPekerjaan || ''} multiline />
              {/* Peralatan kerja yang akan digunakan — multi-line list */}
              <div className="px-5 py-3">
                <label className="w-44 text-sm text-gray-900 font-medium block mb-2">Peralatan kerja yang akan digunakan:</label>
                <div className="space-y-1.5 pl-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">—</span>
                      <input type="text" className="flex-1 border-b border-gray-200 py-0.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 bg-transparent" placeholder={`Peralatan ${n}...`} />
                    </div>
                  ))}
                </div>
              </div>
              {sika?.pekerjaList && sika.pekerjaList.length > 0 && (
                <div className="flex items-start gap-3 px-5 py-3">
                  <label className="w-44 text-sm text-gray-900 shrink-0 font-medium pt-1 flex items-center gap-1.5">
                    <Users size={12} className="text-gray-500" />
                    Daftar Pekerja
                  </label>
                  <span className="text-gray-300 shrink-0 pt-1">|</span>
                  <div className="flex-1 grid grid-cols-3 gap-2 pt-0.5">
                    {sika.pekerjaList.map((nama: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-blue-50 rounded px-3 py-1.5 border border-blue-100">
                        <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-sm text-gray-900">{nama}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BAGIAN 3 — Pemeriksaan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#FFFF00', borderColor: '#e6ac00' }}>
              <div>
                <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#000000' }}>Bagian 3 — Pemeriksaan</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Yes: {yesCount}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> No: {noCount}
                </span>
                <span className="text-xs text-gray-400">{checklistSingle.length - totalFilled} belum diisi</span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={diisiOlehIA} onChange={() => setDiisiOlehIA(!diisiOlehIA)}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                  <span className="text-sm text-gray-900">Diisi oleh Issuing Authority (IA)</span>
                </label>
              </div>

              <div className="rounded overflow-hidden border border-blue-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <th className="text-left text-blue-700 font-semibold px-4 py-3 w-8 text-sm">No</th>
                      <th className="text-left text-blue-700 font-semibold px-4 py-3 text-sm">Item Pemeriksaan</th>
                      <th className="text-center text-green-600 font-bold px-4 py-3 w-28 text-sm" colSpan={2}>Yes / No</th>
                      <th className="text-center text-green-600 font-bold px-4 py-3 w-28 text-sm" colSpan={2}>Yes / No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sub-section header: KONDISI PERALATAN */}
                    <tr className="bg-yellow-50 border-b border-yellow-200">
                      <td colSpan={6} className="px-4 py-2 text-xs font-bold text-yellow-800 uppercase tracking-wider">KONDISI PERALATAN</td>
                    </tr>

                    {/* Row 1 */}
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="px-4 py-3 text-gray-900 text-sm font-mono">01</td>
                      <td className="px-4 py-3 text-gray-900 text-sm">Apakah objek yg bersangkutan/digali:</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-gray-500 block mb-1">Berbahaya?</span>
                        <YesNoCell val={multiChecklist['c1_berbahaya'] ?? null} onYes={() => toggleMulti('c1_berbahaya', 'yes')} onNo={() => toggleMulti('c1_berbahaya', 'no')} />
                      </td>
                      <td className="px-3 py-3 text-center border-l border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Rusak?/ Damaged?</span>
                        <YesNoCell val={multiChecklist['c1_rusak'] ?? null} onYes={() => toggleMulti('c1_rusak', 'yes')} onNo={() => toggleMulti('c1_rusak', 'no')} />
                      </td>
                      <td colSpan={2} />
                    </tr>

                    {/* Row 2 */}
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-900 text-sm font-mono">02</td>
                      <td className="px-4 py-3 text-gray-900 text-sm">Tipe penggalian apakah yg diijinkan:</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-gray-500 block mb-1">Mekanik?</span>
                        <YesNoCell val={multiChecklist['c2_mekanik'] ?? null} onYes={() => toggleMulti('c2_mekanik', 'yes')} onNo={() => toggleMulti('c2_mekanik', 'no')} />
                      </td>
                      <td className="px-3 py-3 text-center border-l border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Manual?/ Hand digging?</span>
                        <YesNoCell val={multiChecklist['c2_manual'] ?? null} onYes={() => toggleMulti('c2_manual', 'yes')} onNo={() => toggleMulti('c2_manual', 'no')} />
                      </td>
                      <td colSpan={2} />
                    </tr>

                    {/* Row 3 */}
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="px-4 py-3 text-gray-900 text-sm font-mono">03</td>
                      <td className="px-4 py-3 text-gray-900 text-sm">Peralatan deteksi logam gg diperlukan:</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-gray-500 block mb-1">Detektor logam?</span>
                        <YesNoCell val={multiChecklist['c3_detektor'] ?? null} onYes={() => toggleMulti('c3_detektor', 'yes')} onNo={() => toggleMulti('c3_detektor', 'no')} />
                      </td>
                      <td className="px-3 py-3 text-center border-l border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Manual?/ Hand digging?</span>
                        <YesNoCell val={multiChecklist['c3_manual'] ?? null} onYes={() => toggleMulti('c3_manual', 'yes')} onNo={() => toggleMulti('c3_manual', 'no')} />
                      </td>
                      <td colSpan={2} />
                    </tr>

                    {/* Single-column items 4–13 */}
                    {checklistSingle.map((item, index) => {
                      const val = checklist[index];
                      const rowNum = index + 4;
                      return (
                        <tr key={index} className={`border-b border-gray-100 transition-colors ${
                          val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : rowNum % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}>
                          <td className="px-4 py-3 text-gray-900 text-sm font-mono">{String(rowNum).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed" colSpan={3}>{item}</td>
                          <td className="px-4 py-3 text-center" colSpan={2}>
                            <YesNoCell val={val} onYes={() => toggleChecklist(index, 'yes')} onNo={() => toggleChecklist(index, 'no')} />
                          </td>
                        </tr>
                      );
                    })}

                    {/* Row 14 — Kedalaman penggalian */}
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="px-4 py-3 text-gray-900 text-sm font-mono">14</td>
                      <td className="px-4 py-3 text-gray-900 text-sm font-medium">Kedalaman penggalian</td>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          {depthOptions.map((opt) => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="kedalaman"
                                checked={kedalaman === opt}
                                onChange={() => setKedalaman(opt)}
                                className="accent-blue-600"
                              />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="kedalaman"
                              checked={kedalaman === 'custom'}
                              onChange={() => setKedalaman('custom')}
                              className="accent-blue-600"
                            />
                            <input
                              type="text"
                              value={kedalamanCustom}
                              onChange={(e) => { setKedalamanCustom(e.target.value); setKedalaman('custom'); }}
                              placeholder=".............. m"
                              className="border-b border-gray-300 w-24 text-sm text-gray-900 focus:outline-none focus:border-blue-400 bg-transparent px-1"
                            />
                          </label>
                        </div>
                      </td>
                    </tr>

                    {/* Row 15 — Pencegahan lainnya */}
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-900 text-sm font-mono">15</td>
                      <td className="px-4 py-3 text-gray-900 text-sm" colSpan={5}>
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 pt-0.5">Jika ya, sebutkan pencegahan-pencegahan lainnya:</span>
                          <input
                            type="text"
                            value={pencegahanLain}
                            onChange={(e) => setPencegahanLain(e.target.value)}
                            placeholder="..."
                            className="flex-1 border-b border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-400 bg-transparent px-1"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* BAGIAN 4 — Verifikasi Lapangan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#00b050', borderColor: '#009040' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 4 — Verifikasi Lapangan</span>
              <span className="text-xs text-white italic">Hanya Pemberi Kerja & Penanggung Jawab</span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Statement */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded px-4 py-3">
                <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-gray-900 leading-relaxed">
                  Kami yang bertanda tangan dibawah ini telah melakukan verifikasi di lapangan untuk pekerjaan yang dijelaskan di atas, dan seluruh pengendalian bahaya yang dicetuskan telah dipenuhi.
                  {' '}<span className="text-blue-500 font-medium">Bagian ini hanya dapat diisi oleh Pemberi Kerja dan Penanggung Jawab.</span>
                </p>
              </div>

              {/* Verifikasi sub-checklist (pipe, cable, fire) */}
              <div className="rounded overflow-hidden border border-green-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-green-50 border-b border-green-200">
                      <th className="text-left text-green-700 font-semibold px-4 py-2 text-sm">Item Verifikasi</th>
                      <th className="text-center text-green-600 font-bold px-4 py-2 w-28 text-sm">Yes / No</th>
                      <th className="text-center text-blue-600 font-semibold px-4 py-2 text-sm">Gambar/PID tersedia</th>
                      <th className="text-center text-green-600 font-bold px-4 py-2 w-28 text-sm">Yes / No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifikasiLapanganItems.map((item, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed">{item}</td>
                        <td className="px-4 py-3 text-center">
                          <YesNoCell
                            val={verLapChecklist[i]?.left ?? null}
                            onYes={() => setVerLapChecklist(p => ({ ...p, [i]: { ...p[i], left: p[i]?.left === 'yes' ? null : 'yes' } }))}
                            onNo={() => setVerLapChecklist(p => ({ ...p, [i]: { ...p[i], left: p[i]?.left === 'no' ? null : 'no' } }))}
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-400 italic">Gambar/PID tersedia</td>
                        <td className="px-4 py-3 text-center">
                          <YesNoCell
                            val={verLapChecklist[i]?.right ?? null}
                            onYes={() => setVerLapChecklist(p => ({ ...p, [i]: { ...p[i], right: p[i]?.right === 'yes' ? null : 'yes' } }))}
                            onNo={() => setVerLapChecklist(p => ({ ...p, [i]: { ...p[i], right: p[i]?.right === 'no' ? null : 'no' } }))}
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Keterangan Tambahan */}
                    <tr className="border-b border-gray-100 bg-white">
                      <td className="px-4 py-3 text-gray-900 text-sm font-medium">4&nbsp;&nbsp; Keterangan Tambahan:</td>
                      <td colSpan={3} className="px-4 py-3">
                        <input
                          type="text"
                          value={keteranganTambahan}
                          onChange={(e) => setKeteranganTambahan(e.target.value)}
                          placeholder="..."
                          className="w-full border-b border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-blue-400 bg-transparent px-1 py-0.5"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature panels */}
              <div className="grid grid-cols-2 gap-6">
                <VerifikasiPanel title="Pelaksana Pekerjaan (PA)" sub="Performing Authority · Pemberi Kerja"
                  namaKey="paNama" tanggalKey="paTanggal" canEdit={canEditPA} verifikasi={verifikasi} setVerifikasi={setVerifikasi} />
                <VerifikasiPanel title="Asset Holder / IA" sub="Issuing Authority · Penanggung Jawab"
                  namaKey="iaNama" tanggalKey="iaTanggal" canEdit={canEditIA} verifikasi={verifikasi} setVerifikasi={setVerifikasi} />
              </div>
            </div>
          </div>

          {/* BAGIAN 5 — Kegiatan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: '#993366', borderColor: '#7a2952' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 5 — Kegiatan</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-white mr-1">Pengukuran & monitoring gas:</span>
                {(['ya', 'tidak'] as const).map((opt) => (
                  <button key={opt} onClick={() => setGasMonitoring(gasMonitoring === opt ? null : opt)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      gasMonitoring === opt
                        ? opt === 'ya' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}>
                    {opt === 'ya' ? 'Ya — gunakan form kondisi gas' : 'Tidak'}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Safety Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Hal-hal penting yang harus menjadi perhatian untuk keselamatan pekerjaan
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden border border-green-200 divide-y divide-green-100">
                  {safetyNotes.map((text, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50'}`}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DISTRIBUSI */}
          <div className="flex border-t-2 border-blue-400">
            <div className="flex items-center px-5 py-3 shrink-0" style={{ backgroundColor: '#c8b89a', minWidth: '140px' }}>
              <span className="text-xs font-bold text-black uppercase tracking-widest">DISTRIBUSI:</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-l border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <span className="text-xs font-semibold text-black">Putih Sebagai Arsip Performing Authority (PA)</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-l border-white/40" style={{ backgroundColor: '#92d050' }}>
              <span className="text-xs font-bold" style={{ color: '#000000' }}>Hijau Sebagai Arsip HSE</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-l border-yellow-200" style={{ backgroundColor: '#ffff00' }}>
              <span className="text-xs font-bold" style={{ color: '#000000' }}>Kuning Sebagai Arsip SIKA Controller</span>
            </div>
          </div>

        </div>{/* akhir 1 border wrapper */}

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 py-2 pb-8">
          <button onClick={() => router.push('/dashboard/pemohon/sika/pemeriksaan')}
            className="px-6 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-md shadow-red-200">
            Back
          </button>
          <button onClick={handleSaveAndClose}
            className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition shadow-md shadow-green-200">
            Save and Close
          </button>
          <button onClick={handleSimpan}
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200">
            Simpan
          </button>
        </div>

      </div>

      {/* CSS untuk animasi notifikasi */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}