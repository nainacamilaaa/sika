'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, CheckCircle, XCircle, Clock, FileText, History } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';

function ChipGroup({ label, items }: { label: string; items?: string[] }) {
  return (
    <div>
      <span className="text-xs text-gray-500 font-medium block mb-1.5">{label}</span>
      {items?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-300 text-xs">-</span>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-44 text-xs text-gray-500 shrink-0 font-medium">{label}</span>
      <span className="text-gray-400 shrink-0 text-xs">:</span>
      <span className="text-xs text-gray-800">{value || '-'}</span>
    </div>
  );
}

type ModalType = 'approve-sika' | 'reject-sika' | 'approve-jsa' | 'reject-jsa' | null;

export default function PemberiReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuthStore();
  const {
    program, jsa, sika,
    sikaStatusPemberi, jsaStatusPemberi,
    alasanTolakSikaPemberi, alasanTolakJsaPemberi,
    approveSikaPemberi, rejectSikaPemberi,
    approveJsaPemberi, rejectJsaPemberi,
    approvalHistory,
  } = useProgramStore();

  useEffect(() => {
    if (!program || !sika || !jsa) {
      router.replace('/dashboard/pemberi/data-management');
    } else if (id !== 'store-1') {
      // Saat ini hanya satu pengajuan aktif yang tersimpan di store (id: 'store-1').
      // Kalau nanti sudah pakai backend dengan banyak pengajuan, ganti logic ini
      // untuk fetch data berdasarkan id dari URL.
      router.replace('/dashboard/pemberi/data-management');
    }
  }, [program, sika, jsa, id]);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [alasan, setAlasan] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const sikaApproved = sikaStatusPemberi === 'approved';
  const sikaRejected = sikaStatusPemberi === 'rejected';
  const jsaApproved = jsaStatusPemberi === 'approved';
  const jsaRejected = jsaStatusPemberi === 'rejected';
  const jsaLocked = sikaStatusPemberi !== 'approved';

  const openModal = (type: ModalType) => {
    setAlasan('');
    setAlasanError('');
    setModalType(type);
  };

  const handleConfirm = () => {
    const namaUser = user?.name || 'Pemberi Kerja';

    if ((modalType === 'reject-sika' || modalType === 'reject-jsa') && !alasan.trim()) {
      setAlasanError('Alasan penolakan wajib diisi.');
      return;
    }
    if (modalType === 'approve-sika') approveSikaPemberi(namaUser);
    if (modalType === 'reject-sika') rejectSikaPemberi(namaUser, alasan.trim());
    if (modalType === 'approve-jsa') approveJsaPemberi(namaUser);
    if (modalType === 'reject-jsa') rejectJsaPemberi(namaUser, alasan.trim());
    setModalType(null);
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'rejected') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const statusLabel: Record<string, string> = {
    draft: 'Belum Direview',
    request: 'Perlu Direview',
    waiting: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
  };

  const relevantHistory = approvalHistory
    .filter((h) => h.peran === 'pemberi' || h.peran === 'pemohon')
    .slice()
    .reverse();

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  if (!program || !sika || !jsa) return null;

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <img src="/logosika.svg" alt="SIKA" className="h-7 object-contain" />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-800">Detail Review</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Pemberi Kerja — Approval SIKA &amp; JSA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mr-6">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-200 transition"
          >
            <History size={15} /> Riwayat
          </button>
          <button
            onClick={() => router.push('/dashboard/pemberi/data-management')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-200 transition"
          >
            <ChevronLeft size={15} /> Kembali
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">DATA PROGRAM</span>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <InfoRow label="Nama Paket" value={program.namaPaket} />
              <InfoRow label="No. Kontrak" value={program.noKontrak} />
              <InfoRow label="Tanggal Kontrak" value={program.tanggalKontrak} />
              <InfoRow label="Lokasi Kerja" value={program.lokasiKerja} />
              <InfoRow label="Fungsi PJ Pekerjaan" value={program.satKerjaPemberi} />
              <InfoRow label="Perusahaan Pelaksana" value={program.pelaksanaPerusahaan} />
              <InfoRow label="PIC Pemberi Kerja" value={program.picPemberiList?.[0]} />
              <InfoRow label="Fungsi PJ Aset" value={program.satKerjaPenanggung} />
              <InfoRow label="Fungsi IA" value={program.fungsiIA} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">SIKA — JENIS PEKERJAAN</span>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <InfoRow label="Fungsi / Perusahaan" value={sika.fungsiPerusahaan} />
              <InfoRow label="Lokasi / Instalasi" value={sika.lokasiInstalasi} />
              <InfoRow label="Peralatan / No. Identitas" value={sika.peralatanNoIdentitas} />
              <InfoRow label="Uraian Pekerjaan" value={sika.uraianPekerjaan} />
              <InfoRow label="Peralatan Digunakan" value={sika.peralatanDigunakan} />
              <InfoRow label="Jumlah Pekerja" value={sika.pekerjaList?.length ? `${sika.pekerjaList.length} orang` : undefined} />
              {!!sika.pekerjaList?.length && (
                <div className="flex gap-3">
                  <span className="w-44 text-xs text-gray-500 shrink-0 font-medium">Nama Pekerja</span>
                  <span className="text-gray-400 shrink-0 text-xs">:</span>
                  <div className="flex flex-wrap gap-1">
                    {sika.pekerjaList.map((p, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">PEMERIKSAAN SIKA</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <ChipGroup label="Isolasi Peralatan" items={sika.isolasi} />
              <ChipGroup label="Lampiran" items={sika.lampiran} />
              <ChipGroup label="Identifikasi Bahaya" items={sika.identifikasi} />
              {sika.identifikasiTambahan && <InfoRow label="Identifikasi Tambahan" value={sika.identifikasiTambahan} />}
              <ChipGroup label="Pengendalian Bahaya" items={sika.pengendalian} />
              {sika.permintaanTambahan && <InfoRow label="Permintaan Tambahan" value={sika.permintaanTambahan} />}
              <ChipGroup label="Sertifikat" items={sika.sertifikat} />
              <InfoRow label="Sifat Pekerjaan" value={sika.sifatPekerjaan} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <span className="text-white font-bold text-xs tracking-wide">JOB SAFETY ANALYSIS</span>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <InfoRow label="No. SIKA" value={jsa.jsaNo} />
              <InfoRow label="Judul Pekerjaan" value={jsa.judulPekerjaan} />
              <InfoRow label="Tanggal" value={jsa.tanggalJSA} />
              <InfoRow label="Lokasi" value={jsa.lokasi} />
              <InfoRow label="Status" value={jsa.status === 'revisi' ? 'Revisi' : 'Baru'} />
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 font-medium mb-2">Langkah Pekerjaan</p>
                {jsa.sections?.map((sec) => (
                  <div key={sec.key} className="mb-2">
                    <p className="text-xs font-bold text-blue-700 mb-1">{sec.key}. {sec.label}</p>
                    {sec.rows.filter(r => r.langkah.trim()).map((row, ri) => (
                      <div key={ri} className="text-xs text-gray-600 pl-3 py-0.5 border-l-2 border-blue-100 mb-1">
                        <span className="font-medium">{row.langkah}</span>
                        {row.potensiBahaya && <span className="text-gray-400"> — {row.potensiBahaya}</span>}
                        {row.tingkatRisiko && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            row.tingkatRisiko.toLowerCase().includes('tinggi') ? 'bg-red-100 text-red-600' :
                            row.tingkatRisiko.toLowerCase().includes('sedang') ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>{row.tingkatRisiko}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <span className="text-white font-bold text-xs tracking-wide">PROSES APPROVAL</span>
            <p className="text-blue-200 text-[10px] mt-0.5">SIKA harus disetujui terlebih dahulu sebelum JSA dapat diproses</p>
          </div>

          <div className="px-6 py-5 grid grid-cols-2 gap-6">

            <div className={`rounded-xl border-2 p-5 ${
              sikaApproved ? 'border-green-200 bg-green-50' :
              sikaRejected ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-bold text-gray-800">SIKA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusIcon(sikaStatusPemberi)}
                  <span className={`text-xs font-semibold ${
                    sikaApproved ? 'text-green-600' : sikaRejected ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {statusLabel[sikaStatusPemberi] ?? 'Belum Direview'}
                  </span>
                </div>
              </div>

              {sikaApproved && (
                <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-lg px-3 py-2 mb-4">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">
                    SIKA telah disetujui dan diteruskan ke Penanggung Jawab Aset. Keputusan ini bersifat final dan tidak dapat diubah dari halaman ini.
                  </p>
                </div>
              )}

              {sikaRejected && alasanTolakSikaPemberi && (
                <div className="mb-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-medium mb-0.5">Alasan Penolakan:</p>
                  <p className="text-xs text-red-700">{alasanTolakSikaPemberi}</p>
                  <p className="text-[10px] text-red-500 mt-1.5">
                    Menunggu pemohon mengajukan ulang setelah revisi.
                  </p>
                </div>
              )}

              {!sikaApproved && !sikaRejected && (
                <p className="text-xs text-gray-500 mb-4">Periksa dokumen SIKA di atas sebelum memberikan keputusan.</p>
              )}

              {!sikaApproved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('approve-sika')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <CheckCircle size={13} /> Setujui SIKA
                  </button>
                  <button
                    onClick={() => openModal('reject-sika')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <XCircle size={13} /> Tolak SIKA
                  </button>
                </div>
              )}
            </div>

            <div className={`rounded-xl border-2 p-5 ${
              jsaLocked ? 'border-gray-200 bg-gray-50 opacity-60' :
              jsaApproved ? 'border-green-200 bg-green-50' :
              jsaRejected ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className={jsaLocked ? 'text-gray-400' : 'text-blue-600'} />
                  <span className="text-sm font-bold text-gray-800">JSA</span>
                  {jsaLocked && (
                    <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      Terkunci
                    </span>
                  )}
                </div>
                {!jsaLocked && (
                  <div className="flex items-center gap-1.5">
                    {statusIcon(jsaStatusPemberi)}
                    <span className={`text-xs font-semibold ${
                      jsaApproved ? 'text-green-600' : jsaRejected ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {statusLabel[jsaStatusPemberi] ?? 'Belum Direview'}
                    </span>
                  </div>
                )}
              </div>

              {jsaLocked && (
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 mb-4">
                  <Clock size={13} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500">JSA baru dapat diproses setelah SIKA disetujui.</p>
                </div>
              )}

              {jsaApproved && (
                <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-lg px-3 py-2 mb-4">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">
                    JSA telah disetujui dan diteruskan ke Penanggung Jawab Aset. Keputusan ini bersifat final.
                  </p>
                </div>
              )}

              {jsaRejected && alasanTolakJsaPemberi && (
                <div className="mb-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-600 font-medium mb-0.5">Alasan Penolakan:</p>
                  <p className="text-xs text-red-700">{alasanTolakJsaPemberi}</p>
                  <p className="text-[10px] text-red-500 mt-1.5">
                    Menunggu pemohon mengajukan ulang setelah revisi.
                  </p>
                </div>
              )}

              {!jsaLocked && !jsaApproved && !jsaRejected && (
                <p className="text-xs text-gray-500 mb-4">Periksa dokumen JSA di atas sebelum memberikan keputusan.</p>
              )}

              {!jsaLocked && !jsaApproved && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('approve-jsa')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <CheckCircle size={13} /> Setujui JSA
                  </button>
                  <button
                    onClick={() => openModal('reject-jsa')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    <XCircle size={13} /> Tolak JSA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <p className="text-white font-bold text-sm">
                {modalType === 'approve-sika' && 'Konfirmasi Persetujuan SIKA'}
                {modalType === 'reject-sika' && 'Penolakan SIKA'}
                {modalType === 'approve-jsa' && 'Konfirmasi Persetujuan JSA'}
                {modalType === 'reject-jsa' && 'Penolakan JSA'}
              </p>
              <p className="text-blue-200 text-xs mt-0.5">
                {modalType?.startsWith('approve')
                  ? 'Keputusan ini bersifat final dan tidak dapat diubah setelah disetujui.'
                  : 'Pemohon akan menerima notifikasi dan dapat melakukan revisi.'}
              </p>
            </div>

            <div className="px-6 py-5">
              {modalType?.startsWith('approve') ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <p className="text-sm text-green-700">
                    Dengan menyetujui, dokumen {modalType === 'approve-sika' ? 'SIKA' : 'JSA'} akan diteruskan ke Penanggung Jawab Aset dan keputusan ini <strong>tidak dapat dibatalkan</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">
                      Dokumen {modalType === 'reject-sika' ? 'SIKA' : 'JSA'} akan dikembalikan ke pemohon untuk direvisi.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-medium block mb-1.5">
                      Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={alasan}
                      onChange={(e) => { setAlasan(e.target.value); setAlasanError(''); }}
                      placeholder="Tuliskan alasan penolakan secara jelas dan detail..."
                      className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 resize-none ${
                        alasanError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
                      }`}
                    />
                    {alasanError && <p className="text-red-500 text-xs mt-1">{alasanError}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition ${
                  modalType?.startsWith('approve')
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {modalType?.startsWith('approve') ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div>
                <p className="text-white font-bold text-sm">Riwayat Approval</p>
                <p className="text-blue-200 text-xs mt-0.5">SIKA &amp; JSA — Pemberi Kerja</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 hover:bg-white/20 rounded-full flex items-center justify-center transition text-white"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {relevantHistory.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-10">Belum ada riwayat aktivitas.</p>
              ) : (
                <div className="space-y-3">
                  {relevantHistory.map((h) => {
                    const aksiLabel = h.aksi === 'approve' ? 'Menyetujui' : h.aksi === 'reject' ? 'Menolak' : 'Mengajukan ulang';
                    const aksiColor = h.aksi === 'approve' ? 'text-green-600' : h.aksi === 'reject' ? 'text-red-600' : 'text-blue-600';
                    const dokumenLabel = h.dokumen === 'sika' ? 'SIKA' : 'JSA';
                    return (
                      <div key={h.id} className="border border-gray-100 rounded-lg px-3 py-2.5 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${aksiColor}`}>
                            {aksiLabel} {dokumenLabel}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatTimestamp(h.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          oleh <span className="font-medium">{h.oleh}</span>
                          <span className="text-gray-400"> ({h.peran === 'pemberi' ? 'Pemberi Kerja' : 'Pemohon'})</span>
                        </p>
                        {h.alasan && (
                          <p className="text-xs text-gray-500 mt-1 italic">"{h.alasan}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}