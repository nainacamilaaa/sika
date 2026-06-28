'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

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
  const { program, sika, setSikaPemeriksaan, filledSertifikat } = useProgramStore();

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
    else if (!sika) router.replace('/dashboard/pemohon/sika/new');
  }, [program, sika]);

  const isolasiCol1 = ['Electrical Circuits', 'Gas Valve', 'Water Valves'];
  const isolasiCol2 = ['Air Instrument Valves', 'Mekanik', 'Pneumatic/Hydraulic'];

  const lampiranCol1 = ['JSA', 'TKO, TKI, TKPA', 'P&ID, Underground Maps'];
  const lampiranCol2 = ['Koordinator PLN', 'Koordinator Telcom', 'Koordinator PDAM'];
  const lampiranCol3 = ['Koordinator BPJN', 'BA Sosialisasi', 'Perizinan Lahan'];

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

  const sertifikatCol1 = [
    'Sertifikat Kerja Panas (SKP)',
    'Sertifikat Kerja Dingin (SKD)',
    'Sertifikat Kerja Ruang Terbatas (SKRT)',
    'Sertifikat Kerja Radiografi (SKR)',
    'Sertifikat Kerja Isolasi Listrik (SKL)',
  ];
  const sertifikatCol2 = [
    'Sertifikat Kerja Penggalian (SKG)',
    'Sertifikat Kerja Pengangkatan (SKA)',
    'Sertifikat Kerja Di Ketinggian (SKK)',
    'Sertifikat Kerja Pengambilan Fotografi (SKPF)',
  ];
  const allSertifikat = [...sertifikatCol1, ...sertifikatCol2];

  const sertifikatRoutes: Record<string, string> = {
    'Sertifikat Kerja Panas (SKP)': '/dashboard/pemohon/sika/sertifikat/skp',
    'Sertifikat Kerja Dingin (SKD)': '/dashboard/pemohon/sika/sertifikat/skd',
    'Sertifikat Kerja Ruang Terbatas (SKRT)': '/dashboard/pemohon/sika/sertifikat/skrt',
    'Sertifikat Kerja Radiografi (SKR)': '/dashboard/pemohon/sika/sertifikat/skr',
    'Sertifikat Kerja Isolasi Listrik (SKL)': '/dashboard/pemohon/sika/sertifikat/skl',
    'Sertifikat Kerja Penggalian (SKG)': '/dashboard/pemohon/sika/sertifikat/skg',
    'Sertifikat Kerja Pengangkatan (SKA)': '/dashboard/pemohon/sika/sertifikat/ska',
    'Sertifikat Kerja Di Ketinggian (SKK)': '/dashboard/pemohon/sika/sertifikat/skk',
    'Sertifikat Kerja Pengambilan Fotografi (SKPF)': '/dashboard/pemohon/sika/sertifikat/skpf',
  };

  const sifatOptions = ['Normal', 'Proyek', 'T/A', 'Emergency'];

  const [showModal, setShowModal] = useState(false);

  const [isolasi, setIsolasi] = useState<string[]>(sika?.isolasi ?? []);
  const [lampiran, setLampiran] = useState<string[]>(sika?.lampiran ?? []);
  const [identifikasi, setIdentifikasi] = useState<string[]>(sika?.identifikasi ?? []);
  const [identifikasiTambahan, setIdentifikasiTambahan] = useState(sika?.identifikasiTambahan ?? '');
  const [pengendalian, setPengendalian] = useState<string[]>(sika?.pengendalian ?? []);
  const [permintaanTambahan, setPermintaanTambahan] = useState(sika?.permintaanTambahan ?? '');
  const [sertifikat, setSertifikat] = useState<string[]>(sika?.sertifikat ?? []);
  const [sifatPekerjaan, setSifatPekerjaan] = useState(sika?.sifatPekerjaan ?? '');

  useEffect(() => {
    const filled = allSertifikat.filter((item) => filledSertifikat.includes(item));
    setSertifikat((prev) => [...new Set([...prev, ...filled])]);
  }, [filledSertifikat]);

  const buildPemeriksaan = (overrideSertifikat?: string[]) => ({
    isolasi,
    lampiran,
    identifikasi,
    identifikasiTambahan,
    pengendalian,
    permintaanTambahan,
    sertifikat: overrideSertifikat ?? sertifikat,
    sifatPekerjaan,
  });

  const saveToStore = (overrideSertifikat?: string[]) => {
    setSikaPemeriksaan(buildPemeriksaan(overrideSertifikat));
  };

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    if (!val) return;
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const toggleSertifikat = (val: string) => {
    if (filledSertifikat.includes(val)) {
      saveToStore();
      router.push(sertifikatRoutes[val]);
      return;
    }

    const isCurrentlyChecked = sertifikat.includes(val);
    const newSertifikat = isCurrentlyChecked
      ? sertifikat.filter((v) => v !== val)
      : [...sertifikat, val];

    setSertifikat(newSertifikat);

    if (!isCurrentlyChecked) {
      saveToStore(newSertifikat);
      router.push(sertifikatRoutes[val]);
    }
  };

  const handleSimpan = () => {
    saveToStore();
    setShowModal(false);
    router.push('/dashboard/pemohon/jsa/new');
  };

  const handleSaveClose = () => {
    saveToStore();
    router.push('/dashboard/pemohon');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">SIKA</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Surat Izin Kerja Aman
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0">
          {[
            { label: 'Program', active: false },
            { label: 'Pengisian SIKA', active: true },
            { label: 'Pengisian JSA', active: false },
            { label: 'Detail Program', active: false },
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
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">ISOLASI PERALATAN</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Pilih isolasi yang diterapkan</p>
            </div>
            <div className="px-6 py-5">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 48px' }}>
                {[...isolasiCol1, ...isolasiCol2].map((opt) => (
                  <CheckItem key={opt} label={opt} checked={isolasi.includes(opt)} onChange={() => toggle(isolasi, setIsolasi, opt)} />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">LAMPIRAN (MANDATORY)</span>
              <p className="text-blue-200 text-[10px] mt-0.5">Lampiran wajib dilampirkan</p>
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

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <span className="text-white font-bold text-xs tracking-wide">IDENTIFIKASI BAHAYA</span>
            <p className="text-blue-200 text-[10px] mt-0.5">Centang semua bahaya yang relevan</p>
          </div>
          <div className="px-6 py-5">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 40px' }}>
              {[...identifikasiCol1, ...identifikasiCol2, ...identifikasiCol3, ...identifikasiCol4].map((item) => (
                <CheckItem key={item} label={item} checked={identifikasi.includes(item)} onChange={() => toggle(identifikasi, setIdentifikasi, item)} />
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">Identifikasi Tambahan:</label>
              <input
                type="text"
                value={identifikasiTambahan}
                onChange={(e) => setIdentifikasiTambahan(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <span className="text-white font-bold text-xs tracking-wide">PENGENDALIAN BAHAYA</span>
            <p className="text-blue-200 text-[10px] mt-0.5">Pilih pengendalian yang akan diterapkan</p>
          </div>
          <div className="px-6 py-5">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 40px' }}>
              {[...pengendalianCol1, ...pengendalianCol2, ...pengendalianCol3].map((item) => (
                <CheckItem key={item} label={item} checked={pengendalian.includes(item)} onChange={() => toggle(pengendalian, setPengendalian, item)} />
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">Permintaan Tambahan:</label>
              <input
                type="text"
                value={permintaanTambahan}
                onChange={(e) => setPermintaanTambahan(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 py-2">
          <button
            onClick={() => router.push('/dashboard/pemohon/sika/new')}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition shadow-md shadow-red-200"
          >
            Back
          </button>
          <button
            onClick={handleSaveClose}
            className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition shadow-md shadow-green-200"
          >
            Save and Close
          </button>
          <button
            onClick={() => {
              saveToStore();
              setShowModal(true);
            }}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-180 max-w-[95vw] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div>
                <p className="text-white font-bold text-base tracking-wide">Formulir SIKA</p>
                <p className="text-blue-200 text-xs">Surat Izin Kerja Aman</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {allSertifikat.map((item) => {
                  const isFilled = filledSertifikat.includes(item);
                  const isChecked = sertifikat.includes(item) || isFilled;
                  return (
                    <label
                      key={item}
                      onClick={() => toggleSertifikat(item)}
                      className={`flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all border ${
                        isFilled
                          ? 'bg-green-50 border-green-200 cursor-default'
                          : isChecked
                          ? 'bg-blue-50 border-blue-300 shadow-sm shadow-blue-100'
                          : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center ${
                        isFilled
                          ? 'bg-green-500 border-green-500'
                          : isChecked
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {(isChecked || isFilled) && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-medium leading-tight flex-1 ${
                        isFilled ? 'text-green-700' : isChecked ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {item}
                      </span>
                      {isFilled && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                          ✓ Terisi
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  <p className="text-sm font-bold text-gray-800">Sifat Pekerjaan</p>
                </div>
                <div className="flex items-center gap-3">
                  {sifatOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSifatPekerjaan(sifatPekerjaan === opt ? '' : opt)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                        sifatPekerjaan === opt
                          ? opt === 'Emergency'
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-blue-600 border-blue-600 text-white'
                          : opt === 'Emergency'
                            ? 'bg-white border-gray-200 text-red-400 hover:border-red-300 hover:bg-red-50'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {opt}
                    </button>
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
              <button
                onClick={handleSimpan}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200"
              >
                Simpan SIKA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}