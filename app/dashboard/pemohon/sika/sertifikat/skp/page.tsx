'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Users, Lock, Paperclip, X, FileText, Plus, Trash2 } from 'lucide-react';
import { buildChecklist } from '@/lib/sertifikatUtils';

const checklistItems = [
  'Apakah pekerja sudah diberi penjelasan secara detail mengenai pekerjaan yang akan dilakukan',
  'Apakah pekerja sudah diberi penjelasan tentang bahaya yang ada / dapat terjadi terhadap pekerjaan yang akan dilakukan',
  'Apakah tindakan pencegahan telah dilakukan guna memastikan tidak ada pekerjaan lain yang dapat menimbulkan bahaya ketika pekerjaan ini berlangsung',
  'Apakah operator yang bertugas (operator lapangan dan DCS) telah dihubungi bahwa adanya pekerjaan yang akan dilakukan',
  'Apakah peralatan yang akan dikerjakan sudah bebas dari gas-gas yang berbahaya dan bertekanan (dikosongkan, dipurging, disteam, diflushing, didrain)',
  'Apakah peralatan sudah diisolir / diamankan dari sumber bahaya',
  'Apakah peralatan sudah bebas dari sumber tenaga penggerak',
  'Dipasang label locked out & tag out pada peralatan',
  'Apakah diperlukan pengamanan & pengawasan terhadapan percikan api las',
  'Apakah bahan-bahan yang mudah terbakar, perlu dipindah atau dilindungi',
  'Apakah selokan/sewer/drain dan kerasangan pada jarak radius 15 meter dari tempat pekerjaan telah ditutup dengan rapat',
  'Apakah lokasi kerja bebas dari tumpahan/ceceran minyak/bocoran gas',
  'Apakah kegiatan lain yang mempengaruhi operasi tersebut',
  'Apakah mesin diesel, compressor, pompa telah ditempatkan pada posisi aman',
  'Semua peralatan las telah ditempatkan pada posisi yang aman, dipasang bounding dan di-grounded / arde secara aman',
  'Semua penggerak utama peralatan listrik telah diisolasi dan diberi label, dan diisolasi dari sumber tenaga listrik',
  'Stand by alat pemadam api yang sesuai',
  'Stand by petugas pemadam kebakaran / safety / Fire Watcher (Nama Petugas: ...)',
  'Standby .............. Rescuer dan ............... Paramedic',
  'Tersedia kacamata Las dan Apron',
  'Apakah pekerja perlu dilakukan dengan menggunakan Non-Sparking Tools',
  'Apakah para pekerja memahami tindakan dalam keadaan darurat',
];

