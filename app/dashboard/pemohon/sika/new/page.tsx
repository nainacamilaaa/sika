'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

const dateDigitPlaceholders = ['D', 'D', 'M', 'M', 'Y', 'Y'];

const DigitBox = ({
  value, placeholder, onChange,
}: { value: string; placeholder: string; onChange: (v: string) => void }) => (
  <input
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    placeholder={placeholder}
    readOnly
    onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
    className="w-7 h-8 text-center text-xs border-r border-gray-300 last:border-r-0 focus:outline-none focus:bg-blue-50 text-gray-700 placeholder-gray-300 cursor-pointer caret-transparent"
  />
);

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

const isoDateToDigits = (iso: string): string[] => {
  if (!iso) return Array(6).fill('');
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return Array(6).fill('');
  return [d[0], d[1], m[0], m[1], y.slice(2, 3), y.slice(3, 4)];
};

const digitsToIsoDate = (digits: string[]): string => {
  if (digits.some((d) => d === '')) return '';
  const [d1, d2, m1, m2, y1, y2] = digits;
  const day = `${d1}${d2}`;
  const month = `${m1}${m2}`;
  const year = `20${y1}${y2}`;
  return `${year}-${month}-${day}`;
};

const timeValueToDisplay = (val: string): string => (val ? val.replace(':', '.') : '');

const displayToTimeValue = (val: string): string => {
  if (!val) return '';
  const cleaned = val.replace('.', ':');
  return /^\d{2}:\d{2}$/.test(cleaned) ? cleaned : '';
};

