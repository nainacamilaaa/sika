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

  const handleClearState = () => {
    setForm({
      fungsiPerusahaan: '',
      lokasiInstalasi: '',
      peralatanNoIdentitas: '',
      uraianPekerjaan: '',
      peralatanDigunakan: '',
    });
    setPekerjaList(['']);
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

  const handleNext = () => {
    saveToStore();
    router.push('/dashboard/pemohon/sika/pemeriksaan');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2" style={{ paddingLeft: '30px' }}>
        <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
        <div className="w-px h-5 bg-gray-300 mx-2" />
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">SIKA (Sistem Kerja Aman)</span>
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
            {i < arr.length - 1 && (
              <div className="w-8 h-px bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>

          {/* ─── CONTENT ─── */}
        <div className="px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            {/* Subheader */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div>
                <span className="text-white font-bold text-sm tracking-wide">JENIS PEKERJAAN</span>
                <p className="text-blue-200 text-xs mt-0.5">Isi seluruh kolom dengan lengkap dan benar</p>
              </div>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                Surat Izin Kerja (SIKA)
              </span>
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
              onClick={() => {
                handleClearState();
                router.push('/dashboard/pemohon/program/new');
              }}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition shadow-md shadow-red-200"
            >
              Back
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