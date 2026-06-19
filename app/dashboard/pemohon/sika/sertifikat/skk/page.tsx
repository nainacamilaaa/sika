'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Users, Lock, CheckCircle } from 'lucide-react';

const checklistItemsPA = [
  'Lantai dudukan tiang scaffold rata',
  'Tanah cukup kuat untuk menahan tiang penyangga',
  'Tinggi perancah lebih dari 4 kali lebarnya',
  'Ada galian di dekat pemasangan perancah',
  'Ada pekerjaan lain dibawah dekat pemasangan perancah',
  'Sudah disiapkan tali untuk menaikkan dan menurunkan peralatan',
  'Sudah disiapkan keranjang untuk menaikkan dan menurunkan peralatan scaffold diperlukan',
  'Tambahan Persiapan',
];

const checklistItemsIA = [
  'Apakah menara memerlukan tambahan tiang penyangga',
  'Apakah papan pencegah jatuh pada lantai kerja perlu dipasang',
  'Apakah Safety Net perlu dipasang',
  'Apakah tali pembatas daerah perlu dipasang di sekeliling tempat kerja',
  'Apakah tanda keselamatan perlu dipasang',
  'Apakah keranjang peralatan di lantai kerja diperlukan',
  'Dipasang tanda standar pengelolaan perancah',
];

const jenisPerancah = [
  'Perancah diikat mandiri',
  'Sangkar burung/Birdcage',
  'Penyangga luar/Truss-out',
  'Diikat Sling/Slung scaffolds',
  'Penyangga lantai/Putlog',
  'Menara/Tower',
  'Tiang penyangga/Cantilever',
];

const safetyNotes = [
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
  'PASAL-5: PT Pertamina (Persero). Pastikan action/tindakan kerja selalu aman, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk/bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing.',
  'Pelaksana kerja melaporkan ke Field Operator/Pengawas (Proses) sebelum dan sesudah melaksanakan kegiatan, disarankan pelaksanaan dilakukan pada saat tidak banyak orang kerja atau aktivitas mandi berhenti untuk menghindari potensi bahaya dari tindakan LOW risk bahaya dengan kegiatan kerja.',
  'Perancah yang belum di inspeksi/belum dipasang label, DILARANG untuk digunakan.',
  'Perancah dan perlengkapannya yang sudah rusak DILARANG dipergunakan, perikendap bagian atas harus dipasang apabila terdapat potensi bahaya dari atas.',
  'Pijakan perancah harus kuat, keras dan mampu menahan beban maksimum, naikkan dan menurunkan material harus menggunakan tali.',
  'Semua material diatas perancah harus disimpan dengan aman dari kemungkinan jatuh.',
];

function ReadOnlyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-5 py-2.5">
      <label className="w-44 text-sm text-gray-700 shrink-0 font-medium pt-0.5">{label}</label>
      <span className="text-gray-300 shrink-0 pt-0.5">:</span>
      {multiline ? (
        <p className="flex-1 text-sm text-gray-900 leading-relaxed">{value || <span className="text-gray-300 italic">—</span>}</p>
      ) : (
        <p className="flex-1 text-sm text-gray-900">{value || <span className="text-gray-300 italic">—</span>}</p>
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
function CheckRow({ label, val, onToggle }: { label: string; val: 'yes' | 'no' | null; onToggle: (v: 'yes' | 'no') => void }) {
  return (
    <tr className={`border-b border-gray-100 transition-colors ${val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : 'bg-white'}`}>
      <td className="px-4 py-2.5 text-sm text-gray-800 leading-relaxed">{label}</td>
      <td className="px-3 py-2.5 text-center w-14">
        <button onClick={() => onToggle('yes')}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-all ${val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300'}`}>
          {val === 'yes' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </td>
      <td className="px-3 py-2.5 text-center w-14">
        <button onClick={() => onToggle('no')}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-all ${val === 'no' ? 'bg-red-500 border-red-500' : 'border-gray-200 hover:border-red-300'}`}>
          {val === 'no' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        </button>
      </td>
    </tr>
  );
}

export default function SKKPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled } = useProgramStore();
  const { user } = useAuthStore();

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  const [checklistPA, setChecklistPA] = useState<Record<number, 'yes' | 'no' | null>>(
    Object.fromEntries(checklistItemsPA.map((_, i) => [i, null]))
  );
  const [checklistIA, setChecklistIA] = useState<Record<number, 'yes' | 'no' | null>>(
    Object.fromEntries(checklistItemsIA.map((_, i) => [i, null]))
  );
  const [jenisPerancahChecked, setJenisPerancahChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(jenisPerancah.map((_, i) => [i, false]))
  );
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [berlakuHingga, setBerlakuHingga] = useState('');
  const [verifikasi, setVerifikasi] = useState<Record<string, string>>({
    paNama: '', paTanggal: '', iaNama: '', iaTanggal: '',
  });
  const [namaInspektur, setNamaInspektur] = useState('');
  const [noPekerja, setNoPekerja] = useState('');
  const [fungsiInspektur, setFungsiInspektur] = useState('');

  // Material fields
  const [materialFields, setMaterialFields] = useState({
    papanPanjang: '', papanLebar: '', papanTebal: '', papanJumlah: '',
    tanggaPanjang: '', tanggaLebar: '', tanggaTebal: '', tanggaJumlah: '',
    pipaPanjang: '', pipaDiameter: '', pipaTebal: '', pipaJumlah: '',
    clampJumlah: '', clampKgm: '',
    screwJumlah: '', screwKetinggian: '',
    basePlateJumlah: '', basePlateTempat: '',
    connectionPinJumlah: '', connectionPinPanjang: '',
  });

  const totalPA = Object.values(checklistPA).filter(v => v !== null).length;
  const totalIA = Object.values(checklistIA).filter(v => v !== null).length;
  const totalFilled = totalPA + totalIA;
  const totalItems = checklistItemsPA.length + checklistItemsIA.length;

  // Handler untuk Simpan
  const handleSimpan = () => {
    // Tandai sertifikat sebagai terisi di store
    markSertifikatFilled('Sertifikat Kerja Di Ketinggian (SKK)');
    
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
    markSertifikatFilled('Sertifikat Kerja di Ketinggian (SKK)');
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
          <span className="text-blue-800 font-semibold">SKK</span>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja di Ketinggian (SKK) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* HERO HEADER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-01W/B-003/PG0300/2026-S9</span>
          </div>
          <div className="flex border-t border-gray-200">
            <div className="flex items-center gap-3 px-5 py-4 border-r border-gray-200 shrink-0">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Rujukan SIKA No.</span>
              <input type="text" placeholder="..."
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 w-44 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
            </div>
            <div className="flex-1 flex items-center justify-center px-6 py-4" style={{ backgroundColor: '#0070c0' }}>
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Sertifikat Kerja di Ketinggian
              </h1>
            </div>
            <div className="flex items-center justify-center px-6 py-4 border-l border-gray-200 bg-white shrink-0" style={{ minWidth: '180px' }}>
              <img src="/logopertaminagas.svg" alt="Pertamina Gas" className="h-10 object-contain" />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">SKK</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${totalFilled === totalItems ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="text-xs text-gray-500">{totalFilled}/{totalItems} item checklist terisi</span>
            </div>
          </div>
        </div>

        {/* SATU BORDER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden divide-y divide-blue-200">

          {/* BAGIAN 1 */}
          <div className="flex items-stretch" style={{ minHeight: '48px' }}>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-5 py-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 1 — Tanggal Terbit</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={tanggalTerbit} onChange={(e) => setTanggalTerbit(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Jam Kerja</span>
              </div>
              <div className="flex items-center justify-center flex-1 gap-2 px-3">
                <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                <span className="text-sm text-gray-500 font-semibold shrink-0">s/d</span>
                <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Berlaku Hingga</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={berlakuHingga} onChange={(e) => setBerlakuHingga(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
          </div>

          <div className="h-3 bg-gray-100" />

          {/* BAGIAN 2 */}
          <div>
            <div className="bg-blue-100 px-5 py-4 border-b border-blue-200 flex items-center justify-between">
              <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Bagian 2 — Jenis Pekerjaan</span>
              <span className="text-xs text-blue-400 italic">Dilengkapi oleh Pelaksana Pekerjaan (PA)</span>
            </div>
            <div className="px-5 py-3 space-y-1">
              <div className="flex items-start gap-3 py-1.5">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Fungsi/Perusahaan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.fungsiPerusahaan || <span className="text-gray-300 italic">—</span>}</p>
              </div>
              <div className="flex items-start gap-3 py-1.5 border-t border-gray-100">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Lokasi/Instalasi</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.lokasiInstalasi || <span className="text-gray-300 italic">—</span>}</p>
                <label className="text-sm text-gray-700 shrink-0 font-medium ml-6">Peralatan/No. Identitas</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.peralatanNoIdentitas || <span className="text-gray-300 italic">—</span>}</p>
              </div>
              <div className="flex items-start gap-3 py-1.5 border-t border-gray-100">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Jumlah Pekerja</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="text-sm text-gray-900 mr-2">{sika?.pekerjaList?.length || '—'} orang, terdiri dari :</p>
                <div className="flex-1 flex flex-wrap gap-2">
                  {sika?.pekerjaList?.map((nama: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 bg-blue-50 rounded px-2 py-1 border border-blue-100">
                      <span className="w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-xs text-gray-800">{nama}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3 py-1.5 border-t border-gray-100">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Uraian pekerjaan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.uraianPekerjaan || <span className="text-gray-300 italic">—</span>}</p>
              </div>
              <div className="flex items-start gap-3 py-1.5 border-t border-gray-100">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Peralatan kerja yang akan digunakan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.peralatanDigunakan || <span className="text-gray-300 italic">—</span>}</p>
              </div>
            </div>
          </div>

          {/* BAGIAN 3 — Pemeriksaan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#FFFF00', borderColor: '#e6e600' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#000000' }}>Bagian 3 — Pemeriksaan</span>
              <span className="text-xs font-medium" style={{ color: '#555500' }}>Pemeriksaan terhadap material perancah</span>
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Jenis Perancah */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Jenis perancah yang akan dipasang :</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {jenisPerancah.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={jenisPerancahChecked[i] || false}
                        onChange={() => setJenisPerancahChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="w-3.5 h-3.5 accent-blue-600" />
                      <span className="text-sm text-gray-800">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inspektur */}
              <div className="bg-gray-50 rounded border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600 mb-2">Pemeriksaan terhadap material perancah dibawah ini telah dilakukan oleh petugas PT Pertamina Gas yang berwenang :</p>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 shrink-0">Nama :</span>
                    <input type="text" value={namaInspektur} onChange={e => setNamaInspektur(e.target.value)}
                      placeholder="Nama inspektur..." className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 w-40 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 shrink-0">No. Pekerja :</span>
                    <input type="text" value={noPekerja} onChange={e => setNoPekerja(e.target.value)}
                      placeholder="No..." className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 w-28 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 shrink-0">Fungsi :</span>
                    <input type="text" value={fungsiInspektur} onChange={e => setFungsiInspektur(e.target.value)}
                      placeholder="Fungsi..." className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 w-36 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Material Table */}
              <div className="rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#FFFF00' }}>
                      <th className="text-left px-3 py-2 text-xs font-bold text-gray-800 border-b border-gray-300 w-32">Material</th>
                      <th className="text-center px-2 py-2 text-xs font-bold text-green-700 border-b border-gray-300 w-16">Layak</th>
                      <th className="text-center px-2 py-2 text-xs font-bold text-red-600 border-b border-gray-300 w-20">Tidak Layak</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-gray-800 border-b border-gray-300">Spesifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: 'Papan', fields: ['Panjang', 'Lebar', 'Tebal', 'Jumlah'], unit: ['cm', 'cm', 'mm', 'buah'] },
                      { label: 'Tangga', fields: ['Panjang', 'Lebar', 'Tebal', 'Jumlah'], unit: ['cm', 'cm', 'mm', 'buah'] },
                      { label: 'Pipa perancah', fields: ['Panjang', 'Diameter', 'Tebal', 'Jumlah'], unit: ['cm', 'cm', 'mm', 'buah'] },
                      { label: 'Clamp', fields: ['Jumlah/Quantity', 'Perkiraan beban'], unit: ['buah', 'kg/m'] },
                      { label: 'Screw Jacks', fields: ['Jumlah/Quantity', 'Ketinggian Max'], unit: ['buah', 'm'] },
                      { label: 'Base Plate', fields: ['Jumlah/Quantity', 'Tempat kerja'], unit: ['buah', 'tingkat'] },
                      { label: 'Connection Pin', fields: ['Jumlah/Quantity', 'Panjang/lebar'], unit: ['buah', 'm'] },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-3 py-2 text-xs font-semibold text-gray-800">{row.label}</td>
                        <td className="px-2 py-2 text-center">
                          <input type="checkbox" className="w-3.5 h-3.5 accent-green-600" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <input type="checkbox" className="w-3.5 h-3.5 accent-red-500" />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {row.fields.map((field, j) => (
                              <div key={j} className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">{field} =</span>
                                <input type="text" placeholder="___"
                                  className="border-b border-gray-300 text-xs text-gray-900 w-14 px-1 focus:outline-none focus:border-blue-400 bg-transparent" />
                                <span className="text-xs text-gray-400">{row.unit[j]}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dua kolom checklist PA dan IA */}
              <div className="grid grid-cols-2 gap-4">
                {/* PA Checklist */}
                <div className="rounded border border-blue-200 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Diperiksa oleh Pelaksana Kerja (PA)</p>
                  </div>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Item</th>
                        <th className="text-center px-2 py-2 text-xs font-bold text-green-600 w-12">Yes</th>
                        <th className="text-center px-2 py-2 text-xs font-bold text-red-500 w-12">No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklistItemsPA.map((item, i) => (
                        <CheckRow key={i} label={item} val={checklistPA[i]}
                          onToggle={(v) => setChecklistPA(prev => ({ ...prev, [i]: prev[i] === v ? null : v }))} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* IA Checklist */}
                <div className="rounded border border-green-200 overflow-hidden">
                  <div className="px-4 py-2 border-b border-green-200" style={{ backgroundColor: '#00b050' }}>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Diisi oleh Petugas Keselamatan Kerja</p>
                  </div>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Item</th>
                        <th className="text-center px-2 py-2 text-xs font-bold text-green-600 w-12">Yes</th>
                        <th className="text-center px-2 py-2 text-xs font-bold text-red-500 w-12">No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklistItemsIA.map((item, i) => (
                        <CheckRow key={i} label={item} val={checklistIA[i]}
                          onToggle={(v) => setChecklistIA(prev => ({ ...prev, [i]: prev[i] === v ? null : v }))} />
                      ))}
                    </tbody>
                  </table>
                  {/* Nama Tanggal Tanda tangan row */}
                  <div className="border-t border-gray-200 grid grid-cols-3 divide-x divide-gray-200">
                    {['Nama', 'Tanggal', 'Tanda-tangan'].map((label) => (
                      <div key={label} className="px-3 py-2">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <input type="text" className="w-full border-b border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-transparent" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 4 — Verifikasi Lapangan */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#00b050', borderColor: '#009040' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 4 — Verifikasi Lapangan</span>
              <span className="text-xs text-white italic">Hanya Pemberi Kerja & Penanggung Jawab</span>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-5 bg-blue-50 border border-blue-200 rounded px-4 py-3">
                <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-gray-900 leading-relaxed">
                  Kami yang bertanda tangan dibawah ini telah melakukan verifikasi di lapangan untuk pekerjaan yang dijelaskan di atas, dan seluruh pengendalian bahaya yang dicetuskan telah dipenuhi.
                  {' '}<span className="text-blue-500 font-medium">Bagian ini hanya dapat diisi oleh Pemberi Kerja dan Penanggung Jawab.</span>
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
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#993366', borderColor: '#7a2952' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 5 — Kegiatan</span>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Hal-hal yang harus menjadi perhatian untuk keselamatan pekerjaan
                </p>
                <div className="rounded-lg overflow-hidden border border-green-200 divide-y divide-green-100">
                  {safetyNotes.map((text, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50/60'}`}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
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
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-l border-r border-blue-400">
              <span className="text-xs font-semibold text-black">Putih Sebagai Arsip Performing Authority (PA)</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3 border-r border-blue-400" style={{ backgroundColor: '#92d050' }}>
              <span className="text-xs font-bold text-black">Hijau Sebagai Arsip HSE</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-3" style={{ backgroundColor: '#ffff00' }}>
              <span className="text-xs font-bold text-black">Kuning Sebagai Arsip SIKA Controller</span>
            </div>
          </div>

        </div>

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