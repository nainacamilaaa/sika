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
    picPemberi: '',
    satKerjaPenanggung: '',
    picPenanggung: '',
    pelaksanaJenis: '',
    pelaksanaPerusahaan: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClose = () => {
    setProgram(form);
    alert('Data disimpan sebagai draft.');
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
    setProgram(form);
    router.push('/dashboard/pemohon/jsa/new');
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
    'Project Management'
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
    'Operation Kalimantan Area'
  ];
  const opsiPIC = ['Test 1', 'Test 2', 'Test 3'];
  const opsiPelaksana = ['Test 1', 'Test 2', 'Test 3'];
  const opsiPerusahaan = ['Test 1', 'Test 2', 'Test 3'];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ─── TOP NAVBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '30px' }}>
          <div className="flex items-center gap-2">
            <img
              src="/logosika.svg"
              alt="SIKA"
              className="h-7 object-contain"
            />
            <span className="font-bold text-gray-800 text-sm tracking-wide">ENTRY DATA</span>
          </div>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <span className="text-blue-800 cursor-pointer hover:underline">PROGRAM</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">JSA</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">DETAIL JSA</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-8">
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">

          {/* Subheader */}
          <div className="bg-blue-100 px-6 py-2 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-sm">ENTRY PROGRAM</span>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">

            {/* Lokasi Kerja */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Lokasi Kerja
              </label>
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

            {/* Nama Paket Pekerjaan */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Nama Paket Pekerjaan (Kontrak)
              </label>
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
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                No. Kontrak
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="No. Kontrak"
                value={form.noKontrak}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                  handleChange('noKontrak', value);
                }}
                maxLength={15}
                inputMode="numeric"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Tanggal Kontrak */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Tanggal Kontrak
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="date"
                value={form.tanggalKontrak}
                onChange={(e) => handleChange('tanggalKontrak', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
              />
            </div>

            {/* Fungsi Pemberi Kerja */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Fungsi (Pemberi Kerja)
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

            {/* PIC Pemberi Kerja */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                PA (Pelaksana Pekerjaan)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <div className="flex-1 flex gap-2">
                <select
                  value={form.picPemberi}
                  onChange={(e) => handleChange('picPemberi', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  <option value="">-- Pilih --</option>
                  {opsiPIC.map((o) => <option key={o}>{o}</option>)}
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition whitespace-nowrap">
                  Tambah PIC
                </button>
              </div>
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

            {/* PIC Penanggung Jawab Aset */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                PIC (Penanggung Jawab Aset)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <div className="flex-1 flex gap-2">
                <select
                  value={form.picPenanggung}
                  onChange={(e) => handleChange('picPenanggung', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  <option value="">-- Pilih --</option>
                  {opsiPIC.map((o) => <option key={o}>{o}</option>)}
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition whitespace-nowrap">
                  Tambah PIC
                </button>
              </div>
            </div>

            {/* Pelaksana */}
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm text-gray-700 shrink-0 font-medium">
                Pelaksana
              </label>
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