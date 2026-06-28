'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

export default function SikaNewPage() {
  const router = useRouter();
  const { program, sika, setSikaBasic } = useProgramStore();

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
  }, [program]);

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

  const handleAddPekerja = () => setPekerjaList((prev) => [...prev, '']);

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

  const buildPayload = () => ({
    fungsiPerusahaan: form.fungsiPerusahaan,
    lokasiInstalasi: form.lokasiInstalasi,
    peralatanNoIdentitas: form.peralatanNoIdentitas,
    uraianPekerjaan: form.uraianPekerjaan,
    peralatanDigunakan: form.peralatanDigunakan,
    pekerjaList: pekerjaList.filter((p) => p.trim() !== ''),
    noSIKA: sika?.noSIKA || '',
    tanggalSIKA: sika?.tanggalSIKA || '',
  });

  const handleSaveClose = () => {
    setSikaBasic(buildPayload());
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
    if (!validate()) return;
    setSikaBasic(buildPayload());
    router.push('/dashboard/pemohon/sika/pemeriksaan');
  };

  const inputClass = (field: string) =>
    `flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">SIKA</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Surat Izin Kerja
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

      <div className="px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

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
                      onChange={(e) => handlePekerjaChange(index, e.target.value)}
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

          <div className="flex justify-end gap-3 py-6 px-8 border-t border-gray-100">
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
      </div>
    </div>
  );
}