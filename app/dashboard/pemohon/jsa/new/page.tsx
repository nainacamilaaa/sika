'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, X } from 'lucide-react';
import { useProgramStore } from '@/store/programStore';

export default function EntryJSAPage() {
  const router = useRouter();
  const setJSA = useProgramStore((s) => s.setJSA);

  const [form, setForm] = useState({
    kontraktor: '',
    lokasi: '',
    tanggalJSA: '',
    namaJSA: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFiles = Array.from(e.target.files || []);

    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      setError('Hanya file PDF dengan maksimal ukuran 10MB per file yang diperbolehkan.');
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveClose = () => {
    setJSA({
      jsaNo: '',
      kontraktor: form.kontraktor,
      lokasi: form.lokasi,
      tanggalJSA: formatTanggal(form.tanggalJSA),
      namaJSA: form.namaJSA,
      dokumen: files.map((f) => f.name),
    });
    alert('Data JSA disimpan sebagai draft.');
    router.push('/dashboard/pemohon');
  };

  const handleNext = () => {
    setJSA({
      jsaNo: '',
      kontraktor: form.kontraktor,
      lokasi: form.lokasi,
      tanggalJSA: formatTanggal(form.tanggalJSA),
      namaJSA: form.namaJSA,
      dokumen: files.map((f) => f.name),
    });
    router.push('/dashboard/pemohon/jsa/detail');
  };

  const handleBack = () => {
    router.back();
  };

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
          <span className="text-blue-400 cursor-pointer hover:underline">PROGRAM</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-800 cursor-pointer hover:underline">JSA</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-400 cursor-pointer hover:underline">DETAIL JSA</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="px-6 py-8">
        <div className="bg-white rounded border-2 border-blue-400 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-100 px-6 py-3 border-b border-blue-200">
            <span className="text-blue-700 font-bold text-base">ENTRY JOB SAFETY ANALYSIS</span>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-5">

            {/* Kontraktor */}
            <div className="flex items-center gap-4">
              <label className="w-48 text-sm text-gray-700 shrink-0 font-medium">
                Kontraktor
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="Masukkan nama kontraktor"
                value={form.kontraktor}
                onChange={(e) => handleChange('kontraktor', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Lokasi */}
            <div className="flex items-center gap-4">
              <label className="w-48 text-sm text-gray-700 shrink-0 font-medium">
                Lokasi
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="Masukkan lokasi kerja"
                value={form.lokasi}
                onChange={(e) => handleChange('lokasi', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Tanggal JSA */}
            <div className="flex items-center gap-4">
              <label className="w-48 text-sm text-gray-700 shrink-0 font-medium">
                Tanggal JSA
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="date"
                value={form.tanggalJSA}
                onChange={(e) => handleChange('tanggalJSA', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Nama JSA */}
            <div className="flex items-center gap-4">
              <label className="w-48 text-sm text-gray-700 shrink-0 font-medium">
                Nama JSA
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <input
                type="text"
                placeholder="Masukkan nama JSA"
                value={form.namaJSA}
                onChange={(e) => handleChange('namaJSA', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Dokumen Terkait */}
            <div className="flex items-start gap-4">
              <label className="w-48 text-sm text-gray-700 shrink-0 font-medium pt-2">
                Doc Terkait (Permohonan JSA dan Work Permit)
              </label>
              <span className="text-gray-400 shrink-0">:</span>
              <div className="flex-1 space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Klik untuk browse atau drag & drop file PDF
                    </span>
                    <span className="text-xs text-gray-400">Maksimal 10MB per file</span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">File terupload ({files.length}):</p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-500" />
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <span className="text-xs text-gray-400">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <p className="text-xs text-gray-400">*Max Size: 10mb per file, format PDF (Opsional)</p>
              </div>
            </div>

          </div>

          {/* ─── FOOTER BUTTONS ─── */}
          <div className="flex justify-end gap-3 py-6 px-8 border-t border-gray-100">
            <button
              onClick={handleBack}
              className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-md shadow-red-200"
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