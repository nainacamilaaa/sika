'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Users, Lock, CheckCircle } from 'lucide-react';

const kondisiItems = [
  'Peralatan secara fisik diisolasi dari semua sumber bahaya',
  'Ruangan sudah diisolir/diikat atau dilepas dari sistem',
  'Peralatan sudah dikuras dan diventilasi.',
  'Semua lumpur endapan lainnya sudah dihilangkan.',
  'Penggerak mekanik sudah diputuskan.',
  'Sirkuit listrik sudah dikunci dalam posisi off (LO-TO)',
  'Udara sudah dites awal (sebelum masuk ruang tertutup)',
  'Udara sudah bebas dari bahan beracun dan mudah terbakar.',
  'Disediakan ventilasi basah.',
  'Sistem inerting disolasi.',
  'Tersedia cukup udara segar pada lokasi kerja.',
  'Perencanaan penyelamatan ada di lokasi kerja.',
];

const pencegahanItems = [
  'Menghubungi Operator',
  'Menggunakan sarung tangan dan baju pelindung, tipe khusus (sebutkan bila Ya)',
  'Menggunakan sabuk pengaman/harness dan tali penghubung',
  'Menggunakan alat bantu pernapasan tipe (bila Ya sebutkan tipe)',
  'Semua Peralatan & Alat kerja telah di-grounding / bonding',
  'Menggunakan lampu tahan api dan aman.',
  'Sistem komunikasi tersedia/berfungsi.',
  'Menggunakan pelindung mata, tipe khusus (sebutkan bila Ya)',
  'Menggunakan pelindung kepala, tipe khusus (sebutkan bila Ya)',
  'Petugas jaga dan papan kontrol selalu di lokasi dan diperbarui sesuai kondisi',
  'Dilakukan briefing / tool box meeting tatacara kerja aman',
];

