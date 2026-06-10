'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

// ─── Options ─────────────────────────────────────────────────────────────────

const TIPE_WP_OPTIONS = [
  '- Pilih Tipe Work Permit -',
  'PTW Dingin',
  'PTW Penggalian',
  'PTW Bekerja di Ketinggian',
  'PTW Listrik',
  'PTW Ruang Terbatas',
  'PTW Panas',
  'PTW Radiografi',
];

const SUMBER_BAHAYA: string[] = [
  'Alat Listrik',   'Moving Part',            'Crane',
  'Getaran',        'Generator / Compressor', 'Gas',
  'Bahan Kimia',    'Bising',                 'Kejatuhan',
  'Ergonomi',       'Bertekanan',             'Mudah Terbakar',
  'Biologi',        'Paparan Panas Matahari', 'Media Panas/Dingin',
  'Cuaca Buruk',    'Penggunaan Bahan Kimia', 'Cold Cutting',
  'Lifting',        'Uji Bertekanan',         'Drilling',
  'Kalibrasi',      'Bongkar Muat',           'Pengecatan',
];

const ALAT_PELINDUNG: string[] = [
  'Goggle',              'Safety Helmet',         'Safety Glass',
  'Face Shield',         'Ear Plug',              'Ear Muff',
  'Safety Shoes/Boot',   'Safety Rain Boot',      'Electrical Shoes/Boot',
  'Full Body Harness',   'Safety Line',           'Half Mask Respirator',
  'Full Face Respirator','Dust Mask',             'SCBA/Airline Set',
  'Cotton Glove',        'Leather Glove',         'Rubber Glove',
  'Chemical Glove',      'Coverall',              'Chemical Suit',
  'Apron',               'Life Vest',             'Vest Reflector',
];

// ─── Checkbox Grid ────────────────────────────────────────────────────────────

