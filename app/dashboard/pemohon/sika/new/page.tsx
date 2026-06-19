'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

export default function SikaNewPage() {
  const router = useRouter();
  const { program, setSika } = useProgramStore();

  const [form, setForm] = useState({
    fungsiPerusahaan: program?.pelaksanaPerusahaan || '',
    lokasiInstalasi: program?.lokasiKerja || '',
    peralatanNoIdentitas: '',
    uraianPekerjaan: '',
    peralatanDigunakan: '',
  });

  const [pekerjaList, setPekerjaList] = useState<string[]>(['']);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPekerja = () => {
    setPekerjaList((prev) => [...prev, '']);
  };

  const handlePekerjaChange = (index: number, value: string) => {
    setPekerjaList((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const handleRemovePekerja = (index: number) => {
    if (pekerjaList.length === 1) return;
    setPekerjaList((prev) => prev.filter((_, i) => i !== index));
  };

  const saveToStore = () => {
    setSika({
      fungsiPerusahaan: form.fungsiPerusahaan,
      lokasiInstalasi: form.lokasiInstalasi,
      peralatanNoIdentitas: form.peralatanNoIdentitas,
      uraianPekerjaan: form.uraianPekerjaan,
      peralatanDigunakan: form.peralatanDigunakan,
      pekerjaList: pekerjaList.filter((p) => p.trim() !== ''),
    });
  };

  const handleSaveClose = () => {
    saveToStore();
    router.push('/dashboard/pemohon/data-management');
  };

  const handleNext = () => {
    saveToStore();
    router.push('/dashboard/pemohon/sika/pemeriksaan');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '30px' }}>
          <div className="flex items-center gap-2">
            <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-800 font-semibold">JENIS PEKERJAAN</span>
          <span className="text-gray-400">&gt;</span>
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push('/dashboard/pemohon/sika/pemeriksaan')}
          >
            PEMERIKSAAN
          </span>
          <span className="text-gray-400">&gt;</span>
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push('/dashboard/pemohon/sika/formulir')}
          >
            FORMULIR SIKA
          </span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-8">
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">

          {/* Subheader */}
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-sm">JENIS PEKERJAAN</span>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">

            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Fungsi / Perusahaan</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                value={form.fungsiPerusahaan}
                onChange={(e) => handleChange('fungsiPerusahaan', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Lokasi / Instalasi</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                value={form.lokasiInstalasi}
                onChange={(e) => handleChange('lokasiInstalasi', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Peralatan / No. Identitas</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                value={form.peralatanNoIdentitas}
                onChange={(e) => handleChange('peralatanNoIdentitas', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 pt-2 font-medium">Uraian Pekerjaan</label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <textarea
                value={form.uraianPekerjaan}
                onChange={(e) => handleChange('uraianPekerjaan', e.target.value)}
                rows={4}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              />
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 pt-2 font-medium">Peralatan yang Digunakan</label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <textarea
                value={form.peralatanDigunakan}
                onChange={(e) => handleChange('peralatanDigunakan', e.target.value)}
                rows={3}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              />
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 pt-2 font-medium">Jumlah Pekerja</label>
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
                      onChange={(e) => handlePekerjaChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    {pekerjaList.length > 1 && (
                      <button onClick={() => handleRemovePekerja(index)} className="text-red-400 hover:text-red-600 transition shrink-0">
                        <X size={16} />
                      </button>
                    )}
                    {index === pekerjaList.length - 1 && (
                      <button onClick={handleAddPekerja} className="w-8 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center shrink-0 transition">
                        <Plus size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── FOOTER BUTTONS ─── */}
          <div className="flex justify-end gap-3 py-6 px-8 border-t border-gray-100">
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
      </div>
    </div>
  );
}