'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';

export default function EntryProgramPage() {
  const router = useRouter();
  const setProgram = useProgramStore((s) => s.setProgram);

  const [form, setForm] = useState({
    lokasiKerja: '',
    namaPaket: '',
    noKontrak: '',
    tanggalKontrak: '',
    satKerjaPemberi: '',
    pelaksanaJenis: '',
    pelaksanaPerusahaan: '',
    picPemberiList: [''],
    pimpinanPelaksanaList: [''],
    satKerjaPenanggung: '',
    fungsiIA: '',
    picPenanggungList: [''],
  });

  const handleChange = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClose = () => {
    setProgram(form);
    alert('Data disimpan sebagai draft.');
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
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
      <div key={`${listKey}-${idx}`} className="flex gap-2">
        <select
          value={val}
          onChange={(e) => {
            const updated = [...list];
            updated[idx] = e.target.value;
            handleChange(listKey, updated);
          }}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
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
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded transition whitespace-nowrap"
          >
            Hapus
          </button>
        )}
      </div>
    ))}
  </div>
);

  return (
    <div className="min-h-screen bg-gray-100">

    {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ paddingLeft: '30px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-5 bg-gray-300 mx-2" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Entry Data</span>
        </div>

        <div className="flex items-center gap-0">
          {[
            { label: 'Program', active: true },
            { label: 'Pengisian SIKA', active: false },
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
              <span className="text-white font-bold text-sm tracking-wide">ENTRY PROGRAM</span>
              <p className="text-blue-200 text-xs mt-0.5">Isi seluruh kolom dengan lengkap dan benar</p>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              Program Form
            </span>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">

            {/* Lokasi Kerja */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Lokasi Kerja</label>
              <span className="text-gray-400 shrink-0">:</span>
              <select
                value={form.lokasiKerja}
                onChange={(e) => handleChange('lokasiKerja', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">-- Pilih --</option>
                {opsiLokasi.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Judul Kontrak Kerja */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Judul Kontrak Kerja</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="Nama paket pekerjaan"
                value={form.namaPaket}
                onChange={(e) => handleChange('namaPaket', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* No. Kontrak */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">No. Kontrak</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="No. Kontrak"
                value={form.noKontrak}
                onChange={(e) => handleChange('noKontrak', e.target.value.replace(/\D/g, '').slice(0, 15))}
                maxLength={15}
                inputMode="numeric"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Tanggal Kontrak */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Tanggal Kontrak</label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="date"
                value={form.tanggalKontrak}
                onChange={(e) => handleChange('tanggalKontrak', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
              />
            </div>

            {/* Fungsi Penanggung Jawab Pekerjaan */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Fungsi (Penanggung Jawab Pekerjaan)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <select
                value={form.satKerjaPemberi}
                onChange={(e) => handleChange('satKerjaPemberi', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">-- Pilih --</option>
                {opsiFungsi.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Perusahaan Pelaksana */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">Perusahaan Pelaksana</label>
              <span className="text-gray-400 shrink-0">:</span>
              <div className="flex-1 flex gap-2">
                <select
                  value={form.pelaksanaJenis}
                  onChange={(e) => handleChange('pelaksanaJenis', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  <option value="">-- Jenis --</option>
                  {opsiPelaksana.map((o) => <option key={o}>{o}</option>)}
                </select>
                <select
                  value={form.pelaksanaPerusahaan}
                  onChange={(e) => handleChange('pelaksanaPerusahaan', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  <option value="">-- Perusahaan --</option>
                  {opsiPerusahaan.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* PA - Pelaksana Pekerjaan */}
            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                PA (Pelaksana Pekerjaan/Performing Authority)
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('picPemberiList', form.picPemberiList)}
            </div>

            {/* Pimpinan Pelaksana Pekerjaan (PPA) */}
            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Pimpinan Pelaksana Pekerjaan (PPA)
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('pimpinanPelaksanaList', form.pimpinanPelaksanaList)}
            </div>

            {/* Fungsi Penanggung Jawab Aset */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Fungsi (Penanggung Jawab Aset)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <select
                value={form.satKerjaPenanggung}
                onChange={(e) => handleChange('satKerjaPenanggung', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">-- Pilih --</option>
                {opsiFungsi.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* Fungsi IA */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Fungsi IA (Pemberi Izin Aset/Asset Holder/Issuing Authority)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <select
                value={form.fungsiIA}
                onChange={(e) => handleChange('fungsiIA', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
              >
                <option value="">-- Pilih --</option>
                {opsiFungsiIA.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            {/* PIC IA */}
            <div className="flex items-start gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium pt-2">
                PIC IA (Pemberi Izin Aset/Asset Holder/Issuing Authority)
              </label>
              <span className="text-gray-400 shrink-0 pt-2">:</span>
              {renderPICRows('picPenanggungList', form.picPenanggungList)}
            </div>

          </div>

          {/* ─── FOOTER BUTTONS ─── */}
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