export default function SikaNewPage() {
  const router = useRouter();
  const { program, sika, setSikaBasic, setSikaPemeriksaan, filledSertifikat } = useProgramStore();

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
  }, [program]);

  const [tanggalTerbit, setTanggalTerbit] = useState<string[]>(
    sika?.tanggalTerbit?.length === 6 ? sika.tanggalTerbit : Array(6).fill('')
  );
  const [berlakuHingga, setBerlakuHingga] = useState<string[]>(
    sika?.berlakuHingga?.length === 6 ? sika.berlakuHingga : Array(6).fill('')
  );
  const [jamKerjaMulai, setJamKerjaMulai] = useState(sika?.jamKerjaMulai || '');
  const [jamKerjaSelesai, setJamKerjaSelesai] = useState(sika?.jamKerjaSelesai || '');
  const [waktuIsolasi, setWaktuIsolasi] = useState(sika?.waktuIsolasi || '');
  const [noSikaAreaFungsi, setNoSikaAreaFungsi] = useState(sika?.noSikaAreaFungsi || '');

  // NOMOR SIKA - bagian kedua dikunci ke tahun berjalan (mis. 2026, otomatis jadi 2027 saat tahun berganti)
  const currentYear = new Date().getFullYear().toString();
  const [noSikaNomorUrut, setNoSikaNomorUrut] = useState(sika?.noSikaNomorUrut || currentYear);

  useEffect(() => {
    setNoSikaNomorUrut(new Date().getFullYear().toString());
  }, []);

  const [lanjutanDariSika, setLanjutanDariSika] = useState(sika?.lanjutanDariSika || '');

  const tanggalTerbitPickerRef = useRef<HTMLInputElement>(null);
  const berlakuHinggaPickerRef = useRef<HTMLInputElement>(null);
  const jamMulaiPickerRef = useRef<HTMLInputElement>(null);
  const jamSelesaiPickerRef = useRef<HTMLInputElement>(null);
  const pekerjaInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      try {
        (el as any).showPicker();
        return;
      } catch {}
    }
    el.focus();
    el.click();
  };

  const updateDigit = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    val: string
  ) => {
    setter((prev) => prev.map((c, i) => (i === index ? val : c)));
  };

  const [form, setForm] = useState({
    fungsiPerusahaan: sika?.fungsiPerusahaan || program?.pelaksanaPerusahaan || '',
    lokasiInstalasi: sika?.lokasiInstalasi || program?.lokasiKerja || '',
    peralatanNoIdentitas: sika?.peralatanNoIdentitas || '',
    uraianPekerjaan: sika?.uraianPekerjaan || '',
    peralatanDigunakan: sika?.peralatanDigunakan || '',
  });

  const [pekerjaList, setPekerjaList] = useState<string[]>(
    sika?.pekerjaList?.length ? sika.pekerjaList : ['']
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddPekerja = () => {
    setPekerjaList((prev) => {
      const next = [...prev, ''];
      setTimeout(() => {
        pekerjaInputRefs.current[next.length - 1]?.focus();
      }, 0);
      return next;
    });
  };

  const handlePekerjaChange = (index: number, value: string) => {
    setPekerjaList((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const handleRemovePekerja = (index: number) => {
    if (pekerjaList.length === 1) return;
    setPekerjaList((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fungsiPerusahaan.trim()) newErrors.fungsiPerusahaan = 'Fungsi / Perusahaan wajib diisi';
    if (!form.lokasiInstalasi.trim()) newErrors.lokasiInstalasi = 'Lokasi / Instalasi wajib diisi';
    if (!form.uraianPekerjaan.trim()) newErrors.uraianPekerjaan = 'Uraian pekerjaan wajib diisi';
    const filledPekerja = pekerjaList.filter((p) => p.trim() !== '');
    if (filledPekerja.length === 0) newErrors.pekerjaList = 'Minimal satu nama pekerja wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildBasicPayload = () => ({
    fungsiPerusahaan: form.fungsiPerusahaan,
    lokasiInstalasi: form.lokasiInstalasi,
    peralatanNoIdentitas: form.peralatanNoIdentitas,
    uraianPekerjaan: form.uraianPekerjaan,
    peralatanDigunakan: form.peralatanDigunakan,
    pekerjaList: pekerjaList.filter((p) => p.trim() !== ''),
    noSIKA: sika?.noSIKA || '',
    tanggalSIKA: sika?.tanggalSIKA || '',
    tanggalTerbit,
    berlakuHingga,
    jamKerjaMulai,
    jamKerjaSelesai,
    waktuIsolasi,
    noSikaAreaFungsi,
    noSikaNomorUrut,
    lanjutanDariSika,
  });

  const inputClass = (field: string) =>
    `w-full border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-400'
    }`;

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
  const [diisiPA, setDiisiPA] = useState<boolean>(sika?.diisiPA ?? false);
  const [diperiksaIA, setDiperiksaIA] = useState<boolean>(sika?.diperiksaIA ?? false);

  useEffect(() => {
    const filled = allSertifikat.filter((item) => filledSertifikat.includes(item));
    setSertifikat((prev) => [...new Set([...prev, ...filled])]);
  }, [filledSertifikat]);

  const buildPemeriksaanPayload = (overrideSertifikat?: string[]) => ({
    isolasi,
    lampiran,
    identifikasi,
    identifikasiTambahan,
    pengendalian,
    permintaanTambahan,
    sertifikat: overrideSertifikat ?? sertifikat,
    sifatPekerjaan,
    diisiPA,
    diperiksaIA,
  });

  const saveAll = (overrideSertifikat?: string[]) => {
    setSikaBasic(buildBasicPayload());
    setSikaPemeriksaan(buildPemeriksaanPayload(overrideSertifikat));
  };

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    if (!val) return;
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const toggleSertifikat = (val: string) => {
    if (filledSertifikat.includes(val)) {
      saveAll();
      router.push(sertifikatRoutes[val]);
      return;
    }

    const isCurrentlyChecked = sertifikat.includes(val);
    const newSertifikat = isCurrentlyChecked
      ? sertifikat.filter((v) => v !== val)
      : [...sertifikat, val];

    setSertifikat(newSertifikat);

    if (!isCurrentlyChecked) {
      saveAll(newSertifikat);
      router.push(sertifikatRoutes[val]);
    }
  };

  const handleSaveClose = () => {
    saveAll();
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
    if (!validate()) return;
    saveAll();
    setShowModal(true);
  };

  const handleSimpan = () => {
    saveAll();
    setShowModal(false);
    router.push('/dashboard/pemohon/jsa/new');
  };

  const steps = [
    { label: 'Program', active: false },
    { label: 'Pengisian SIKA', active: true },
    { label: 'Pengisian JSA', active: false },
    { label: 'Detail Program', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <style jsx global>{`
        input[type="date"]::-webkit-datetime-edit,
        input[type="date"]::-webkit-datetime-edit-fields-wrapper,
        input[type="date"]::-webkit-datetime-edit-text,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field,
        input[type="time"]::-webkit-datetime-edit,
        input[type="time"]::-webkit-datetime-edit-fields-wrapper,
        input[type="time"]::-webkit-datetime-edit-text,
        input[type="time"]::-webkit-datetime-edit-hour-field,
        input[type="time"]::-webkit-datetime-edit-minute-field,
        input[type="time"]::-webkit-datetime-edit-ampm-field {
          color: transparent !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0 !important;
          -webkit-appearance: none;
          position: absolute;
          right: 0;
        }
        input[type="date"],
        input[type="time"] {
          color-scheme: light;
        }
      `}</style>

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">SIKA</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Surat Izin Kerja
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0">
            {steps.map((step, i, arr) => (
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

      <div className="px-6 pt-3 pb-6 space-y-4">

      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">PENGISIAN SIKA</span>
            <p className="text-blue-200 text-xs mt-0.5">Isi seluruh kolom dengan lengkap dan benar</p>
          </div>
          <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium border border-white/30">
            Surat Izin Kerja
          </span>
        </div>

        <div className="flex flex-wrap items-stretch text-xs border-b border-gray-300">
          <div className="flex items-center flex-1 min-w-[320px] border-b border-gray-300">
            <div
              className="px-6 py-2.5 flex items-center font-bold text-gray-800 border-r border-gray-300 whitespace-nowrap bg-white"
            >
              NOMOR SIKA
            </div>
            <div className="flex items-center gap-2 px-3 flex-1">
              <input
                type="text"
                value={noSikaAreaFungsi}
                onChange={(e) => setNoSikaAreaFungsi(e.target.value)}
                placeholder="Area/Fungsi/Projek"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-center text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="text"
                value={noSikaNomorUrut}
                readOnly
                title="Terkunci ke tahun berjalan"
                className="w-16 border border-gray-300 rounded px-2 py-1.5 text-center text-gray-500 bg-gray-100 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center flex-1 min-w-[320px] border-b border-gray-300">
            <div
              className="px-3 py-2.5 flex items-center font-bold text-gray-800 border-r border-gray-300 whitespace-nowrap bg-white"
            >
              LANJUTAN DARI SIKA
            </div>
            <div className="flex items-center px-3 flex-1">
              <input
                type="text"
                value={lanjutanDariSika}
                onChange={(e) => setLanjutanDariSika(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 text-sm border-b border-gray-300 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black-800 whitespace-nowrap">BAGIAN 1 - TANGGAL TERBIT</span>
            <div
              className="relative flex border border-gray-300 rounded cursor-pointer overflow-hidden"
              onClick={() => openPicker(tanggalTerbitPickerRef)}
              title="Klik untuk pilih tanggal"
            >
              {tanggalTerbit.map((v, i) => (
                <DigitBox
                  key={i}
                  value={v}
                  placeholder={dateDigitPlaceholders[i]}
                  onChange={(val) => updateDigit(setTanggalTerbit, i, val)}
                />
              ))}
              <input
                ref={tanggalTerbitPickerRef}
                type="date"
                value={digitsToIsoDate(tanggalTerbit)}
                onChange={(e) => setTanggalTerbit(isoDateToDigits(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 whitespace-nowrap">JAM KERJA</span>
            <div className="flex items-center gap-1 border border-gray-300 rounded px-2">
              <div className="relative cursor-pointer overflow-hidden" onClick={() => openPicker(jamMulaiPickerRef)} title="Klik untuk pilih jam mulai">
                <input
                  type="text"
                  value={jamKerjaMulai}
                  readOnly
                  placeholder="00.00"
                  className="w-11 text-center focus:outline-none text-gray-700 placeholder-gray-300 cursor-pointer caret-transparent"
                />
                <input
                  ref={jamMulaiPickerRef}
                  type="time"
                  value={displayToTimeValue(jamKerjaMulai)}
                  onChange={(e) => setJamKerjaMulai(timeValueToDisplay(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
              </div>
              <span className="text-gray-500 font-medium px-0.5">s/d</span>
              <div className="relative cursor-pointer overflow-hidden" onClick={() => openPicker(jamSelesaiPickerRef)} title="Klik untuk pilih jam selesai">
                <input
                  type="text"
                  value={jamKerjaSelesai}
                  readOnly
                  placeholder="00.00"
                  className="w-11 text-center focus:outline-none text-gray-700 placeholder-gray-300 cursor-pointer caret-transparent"
                />
                <input
                  ref={jamSelesaiPickerRef}
                  type="time"
                  value={displayToTimeValue(jamKerjaSelesai)}
                  onChange={(e) => setJamKerjaSelesai(timeValueToDisplay(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-blue-700">W.I</span>
            <input
              type="text"
              value={waktuIsolasi}
              onChange={(e) => setWaktuIsolasi(e.target.value)}
              placeholder="BIT/TA"
              className="w-16 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none text-gray-500 placeholder-gray-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 whitespace-nowrap">BERLAKU HINGGA</span>
            <div
              className="relative flex border border-gray-300 rounded cursor-pointer overflow-hidden"
              onClick={() => openPicker(berlakuHinggaPickerRef)}
              title="Klik untuk pilih tanggal"
            >
              {berlakuHingga.map((v, i) => (
                <DigitBox
                  key={i}
                  value={v}
                  placeholder={dateDigitPlaceholders[i]}
                  onChange={(val) => updateDigit(setBerlakuHingga, i, val)}
                />
              ))}
              <input
                ref={berlakuHinggaPickerRef}
                type="date"
                value={digitsToIsoDate(berlakuHingga)}
                onChange={(e) => setBerlakuHingga(isoDateToDigits(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                tabIndex={-1}
              />
            </div>
          </div>
        </div>

    <div className="border-b border-gray-300">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-6">
          <span className="text-gray-800 font-bold text-sm tracking-wide whitespace-nowrap">BAGIAN 2 - JENIS PEKERJAAN</span>
          <span className="text-xs text-gray-500 whitespace-nowrap">Diisi oleh Pelaksana Pekerjaan (PA)</span>
        </div>
      </div>
      
          <div className="px-8 py-6 space-y-5">

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Fungsi / Perusahaan <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={form.fungsiPerusahaan}
                  onChange={(e) => handleChange('fungsiPerusahaan', e.target.value)}
                  className={inputClass('fungsiPerusahaan')}
                />
                {errors.fungsiPerusahaan && (
                  <p className="text-red-500 text-xs mt-1">{errors.fungsiPerusahaan}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Lokasi / Instalasi <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={form.lokasiInstalasi}
                  onChange={(e) => handleChange('lokasiInstalasi', e.target.value)}
                  className={inputClass('lokasiInstalasi')}
                />
                {errors.lokasiInstalasi && (
                  <p className="text-red-500 text-xs mt-1">{errors.lokasiInstalasi}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Peralatan / No. Identitas
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                value={form.peralatanNoIdentitas}
                onChange={(e) => handleChange('peralatanNoIdentitas', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Uraian Pekerjaan <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <textarea
                  value={form.uraianPekerjaan}
                  onChange={(e) => handleChange('uraianPekerjaan', e.target.value)}
                  rows={4}
                  className={`w-full border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 resize-none ${
                    errors.uraianPekerjaan
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-blue-400'
                  }`}
                />
                {errors.uraianPekerjaan && (
                  <p className="text-red-500 text-xs mt-1">{errors.uraianPekerjaan}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Peralatan yang Digunakan
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <textarea
                value={form.peralatanDigunakan}
                onChange={(e) => handleChange('peralatanDigunakan', e.target.value)}
                rows={3}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              />
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Jumlah Pekerja <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1 space-y-2">
                {pekerjaList.map((pekerja, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-9 border border-gray-300 rounded flex items-center justify-center text-sm text-gray-500 bg-gray-50 shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={pekerja}
                      placeholder="Nama pekerja"
                      ref={(el) => { pekerjaInputRefs.current[index] = el; }}
                      onChange={(e) => handlePekerjaChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPekerja();
                        }
                      }}
                      className={`flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 ${
                        errors.pekerjaList && index === 0
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-blue-400'
                      }`}
                    />
                    {pekerjaList.length > 1 && (
                      <button
                        onClick={() => handleRemovePekerja(index)}
                        className="text-red-400 hover:text-red-600 transition shrink-0"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {index === pekerjaList.length - 1 && (
                      <button
                        onClick={handleAddPekerja}
                        className="w-8 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center shrink-0 transition"
                      >
                        <Plus size={15} />
                      </button>
                    )}
                  </div>
                ))}
                {errors.pekerjaList && (
                  <p className="text-red-500 text-xs mt-1">{errors.pekerjaList}</p>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 bg-white border-b border-gray-300">
          <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
            BAGIAN 3 - PEMERIKSAAN
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={diisiPA}
              onChange={() => setDiisiPA((v) => !v)}
              className="w-3.5 h-3.5 shrink-0 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-gray-600 whitespace-nowrap">
              Diisi oleh Pelaksana Pekerjaan (PA)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={diperiksaIA}
              onChange={() => setDiperiksaIA((v) => !v)}
              className="w-3.5 h-3.5 shrink-0 accent-blue-600 cursor-pointer"
              style={{ borderRadius: '9999px' }}
            />
            <span className="text-xs text-gray-600 whitespace-nowrap">
              Diperiksa oleh Asset Holder (Issuing Authority-IA)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="border-r border-gray-300">
            <div className="px-5 py-3 border-b border-gray-200 bg-white">
              <span className="text-gray-800 font-bold text-xs tracking-wide">ISOLASI PERALATAN</span>
              <p className="text-gray-500 text-[10px] mt-0.5">Pilih isolasi yang diterapkan</p>
            </div>
            <div className="px-6 py-5">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 48px' }}>
                {[...isolasiCol1, ...isolasiCol2].map((opt) => (
                  <CheckItem key={opt} label={opt} checked={isolasi.includes(opt)} onChange={() => toggle(isolasi, setIsolasi, opt)} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="px-5 py-3 border-b border-gray-200 bg-white">
              <span className="text-gray-800 font-bold text-xs tracking-wide">LAMPIRAN (MANDATORY)</span>
              <p className="text-gray-500 text-[10px] mt-0.5">Lampiran wajib dilampirkan</p>
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

        <div className="border-b border-gray-300">
          <div className="px-5 py-3 border-b border-gray-200 bg-white">
            <span className="text-gray-800 font-bold text-xs tracking-wide">IDENTIFIKASI BAHAYA</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Centang semua bahaya yang relevan</p>
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

        <div>
          <div className="px-5 py-3 border-b border-gray-200 bg-white">
            <span className="text-gray-800 font-bold text-xs tracking-wide">PENGENDALIAN BAHAYA</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Pilih pengendalian yang akan diterapkan</p>
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

        </div>

        <div className="flex justify-end gap-3 py-2">
          <button
            onClick={() => router.push('/dashboard/pemohon/program/new')}
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
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-180 max-w-[95vw] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200"
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