const safetyNotes = [
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
  'PASAL-5: P=Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk / bisa diterima — lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
  'Pekerja yang kompeten dan berpengalaman serta paham mengikuti atau mendapatkan penjelasan tentang bahaya-bahaya bekerja di dalam ruang tertutup.',
  'Bila ruangan memungkinkan lakukan pekerjaan ini dari luar dan pastikan ada satu orang pengawas berjaga diluar yang memonitor kegiatan dengan peralatan yang cukup, yang sewaktu-waktu siap melakukan pertolongan jika dibutuhkan.',
  'Gunakan lifeline/tali penyelamatan/rescure untuk dipergunakan apabila diperlukan untuk penyelamatan dalam kondisi darurat.',
  'Apabila dipandang perlu (tergantung dari kompleksitas dan besarnya risiko) dapat ditambahkan tim rescue dengan perlengkapannya di lokasi kerja, untuk keperluan emergency rescue.',
  'Selama melakukan pekerjaan di dalam ruangan tertutup maka harus dilakukan monitoring kondisi udara di dalamnya untuk memastikan kecukupannya untuk bernafas (min 20% O2).',
  'Lakukan pemeriksaan kondungan udara setiap akan memasuki ruangan tertutup dan setelah istirahat siang.',
  'Buat/catat nama orang-orang yang masuk kedalam ruang tertutup/bejana dan tuliskan pada papan kontrol, pastikan catatan tersebut selalu terbaharui.',
  'Amankan lokasi/tempat masuk/keluar ruang tertutup apabila akan istirahat atau ditunda untuk pekerjaan kesokan harinya. Pasang tanda peringatan "DILARANG MASUK BERBAHAYA".',
  'Pasang barricade/diskelling lokasi kerja untuk memastikan hanya pekerja yang berkepentingan yang diijinkan berada di lokasi kerja.',
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
            onChange={(e) => canEdit && setVerifikasi((prev) => ({ ...prev, [tanggalKey]: e.target.value }))}
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
const allItems = [...kondisiItems, ...pencegahanItems];

export default function SKRTPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled } = useProgramStore();
  const { user } = useAuthStore();

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  const [checklist, setChecklist] = useState<Record<number, CheckVal>>(
    Object.fromEntries(allItems.map((_, i) => [i, null]))
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
  
  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  // Gas tester fields
  const [gasTesterNama, setGasTesterNama] = useState('');
  const [gasTesterNoSertif, setGasTesterNoSertif] = useState('');
  const [gasO2, setGasO2] = useState('');
  const [gasExplosive, setGasExplosive] = useState('');
  const [gasCO2, setGasCO2] = useState('');
  const [gasCO, setGasCO] = useState('');
  const [gasH2S, setGasH2S] = useState('');
  const [gasLainnya, setGasLainnya] = useState('');

  const toggleChecklist = (index: number, val: 'yes' | 'no') => {
    setChecklist((prev) => ({ ...prev, [index]: prev[index] === val ? null : val }));
  };

  const yesCount   = Object.values(checklist).filter(v => v === 'yes').length;
  const noCount    = Object.values(checklist).filter(v => v === 'no').length;
  const totalFilled = yesCount + noCount;

  // Handler untuk Simpan
  const handleSimpan = () => {
    // Tandai sertifikat sebagai terisi di store
    markSertifikatFilled('Sertifikat Kerja Ruang Terbatas (SKRT)');
    
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
    markSertifikatFilled('Sertifikat Kerja Ruang Terbatas (SKRT)');
    router.push('/dashboard/pemohon/sika/pemeriksaan');
  };

  function ChecklistTable({
    items,
    offset,
  }: {
    items: string[];
    offset: number;
  }) {
    return (
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
            {items.map((item, idx) => {
              const i = offset + idx;
              const val = checklist[i];
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 transition-colors ${
                    val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-3 text-gray-900 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed">{item}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleChecklist(i, 'yes')}
                      className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                        val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {val === 'yes' && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleChecklist(i, 'no')}
                      className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                        val === 'no' ? 'bg-red-500 border-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {val === 'no' && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

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
          <span className="text-blue-800 font-semibold">SKRT</span>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja Ruang Terbatas (SKRT) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* HERO HEADER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-013/B-003/PG0300/2026-S9</span>
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
            <div style={{ flex: 3, backgroundColor: '#6b7280', minHeight: '80px' }} className="flex items-center justify-center px-6 py-4">
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Sertifikat Kerja Ruang Terbatas
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
            <div className={`w-2 h-2 rounded-full ${totalFilled === allItems.length ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs text-gray-500">{totalFilled}/{allItems.length} item checklist terisi</span>
          </div>
        </div>

        {/* ═══ SATU BORDER WRAPPER ═══ */}
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
              <span className="text-xs text-blue-400 italic">Data dari Jenis Pekerjaan (read-only)</span>
            </div>
            <div className="divide-y divide-gray-100">
              <ReadOnlyField label="Fungsi / Perusahaan"       value={sika?.fungsiPerusahaan || ''} />
              <ReadOnlyField label="Lokasi / Instalasi"        value={sika?.lokasiInstalasi || ''} />
              <ReadOnlyField label="Peralatan / No. Identitas" value={sika?.peralatanNoIdentitas || ''} />
              <ReadOnlyField label="Jumlah Pekerja"            value={sika?.pekerjaList?.length ? `${sika.pekerjaList.length} orang` : ''} />
              <ReadOnlyField label="Uraian Pekerjaan"          value={sika?.uraianPekerjaan || ''} multiline />
              <ReadOnlyField label="Peralatan Digunakan"       value={sika?.peralatanDigunakan || ''} multiline />
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
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#000000' }}>Bagian 3 — Pemeriksaan</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Yes: {yesCount}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> No: {noCount}
                </span>
                <span className="text-xs text-gray-400">{allItems.length - totalFilled} belum diisi</span>
              </div>
            </div>
            <div className="px-6 py-4 space-y-5">
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={diisiOlehIA} onChange={() => setDiisiOlehIA(!diisiOlehIA)}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                  <span className="text-sm text-gray-900">Diisi oleh Issuing Authority (IA)</span>
                </label>
              </div>

              {/* Sub: Kondisi Peralatan */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded">Kondisi Peralatan</span>
                </div>
                <ChecklistTable items={kondisiItems} offset={0} />
              </div>

              {/* Sub: Pengetesan Kondisi Udara Awal */}
              <div className="rounded overflow-hidden border border-blue-200">
                <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-200">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Pengetesan Kondisi Udara Awal</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-blue-100">
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-sm text-gray-700 font-medium block mb-1">Diisi oleh Gas Tester bersertifikat (Certified Gas Tester)</label>
                      <input type="text" value={gasTesterNama} onChange={(e) => setGasTesterNama(e.target.value)}
                        placeholder="Nama Gas Tester..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 font-medium block mb-1">Nama</label>
                      <input type="text" placeholder="Nama lengkap..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-sm text-gray-700 font-medium block mb-1">Tanda Tangan</label>
                      <div className="border-2 border-dashed border-blue-200 bg-white rounded h-14 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition">
                        <span className="text-sm text-blue-300">Klik untuk tanda tangan</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 font-medium block mb-1">No. Sertifikat</label>
                      <input type="text" value={gasTesterNoSertif} onChange={(e) => setGasTesterNoSertif(e.target.value)}
                        placeholder="No. Sertifikat..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border-t border-blue-200 p-4">
                  <label className="text-sm font-semibold text-blue-700 block mb-3">Hasil Pemeriksaan Awal (%)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'O2', val: gasO2, set: setGasO2, placeholder: '%' },
                      { label: 'GAS EXPLOSIVE', val: gasExplosive, set: setGasExplosive, placeholder: '%' },
                      { label: 'CO2', val: gasCO2, set: setGasCO2, placeholder: 'ppm' },
                      { label: 'CO', val: gasCO, set: setGasCO, placeholder: 'ppm' },
                      { label: 'H2S', val: gasH2S, set: setGasH2S, placeholder: 'ppm' },
                      { label: 'Lainnya', val: gasLainnya, set: setGasLainnya, placeholder: '...' },
                    ].map(({ label, val, set, placeholder }) => (
                      <div key={label} className="bg-white border border-blue-200 rounded p-2.5">
                        <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>
                        <input 
                          type={label === 'Lainnya' ? 'text' : 'number'} 
                          value={val} 
                          onChange={(e) => set(e.target.value)}
                          placeholder={placeholder}
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" 
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic mt-3">Catatan: Gunakan lembar monitoring gas secara terpisah untuk memonitor perubahan kondisi kerja.</p>
                </div>
              </div>

              {/* Sub: Pencegahan Khusus */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded">Pencegahan Khusus yang Dilakukan</span>
                </div>
                <ChecklistTable items={pencegahanItems} offset={kondisiItems.length} />
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
                  Kami yang bertanda tangan dibawah ini telah melakukan verifikasi di lapangan untuk pekerjaan yang dijelaskan di atas, dan seluruh pengendalian bahaya yang dicetuskan telah dipenuhi.{' '}
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
                <span className="text-sm text-white mr-1">Pengukuran &amp; monitoring gas:</span>
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