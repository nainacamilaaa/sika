'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, Plus, Trash2 } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

function SectionHeader({ title, color = 'green' }: { title: string; color?: 'green' | 'gray' | 'blue' }) {
  const bg = color === 'green' ? '#16a34a' : color === 'blue' ? '#0d9488' : '#9ca3af';
  return (
    <div className="px-4 py-2 rounded-t" style={{ backgroundColor: bg }}>
      <span className="text-white font-bold text-sm tracking-wide">{title}</span>
    </div>
  );
}

function CheckboxItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 select-none">
      <input type="checkbox" checked={checked} readOnly
        className="w-3.5 h-3.5 rounded border-gray-400 accent-gray-600 flex-shrink-0" />
      <span className="text-sm text-gray-700 leading-snug">{label}</span>
    </label>
  );
}

function SafetyCheckItem({ label, value }: { label: string; value: boolean | undefined }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
        <span className="text-gray-400 mr-2">:</span>
        <label className="flex items-center gap-1">
          <input type="radio" readOnly checked={value === true} className="w-3.5 h-3.5 accent-gray-600" />
          <span className="text-sm text-gray-700">Yes</span>
        </label>
        <label className="flex items-center gap-1 ml-3">
          <input type="radio" readOnly checked={value === false} className="w-3.5 h-3.5 accent-gray-600" />
          <span className="text-sm text-gray-700">No</span>
        </label>
      </div>
    </div>
  );
}

interface ValidasiItem {
  id: number;
  tanggal: string;
  validasi: string;
  jamDari: string;
  jamSampai: string;
  status: string;
}

export default function ReviewWorkPermitPJAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noWP = searchParams.get('no');

  const { workPermitList, updateWorkPermitStatus, program, jsa } = useProgramStore();

  const wp = noWP
    ? workPermitList.find((w) => w.noWP === noWP)
    : workPermitList[workPermitList.length - 1];

  const isApproved = wp?.status === 'Approved';

  // ─── Modal & state untuk tombol Save/Reject/Approve (sebelum approved) ───
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ─── State Validasi (setelah approved) ───
  const [validasiList, setValidasiList] = useState<ValidasiItem[]>([]);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [formValidasi, setFormValidasi] = useState({
    tanggal: '',
    validasi: '',
    jamDari: '',
    jamSampai: '',
  });

  const handleSave = () => {
    if (!wp) return;
    alert('Data Work Permit berhasil disimpan.');
    // Data sudah tersimpan otomatis via Zustand persist
  };

  const handleReject = () => {
    if (!wp) return;
    updateWorkPermitStatus(wp.noWP, 'Rejected');
    setShowRejectModal(false);
    router.push('/dashboard/pja/daftar-work-permit');
  };

  const handleApprove = () => {
    if (!wp) return;
    updateWorkPermitStatus(wp.noWP, 'Approved');
    setShowApproveModal(false);
    router.push('/dashboard/pja/daftar-work-permit');
  };

  const handleSaveValidasi = () => {
    if (!formValidasi.tanggal || !formValidasi.validasi || !formValidasi.jamDari || !formValidasi.jamSampai) {
      alert('Semua field wajib diisi.');
      return;
    }
    setValidasiList((prev) => ([
      ...prev,
      {
        id: prev.length + 1,
        tanggal: formValidasi.tanggal,
        validasi: formValidasi.validasi,
        jamDari: formValidasi.jamDari,
        jamSampai: formValidasi.jamSampai,
        status: 'Open',
      },
    ]));
    setFormValidasi({ tanggal: '', validasi: '', jamDari: '', jamSampai: '' });
    setShowTambahModal(false);
  };

  const handleDeleteValidasi = (id: number) => {
    setValidasiList((prev) => prev.filter((v) => v.id !== id).map((v, i) => ({ ...v, id: i + 1 })));
  };

  if (!wp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">Work Permit tidak ditemukan.</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-600 text-sm hover:underline">Kembali</button>
        </div>
      </div>
    );
  }

  const safetyItems = [
    'Kabel listrik bawah tanah',
    'Kabel telepon bawah tanah',
    'Kabel instrument bawah tanah',
    'Gorong-gorong bawah tanah',
    'Pipa air/gas/minyak bawah tanah',
    'Dinding penggalian perlu dipasang turap',
    'Rambu peringatan telah terpasang',
    'Lokasi telah di beri batas/penghalang',
    'Lokasi bebas dari area mudah terbakar',
    'Memerlukan izin kerja yang lain',
  ];

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
        <div className="flex items-center gap-8 text-sm font-medium">
          <span
            onClick={() => router.push('/dashboard/pja/daftar-work-permit')}
            className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer"
          >
            DATA MANAGEMENT (JSA)
          </span>
          <span className="text-gray-500 cursor-pointer hover:text-gray-700">REPORT</span>
        </div>
      </div>

      {/* ─── STATUS HEADER ─── */}
      <div className="text-center py-4">
        <span className="text-gray-700 font-semibold text-base tracking-wide">
          STATUS : {wp.status}
        </span>
      </div>

      <div className="px-6 pb-8 space-y-5">

        {/* ─── INFO PROGRAM & JSA ─── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Data Program</h3>
            {[
              ['Nama Paket', program?.namaPaket],
              ['No Kontrak', program?.noKontrak],
              ['Pelaksana', program?.pelaksanaPerusahaan],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2 text-sm mb-1.5">
                <span className="w-28 text-gray-500 flex-shrink-0">{label}</span>
                <span className="text-gray-400">:</span>
                <span className="text-gray-800">{value || '-'}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Data JSA</h3>
            {[
              ['No JSA', jsa?.jsaNo],
              ['Nama Pekerjaan', jsa?.namaJSA],
              ['Lokasi', jsa?.lokasi],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2 text-sm mb-1.5">
                <span className="w-28 text-gray-500 flex-shrink-0">{label}</span>
                <span className="text-gray-400">:</span>
                <span className="text-gray-800">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── DATA WORK PERMIT ─── */}
        <div className="border border-green-500 rounded overflow-hidden">
          <SectionHeader title="DATA WORK PERMIT" />
          <div className="bg-white px-8 py-6">
            <div className="max-w-lg space-y-4">
              {[
                ['WPS No.', wp.noWP],
                ['Tanggal Pekerjaan', wp.tanggalMulai],
                ['Tanggal Selesai', wp.tanggalSelesai],
                ['Tipe Work Permit', wp.jenisWP],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-4">
                  <label className="w-40 text-sm text-gray-700 shrink-0">{label}</label>
                  <span className="text-gray-400 shrink-0">:</span>
                  <div className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 bg-gray-50">
                    {value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── SUMBER BAHAYA + ALAT PELINDUNG ─── */}
        <div className="grid grid-cols-2 gap-5">
          <div className="border border-green-500 rounded overflow-hidden">
            <SectionHeader title="SUMBER BAHAYA ALAT / KEGIATAN" />
            <div className="bg-white px-5 py-4">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {(wp.sumberBahaya ?? []).length > 0 ? (
                  wp.sumberBahaya.map((item) => <CheckboxItem key={item} label={item} checked={true} />)
                ) : (
                  <p className="text-gray-400 text-xs col-span-3">Tidak ada sumber bahaya dipilih.</p>
                )}
              </div>
            </div>
          </div>
          <div className="border border-green-500 rounded overflow-hidden">
            <SectionHeader title="ALAT PELINDUNG DIRI" />
            <div className="bg-white px-5 py-4">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {(wp.alatPelindung ?? []).length > 0 ? (
                  wp.alatPelindung.map((item) => <CheckboxItem key={item} label={item} checked={true} />)
                ) : (
                  <p className="text-gray-400 text-xs col-span-3">Tidak ada alat pelindung dipilih.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SAFETY CHECKLIST ─── */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <SectionHeader title="SAFETY CHECKLIST" color="gray" />
          <div className="bg-white px-6 py-4 space-y-1">
            <div>
              <p className="text-sm text-gray-700 mb-1">Jalur tersebut telah bebas dari</p>
              <div className="pl-6">
                {safetyItems.slice(0, 5).map((item) => (
                  <SafetyCheckItem key={item} label={item} value={wp.safetyChecklist?.[item]} />
                ))}
              </div>
            </div>
            {safetyItems.slice(5).map((item) => (
              <SafetyCheckItem key={item} label={item} value={wp.safetyChecklist?.[item]} />
            ))}
          </div>
        </div>

        {/* ─── VALIDASI WORK PERMIT (hanya kalau sudah Approved) ─── */}
        {isApproved && (
          <div className="border border-teal-500 rounded overflow-hidden">
            <SectionHeader title="Validasi Work Permit" color="blue" />
            <div className="bg-white px-5 py-4">
              <button
                onClick={() => setShowTambahModal(true)}
                className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded transition mb-4"
                style={{ backgroundColor: '#22c55e' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
              >
                <Plus size={16} />
                Tambah
              </button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#0d9488' }} className="text-white">
                      {['No.', 'Validasi', 'Tanggal', 'Waktu', 'Status', 'Approval', 'Action'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 font-semibold whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            {!['Action'].includes(h) && (
                              <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5z" />
                              </svg>
                            )}
                            {h}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validasiList.length > 0 ? (
                      validasiList.map((v) => (
                        <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{v.id}</td>
                          <td className="px-4 py-3 text-gray-800 max-w-xs">{v.validasi}</td>
                          <td className="px-4 py-3 text-gray-700 text-xs">{v.tanggal}</td>
                          <td className="px-4 py-3 text-gray-700 text-xs">
                            <div>{v.jamDari}</div>
                            <div className="text-gray-400">s/d {v.jamSampai}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded">
                              {v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">-</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteValidasi(v.id)}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded transition"
                            >
                              <Trash2 size={12} />
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-400 py-8 text-sm">
                          Belum ada validasi. Klik "Tambah" untuk menambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex justify-end gap-3 pt-2 pb-4">
          <button
            onClick={() => router.back()}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold px-6 py-2 rounded transition"
          >
            Cancel
          </button>

          {!isApproved && (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="text-white text-sm font-semibold px-6 py-2 rounded transition"
                style={{ backgroundColor: '#ef4444' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
              >
                Reject
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                className="text-white text-sm font-semibold px-6 py-2 rounded transition"
                style={{ backgroundColor: '#22c55e' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
              >
                Save and Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── MODAL TAMBAH VALIDASI ─── */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-5">Tambah Validasi</h3>

            <div className="space-y-4">
              {/* Tanggal */}
              <div className="flex items-start gap-4">
                <label className="w-24 text-sm text-gray-700 flex-shrink-0 pt-1.5">Tanggal</label>
                <span className="text-gray-400 flex-shrink-0 pt-1.5">:</span>
                <input
                  type="date"
                  value={formValidasi.tanggal}
                  onChange={(e) => setFormValidasi((p) => ({ ...p, tanggal: e.target.value }))}
                  className="flex-1 border border-red-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Validasi */}
              <div className="flex items-start gap-4">
                <label className="w-24 text-sm text-gray-700 flex-shrink-0 pt-1.5">Validasi</label>
                <span className="text-gray-400 flex-shrink-0 pt-1.5">:</span>
                <textarea
                  value={formValidasi.validasi}
                  onChange={(e) => setFormValidasi((p) => ({ ...p, validasi: e.target.value }))}
                  rows={3}
                  className="flex-1 border border-red-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                />
              </div>

              {/* Jam */}
              <div className="flex items-start gap-4">
                <label className="w-24 text-sm text-gray-700 flex-shrink-0 pt-1.5">Jam</label>
                <span className="text-gray-400 flex-shrink-0 pt-1.5">:</span>
                <div className="flex-1 space-y-2">
                  <input
                    type="time"
                    value={formValidasi.jamDari}
                    onChange={(e) => setFormValidasi((p) => ({ ...p, jamDari: e.target.value }))}
                    placeholder="Dari Jam"
                    className="w-full border border-red-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    type="time"
                    value={formValidasi.jamSampai}
                    onChange={(e) => setFormValidasi((p) => ({ ...p, jamSampai: e.target.value }))}
                    placeholder="Sampai Jam"
                    className="w-full border border-red-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowTambahModal(false); setFormValidasi({ tanggal: '', validasi: '', jamDari: '', jamSampai: '' }); }}
                className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={handleSaveValidasi}
                className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded font-semibold transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL REJECT ─── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">Konfirmasi Reject</h3>
            <p className="text-sm text-gray-600 mb-3">Berikan alasan penolakan Work Permit ini:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tuliskan alasan reject..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm text-white rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#ef4444' }}
              >
                Ya, Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL APPROVE ─── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">Konfirmasi Approve</h3>
            <p className="text-sm text-gray-600 mb-5">
              Apakah Anda yakin ingin <span className="text-green-600 font-semibold">menyetujui</span> Work Permit ini?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 text-sm text-white rounded font-semibold transition"
                style={{ backgroundColor: '#22c55e' }}
              >
                Ya, Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}