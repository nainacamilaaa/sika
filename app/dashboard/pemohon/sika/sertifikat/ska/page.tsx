'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Lock, CheckCircle } from 'lucide-react';

const safetyNotes = [
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
  'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk/bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
  'Selama melakukan kegiatan pengangkatan pengaturan cara regular.',
  'HINDARI mengangkat beban melebihi fasilitas yang hidup, properti pipa air bertekanan, kabel listrik, apabila hal tersebut HARUS dilakukan maka pengerjaan keselamatan yang cukup untuk melindungi bahaya harus dikerjakan.',
  'Rigger/Signalman diperlukan untuk pengangkatan beban yang kompleks dan sangat berat.',
  'Komunikasi dan koordinasi dengan operator/forklift terlibat diperlukan dan status diperlukan bila anda ragu.',
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

function YaTidak({ value, onChange }: { value: 'ya' | 'tidak' | null; onChange: (v: 'ya' | 'tidak') => void }) {
  return (
    <div className="flex items-center gap-3">
      {(['ya', 'tidak'] as const).map(opt => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={value === opt} onChange={() => onChange(opt)}
            className="w-3.5 h-3.5 accent-blue-600" />
          <span className="text-sm text-gray-800 capitalize">{opt === 'ya' ? 'Ya' : 'Tidak'}</span>
        </label>
      ))}
    </div>
  );
}