function CheckboxGrid({
  items,
  selected,
  onToggle,
  cols = 3,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  cols?: number;
}) {
  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  return (
    <div className={`grid ${colClass[cols] ?? 'grid-cols-3'} gap-x-6 gap-y-2`}>
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="w-3.5 h-3.5 rounded border-gray-400 accent-gray-600 cursor-pointer flex-shrink-0"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-snug">
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}

// ─── Safety Check Item ───────────────────────────────────────────────────────

function SafetyCheckItem({
  label,
  value,
  onChange,
  indent = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between border-b border-gray-100 py-2 ${indent ? 'pl-4' : ''}`}>
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
        <span className="text-gray-400 mr-2">:</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name={label}
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-3.5 h-3.5 accent-gray-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700">Yes</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer ml-3">
          <input
            type="radio"
            name={label}
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-3.5 h-3.5 accent-gray-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700">No</span>
        </label>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DraftWorkPermitPage() {
  const router = useRouter();
  const { addWorkPermit } = useProgramStore();

  const noWP = `PTW/${new Date().getFullYear()}/08///000${Math.floor(Math.random() * 9) + 1}`;

  const [tanggalPekerjaan, setTanggalPekerjaan] = useState('');
  const [tanggalSelesai,   setTanggalSelesai]   = useState('');
  const [tipeWP,           setTipeWP]           = useState(TIPE_WP_OPTIONS[0]);
  const [sumberBahaya,     setSumberBahaya]      = useState<string[]>([]);
  const [alatPelindung,    setAlatPelindung]     = useState<string[]>([]);
  const [safetyChecklist,  setSafetyChecklist]   = useState<Record<string, boolean>>({});

  const toggleSumber = (item: string) =>
    setSumberBahaya((p) => p.includes(item) ? p.filter((x) => x !== item) : [...p, item]);

  const toggleAlat = (item: string) =>
    setAlatPelindung((p) => p.includes(item) ? p.filter((x) => x !== item) : [...p, item]);

  const handleSimpan = () => {
    if (!tanggalPekerjaan || !tanggalSelesai || tipeWP === TIPE_WP_OPTIONS[0]) {
      alert('Tanggal pekerjaan dan tipe work permit wajib diisi.');
      return;
    }
    addWorkPermit({
      noWP,
      jenisWP: tipeWP,
      tanggalMulai: tanggalPekerjaan,
      tanggalSelesai,
      status: 'Open',
      sumberBahaya,
      alatPelindung,
      safetyChecklist,
    });
    alert('Work Permit berhasil diajukan!');
    router.push('/dashboard/pemohon/data-management/jsa');
  };

  const handleBatal = () => router.back();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-gray-600 cursor-pointer" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-800 cursor-pointer hover:underline">DATA MANAGEMENT</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">REPORT</span>
        </div>
      </div>

      {/* ─── STATUS BADGE ─── */}
      <div className="px-6 pt-6">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-blue-400 rounded px-4 py-2">
          <span className="text-gray-600 text-sm font-medium">STATUS</span>
          <span className="text-gray-600 text-sm font-medium">: DRAFT</span>
          <span className="bg-gray-400 text-white text-xs font-medium px-2.5 py-1 rounded">Draft</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-6 space-y-6">

        {/* ─── DATA WORK PERMIT ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">DATA WORK PERMIT</span>
          </div>
          <div className="px-8 py-6">
            <div className="max-w-lg space-y-4">

              {/* WPS No */}
              <div className="flex items-center gap-4">
                <label className="w-44 text-sm text-gray-600 font-medium flex-shrink-0">WPS No.</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <input
                  type="text"
                  value={noWP}
                  readOnly
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none"
                />
              </div>

              {/* Tanggal Pekerjaan */}
              <div className="flex items-center gap-4">
                <label className="w-44 text-sm text-gray-600 font-medium flex-shrink-0">Tanggal Pekerjaan</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <input
                  type="date"
                  value={tanggalPekerjaan}
                  onChange={(e) => setTanggalPekerjaan(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* s/d */}
              <div className="flex items-center gap-4">
                <div className="w-44 flex-shrink-0" />
                <span className="invisible text-gray-400 flex-shrink-0">:</span>
                <span className="text-sm text-gray-500 font-medium">s/d</span>
              </div>

              {/* Tanggal Selesai */}
              <div className="flex items-center gap-4">
                <label className="w-44 text-sm text-gray-600 font-medium flex-shrink-0">Tanggal Selesai</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Tipe Work Permit */}
              <div className="flex items-center gap-4">
                <label className="w-44 text-sm text-gray-600 font-medium flex-shrink-0">Tipe Work Permit</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <div className="flex-1 relative">
                  <select
                    value={tipeWP}
                    onChange={(e) => setTipeWP(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 pr-8"
                  >
                    {TIPE_WP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── SUMBER BAHAYA + ALAT PELINDUNG ─── */}
        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">SUMBER BAHAYA ALAT / KEGIATAN</span>
            </div>
            <div className="px-5 py-5">
              <CheckboxGrid items={SUMBER_BAHAYA} selected={sumberBahaya} onToggle={toggleSumber} cols={2} />
            </div>
          </div>

          <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
            <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
              <span className="text-blue-700 font-semibold text-sm">ALAT PELINDUNG DIRI</span>
            </div>
            <div className="px-5 py-5">
              <CheckboxGrid items={ALAT_PELINDUNG} selected={alatPelindung} onToggle={toggleAlat} cols={2} />
            </div>
          </div>

        </div>

        {/* ─── SAFETY CHECKLIST ─── */}
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-semibold text-sm">SAFETY CHECKLIST</span>
          </div>
          <div className="px-6 py-4 space-y-1">

            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Jalur tersebut telah bebas dari</p>
              <div className="pl-4">
                {[
                  'Kabel listrik bawah tanah',
                  'Kabel telepon bawah tanah',
                  'Kabel instrument bawah tanah',
                  'Gorong-gorong bawah tanah',
                  'Pipa air/gas/minyak bawah tanah',
                ].map((item) => (
                  <SafetyCheckItem
                    key={item}
                    label={item}
                    value={safetyChecklist[item] ?? null}
                    onChange={(v) => setSafetyChecklist((p) => ({ ...p, [item]: v }))}
                    indent
                  />
                ))}
              </div>
            </div>

            {[
              'Dinding penggalian perlu dipasang turap',
              'Rambu peringatan telah terpasang',
              'Lokasi telah di beri batas/penghalang',
              'Lokasi bebas dari area mudah terbakar',
              'Memerlukan izin kerja yang lain',
            ].map((item) => (
              <SafetyCheckItem
                key={item}
                label={item}
                value={safetyChecklist[item] ?? null}
                onChange={(v) => setSafetyChecklist((p) => ({ ...p, [item]: v }))}
              />
            ))}
          </div>
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex justify-end gap-3 pt-2 pb-4">
          <button
            onClick={handleBatal}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold px-6 py-2 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSimpan}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded transition"
          >
            Request Work Permit
          </button>
        </div>

      </div>
    </div>
  );
}