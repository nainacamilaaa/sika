'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';

export default function EntryProgramPage() {
  const router = useRouter();
  const { setProgram, program } = useProgramStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    lokasiKerja: program?.lokasiKerja || '',
    namaPaket: program?.namaPaket || '',
    noKontrak: program?.noKontrak || '',
    tanggalKontrak: program?.tanggalKontrak || '',
    satKerjaPemberi: program?.satKerjaPemberi || '',
    pelaksanaJenis: program?.pelaksanaJenis || '',
    pelaksanaPerusahaan: program?.pelaksanaPerusahaan || '',
    picPemberiList: program?.picPemberiList || [''],
    pimpinanPelaksanaList: program?.pimpinanPelaksanaList || [''],
    satKerjaPenanggung: program?.satKerjaPenanggung || '',
    fungsiIA: program?.fungsiIA || '',
    picPenanggungList: program?.picPenanggungList || [''],
  });

  const handleChange = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.lokasiKerja) newErrors.lokasiKerja = 'Lokasi kerja wajib dipilih';
    if (!form.namaPaket.trim()) newErrors.namaPaket = 'Judul kontrak kerja wajib diisi';
    if (!form.noKontrak.trim()) newErrors.noKontrak = 'No. kontrak wajib diisi';
    if (!form.tanggalKontrak) newErrors.tanggalKontrak = 'Tanggal kontrak wajib diisi';
    if (!form.satKerjaPemberi) newErrors.satKerjaPemberi = 'Fungsi penanggung jawab pekerjaan wajib dipilih';
    if (!form.pelaksanaJenis) newErrors.pelaksanaJenis = 'Jenis pelaksana wajib dipilih';
    if (!form.pelaksanaPerusahaan) newErrors.pelaksanaPerusahaan = 'Perusahaan pelaksana wajib dipilih';
    if (!form.picPemberiList[0]?.trim()) newErrors.picPemberiList = 'PA wajib dipilih';
    if (!form.pimpinanPelaksanaList[0]?.trim()) newErrors.pimpinanPelaksanaList = 'Pimpinan pelaksana pekerjaan wajib dipilih';
    if (!form.satKerjaPenanggung) newErrors.satKerjaPenanggung = 'Fungsi penanggung jawab aset wajib dipilih';
    if (!form.fungsiIA) newErrors.fungsiIA = 'Fungsi IA wajib dipilih';
    if (!form.picPenanggungList[0]?.trim()) newErrors.picPenanggungList = 'PIC IA wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClose = () => {
    setProgram(form);
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
    if (!validate()) return;
    setProgram(form);
    router.push('/dashboard/pemohon/sika/new');
  };

  const opsiLokasi = [
    'Kantor Pusat',
    'Operation North Sumatera Area',
    'Operation Rokan Area',
    'Operation Dumai Area',
    'Operation Central Sumatera Area',
    'Operation South Sumatera Area',
    'Operation West Java Area',
    'Operation East Java Area',
    'Operation Kalimantan Area',
    'Project Management',
  ];

  const opsiFungsi = [
    'Procurement & Facilities Management',
    'Technical Management',
    'Infrastructure Management',
    'Operation West Region',
    'Operation East Region',
    'Operation North Sumatra Area',
    'Operation Central Sumatra Area',
    'Operation South Sumatra Area',
    'Operation Dumai Area',
    'Operation Rokan Area',
    'Operation West Java Area',
    'Operation East Java Area',
    'Operation Kalimantan Area',
  ];

  const opsiPIC = ['Test 1', 'Test 2', 'Test 3'];
  const opsiPelaksana = ['Test 1', 'Test 2', 'Test 3'];
  const opsiPerusahaan = ['Test 1', 'Test 2', 'Test 3'];
  const opsiFungsiIA = [
    'Procurement & Facilities Management',
    'Technical Management',
    'Infrastructure Management',
    'Operation West Region',
    'Operation East Region',
    'Operation North Sumatra Area',
    'Operation Central Sumatra Area',
    'Operation South Sumatra Area',
    'Operation Dumai Area',
    'Operation Rokan Area',
    'Operation West Java Area',
    'Operation East Java Area',
    'Operation Kalimantan Area',
  ];

  const renderPICRows = (
    listKey: 'picPemberiList' | 'pimpinanPelaksanaList' | 'picPenanggungList',
    list: string[]
  ) => (
    <div className="flex-1 flex flex-col gap-2">
      {list.map((val, idx) => (
        <div key={`${listKey}-${idx}`} className="flex gap-2 items-center">
          <select
            value={val}
            onChange={(e) => {
              const updated = [...list];
              updated[idx] = e.target.value;
              handleChange(listKey, updated);
            }}
            className={`flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 bg-white ${
              idx === 0 && errors[listKey]
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-400'
            }`}
          >
            <option value="">-- Pilih --</option>
            {opsiPIC.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {idx === 0 ? (
            <button
              type="button"
              onClick={() => handleChange(listKey, [...list, ''])}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition whitespace-nowrap"
            >
              Tambah PIC
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleChange(listKey, list.filter((_, i) => i !== idx))}
              className="text-red-500 hover:text-red-700 transition shrink-0 p-2"
              aria-label="Hapus"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {errors[listKey] && (
        <p className="text-red-500 text-xs">{errors[listKey]}</p>
      )}
    </div>
  );

  const fieldClass = (field: string) =>
    `flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 bg-white ${
      errors[field]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-blue-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Entry Data</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Formulir Pengajuan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0">
            {[
              { label: 'Program', active: true },
              { label: 'Pengisian SIKA', active: false },
              { label: 'Pengisian JSA', active: false },
              { label: 'Detail Program', active: false },
            ].map((step, i, arr) => (
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

      <div className="px-6 pt-3 pb-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">ENTRY PROGRAM</span>
              <p className="text-blue-200 text-xs mt-0.5">Isi seluruh kolom dengan lengkap dan benar</p>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              Program Form
            </span>
          </div>

          <div className="px-8 py-6 space-y-5">

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Lokasi Kerja <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <select
                  value={form.lokasiKerja}
                  onChange={(e) => handleChange('lokasiKerja', e.target.value)}
                  className={fieldClass('lokasiKerja')}
                >
                  <option value="">-- Pilih --</option>
                  {opsiLokasi.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.lokasiKerja && (
                  <p className="text-red-500 text-xs mt-1">{errors.lokasiKerja}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Judul Kontrak Kerja <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nama paket pekerjaan"
                  value={form.namaPaket}
                  onChange={(e) => handleChange('namaPaket', e.target.value)}
                  className={fieldClass('namaPaket')}
                />
                {errors.namaPaket && (
                  <p className="text-red-500 text-xs mt-1">{errors.namaPaket}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                No. Kontrak <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="No. Kontrak"
                  value={form.noKontrak}
                  onChange={(e) => handleChange('noKontrak', e.target.value.replace(/\D/g, '').slice(0, 15))}
                  maxLength={15}
                  inputMode="numeric"
                  className={fieldClass('noKontrak')}
                />
                {errors.noKontrak && (
                  <p className="text-red-500 text-xs mt-1">{errors.noKontrak}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Tanggal Kontrak <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <input
                  type="date"
                  value={form.tanggalKontrak}
                  onChange={(e) => handleChange('tanggalKontrak', e.target.value)}
                  className={fieldClass('tanggalKontrak')}
                />
                {errors.tanggalKontrak && (
                  <p className="text-red-500 text-xs mt-1">{errors.tanggalKontrak}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Fungsi (Penanggung Jawab Pekerjaan) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <select
                  value={form.satKerjaPemberi}
                  onChange={(e) => handleChange('satKerjaPemberi', e.target.value)}
                  className={fieldClass('satKerjaPemberi')}
                >
                  <option value="">-- Pilih --</option>
                  {opsiFungsi.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.satKerjaPemberi && (
                  <p className="text-red-500 text-xs mt-1">{errors.satKerjaPemberi}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Perusahaan Pelaksana <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex gap-2">
                  <select
                    value={form.pelaksanaJenis}
                    onChange={(e) => handleChange('pelaksanaJenis', e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 bg-white ${
                      errors.pelaksanaJenis
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  >
                    <option value="">-- Jenis --</option>
                    {opsiPelaksana.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <select
                    value={form.pelaksanaPerusahaan}
                    onChange={(e) => handleChange('pelaksanaPerusahaan', e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 bg-white ${
                      errors.pelaksanaPerusahaan
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  >
                    <option value="">-- Perusahaan --</option>
                    {opsiPerusahaan.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {(errors.pelaksanaJenis || errors.pelaksanaPerusahaan) && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pelaksanaJenis || errors.pelaksanaPerusahaan}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                PA (Pelaksana Pekerjaan/Performing Authority) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('picPemberiList', form.picPemberiList)}
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Pimpinan Pelaksana Pekerjaan (PPA) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('pimpinanPelaksanaList', form.pimpinanPelaksanaList)}
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Fungsi (Penanggung Jawab Aset) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <select
                  value={form.satKerjaPenanggung}
                  onChange={(e) => handleChange('satKerjaPenanggung', e.target.value)}
                  className={fieldClass('satKerjaPenanggung')}
                >
                  <option value="">-- Pilih --</option>
                  {opsiFungsi.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.satKerjaPenanggung && (
                  <p className="text-red-500 text-xs mt-1">{errors.satKerjaPenanggung}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Fungsi IA (Pemberi Izin Aset/Asset Holder/Issuing Authority) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              <div className="flex-1">
                <select
                  value={form.fungsiIA}
                  onChange={(e) => handleChange('fungsiIA', e.target.value)}
                  className={fieldClass('fungsiIA')}
                >
                  <option value="">-- Pilih --</option>
                  {opsiFungsiIA.map((o) => <option key={o}>{o}</option>)}
                </select>
                {errors.fungsiIA && (
                  <p className="text-red-500 text-xs mt-1">{errors.fungsiIA}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                PIC IA (Pemberi Izin Aset/Asset Holder/Issuing Authority) <span className="text-red-500">*</span>
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('picPenanggungList', form.picPenanggungList)}
            </div>

          </div>

          <div className="flex justify-end gap-3 py-6 px-8 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveClose}
              className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition shadow-md shadow-green-200"
            >
              Save and Close
            </button>
            <button
              type="button"
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