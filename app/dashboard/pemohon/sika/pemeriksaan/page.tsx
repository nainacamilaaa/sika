'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

const CheckItem = ({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 shrink-0 accent-blue-600 cursor-pointer"
    />
    <span className="text-xs text-gray-700 group-hover:text-gray-900 leading-tight whitespace-nowrap">{label}</span>
  </label>
);

export default function SikaPemeriksaanPage() {
  const router = useRouter();

  const isolasiCol1 = ['Electrical Circuits', 'Gas Valve', 'Water Valves'];
  const isolasiCol2 = ['Air Instrument Valves', 'Mekanik', 'Pneumatic/Hydraulic'];
  const [isolasi, setIsolasi] = useState<string[]>([]);

  const lampiranCol1 = ['JSA', 'TKO, TKI, TKPA', 'P&ID, Underground Maps'];
  const lampiranCol2 = ['Koordinator PLN', 'Koordinator Telcom', 'Koordinator PDAM'];
  const lampiranCol3 = ['Koordinator BPJN', 'BA Sosialisasi', 'Perizinan Lahan'];
  const [lampiran, setLampiran] = useState<string[]>([]);

  const identifikasiCol1 = [
    'Gas Lemas, mudah terbakar/beracun', 'Kekurangan Oksigen',
    'Nyala Api/Kebakaran/Ledakan', 'Bising',
    'Bahan berbahaya dan beracun', 'Peralatan jalan/listrik hidup/tersengat',
    'Mesin bergetar/berputar',
  ];
  const identifikasiCol2 = [
    'Cairan/gas bertekanan', 'Longsoran',
    'Benda bergerak/mesin yang berputar', 'Pengangkatan benda berat',
    'Kerja di ketinggian', 'Radiasi radioaktif', 'Kontaminasi tanah',
  ];
  const identifikasiCol3 = [
    'Temperatur ekstrim (dingin/panas)', 'Pengangkatan manual/alat angkat',
    'Ruang terbatas/kekurangan oksigen', 'Bahaya pencemaran lingkungan',
    'Faktor ergonomis', 'Paparan debu', 'Dampak visual',
  ];
  const identifikasiCol4 = [
    'Biohazard', 'Iritasi mata/kulit', 'Gangguan pernapasan',
    'Faktor fisik/biologis', 'Gangguan keamanan', 'Pencurian',
  ];
  const [identifikasi, setIdentifikasi] = useState<string[]>([]);
  const [identifikasiTambahan, setIdentifikasiTambahan] = useState('');

  const pengendalianCol1 = [
    'HSE Plan', 'Topi/Sepatu/Coverall keselamatan',
    'Kacamata keselamatan yang sesuai', 'Pelindung telinga yang sesuai',
    'Sarung tangan keselamatan', 'Harness/tali pengaman',
    'Masker debu/gas', 'Masker kimia', 'Tali pembatas daerah', 'Absoren',
    'Peralatan disolasi/dilepas', 'Pengetesan gas sebelum mulai kerja (LEL, O2, Toxic)',
    'Tanda Keselamatan', 'Tambahan lampu penerangan',
    'Scaffolding/perancah/tangga', 'Pos Pemeriksaan (barang dan data pribadi)',
  ];
  const pengendalianCol2 = [
    'Pengetesan HC gas secara teratur', 'Alat anti percikan api (Anti Sparks Tool)',
    'Tanda peringatan/rintangan', 'Peralatan tanpa tekanan',
    'Peralatan dikosongkan/dibersihkan(flushing)', 'Tempat kerja di-ventilasi',
    'PPE sand blasting', 'Alat bantu pernapasan udara tekan',
    'Tirai pelindung semprotan pasir', 'PPE bahan kimia',
    'Alat penampung cairan B3', 'Lapor kepada petugas keamanan',
    'Lapisan penahan percikan las', 'Tirai pelindung percikan las',
    'Tirai air di perlukan', 'Peralatan di-purging dengan N₂',
  ];
  const pengendalianCol3 = [
    'Bebas dari endapan yang eksplosif/toxic',
    'Didinginkan secara mekanis',
    'Memenuhi persyaratan sertifikat kerja',
  ];
  const [pengendalian, setPengendalian] = useState<string[]>([]);
  const [permintaanTambahan, setPermintaanTambahan] = useState('');

  const [showModal, setShowModal] = useState(false);
  const sertifikatCol1 = [
    'Sertifikat Kerja Panas (SKP)', 'Sertifikat Kerja Dingin (SKD)',
    'Sertifikat Kerja Ruang Terbatas (SKRT)', 'Sertifikat Kerja Radiografi (SKR)',
    'Sertifikat Kerja Isolasi Listrik (SKL)',
  ];
  const sertifikatCol2 = [
    'Sertifikat Kerja Penggalian (SKG)', 'Sertifikat Kerja Pengangkatan (SKA)',
    'Sertifikat Kerja Pemasangan Perancah (SKPP)', 'Sertifikat Kerja Pengembalian Fotografi (SKPF)',
  ];
  const [sertifikat, setSertifikat] = useState<string[]>([]);
  const [sertifikatFiles, setSertifikatFiles] = useState<File[]>([]);
  const [sifatPekerjaan, setSifatPekerjaan] = useState('');
  const sifatOptions = ['Normal', 'Proyek', 'T/A', 'Emergency'];

  const toggleSertifikat = (val: string) =>
    setSertifikat((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    if (!val) return;
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ paddingLeft: '30px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => router.push('/dashboard/pemohon/sika/new')}>JENIS PEKERJAAN</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 font-semibold">PEMERIKSAAN</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => router.push('/dashboard/pemohon/sika/formulir')}>FORMULIR SIKA</span>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">

        {/* ROW 1: ISOLASI + LAMPIRAN */}
        <div className="grid grid-cols-2 gap-4">

          {/* ISOLASI PERALATAN */}
          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-bold text-xs tracking-wide">ISOLASI PERALATAN</span>
            </div>
            <div className="px-6 py-5">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 48px' }}>
                {[...isolasiCol1, ...isolasiCol2].map((opt) => (
                  <CheckItem key={opt} label={opt} checked={isolasi.includes(opt)} onChange={() => toggle(isolasi, setIsolasi, opt)} />
                ))}
              </div>
            </div>
          </div>

          {/* LAMPIRAN MANDATORY */}
          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-bold text-xs tracking-wide">LAMPIRAN (MANDATORY)</span>
            </div>
            <div className="px-6 py-5">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 32px' }}>
                {[...lampiranCol1, ...lampiranCol2, ...lampiranCol3].map((opt) => (
                  <CheckItem key={opt} label={opt} checked={lampiran.includes(opt)} onChange={() => toggle(lampiran, setLampiran, opt)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IDENTIFIKASI BAHAYA */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-xs tracking-wide">IDENTIFIKASI BAHAYA</span>
          </div>
          <div className="px-6 py-5">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 40px' }}>
              {identifikasiCol1.map((item) => (
                <CheckItem key={item} label={item} checked={identifikasi.includes(item)} onChange={() => toggle(identifikasi, setIdentifikasi, item)} />
              ))}
              {identifikasiCol2.map((item) => (
                <CheckItem key={item} label={item} checked={identifikasi.includes(item)} onChange={() => toggle(identifikasi, setIdentifikasi, item)} />
              ))}
              {identifikasiCol3.map((item) => (
                <CheckItem key={item} label={item} checked={identifikasi.includes(item)} onChange={() => toggle(identifikasi, setIdentifikasi, item)} />
              ))}
              {identifikasiCol4.map((item) => (
                <CheckItem key={item} label={item} checked={identifikasi.includes(item)} onChange={() => toggle(identifikasi, setIdentifikasi, item)} />
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">Identifikasi Tambahan:</label>
              <input type="text" value={identifikasiTambahan} onChange={(e) => setIdentifikasiTambahan(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        {/* PENGENDALIAN BAHAYA */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-5 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-xs tracking-wide">PENGENDALIAN BAHAYA</span>
          </div>
          <div className="px-6 py-5">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 40px' }}>
              {pengendalianCol1.map((item) => (
                <CheckItem key={item} label={item} checked={pengendalian.includes(item)} onChange={() => toggle(pengendalian, setPengendalian, item)} />
              ))}
              {pengendalianCol2.map((item) => (
                <CheckItem key={item} label={item} checked={pengendalian.includes(item)} onChange={() => toggle(pengendalian, setPengendalian, item)} />
              ))}
              {pengendalianCol3.map((item) => (
                <CheckItem key={item} label={item} checked={pengendalian.includes(item)} onChange={() => toggle(pengendalian, setPengendalian, item)} />
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">Permintaan Tambahan:</label>
              <input type="text" value={permintaanTambahan} onChange={(e) => setPermintaanTambahan(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 py-2">
          <button
            onClick={() => router.push('/dashboard/pemohon/sika/new')}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition shadow-md shadow-red-200"
          >
            Back
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-180 max-w-[95vw] overflow-hidden">
            <div className="bg-blue-100 px-6 py-4 flex items-center justify-between border-b border-blue-200">
              <div>
                <p className="text-blue-700 font-bold text-base tracking-wide">Formulir SIKA</p>
                <p className="text-blue-500 text-xs">Surat Izin Kerja Aman</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 hover:bg-blue-200 rounded-full flex items-center justify-center transition">
                <X size={16} className="text-blue-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  <p className="text-sm font-bold text-gray-800">Sertifikat Kerja yang Diperlukan</p>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[...sertifikatCol1, ...sertifikatCol2].map((item) => (
                    <label key={item} className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 transition-all border ${sertifikat.includes(item) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'}`}>
                      <input type="checkbox" checked={sertifikat.includes(item)} onChange={() => toggleSertifikat(item)} className="w-4 h-4 shrink-0 accent-blue-600 cursor-pointer" />
                      <span className={`text-xs font-medium leading-tight ${sertifikat.includes(item) ? 'text-blue-700' : 'text-gray-600'}`}>{item}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-8">
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-300 rounded-xl py-5 px-4 cursor-pointer bg-white hover:bg-blue-50/40 transition-all group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
                      const valid = dropped.filter(f => f.size <= 10 * 1024 * 1024);
                      setSertifikatFiles(prev => [...prev, ...valid].slice(0, 20));
                    }}>
                    <input type="file" accept=".pdf" multiple className="hidden"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []).filter(f => f.size <= 10 * 1024 * 1024);
                        setSertifikatFiles(prev => [...prev, ...picked].slice(0, 20));
                        e.target.value = '';
                      }} />
                    <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mb-2 transition">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">Klik atau seret file PDF ke sini</p>
                    <p className="text-xs text-gray-400 mt-0.5">Format PDF • Maks. 10 MB per file</p>
                  </label>

                  {sertifikatFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {sertifikatFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-red-100 rounded flex items-center justify-center shrink-0">
                              <span className="text-red-500 text-[9px] font-bold">PDF</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-700 truncate max-w-[340px]">{file.name}</p>
                              <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button onClick={() => setSertifikatFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="w-6 h-6 hover:bg-red-50 rounded-full flex items-center justify-center transition">
                            <X size={12} className="text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '10px' }} className="text-gray-400 mt-2 leading-relaxed">
                    *Wajib sudah diverifikasi oleh kedua belah pihak sebelum diunggah. File yang diunggah harus dalam format PDF dan tidak melebihi 10 MB per file.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  <p className="text-sm font-bold text-gray-800">Sifat Pekerjaan</p>
                </div>
                <div className="flex items-center gap-3">
                  {sifatOptions.map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2.5 transition-all border font-medium text-xs ${
                      sifatPekerjaan === opt
                        ? opt === 'Emergency' ? 'bg-red-50 border-red-400 text-red-600' : 'bg-blue-50 border-blue-400 text-blue-700'
                        : opt === 'Emergency' ? 'bg-white border-gray-200 text-red-400 hover:border-red-300 hover:bg-red-50/40'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40'
                    }`}>
                      <input type="checkbox" checked={sifatPekerjaan === opt} onChange={() => setSifatPekerjaan(sifatPekerjaan === opt ? '' : opt)}
                        className="w-4 h-4 shrink-0 accent-blue-600 cursor-pointer" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

           <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-md shadow-red-200"
            >
              Batal
            </button>
              <button onClick={() => router.push('/dashboard/pemohon/data-management')}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}