'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Lock, CheckCircle } from 'lucide-react';

const checklistItems = [
  'Apakah pelaksana pengambil foto/video sudah diberi penjelasan mengenai kondisi dan bahaya penggunaan camera di daerah terbatas',
  'Apakah kondisi camera yang akan dipergunakan telah dilakukan pemeriksaan',
  'Apakah para petugas pengambil foto telah diberi penjelasan tindakan dalam keadaan darurat',
  'Alasan pengambilan foto/video dan nama alat yang spesifik untuk keperluan eksternal secara detail adalah sbb:',
];

const safetyNotes = [
  'Peralatan foto harus dibawa pada saat mengajukan ijin untuk diperiksa kondisinya.',
  'Bila menggunakan lampu blitz, pengetesan gas yang mudah terbakar harus dilakukan sebelum pengambilan foto.',
  'Untuk external (Kontraktor dan Tamu) harus didampingi oleh Sponsor/fungsi ybs.',
  'Surat izin ini harus diperlihatkan ke Petugas Security di Pos pemeriksaan sebelum masuk area terbatas.',
];

const jenisFotoOptions = [
  'DSLR / Pocket',
  'Camcorder',
  'Polaroid',
  'Gawai / Handphone',
];

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
            onChange={(e) => canEdit && setVerifikasi(prev => ({ ...prev, [namaKey]: e.target.value }))}
            disabled={!canEdit}
            className={`w-full border rounded px-3 py-2 text-sm transition ${
              canEdit
                ? 'border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
            }`}
            placeholder={canEdit ? 'Nama lengkap...' : '—'}
          />
        </div>
        <div>
          <label className={`text-sm mb-1 block ${canEdit ? 'text-gray-600' : 'text-gray-300'}`}>Tanggal</label>
          <input
            type="date"
            value={verifikasi[tanggalKey] || ''}
            onChange={(e) => canEdit && setVerifikasi(prev => ({ ...prev, [tanggalKey]: e.target.value }))}
            disabled={!canEdit}
            className={`w-full border rounded px-3 py-2 text-sm transition ${
              canEdit
                ? 'border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                : 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

type CheckVal = 'yes' | 'no' | null;

export default function SKPFPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled } = useProgramStore();
  const { user } = useAuthStore();

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  const [checklist, setChecklist] = useState<Record<number, CheckVal>>(
    Object.fromEntries(checklistItems.map((_, i) => [i, null]))
  );
  const [diisiOlehIA, setDiisiOlehIA] = useState(false);
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [berlakuHingga, setBerlakuHingga] = useState('');
  const [verifikasi, setVerifikasi] = useState<Record<string, string>>({
    paNama: '', paTanggal: '', iaNama: '', iaTanggal: '',
  });
  const [gasMonitoring, setGasMonitoring] = useState<'ya' | 'tidak' | null>(null);
  const [tindakanLainnya, setTindakanLainnya] = useState('');

  // Bagian 2 tambahan SKPF
  const [lokasiInstalasi, setLokasiInstalasi] = useState('');
  const [peralatanNoIdentitas, setPeralatanNoIdentitas] = useState('');
  const [pemohon, setPemohon] = useState('');
  const [jenisFotoUmum, setJenisFotoUmum] = useState(false);
  const [jenisFotoSpesifik, setJenisFotoSpesifik] = useState(false);
  const [spesifikInstalasi, setSpesifikInstalasi] = useState('');
  const [tujuanPengambilan, setTujuanPengambilan] = useState('');

  // Jenis pemohon
  const [pemohonType, setPemohonType] = useState<string[]>([]);

  // Jenis foto & blitz
  const [selectedFoto, setSelectedFoto] = useState<Record<string, boolean>>({});
  const [typeMerek, setTypeMerek] = useState<Record<string, string>>({});
  const [dilengkapiBlitz, setDilengkapiBlitz] = useState<Record<string, 'ya' | 'tidak' | null>>({});

  const toggleFoto = (item: string) => {
    setSelectedFoto(prev => ({ ...prev, [item]: !prev[item] }));
  };
  const toggleBlitz = (item: string, val: 'ya' | 'tidak') => {
    setDilengkapiBlitz(prev => ({ ...prev, [item]: prev[item] === val ? null : val }));
  };
  const togglePemohon = (val: string) => {
    setPemohonType(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const toggleChecklist = (index: number, val: 'yes' | 'no') => {
    setChecklist(prev => ({ ...prev, [index]: prev[index] === val ? null : val }));
  };

  const yesCount    = Object.values(checklist).filter(v => v === 'yes').length;
  const noCount     = Object.values(checklist).filter(v => v === 'no').length;
  const totalFilled = yesCount + noCount;

  // Handler untuk Simpan - PASTIKAN NAMA SAMA DENGAN YANG ADA DI STORE
  const handleSimpan = () => {
    // Tandai sertifikat sebagai terisi di store
    // Gunakan nama yang sama dengan yang ada di halaman pemeriksaan
    markSertifikatFilled('Sertifikat Kerja Pengambilan Fotografi (SKPF)');
    
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
    markSertifikatFilled('Sertifikat Kerja Pengambilan Fotografi (SKPF)');
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
          <span className="text-blue-800 font-semibold">SKPF</span>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja Pengambilan Fotografi (SKPF) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* HERO HEADER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-019/E-003/PG0300/2026-S9</span>
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
            <div style={{ flex: 3, backgroundColor: '#7030a0', minHeight: '80px' }} className="flex items-center justify-center px-6 py-4">
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>
                Sertifikat Kerja Pengambilan Fotografi
              </h1>
            </div>
            <div className="border-l border-gray-200 bg-white" style={{
              flex: 1,
              minHeight: '80px',
              backgroundImage: 'url(/logopertaminagas.svg)',
              backgroundSize: '100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
            }} />
          </div>
          <div className="px-5 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center justify-end gap-2">
            <div className={`w-2 h-2 rounded-full ${totalFilled === checklistItems.length ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs text-gray-500">{totalFilled}/{checklistItems.length} item checklist terisi</span>
          </div>
        </div>

        {/* ═══ SATU BORDER WRAPPER ═══ */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden divide-y divide-blue-200">

          {/* BAGIAN 1 */}
          <div className="flex items-stretch" style={{ minHeight: '48px' }}>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-5 py-2 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 1 — Tanggal Terbit</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={tanggalTerbit} onChange={e => setTanggalTerbit(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Jam Kerja</span>
              </div>
              <div className="flex items-center justify-center flex-1 gap-2 px-3">
                <input type="time" value={jamMulai} onChange={e => setJamMulai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                <span className="text-sm text-gray-500 font-semibold shrink-0">s/d</span>
                <input type="time" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Berlaku Hingga</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={berlakuHingga} onChange={e => setBerlakuHingga(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
          </div>

          <div className="h-3 bg-gray-100" />

          {/* BAGIAN 2 — Jenis Pekerjaan khusus SKPF */}
          <div>
            <div className="bg-blue-100 px-5 py-4 border-b border-blue-200 flex items-center justify-between">
              <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 2 — Jenis Pekerjaan</span>
              <span className="text-xs text-blue-400 italic">Dilengkapi oleh Pelaksana Pekerjaan (PA)</span>
            </div>

            {/* Row: Fungsi/Perusahaan + Pemohon */}
            <div className="flex border-b border-gray-100">
              <div className="flex items-start gap-3 px-5 py-3 flex-1 border-r border-gray-100">
                <label className="w-40 text-sm text-gray-900 shrink-0 font-medium pt-1">Fungsi / Perusahaan</label>
                <span className="text-gray-300 shrink-0 pt-1">|</span>
                <p className="flex-1 text-sm text-gray-300 italic pt-0.5">{sika?.fungsiPerusahaan || '—'}</p>
              </div>
              <div className="px-5 py-3 shrink-0 min-w-60">
                <p className="text-xs font-bold text-gray-700 mb-2">Pemohon:</p>
                <div className="space-y-1.5">
                  {[
                    'Pekerja / Mitra PT Pertamina Gas',
                    'Kontraktor PT Pertamina Gas',
                    'Tamu PT Pertamina Gas',
                  ].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pemohonType.includes(opt)} onChange={() => togglePemohon(opt)}
                        className="w-3.5 h-3.5 accent-blue-600" />
                      <span className="text-xs text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Row: Lokasi / Peralatan */}
            <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100">
              <label className="w-40 text-sm text-gray-900 shrink-0 font-medium pt-1">Lokasi / Instalasi</label>
              <span className="text-gray-300 shrink-0 pt-1">|</span>
              <p className="flex-1 text-sm text-gray-300 italic pt-0.5">{sika?.lokasiInstalasi || '—'}</p>
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">Peralatan / No. Identitas:</label>
                <p className="text-sm text-gray-300 italic">{sika?.peralatanNoIdentitas || '—'}</p>
              </div>
            </div>

            {/* Jenis Foto / Video */}
            <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100">
              <label className="w-40 text-sm text-gray-900 shrink-0 font-medium pt-1">Jenis Foto / Video</label>
              <span className="text-gray-300 shrink-0 pt-1">|</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={jenisFotoUmum} onChange={() => setJenisFotoUmum(!jenisFotoUmum)}
                      className="w-3.5 h-3.5 accent-blue-600" />
                    <span className="text-sm text-gray-800">Umum</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={jenisFotoSpesifik} onChange={() => setJenisFotoSpesifik(!jenisFotoSpesifik)}
                      className="w-3.5 h-3.5 accent-blue-600" />
                    <span className="text-sm text-gray-800">Spesifik Instalasi / Alat tertentu</span>
                  </label>
                </div>
                {jenisFotoSpesifik && (
                  <input type="text" value={spesifikInstalasi} onChange={e => setSpesifikInstalasi(e.target.value)}
                    placeholder="Sebutkan instalasi / alat tertentu..."
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
                )}
              </div>
            </div>

            {/* Tujuan Pengambilan Foto */}
            <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100">
              <label className="w-40 text-sm text-gray-900 shrink-0 font-medium pt-1">Tujuan Pengambilan Foto</label>
              <span className="text-gray-300 shrink-0 pt-1">|</span>
              <input type="text" value={tujuanPengambilan} onChange={e => setTujuanPengambilan(e.target.value)}
                placeholder="Tuliskan tujuan pengambilan foto/video..."
                className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
            </div>

            {/* Peralatan yang digunakan — Jenis + Type/Merek + Dilengkapi Blitz */}
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Peralatan kerja yang akan digunakan:</p>
              <div className="rounded overflow-hidden border border-blue-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <th className="text-left text-blue-700 font-semibold px-4 py-2.5 w-8">No</th>
                      <th className="text-left text-blue-700 font-semibold px-4 py-2.5">Jenis</th>
                      <th className="text-left text-blue-700 font-semibold px-4 py-2.5 w-48">Type / Merek</th>
                      <th className="text-center text-blue-700 font-semibold px-4 py-2.5 w-36">Dilengkapi Blitz?</th>
                      <th className="text-left text-blue-700 font-semibold px-4 py-2.5 w-64 text-xs">Jika YA, maka pekerjaan ini harus dilengkapi dengan Sertifikat Kerja Panas (SKP) dan dilakukan gas test.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jenisFotoOptions.map((item, idx) => (
                      <tr key={item} className={`border-b border-gray-100 transition-colors ${
                        selectedFoto[item] ? 'bg-blue-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}>
                        <td className="px-4 py-2.5 text-center">
                          <input type="checkbox" checked={!!selectedFoto[item]} onChange={() => toggleFoto(item)}
                            className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 text-sm">{item}</td>
                        <td className="px-4 py-2.5">
                          <input type="text" value={typeMerek[item] || ''} onChange={e => setTypeMerek(prev => ({ ...prev, [item]: e.target.value }))}
                            placeholder="Type / Merek..."
                            disabled={!selectedFoto[item]}
                            className={`w-full border rounded px-2 py-1 text-sm transition ${
                              selectedFoto[item]
                                ? 'border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {(['ya', 'tidak'] as const).map(val => (
                              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dilengkapiBlitz[item] === val}
                                  onChange={() => selectedFoto[item] && toggleBlitz(item, val)}
                                  disabled={!selectedFoto[item]}
                                  className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                                />
                                <span className={`text-xs capitalize ${selectedFoto[item] ? 'text-gray-700' : 'text-gray-300'}`}>
                                  {val.charAt(0).toUpperCase() + val.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {dilengkapiBlitz[item] === 'ya' && (
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                              <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              <span className="text-xs text-amber-700 font-medium">Wajib dilengkapi SKP + gas test</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* BAGIAN 3 — Pemeriksaan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#FFFF00', borderColor: '#e6ac00' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#000000' }}>Bagian 3 — Pemeriksaan</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Yes: {yesCount}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> No: {noCount}
                </span>
                <span className="text-xs text-gray-400">{checklistItems.length - totalFilled} belum diisi</span>
              </div>
            </div>
            <div className="px-6 py-4 space-y-5">
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={diisiOlehIA} onChange={() => setDiisiOlehIA(!diisiOlehIA)}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                  <span className="text-sm text-gray-900">Diperiksa oleh Issuing Authority (IA)</span>
                </label>
              </div>

              {/* Tabel Checklist */}
              <div className="rounded overflow-hidden border border-blue-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <th className="text-left text-blue-700 font-semibold px-4 py-3 w-8 text-sm">No</th>
                      <th className="text-left text-blue-700 font-semibold px-4 py-3 text-sm">Item Pemeriksaan</th>
                      <th className="text-center text-green-600 font-bold px-4 py-3 w-20 text-sm">YES</th>
                      <th className="text-center text-red-500 font-bold px-4 py-3 w-20 text-sm">NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklistItems.map((item, idx) => {
                      const val = checklist[idx];
                      return (
                        <tr key={idx} className={`border-b border-gray-100 transition-colors ${
                          val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}>
                          <td className="px-4 py-3 text-gray-900 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed">{item}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => toggleChecklist(idx, 'yes')}
                              className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                              }`}>
                              {val === 'yes' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => toggleChecklist(idx, 'no')}
                              className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                val === 'no' ? 'bg-red-500 border-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                              }`}>
                              {val === 'no' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tindakan Pencegahan Lainnya */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Tindakan Pencegahan Lainnya</label>
                <textarea
                  value={tindakanLainnya}
                  onChange={e => setTindakanLainnya(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan tindakan pencegahan tambahan jika ada..."
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 4 — Verifikasi Lapangan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#00b050', borderColor: '#009040' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 4 — Verifikasi Lapangan</span>
              <span className="text-xs text-white italic">Hanya Pemberi Kerja &amp; Penanggung Jawab</span>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-5 bg-blue-50 border border-blue-200 rounded px-4 py-3">
                <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-gray-900 leading-relaxed">
                  Kami yang bertanda tangan dibawah ini telah melakukan verifikasi di lapangan untuk pekerjaan yang dijelaskan di atas, dan seluruh pengendalian bahaya yang ditentukan telah dipenuhi.{' '}
                  <span className="text-blue-500 font-medium">Bagian ini hanya dapat diisi oleh Pemberi Kerja dan Penanggung Jawab.</span>
                </p>
              </div>
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
                <span className="text-sm text-white mr-1">Apakah pengukuran dan monitoring gas diperlukan:</span>
                {(['ya', 'tidak'] as const).map(opt => (
                  <button key={opt} onClick={() => setGasMonitoring(gasMonitoring === opt ? null : opt)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      gasMonitoring === opt
                        ? opt === 'ya' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}>
                    {opt === 'ya' ? 'Jika YA, gunakan form pemeriksaan kondisi gas' : 'Tidak'}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Hal-hal yang harus menjadi perhatian untuk keselamatan pekerjaan
                </p>
              </div>
              <div className="rounded-lg overflow-hidden border border-green-200 divide-y divide-green-100">
                {safetyNotes.map((text, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50'}`}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{text}</p>
                  </div>
                ))}
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
              <span className="text-xs font-bold text-black">Hijau Sebagai Arsip HSE</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-l border-yellow-200" style={{ backgroundColor: '#ffff00' }}>
              <span className="text-xs font-bold text-black">Kuning Sebagai Arsip SIKA Controller</span>
            </div>
          </div>

        </div>{/* akhir border wrapper */}

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