const safetyNotes = [
  'Bahaya dalam melaksanakan pekerjaan sekaligus sebagai penyebab dasar kecelakaan adalah karena 3 faktor utama yaitu TIDAK TAHU, TIDAK MAMPU dan/atau TIDAK MAU.',
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader /pengawas pekerjaan.',
  'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk /bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
  'Bahaya utama dari pekerjaan PANAS adalah kebakaran/Peledakan, pastikan jangan sampai terjadi perteuan  ketiga unsur pembentuk API dalam kegiatan tersebut.',
  'Setiap akan memulai pekerjaan, lakukan koordinasi dan komunikasi dengan para pihak terkait dan  pastikan lokasi kerja bebas dari material yang bisa menimbulkan kebakaran/peledakan.',
  'Pastikan kondisi Operasi APAR dan tempatkan di lokasi yang sesuai, dan mudah dijangkau.',
  'Bila pekerjaan panas dilakukan pada ketinggian, pastikan fasilitas yang berpotensi terkena percikan di tutup dengan cover terutma untuk fasilitas yang dimungkinkan terjadi bocoran.',
  'Pastikan semua anggota memahami tindakan dalam keadaan darurat, termasuk No. telepon dan/atau petugas yang bisa dihubungi.',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

type UploadedDoc = {
  file: File;
  previewUrl: string | null;
};

type GasRow = {
  time: string;
  lel: string;
  o2: string;
  h2s: string;
  co2: string;
  co: string;
  temp: string;
  sign: string;
  remark: string;
};

const emptyGasRow = (): GasRow => ({
  time: '', lel: '', o2: '', h2s: '', co2: '', co: '', temp: '', sign: '', remark: '',
});

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocUploadCell({
  index,
  doc,
  error,
  onSelect,
  onRemove,
}: {
  index: number;
  doc: UploadedDoc | null;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-1 min-w-[120px]">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,image/*,application/pdf"
        onChange={handleFile}
        className="hidden"
        id={`doc-upload-${index}`}
      />

      {!doc ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 border border-dashed border-blue-300 text-blue-500 rounded px-2.5 py-1.5 text-sm hover:bg-blue-50 hover:border-blue-400 transition"
        >
          <Paperclip size={12} />
          Upload
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded px-2 py-1.5 max-w-[160px]">
          {doc.previewUrl ? (
            <img src={doc.previewUrl} alt={doc.file.name} className="w-7 h-7 object-cover rounded shrink-0" />
          ) : (
            <FileText size={16} className="text-blue-500 shrink-0" />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-gray-800 truncate" title={doc.file.name}>{doc.file.name}</span>
            <span className="text-sm text-gray-400">{formatFileSize(doc.file.size)}</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-gray-400 hover:text-red-500 transition"
            title="Hapus file"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {error && (
        <span className="text-sm text-red-500 text-center leading-tight">{error}</span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Formulir Pemeriksaan Kondisi Gas (Inline)
// ═══════════════════════════════════════════════════════════
function FormKondisiGas({
  rows,
  diukurOleh,
  onDiukurOlehChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: {
  rows: GasRow[];
  diukurOleh: string;
  onDiukurOlehChange: (val: string) => void;
  onRowChange: (index: number, field: keyof GasRow, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}) {
  const inputCls =
    'w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition';

  return (
    <div className="rounded border-2 border-blue-300 overflow-hidden bg-white">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Formulir Pemeriksaan Kondisi Gas</p>
          <p className="text-xs text-blue-400">Nomor Sika & Lokasi Kerja mengikuti data di atas</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Di ukur oleh:</label>
          <input
            type="text"
            value={diukurOleh}
            onChange={(e) => onDiukurOlehChange(e.target.value)}
            placeholder="Nama petugas..."
            className="border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-900 w-52 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-blue-100">
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold w-10">No</th>
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold w-24">Time</th>
              <th colSpan={5} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold">Gas</th>
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold w-20">Temp °C</th>
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold w-24">Sign</th>
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 text-blue-700 font-semibold min-w-[140px]">Remark</th>
              <th rowSpan={2} className="border border-blue-200 px-2 py-2 w-10"></th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border border-blue-200 px-2 py-1.5 text-blue-600 font-medium w-20">LEL %</th>
              <th className="border border-blue-200 px-2 py-1.5 text-blue-600 font-medium w-20">O2 %</th>
              <th className="border border-blue-200 px-2 py-1.5 text-blue-600 font-medium w-24">H2S ppm</th>
              <th className="border border-blue-200 px-2 py-1.5 text-blue-600 font-medium w-24">CO2 ppm</th>
              <th className="border border-blue-200 px-2 py-1.5 text-blue-600 font-medium w-24">CO ppm</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="border border-gray-100 px-2 py-1.5 text-center text-gray-500 font-mono">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="time" value={row.time} onChange={(e) => onRowChange(index, 'time', e.target.value)} className={inputCls} />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.lel} onChange={(e) => onRowChange(index, 'lel', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.o2} onChange={(e) => onRowChange(index, 'o2', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.h2s} onChange={(e) => onRowChange(index, 'h2s', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.co2} onChange={(e) => onRowChange(index, 'co2', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.co} onChange={(e) => onRowChange(index, 'co', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.temp} onChange={(e) => onRowChange(index, 'temp', e.target.value)} className={inputCls} placeholder="0" />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input type="text" value={row.sign} onChange={(e) => onRowChange(index, 'sign', e.target.value)} className={inputCls} placeholder="..." />
                </td>
                <td className="border border-gray-100 px-2 py-1.5">
                  <input
                    type="text"
                    value={row.remark}
                    onChange={(e) => onRowChange(index, 'remark', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition"
                    placeholder="Catatan..."
                  />
                </td>
                <td className="border border-gray-100 px-1 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(index)}
                    disabled={rows.length === 1}
                    className={`transition ${rows.length === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
                    title="Hapus baris"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-blue-100 bg-gray-50">
        <button
          type="button"
          onClick={onAddRow}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
        >
          <Plus size={14} />
          Tambah Baris
        </button>
      </div>
    </div>
  );
}

export default function SKPPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled, setSertifikatData } = useProgramStore();
  const { user } = useAuthStore();

  const NAMA = 'Sertifikat Kerja Panas (SKP)';

  const canEditPA = user?.role === 'pemberi';
  const canEditIA = user?.role === 'pja';

  const [checklist, setChecklist] = useState<Record<number, 'yes' | 'no' | null>>(
    Object.fromEntries(checklistItems.map((_, i) => [i, null]))
  );

  const [checklistDocs, setChecklistDocs] = useState<Record<number, UploadedDoc | null>>(
    Object.fromEntries(checklistItems.map((_, i) => [i, null]))
  );
  const [docErrors, setDocErrors] = useState<Record<number, string | null>>({});

  const [diisiOlehIA, setDiisiOlehIA] = useState(false);
  const [tanggalTerbit, setTanggalTerbit] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [berlakuHingga, setBerlakuHingga] = useState('');
  const [verifikasi, setVerifikasi] = useState<Record<string, string>>({
    paNama: '', paTanggal: '', iaNama: '', iaTanggal: '',
  });
  const [gasMonitoring, setGasMonitoring] = useState<'ya' | 'tidak' | null>(null);

  // Data Formulir Pemeriksaan Kondisi Gas (muncul saat gasMonitoring === 'ya')
  const [gasRows, setGasRows] = useState<GasRow[]>([emptyGasRow()]);
  const [diukurOleh, setDiukurOleh] = useState('');

  const updateGasRow = (index: number, field: keyof GasRow, value: string) => {
    setGasRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addGasRow = () => setGasRows((prev) => [...prev, emptyGasRow()]);

  const removeGasRow = (index: number) => {
    setGasRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const toggleChecklist = (index: number, val: 'yes' | 'no') => {
    setChecklist((prev) => ({ ...prev, [index]: prev[index] === val ? null : val }));
  };

  const handleDocSelect = (index: number, file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !/\.(jpe?g|png|webp|heic|pdf)$/i.test(file.name)) {
      setDocErrors((prev) => ({ ...prev, [index]: 'Format harus foto atau PDF' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setDocErrors((prev) => ({ ...prev, [index]: 'Ukuran file maks 10MB' }));
      return;
    }

    setDocErrors((prev) => ({ ...prev, [index]: null }));

    setChecklistDocs((prev) => {
      const old = prev[index];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      return { ...prev, [index]: { file, previewUrl } };
    });
  };

  const handleDocRemove = (index: number) => {
    setChecklistDocs((prev) => {
      const old = prev[index];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      return { ...prev, [index]: null };
    });
    setDocErrors((prev) => ({ ...prev, [index]: null }));
  };

  const yesCount = Object.values(checklist).filter(v => v === 'yes').length;
  const noCount = Object.values(checklist).filter(v => v === 'no').length;
  const totalFilled = yesCount + noCount;
  const totalDocs = Object.values(checklistDocs).filter(Boolean).length;

  const sudahIsiGas = gasRows.some(r => r.time || r.lel || r.o2 || r.h2s || r.co2 || r.co || r.temp || r.sign || r.remark);

  const buildData = () => ({
    tanggalTerbit,
    jamMulai,
    jamSelesai,
    berlakuHingga,
    checklist: buildChecklist(checklistItems, checklist),
    checklistDocs: Object.fromEntries(
      Object.entries(checklistDocs).map(([key, doc]) => [
        key,
        doc ? { name: doc.file.name, size: doc.file.size, type: doc.file.type } : null
      ])
    ),
    verifikasi,
    gasMonitoring,
    gasRows,
    diukurOleh,
    lainnya: { diisiOlehIA },
  });

  const handleSimpan = () => {
    markSertifikatFilled(NAMA);
    setSertifikatData(NAMA, buildData(), user?.name || 'Pemohon');
    router.push('/dashboard/pemohon/sika/new');
  };

  const handleSaveAndClose = () => {
    markSertifikatFilled(NAMA);
    setSertifikatData(NAMA, buildData(), user?.name || 'Pemohon');
    router.push('/dashboard/pemohon/sika/new');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3" style={{ paddingLeft: '30px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Entry Data</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Sertifikat Kerja Panas
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">

        {/* SATU BORDER — Rujukan/Hero s/d Bagian 5 dalam 1 container */}
        <div className="bg-white rounded border-2 border-white shadow-lg overflow-hidden">

          {/* HERO HEADER */}
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-011/B-003/PG0300/2026-S9</span>
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
            <div style={{ flex: 3, backgroundColor: '#ff0000', minHeight: '80px' }} className="flex items-center justify-center px-6 py-4">
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Sertifikat Kerja Panas
              </h1>
            </div>
            <div className="border-l border-gray-200 bg-white" style={{
              flex: 1,
              minHeight: '80px',
              backgroundImage: 'url(/logopertaminagaswhite.svg)',
              backgroundSize: '100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
            }} />
          </div>
          <div className="px-5 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center justify-end gap-2">
            <div className={`w-2 h-2 rounded-full ${totalFilled === checklistItems.length ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs text-gray-500">{totalFilled}/{checklistItems.length} item checklist terisi</span>
          </div>

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
            <div className="h-3 bg-gray-100 border-y border-blue-200" />
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
                <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <Paperclip size={10} /> Dokumen: {totalDocs}
                </span>
                <span className="text-xs text-gray-500">{checklistItems.length - totalFilled} belum diisi</span>
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
                      <th className="text-center text-green-600 font-bold px-4 py-3 w-20 text-sm">YES</th>
                      <th className="text-center text-red-500 font-bold px-4 py-3 w-20 text-sm">NO</th>
                      <th className="text-center text-blue-600 font-bold px-4 py-3 w-32 text-sm">Dokumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklistItems.map((item, index) => {
                      const val = checklist[index];
                      return (
                        <tr key={index} className={`border-b border-gray-100 transition-colors ${
                          val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}>
                          <td className="px-4 py-3 text-gray-900 text-sm font-mono">{String(index + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed">{item}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => toggleChecklist(index, 'yes')}
                              className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                              }`}>
                              {val === 'yes' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => toggleChecklist(index, 'no')}
                              className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                val === 'no' ? 'bg-red-500 border-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                              }`}>
                              {val === 'no' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <DocUploadCell
                              index={index}
                              doc={checklistDocs[index] || null}
                              error={docErrors[index] || null}
                              onSelect={(file) => handleDocSelect(index, file)}
                              onRemove={() => handleDocRemove(index)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Format dokumen: JPG, PNG, WEBP, HEIC, atau PDF. Ukuran maksimal 10MB per item.
              </p>
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-white mr-1">Pengukuran & monitoring gas:</span>
                {(['ya', 'tidak'] as const).map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => {
                      if (opt === 'ya') {
                        setGasMonitoring('ya');
                      } else {
                        setGasMonitoring('tidak');
                        // Reset form gas kalau pilih tidak
                        setGasRows([emptyGasRow()]);
                        setDiukurOleh('');
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      gasMonitoring === opt
                        ? opt === 'ya' 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    {opt === 'ya' 
                      ? (sudahIsiGas ? '✓ Data Gas Terisi — Edit' : 'Ya — gunakan form kondisi gas') 
                      : 'Tidak'}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Formulir Pemeriksaan Kondisi Gas — muncul ketika toggle "Ya" dipilih */}
              {gasMonitoring === 'ya' && (
                <FormKondisiGas
                  rows={gasRows}
                  diukurOleh={diukurOleh}
                  onDiukurOlehChange={setDiukurOleh}
                  onRowChange={updateGasRow}
                  onAddRow={addGasRow}
                  onRemoveRow={removeGasRow}
                />
              )}

              {/* Safety Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
          <div className="flex">
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
          <button onClick={() => router.push('/dashboard/pemohon/sika/new')}
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
    </div>
  );
}