export default function SKAPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled } = useProgramStore();
  const { user } = useAuthStore();

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [berlakuHingga, setBerlakuHingga] = useState('');
  const [verifikasi, setVerifikasi] = useState<Record<string, string>>({ paNama: '', paTanggal: '', iaNama: '', iaTanggal: '' });
  const [gasMonitoring, setGasMonitoring] = useState<'ya' | 'tidak' | null>(null);

  // Bagian 3 fields
  const [jenisDerrick, setJenisDerrick] = useState('');
  const [namaOpera, setNamaOpera] = useState('');
  const [jenisBenda, setJenisBenda] = useState<Record<string, boolean>>({
    Peralatan: false, Tanki: false, Box: false, 'Tumpukan/Bulk': false, 'Lain-lain': false,
  });
  const [beratKotor, setBeratKotor] = useState('');
  const [beratTon, setBeratTon] = useState('');
  const [tanahStabil, setTanahStabil] = useState<'ya' | 'tidak' | null>(null);
  const [tindakanDiamt, setTindakanDiamt] = useState('');

  const [kegiatanLingkungan, setKegiatanLingkungan] = useState<Record<string, boolean>>({
    Bangunan: false, 'Instalasi hidup': false, Kendaraan: false, Peralatan: false, Jalan: false, Pekerja: false, 'Lain-lain': false,
  });
  const [keberadaanJalur, setKeberadaanJalur] = useState<Record<string, boolean>>({
    'Hidrokarbon (jalur minyak,gas,dll)': false, Jembatan: false, Struktur: false, 'Kabel Listrik': false,
  });
  const [jalurPipa, setJalurPipa] = useState<Record<string, boolean>>({
    Diisolasi: false, Dikuras: false, Dikunci: false, Dibongkar: false, Dilindungi: false,
  });
  const [jarakLebih15m, setJarakLebih15m] = useState<'ya' | 'tidak' | null>(null);
  const [safetyBriefing, setSafetyBriefing] = useState<'ya' | 'tidak' | null>(null);
  const [preJobMeeting, setPreJobMeeting] = useState<'ya' | 'tidak' | null>(null);
  const [tindakanPencegahan, setTindakanPencegahan] = useState<'ya' | 'tidak' | null>(null);
  const [tindakanLain, setTindakanLain] = useState('');
  const [riggingPlan, setRiggingPlan] = useState<'ya' | 'tidak' | null>(null);

  // Dere fields
  const [prosedurSesuai, setProsedurSesuai] = useState<'ya' | 'tidak' | null>(null);
  const [stabilizer, setStabilizer] = useState<'ya' | 'tidak' | null>(null);
  const [ujiBeban, setUjiBeban] = useState<'ya' | 'tidak' | null>(null);
  const [signalRigor, setSignalRigor] = useState<'ya' | 'tidak' | null>(null);
  const [signalRigorNama, setSignalRigorNama] = useState('');
  const [komunikasiAlat, setKomunikasiAlat] = useState<Record<string, boolean>>({ Verbal: false, Radio: false, Tanda: false });
  const [caraAngkat, setCara] = useState<Record<string, boolean>>({ Sling: false, 'Jala/Net': false, Rantai: false, 'Sabuk/Belt': false });
  const [jenisBeban, setJenisBeban] = useState<'ya' | 'tidak' | null>(null);
  const [jenisBebanCara, setJenisBebanCara] = useState('');
  const [jenisDataran, setJenisDataran] = useState<Record<string, boolean>>({ Batu: false, Pasir: false, Lumpur: false, Aspal: false, Beton: false, Timbunan: false });
  const [kondisiPermukaan, setKondisiPermukaan] = useState<Record<string, boolean>>({ Datar: false, Miring: false });
  const [bahanPermukaan, setBahanPermukaan] = useState('');
  const [penguatTumpuan, setPenguatTumpuan] = useState<'ya' | 'tidak' | null>(null);
  const [penguatLain, setPenguatLain] = useState<Record<string, boolean>>({ Kayu: false, 'Besi/Baja': false });

  // Dokumen
  const [dokumen, setDokumen] = useState<Record<string, boolean>>({
    Prosedur: false, 'Diagram beban derek': false, 'Alat kendali beban/Load Control': false,
  });
  const [sertifikat, setSertifikat] = useState<Record<string, boolean>>({
    'Peralatan angkat utama': false, 'Operator/SIO': false, 'Perlengkapan bantu angkat': false, Rigger: false,
  });
  const [tindakanLainDokumen, setTindakanLainDokumen] = useState('');

  // Handler untuk Simpan
  const handleSimpan = () => {
    // Tandai sertifikat sebagai terisi di store
    markSertifikatFilled('Sertifikat Kerja Pengangkatan (SKA)');
    
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
    markSertifikatFilled('Sertifikat Kerja Pengangkatan (SKA)');
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
          <span className="text-blue-800 font-semibold">SKA</span>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja Pengangkatan (SKA) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* HERO HEADER */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-017/B-003/PG0300/2026-S9</span>
          </div>
          <div className="flex border-t border-gray-200">
            <div className="flex items-center gap-3 px-5 py-4 border-r border-gray-200 shrink-0">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Rujukan SIKA No.</span>
              <input type="text" placeholder="..."
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 w-44 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
            </div>
            <div className="flex-1 flex items-center justify-center px-6 py-4" style={{ backgroundColor: '#00b050' }}>
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Sertifikat Kerja Pengangkatan
              </h1>
            </div>
            <div className="flex items-center justify-center px-6 py-4 border-l border-gray-200 bg-white shrink-0" style={{ minWidth: '180px' }}>
              <img src="/logopertaminagas.svg" alt="Pertamina Gas" className="h-10 object-contain" />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-green-50 border-t border-green-200 flex items-center justify-between">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">SKA</span>
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
                <input type="date" value={tanggalTerbit} onChange={e => setTanggalTerbit(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Jam Kerja</span>
              </div>
              <div className="flex items-center justify-center flex-1 gap-2 px-3">
                <input type="time" value={jamMulai} onChange={e => setJamMulai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                <span className="text-sm text-gray-500 font-semibold shrink-0">s/d</span>
                <input type="time" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
              </div>
            </div>
            <div className="flex flex-1">
              <div className="flex items-center justify-center px-4 border-r border-blue-200 bg-blue-100 shrink-0">
                <span className="text-blue-700 font-bold text-xs tracking-wide uppercase whitespace-nowrap">Berlaku Hingga</span>
              </div>
              <div className="flex items-center justify-center flex-1 px-3">
                <input type="date" value={berlakuHingga} onChange={e => setBerlakuHingga(e.target.value)}
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
            <div className="divide-y divide-gray-100 px-5 py-1">
              <div className="flex items-center gap-3 py-2.5">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Fungsi/Perusahaan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.fungsiPerusahaan || <span className="text-gray-300 italic">—</span>}</p>
                <label className="text-sm text-gray-700 shrink-0 font-medium ml-4">Jumlah Pekerja</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="text-sm text-gray-900 mr-1">{sika?.pekerjaList?.length || '—'}</p>
                <span className="text-sm text-gray-500">orang, terdiri dari :</span>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Lokasi/Instalasi</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.lokasiInstalasi || <span className="text-gray-300 italic">—</span>}</p>
                <label className="text-sm text-gray-700 shrink-0 font-medium ml-4">Peralatan/No. Identitas</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.peralatanNoIdentitas || <span className="text-gray-300 italic">—</span>}</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Uraian pekerjaan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900 leading-relaxed">{sika?.uraianPekerjaan || <span className="text-gray-300 italic">—</span>}</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <label className="w-44 text-sm text-gray-700 shrink-0 font-medium">Peralatan kerja yang akan digunakan</label>
                <span className="text-gray-300 shrink-0">:</span>
                <p className="flex-1 text-sm text-gray-900">{sika?.peralatanDigunakan || <span className="text-gray-300 italic">—</span>}</p>
              </div>
            </div>
          </div>

          {/* BAGIAN 3 */}
          <div>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#FFFF00', borderColor: '#e6e600' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#000000' }}>Bagian 3 — Pemeriksaan</span>
              <span className="text-xs font-medium text-gray-600">Item berikut harus dipastikan sebelum mulai kerja</span>
            </div>

            <div className="px-5 py-4 space-y-5">

              {/* DATA BEBAN */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-yellow-200" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2 bg-yellow-50 rounded">Data Beban dan Operasi Pengangkatan</span>
                  <div className="h-px flex-1 bg-yellow-200" />
                </div>
                <div className="text-xs text-gray-500 italic mb-3">Diisi oleh Pelaksana Kerja / Performing Authority (PA)</div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">1</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Jenis derek/alat angkat/alat be</span>
                    <input type="text" value={jenisDerrick} onChange={e => setJenisDerrick(e.target.value)}
                      placeholder="Jenis derek..." className="flex-1 border-b border-gray-300 text-sm text-gray-900 px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                    <span className="text-sm text-gray-700 font-semibold shrink-0 ml-4">Nama Opera</span>
                    <input type="text" value={namaOpera} onChange={e => setNamaOpera(e.target.value)}
                      className="w-40 border-b border-gray-300 text-sm text-gray-900 px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">2</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Jenis benda yang diangkat :</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(jenisBenda).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={jenisBenda[k]} onChange={() => setJenisBenda(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">3</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Berat kotor beban (beban + sling + aksesoris dll)</span>
                    <input type="text" value={beratKotor} onChange={e => setBeratKotor(e.target.value)}
                      placeholder="Kg" className="w-24 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                    <span className="text-sm text-gray-600">Kg</span>
                    <input type="text" value={beratTon} onChange={e => setBeratTon(e.target.value)}
                      placeholder="Ton" className="w-24 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                    <span className="text-sm text-gray-600">Ton</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">4</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Tanah stabil / tidak stabil</span>
                    <YaTidak value={tanahStabil} onChange={v => setTanahStabil(p => p === v ? null : v)} />
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1"> </span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Tindak pencegahan yang diamt :</span>
                    <input type="text" value={tindakanDiamt} onChange={e => setTindakanDiamt(e.target.value)}
                      className="flex-1 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">5</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Selama kegiatan, boom/beban akan melintas :</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(kegiatanLingkungan).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={kegiatanLingkungan[k]} onChange={() => setKegiatanLingkungan(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">6</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Keberadaan di jalur dan daerah operasi pengangkatan:</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(keberadaanJalur).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={keberadaanJalur[k]} onChange={() => setKeberadaanJalur(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">7</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Jalur pipa, jalur listrik, struktur harus:</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(jalurPipa).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={jalurPipa[k]} onChange={() => setJalurPipa(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">8</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Jarak dari peralatan angkat dan jalur bertegangan tinggi lebih dari 15m</span>
                    <YaTidak value={jarakLebih15m} onChange={v => setJarakLebih15m(p => p === v ? null : v)} />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">9</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Dilakukan pemberitahuan Safety Briefing kepada semua pekerja dan dipasang safety line di sekitar lokasi pengangkatan</span>
                    <YaTidak value={safetyBriefing} onChange={v => setSafetyBriefing(p => p === v ? null : v)} />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">10</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Pre Job Meeting diperlukan</span>
                    <YaTidak value={preJobMeeting} onChange={v => setPreJobMeeting(p => p === v ? null : v)} />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">11</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Tindakan pencegahan telah dilakukan</span>
                    <YaTidak value={tindakanPencegahan} onChange={v => setTindakanPencegahan(p => p === v ? null : v)} />
                    <input type="text" value={tindakanLain} onChange={e => setTindakanLain(e.target.value)}
                      placeholder="Lain-lain..." className="flex-1 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">12</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Rigging / Lifting Plan diperlukan</span>
                    <YaTidak value={riggingPlan} onChange={v => setRiggingPlan(p => p === v ? null : v)} />
                  </div>
                </div>
              </div>

              {/* DATA OPERASI DAN DERE */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-green-200" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2 bg-green-50 rounded">Data Operasi dan Dere</span>
                  <div className="h-px flex-1 bg-green-200" />
                </div>
                <div className="text-xs text-gray-500 italic mb-3">Diisi oleh Pengawas Pelaksana Pengangkatan</div>

                <div className="space-y-3">
                  {[
                    { no: 1, label: 'Apakah prosedur sesuai dengan alat angkat sesuai dalam diagram bebannya?', state: prosedurSesuai, setter: setProsedurSesuai },
                    { no: 2, label: 'Apakah stabilizator perlu dipakai?', state: stabilizer, setter: setStabilizer },
                    { no: 3, label: 'Apakah perlu dilakukan uji beban?', state: ujiBeban, setter: setUjiBeban },
                  ].map(({ no, label, state, setter }) => (
                    <div key={no} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">{no}</span>
                      <span className="text-sm text-gray-800 w-64 shrink-0">{label}</span>
                      <YaTidak value={state} onChange={v => setter((p: any) => p === v ? null : v)} />
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">4</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Apakah diperlukan Signalor/Rigor ?</span>
                    <YaTidak value={signalRigor} onChange={v => setSignalRigor(p => p === v ? null : v)} />
                    <span className="text-sm text-gray-600 ml-2">Jika Ya, tulis nama Signalor/Rigger:</span>
                    <input type="text" value={signalRigorNama} onChange={e => setSignalRigorNama(e.target.value)}
                      className="flex-1 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">5</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Bagaimana komunikasi antara alat dan operator :</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(komunikasiAlat).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={komunikasiAlat[k]} onChange={() => setKomunikasiAlat(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">6</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Bagaimana beban diikat?</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(caraAngkat).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={caraAngkat[k]} onChange={() => setCara(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">7</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Apakah beban harus dituntun? Dengan cara apa?</span>
                    <YaTidak value={jenisBeban} onChange={v => setJenisBeban(p => p === v ? null : v)} />
                    <input type="text" value={jenisBebanCara} onChange={e => setJenisBebanCara(e.target.value)}
                      placeholder="Cara..." className="flex-1 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">8</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0 mt-1">Apa jenis tanah dimana alat angkat akan bertumpu?</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(jenisDataran).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={jenisDataran[k]} onChange={() => setJenisDataran(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1"> </span>
                    <span className="text-sm text-gray-600 w-64 shrink-0 mt-1 italic">Kondisi Permukaan:</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(kondisiPermukaan).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={kondisiPermukaan[k]} onChange={() => setKondisiPermukaan(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">9</span>
                    <span className="text-sm text-gray-800 w-64 shrink-0">Apakah penguat tumpuan diperlukan?</span>
                    <YaTidak value={penguatTumpuan} onChange={v => setPenguatTumpuan(p => p === v ? null : v)} />
                    <div className="flex gap-3 ml-2">
                      {Object.keys(penguatLain).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={penguatLain[k]} onChange={() => setPenguatLain(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* DOKUMEN DAN SERTIFIKAT */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-blue-200" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2 bg-blue-50 rounded">Dokumen dan Sertifikat</span>
                  <div className="h-px flex-1 bg-blue-200" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">1</span>
                    <span className="text-sm text-gray-800 w-44 shrink-0 mt-1">Dokumen yang dibutuhkan</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(dokumen).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={dokumen[k]} onChange={() => setDokumen(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0 mt-1">2</span>
                    <span className="text-sm text-gray-800 w-44 shrink-0 mt-1">Sertifikat yang dibutuhkan (Masih berlaku)</span>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(sertifikat).map(k => (
                        <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={sertifikat[k]} onChange={() => setSertifikat(p => ({ ...p, [k]: !p[k] }))}
                            className="w-3.5 h-3.5 accent-blue-600" />
                          <span className="text-sm text-gray-800">{k}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-5 shrink-0"> </span>
                    <span className="text-sm text-gray-800 w-44 shrink-0">Tindakan Pencegahan Lain:</span>
                    <input type="text" value={tindakanLainDokumen} onChange={e => setTindakanLainDokumen(e.target.value)}
                      className="flex-1 border-b border-gray-300 text-sm px-1 py-0.5 focus:outline-none focus:border-blue-400 bg-transparent" />
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
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: '#993366', borderColor: '#7a2952' }}>
              <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap" style={{ color: '#ffffff' }}>Bagian 5 — Kegiatan</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">Apakah pengukuran dan monitoring gas diperlukan:</span>
                {(['ya', 'tidak'] as const).map(opt => (
                  <button key={opt} onClick={() => setGasMonitoring(p => p === opt ? null : opt)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      gasMonitoring === opt
                        ? opt === 'ya' ? 'bg-white text-green-700 border-white' : 'bg-white text-red-600 border-white'
                        : 'bg-transparent border-white/40 text-white/70 hover:border-white hover:text-white'
                    }`}>
                    {opt === 'ya' ? 'YA — gunakan form pemeriksaan' : 'Tidak'}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-5">
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