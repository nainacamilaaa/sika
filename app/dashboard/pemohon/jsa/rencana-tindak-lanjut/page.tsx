'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

const INTENSITAS_OPTIONS = [
  '(1) Terjadi diatas 6 Bulan sekali.',
  '(2) Terjadi 3-6 Bulan sekali.',
  '(3) Terjadi 1-3 Bulan sekali.',
  '(4) Terjadi beberapa kali sebulan.',
  '(5) Terjadi setiap hari.',
];

const HISTORY_OPTIONS = [
  '(1) Tidak pernah terjadi diperusahaan maupun Industri sejenis atau industry lain',
  '(2) Pernah terjadi di perusahaan sejenis.',
  '(3) Pernah terjadi di perusahaan ini.',
  '(4) Terjadi beberapa kali di perusahaan ini.',
  '(5) Terjadi sering di perusahaan ini.',
];

const KAPABILITAS_OPTIONS = [
  '(1) Banyak Lapisan kontrol eksisting sehingga bahaya/ancaman belum pernah terjadi',
  '(2) Beberapa lapisan kontrol eksisting.',
  '(3) Satu lapisan kontrol eksisting.',
  '(4) Tidak ada kontrol eksisting.',
  '(5) Kontrol tidak efektif.',
];

const KEPARAHAN_OPTIONS = [
  '(1) Ringan',
  '(2) Sedang',
  '(3) Berat',
  '(4) Kritis',
  '(5) Fatal',
];

function calcLevel(intensitas: string, history: string, kapabilitas: string): string {
  const i = parseInt(intensitas.charAt(1)) || 0;
  const h = parseInt(history.charAt(1)) || 0;
  const k = parseInt(kapabilitas.charAt(1)) || 0;
  const total = i + h + k;
  if (total <= 5) return 'Jarang';
  if (total <= 9) return 'Kadang';
  if (total <= 12) return 'Sering';
  return 'Sangat Sering';
}

function calcResiko(level: string, keparahan: string): string {
  const k = parseInt(keparahan.charAt(1)) || 0;
  const levelMap: Record<string, number> = { 'Jarang': 1, 'Kadang': 2, 'Sering': 3, 'Sangat Sering': 4 };
  const score = (levelMap[level] || 1) * k;
  if (score <= 3) return 'Risiko Rendah';
  if (score <= 8) return 'Risiko Sedang';
  if (score <= 12) return 'Risiko Tinggi';
  return 'Risiko Ekstrim';
}

export default function RencanaTindakLanjutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveRTL } = useProgramStore();

  const paramPotensiBahaya = searchParams.get('potensiBahaya') || '';
  const paramIntensitas    = searchParams.get('intensitas')    || INTENSITAS_OPTIONS[0];
  const paramHistory       = searchParams.get('history')       || HISTORY_OPTIONS[0];
  const paramKapabilitas   = searchParams.get('kapabilitas')   || KAPABILITAS_OPTIONS[0];
  const paramKeparahan     = searchParams.get('keparahan')     || KEPARAHAN_OPTIONS[2];
  const paramAktivitasNo   = searchParams.get('aktivitasNo') || '0';

  const [dueDate, setDueDate]                         = useState('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState('');
  const [intensitas, setIntensitas]                   = useState(paramIntensitas);
  const [history, setHistory]                         = useState(paramHistory);
  const [kapabilitas, setKapabilitas]                 = useState(paramKapabilitas);
  const [keparahan, setKeparahan]                     = useState(paramKeparahan);

  const level         = calcLevel(intensitas, history, kapabilitas);
  const tingkatResiko = calcResiko(level, keparahan);

  const handleSimpan = () => {
    if (!dueDate || !rencanaTindakLanjut) {
      alert('Tanggal Due Date dan Rencana Tindak Lanjut wajib diisi.');
      return;
    }
    saveRTL({
      aktivitasNo: parseInt(paramAktivitasNo),
      dueDate,
      rencanaTindakLanjut,
      potensiBahayaSebelum: paramPotensiBahaya,
      konsekuensiSebelum: '',
      kemungkinanSebelum: '',
      tingkatResikoSebelum: '',
      potensiBahayaSetelah: '',
      konsekuensiSetelah: '',
      kemungkinanSetelah: '',
      tingkatResikoSetelah: '',
    });
    alert('Rencana Tindak Lanjut berhasil disimpan.');
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 pl-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-400 cursor-pointer hover:underline">PROGRAM</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">JSA</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 cursor-pointer hover:underline">DETAIL JSA</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-8">
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">

          {/* Subheader */}
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-sm">TINDAK LANJUT JOB SAFETY ANALYSIS</span>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">

            {/* Due Date */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Due Date</label>
              <span className="text-gray-400 flex-shrink-0">:</span>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Rencana Tindak Lanjut */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Rencana Tindak Lanjut</label>
              <span className="text-gray-400 flex-shrink-0">:</span>
              <input
                type="text"
                value={rencanaTindakLanjut}
                onChange={(e) => setRencanaTindakLanjut(e.target.value)}
                placeholder="Masukkan rencana tindak lanjut"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Potensi Bahaya */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Potensi Bahaya</label>
              <span className="text-gray-400 flex-shrink-0">:</span>
              <input
                type="text"
                value={paramPotensiBahaya}
                readOnly
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 bg-gray-100 cursor-default"
              />
            </div>

            {/* ─── TINGKAT KEMUNGKINAN ─── */}
            <div className="px-0 py-0 space-y-5">
              <p className="text-sm font-semibold text-gray-700">Tingkat Kemungkinan</p>

              {/* Intensitas */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Intensitas</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <select
                  value={intensitas}
                  onChange={(e) => setIntensitas(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  {INTENSITAS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Histori Kejadian */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Histori Kejadian</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <select
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  {HISTORY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Kapabilitas */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Kapabilitas</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <select
                  value={kapabilitas}
                  onChange={(e) => setKapabilitas(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  {KAPABILITAS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Level (read-only) */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Level</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <input
                  type="text"
                  value={level}
                  readOnly
                  className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 bg-gray-100 cursor-default"
                />
              </div>

              {/* Tingkat Keparahan */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Tingkat Keparahan</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <select
                  value={keparahan}
                  onChange={(e) => setKeparahan(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  {KEPARAHAN_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Tingkat Resiko (read-only) */}
              <div className="flex items-center gap-4">
                <label className="w-64 text-sm text-gray-700 flex-shrink-0 font-medium">Tingkat Resiko</label>
                <span className="text-gray-400 flex-shrink-0">:</span>
                <input
                  type="text"
                  value={tingkatResiko}
                  readOnly
                  className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 bg-gray-100 cursor-default"
                />
              </div>
            </div>

          </div>

          {/* ─── FOOTER BUTTONS ─── */}
          <div className="flex justify-center gap-3 py-6 border-t border-gray-100">
            <button
              onClick={() => router.back()}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-8 py-2 rounded transition"
            >
              Batal
            </button>
            <button
              onClick={handleSimpan}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-8 py-2 rounded transition"
            >
              Simpan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}