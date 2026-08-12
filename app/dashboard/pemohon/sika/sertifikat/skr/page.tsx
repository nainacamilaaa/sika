'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';
import { Users, Lock, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { buildChecklist } from '@/lib/sertifikatUtils';

const kondisiItems = [
  'Sertifikat Izin Bekerja Radiografi masih berlaku',
  'Kurva Pembelahan untuk Sumber',
  'Catatan Test kebocoran',
  'Sertifikat Kalibrasi Surveymeter Radiasi',
  'Surat Izin Pemanfaatan Tenaga Nuklir dari BAPETEN',
  'Setiap Pelaksana Radiografi menggunakan TLD Badge/dosimeter saku',
  'Sertifikat Kalibrasi Dosimeter saku masih berlaku',
  'Radio Komunikasi tersedia antara pelaksana lapangan dengan operator Control Room',
];

const pencegahanItems = [
  'Daerah telah ditandai pada batas daerah aman 7,5 µSv/jam',
  'Daerah telah bebas dari orang-orang yang tidak berkepentingan',
  'Orang-orang di sekeliling lokasi telah diinformasikan',
  'Flashing light dioperasikan ketika sumber dipaparkan (Shift Malam)',
  'Dilarang meninggalkan sumber radiasi tanpa pengawasan',
];

const safetyNotes = [
  'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
  'PASAL-5: P=Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk/bisa diterima — lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
  'Pelaksana kerja melapor sebelum dan sesudah melaksanakan kegiatan, disarankan pelaksanaan dilakukan pada saat jam istirahat/tidak banyak orang kerja.',
  'Ketahui 3 prinsip keselamatan pelaksanaan pekerjaan radiography; yaitu WAKTU-sesingkat mungkin, Jaga JARAK AMAN saat shooting dan gunakan SHIELDING/Pelindung.',
  'Gunakan radiasi secukupnya sehingga dapat memperkecil jarak tambah.',
  'Pastikan Containment/wadah sumber radiasi dalam kondisi yang baik, menghindari dari kebocoran.',
  'Gunakan/pakailah Dosimeter, seperti Film atau TLD badges.',
  'Hindari kontak dengan kontaminasi.',
  'Bawa dan pastikan, transportasi sumber radiasi dengan cara yang aman.',
  'Pasang barricade dan tanda peringatan selama pelaksanaan kegiatan radiography.',
];

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

type CheckVal = 'yes' | 'no' | null;
const allItems = [...kondisiItems, ...pencegahanItems];

export default function SKRPage() {
  const router = useRouter();
  const { sika, markSertifikatFilled, setSertifikatData } = useProgramStore();
  const { user } = useAuthStore();

  const NAMA = 'Sertifikat Kerja Radiografi (SKR)';

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
  const [tindakanLainnya, setTindakanLainnya] = useState('');

  // Data Formulir Pemeriksaan Kondisi Gas
  const [gasRows, setGasRows] = useState<GasRow[]>([emptyGasRow()]);
  const [diukurOleh, setDiukurOleh] = useState('');

  const updateGasRow = (index: number, field: keyof GasRow, value: string) => {
    setGasRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addGasRow = () => setGasRows((prev) => [...prev, emptyGasRow()]);

  const removeGasRow = (index: number) => {
    setGasRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  // State untuk notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  // Peralatan & Sertifikasi
  const [pengawasPelaksana, setPengawasPelaksana] = useState('');
  const [petugasProteksi, setPetugasProteksi] = useState('');
  const [ahliRadiografi, setAhliRadiografi] = useState('');

  // Jenis Sumber Radiasi
  const [jenisSumber, setJenisSumber] = useState('');
  const [kondisiMax, setKondisiMax] = useState('');
  const [aktivitas, setAktivitas] = useState('');

  const toggleChecklist = (index: number, val: 'yes' | 'no') => {
    setChecklist((prev) => ({ ...prev, [index]: prev[index] === val ? null : val }));
  };

  const yesCount    = Object.values(checklist).filter(v => v === 'yes').length;
  const noCount     = Object.values(checklist).filter(v => v === 'no').length;
  const totalFilled = yesCount + noCount;

  const sudahIsiGas = gasRows.some(r => r.time || r.lel || r.o2 || r.h2s || r.co2 || r.co || r.temp || r.sign || r.remark);

  // Menyusun seluruh data isian SKR menjadi satu objek — mengikuti pola
  // yang sama dengan buildData() di sika/sertifikat/skp & skd/page.tsx —
  // supaya Detail Program bisa menampilkan data ini via sertifikatData.
  const buildData = () => ({
    tanggalTerbit,
    jamMulai,
    jamSelesai,
    berlakuHingga,
    checklist: buildChecklist(allItems, checklist),
    checklistDocs: {},
    verifikasi,
    gasMonitoring,
    gasRows,
    diukurOleh,
    lainnya: {
      diisiOlehIA,
      pengawasPelaksana,
      petugasProteksi,
      ahliRadiografi,
      jenisSumber,
      kondisiMax,
      aktivitas,
      tindakanLainnya,
    },
  });

  const handleSimpan = () => {
    markSertifikatFilled(NAMA);
    setSertifikatData(NAMA, buildData(), user?.name || 'Pemohon');
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/dashboard/pemohon/sika/new');
    }, 1500);
  };

  const handleSaveAndClose = () => {
    markSertifikatFilled(NAMA);
    setSertifikatData(NAMA, buildData(), user?.name || 'Pemohon');
    router.push('/dashboard/pemohon/sika/new');
  };

  function ChecklistTable({ items, offset }: { items: string[]; offset: number }) {
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
                <tr key={i} className={`border-b border-gray-100 transition-colors ${
                  val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  <td className="px-4 py-3 text-gray-900 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm leading-relaxed">{item}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleChecklist(i, 'yes')}
                      className={`w-7 h-7 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                        val === 'yes' ? 'bg-green-500 border-green-500' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}>
                      {val === 'yes' && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleChecklist(i, 'no')}
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Entry Data</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Sertifikat Kerja Radiografi
            </span>
          </div>
        </div>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-400 rounded-lg px-6 py-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-800">Data Berhasil Disimpan!</p>
              <p className="text-sm text-green-600">Sertifikat Kerja Radiografi (SKR) telah ditandai sebagai terisi.</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6 space-y-4">

        {/* SATU BORDER — Rujukan/Hero s/d Bagian 5 dalam 1 container */}
        <div className="bg-white rounded border-2 border-white shadow-lg overflow-hidden">

          {/* HERO HEADER */}
          <div className="flex justify-end px-4 pt-2">
            <span className="text-xs text-gray-400 font-mono">F-014/B-003/PG0300/2026-S9</span>
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
                Sertifikat Kerja Radiografi
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
            <div className={`w-2 h-2 rounded-full ${totalFilled === allItems.length ? 'bg-green-500' : 'bg-amber-400'}`} />
            <span className="text-xs text-gray-500">{totalFilled}/{allItems.length} item checklist terisi</span>
          </div>

          {/* BAGIAN 1 — Tanggal, Jam, Berlaku */}
          <div className="flex items-stretch" style={{ minHeight: '48px' }}>
            <div className="flex flex-1 border-r border-blue-200">
              <div className="flex items-center justify-center px-5 py-2 border-r border-blue-200 bg-blue-100 shrink-0">
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
              <span className="text-xs text-blue-400 italic">Dilengkapi oleh Pelaksana Pekerjaan (PA)</span>
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

              {/* Dua kolom: Kondisi Peralatan (kiri) + Peralatan/Sertifikasi & Jenis Sumber (kanan) */}
              <div className="grid grid-cols-2 gap-5">
                {/* KIRI — Kondisi Peralatan + Pencegahan */}
                <div className="space-y-5">
                  <div>
                    <div className="mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded">Kondisi Peralatan</span>
                    </div>
                    <ChecklistTable items={kondisiItems} offset={0} />
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded">Pencegahan Khusus yang Dilakukan</span>
                    </div>
                    <ChecklistTable items={pencegahanItems} offset={kondisiItems.length} />
                  </div>
                </div>

                {/* KANAN — Peralatan/Sertifikasi & Jenis Sumber Radiasi */}
                <div className="space-y-5">
                  {/* Peralatan/Sertifikasi */}
                <div className="rounded overflow-hidden" style={{ border: '2px solid #FFFF00' }}>
                  <div className="px-4 py-2.5 border-b" style={{ backgroundColor: '#FFFF00', borderColor: '#e6e600' }}>
                    <span className="text-xs font-bold" style={{ color: '#000000' }}>Peralatan / Sertifikasi</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-600 font-medium">Diisi oleh Pengawas Pelaksana</p>
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">Nama Petugas Proteksi Radiasi</label>
                      <input type="text" value={petugasProteksi} onChange={(e) => setPetugasProteksi(e.target.value)}
                        placeholder="Nama lengkap..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">Nama Ahli Radiografi / Operator Radiografi</label>
                      <input type="text" value={ahliRadiografi} onChange={(e) => setAhliRadiografi(e.target.value)}
                        placeholder="Nama lengkap..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                  </div>
                </div>

                {/* Jenis Sumber Radiasi */}
                <div className="rounded overflow-hidden" style={{ border: '2px solid #FFFF00' }}>
                  <div className="px-4 py-2.5 border-b" style={{ backgroundColor: '#FFFF00', borderColor: '#e6e600' }}>
                    <span className="text-xs font-bold" style={{ color: '#000000' }}>Jenis Sumber Radiasi</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-sm text-black font-medium block mb-1">Jenis Sumber</label>
                      <input type="text" value={jenisSumber} onChange={(e) => setJenisSumber(e.target.value)}
                        placeholder="Contoh: Ir-192, Se-75, Co-60..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-black font-medium block mb-1">Kondisi Max. (X-ray) / Aktivitas</label>
                        <input type="text" value={kondisiMax} onChange={(e) => setKondisiMax(e.target.value)}
                          placeholder="kV/mA..."
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                      </div>
                      <div>
                        <label className="text-sm text-black font-medium block mb-1">Aktivitas (kV/mA/GBq/Ci)</label>
                        <input type="text" value={aktivitas} onChange={(e) => setAktivitas(e.target.value)}
                          placeholder="GBq/Ci..."
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition" />
                      </div>
                    </div>
                  </div>
                </div>
                                </div>
              </div>

              {/* Tindakan Pencegahan Lainnya */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Tindakan Pencegahan Lainnya</label>
                <textarea
                  value={tindakanLainnya}
                  onChange={(e) => setTindakanLainnya(e.target.value)}
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
                {(['ya', 'tidak'] as const).map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => {
                      if (opt === 'ya') {
                        setGasMonitoring('ya');
                      } else {
                        setGasMonitoring('tidak');
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
                      ? (sudahIsiGas ? '✓ Data Gas Terisi — Edit' : 'Ya — gunakan form pemeriksaan kondisi gas') 
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