'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgramStore } from '@/store/programStore';

type RiskLevel = string;

interface JSARow {
  id: string;
  langkah: string;
  peralatan: string;
  potensiBahaya: string;
  tingkatRisiko: RiskLevel;
  mitigasi: string;
  penanggungjawab: string;
}

interface JSASection {
  key: string;
  label: string;
  rows: JSARow[];
}

interface PPEItem {
  label: string;
  checked: boolean;
}

const makeRow = (id: string): JSARow => ({
  id,
  langkah: '',
  peralatan: '',
  potensiBahaya: '',
  tingkatRisiko: '',
  mitigasi: '',
  penanggungjawab: '',
});

const getRiskStyle = (value: string): { bg: string; text: string } => {
  const v = value.trim().toLowerCase();
  if (!v) return { bg: '#f1f5f9', text: '#94a3b8' };
  if (v.includes('tinggi') || v.includes('high')) return { bg: '#fef2f2', text: '#b91c1c' };
  if (v.includes('sedang') || v.includes('medium') || v.includes('med')) return { bg: '#fefce8', text: '#a16207' };
  if (v.includes('rendah') || v.includes('low')) return { bg: '#f0fdf4', text: '#15803d' };
  return { bg: '#f1f5f9', text: '#64748b' };
};

const INITIAL_SECTIONS: JSASection[] = [
  { key: 'A', label: 'Persiapan Awal', rows: [makeRow('A1'), makeRow('A2')] },
  { key: 'B', label: 'Pelaksanaan Pekerjaan', rows: [makeRow('B1'), makeRow('B2')] },
  { key: 'C', label: 'Selesai Pekerjaan', rows: [makeRow('C1'), makeRow('C2')] },
];

const INITIAL_PPE: PPEItem[][] = [
  [
    { label: 'Safety Helmet', checked: false },
    { label: 'Goggles / Face Shield', checked: false },
    { label: 'Leather / Chemical Gloves', checked: false },
    { label: 'Safety Sign', checked: false },
  ],
  [
    { label: 'Safety Shoes', checked: false },
    { label: 'Earplug / Earmuff', checked: false },
    { label: 'Safety Harness / Lifelines', checked: false },
    { label: 'SIKA', checked: false },
  ],
  [
    { label: 'Safety Glasses', checked: false },
    { label: 'Dust / Welding Mask', checked: false },
    { label: 'Life Vest', checked: false },
    { label: 'Radio Communication', checked: false },
  ],
  [
    { label: 'Coveralls', checked: false },
    { label: 'Catridge / Filter Mask', checked: false },
    { label: 'Fire Extinguisher', checked: false },
    { label: 'Others :', checked: false },
  ],
];

export default function DetailJSAPage() {
  const router = useRouter();
  const { program, sika, jsa, setJSA } = useProgramStore();

  useEffect(() => {
    if (!program) router.replace('/dashboard/pemohon/program/new');
    else if (!sika) router.replace('/dashboard/pemohon/sika/new');
  }, [program, sika]);

  const [meta, setMeta] = useState({
    judulPekerjaan: jsa?.judulPekerjaan ?? '',
    tanggal: jsa?.tanggalJSA ?? '',
    lokasi: jsa?.lokasi ?? '',
    halaman: jsa?.halaman ?? '1',
    totalHalaman: jsa?.totalHalaman ?? '1',
    noSIKA: jsa?.jsaNo ?? '',
    status: (jsa?.status ?? 'baru') as 'baru' | 'revisi',
  });

  const [sections, setSections] = useState<JSASection[]>(
    jsa?.sections?.length ? jsa.sections : INITIAL_SECTIONS
  );

  const [ppe, setPpe] = useState<PPEItem[][]>(() => {
    if (!jsa?.checkedPPE?.length) return INITIAL_PPE;
    return INITIAL_PPE.map((row) =>
      row.map((item) => ({ ...item, checked: jsa.checkedPPE.includes(item.label) }))
    );
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMetaChange = (field: string, value: string) => {
    setMeta((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateRow = (sectionKey: string, rowId: string, field: keyof JSARow, value: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.key !== sectionKey ? sec : {
          ...sec,
          rows: sec.rows.map((row) => row.id !== rowId ? row : { ...row, [field]: value }),
        }
      )
    );
  };

  const addRow = (sectionKey: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.key !== sectionKey) return sec;
        const nextNum = sec.rows.length + 1;
        return { ...sec, rows: [...sec.rows, makeRow(`${sectionKey}${nextNum}`)] };
      })
    );
  };

  const removeRow = (sectionKey: string, rowId: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.key !== sectionKey ? sec : { ...sec, rows: sec.rows.filter((r) => r.id !== rowId) }
      )
    );
  };

  const togglePPE = (rowIdx: number, colIdx: number) => {
    setPpe((prev) =>
      prev.map((row, ri) =>
        ri !== rowIdx ? row : row.map((item, ci) =>
          ci !== colIdx ? item : { ...item, checked: !item.checked }
        )
      )
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!meta.judulPekerjaan.trim()) newErrors.judulPekerjaan = 'Judul pekerjaan wajib diisi';
    if (!meta.tanggal) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!meta.lokasi.trim()) newErrors.lokasi = 'Lokasi wajib diisi';
    const hasLangkah = sections.some((sec) => sec.rows.some((row) => row.langkah.trim() !== ''));
    if (!hasLangkah) newErrors.sections = 'Minimal satu langkah pekerjaan wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildJSAData = () => ({
    jsaNo: meta.noSIKA,
    kontraktor: jsa?.kontraktor ?? '',
    lokasi: meta.lokasi,
    tanggalJSA: meta.tanggal,
    namaJSA: meta.judulPekerjaan,
    dokumen: jsa?.dokumen ?? [],
    judulPekerjaan: meta.judulPekerjaan,
    halaman: meta.halaman,
    totalHalaman: meta.totalHalaman,
    status: meta.status,
    sections,
    checkedPPE: ppe.flat().filter((item) => item.checked).map((item) => item.label),
  });

  const handleSaveClose = () => {
    setJSA(buildJSAData());
    router.push('/dashboard/pemohon');
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setJSA(buildJSAData());
    router.push('/dashboard/pemohon/jsa/detail');
  };

  const inputStyle = {
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1.5px solid #3b82f6';
    e.target.style.background = '#eff6ff';
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = '1.5px solid #cbd5e1';
    e.target.style.background = '#ffffff';
  };

  const metaInputClass = (field: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 placeholder-gray-400 ${
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
            <span className="text-sm font-bold text-gray-800">JSA</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Job Safety Analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0">
          {[
            { label: 'Program', active: false },
            { label: 'Pengisian SIKA', active: false },
            { label: 'Pengisian JSA', active: true },
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
              <span className="text-white font-bold text-sm tracking-wide">DETAIL JOB SAFETY ANALYSIS</span>
              <p className="text-blue-200 text-xs mt-0.5">Isi seluruh kolom dengan lengkap dan benar</p>
            </div>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              JSA Form
            </span>
          </div>

          <div className="px-8 py-4">
            <table className="w-full text-sm border-collapse">
              <colgroup>
                <col className="w-44" />
                <col className="w-6" />
                <col />
                <col className="w-8" />
                <col className="w-28" />
                <col className="w-6" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">
                    Judul Pekerjaan <span className="text-red-500">*</span>
                  </td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1 pr-10">
                    <div>
                      <input
                        type="text"
                        value={meta.judulPekerjaan}
                        onChange={(e) => handleMetaChange('judulPekerjaan', e.target.value)}
                        placeholder="Masukkan judul pekerjaan"
                        className={metaInputClass('judulPekerjaan')}
                      />
                      {errors.judulPekerjaan && (
                        <p className="text-red-500 text-xs mt-1">{errors.judulPekerjaan}</p>
                      )}
                    </div>
                  </td>
                  <td />
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">
                    Tanggal <span className="text-red-500">*</span>
                  </td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1">
                    <div>
                      <input
                        type="date"
                        value={meta.tanggal}
                        onChange={(e) => handleMetaChange('tanggal', e.target.value)}
                        className={metaInputClass('tanggal')}
                      />
                      {errors.tanggal && (
                        <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">
                    Lokasi <span className="text-red-500">*</span>
                  </td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1 pr-10">
                    <div>
                      <input
                        type="text"
                        value={meta.lokasi}
                        onChange={(e) => handleMetaChange('lokasi', e.target.value)}
                        placeholder="Masukkan lokasi kerja"
                        className={metaInputClass('lokasi')}
                      />
                      {errors.lokasi && (
                        <p className="text-red-500 text-xs mt-1">{errors.lokasi}</p>
                      )}
                    </div>
                  </td>
                  <td />
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">Halaman</td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={meta.halaman}
                        onChange={(e) => handleMetaChange('halaman', e.target.value)}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                      />
                      <span className="text-gray-400 text-sm">dari</span>
                      <input
                        type="number"
                        min={1}
                        value={meta.totalHalaman}
                        onChange={(e) => handleMetaChange('totalHalaman', e.target.value)}
                        className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">No. SIKA</td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1 pr-10">
                    <input
                      type="text"
                      value={meta.noSIKA}
                      onChange={(e) => handleMetaChange('noSIKA', e.target.value)}
                      placeholder="Masukkan No. SIKA"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
                    />
                  </td>
                  <td />
                  <td className="py-1 font-medium text-gray-700 whitespace-nowrap">Status</td>
                  <td className="py-1 px-3 text-gray-400">:</td>
                  <td className="py-1">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input
                          type="radio"
                          name="status"
                          value="baru"
                          checked={meta.status === 'baru'}
                          onChange={() => handleMetaChange('status', 'baru')}
                          className="accent-blue-600"
                        />
                        Baru
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input
                          type="radio"
                          name="status"
                          value="revisi"
                          checked={meta.status === 'revisi'}
                          onChange={() => handleMetaChange('status', 'revisi')}
                          className="accent-blue-600"
                        />
                        Revisi
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mx-8 border-t-2 border-dashed border-gray-200" />

          {errors.sections && (
            <div className="mx-8 mt-4">
              <p className="text-red-500 text-xs">{errors.sections}</p>
            </div>
          )}

          <div className="px-8 py-6 overflow-x-auto">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: '#ffffff' }}>
                    <th className="px-2 py-3 text-center w-8 font-medium text-gray-700 border-r border-gray-200">No</th>
                    <th className="px-3 py-3 text-center w-[22%] font-semibold text-gray-500 border-r border-gray-200">Langkah-langkah / Urutan<br />Pekerjaan</th>
                    <th className="px-3 py-3 text-center w-[18%] font-semibold text-gray-500 border-r border-gray-200">Peralatan / Material yang<br />Digunakan</th>
                    <th className="px-3 py-3 text-center w-[20%] font-semibold text-gray-500 border-r border-gray-200">Potensi Bahaya</th>
                    <th className="px-3 py-3 text-center w-[9%] font-semibold text-gray-500 border-r border-gray-200">Tingkat<br />Risiko</th>
                    <th className="px-3 py-3 text-center w-[22%] font-semibold text-gray-500 border-r border-gray-200">Mitigasi Untuk Menghilangkan atau<br />Mengurangi Bahaya &amp; Resiko</th>
                    <th className="px-3 py-3 text-center w-[10%] font-semibold text-gray-500 border-r border-gray-200">Penanggung<br />Jawab</th>
                    <th className="px-2 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec) => (
                    <Fragment key={sec.key}>
                      <tr style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
                        <td className="px-2 py-2.5 text-center font-bold text-blue-700 border-r border-blue-100">{sec.key}</td>
                        <td colSpan={7} className="px-3 py-2.5 font-bold text-blue-800 tracking-wide text-xs uppercase">{sec.label}</td>
                      </tr>
                      {sec.rows.map((row, rowIdx) => {
                        const risk = getRiskStyle(row.tingkatRisiko);
                        const isEven = rowIdx % 2 === 0;
                        return (
                          <tr
                            key={row.id}
                            className="group divide-x divide-gray-200 transition-colors"
                            style={{ background: isEven ? '#ffffff' : '#f8fafc' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? '#ffffff' : '#f8fafc')}
                          >
                            <td className="px-2 py-2 text-center font-semibold text-gray-400 border-r border-gray-200 w-8">{rowIdx + 1}</td>
                            <td className="px-2 py-2 border-r border-gray-200">
                              <input type="text" value={row.langkah} onChange={(e) => updateRow(sec.key, row.id, 'langkah', e.target.value)} placeholder="Langkah pekerjaan..." className="w-full outline-none text-xs text-gray-800 placeholder-gray-300 rounded px-2 py-1.5 transition" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                            </td>
                            <td className="px-2 py-2 border-r border-gray-200">
                              <input type="text" value={row.peralatan} onChange={(e) => updateRow(sec.key, row.id, 'peralatan', e.target.value)} placeholder="Peralatan/material..." className="w-full outline-none text-xs text-gray-800 placeholder-gray-300 rounded px-2 py-1.5 transition" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                            </td>
                            <td className="px-2 py-2 border-r border-gray-200">
                              <input type="text" value={row.potensiBahaya} onChange={(e) => updateRow(sec.key, row.id, 'potensiBahaya', e.target.value)} placeholder="Potensi bahaya..." className="w-full outline-none text-xs text-gray-800 placeholder-gray-300 rounded px-2 py-1.5 transition" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                            </td>
                            <td className="px-1.5 py-2 text-center border-r border-gray-200">
                              <input type="text" value={row.tingkatRisiko} onChange={(e) => updateRow(sec.key, row.id, 'tingkatRisiko', e.target.value)} placeholder="Risiko" style={{ background: risk.bg, color: risk.text, border: `1.5px solid ${risk.text}60`, fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }} className="w-full rounded-full text-xs py-1 px-2 text-center outline-none placeholder-gray-300 transition" />
                            </td>
                            <td className="px-2 py-2 border-r border-gray-200">
                              <input type="text" value={row.mitigasi} onChange={(e) => updateRow(sec.key, row.id, 'mitigasi', e.target.value)} placeholder="Mitigasi bahaya..." className="w-full outline-none text-xs text-gray-800 placeholder-gray-300 rounded px-2 py-1.5 transition" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                            </td>
                            <td className="px-2 py-2 border-r border-gray-200">
                              <input type="text" value={row.penanggungjawab} onChange={(e) => updateRow(sec.key, row.id, 'penanggungjawab', e.target.value)} placeholder="PJ..." className="w-full outline-none text-xs text-gray-800 placeholder-gray-300 rounded px-2 py-1.5 transition" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                            </td>
                            <td className="px-1 py-2 text-center">
                              {sec.rows.length > 1 && (
                                <button onClick={() => removeRow(sec.key, row.id)} className="inline-flex items-center justify-center w-5 h-5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all text-sm leading-none" title="Hapus baris">×</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#ffffff' }}>
                        <td colSpan={8} className="px-4 py-2 border-t border-dashed border-gray-200">
                          <button onClick={() => addRow(sec.key)} className="text-red-400 hover:text-red-600 text-xs font-semibold transition flex items-center gap-1">
                            <span className="text-base leading-none">+</span> Tambah Baris
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mx-8 border-t-2 border-dashed border-gray-200" />

          <div className="px-8 py-6">
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th colSpan={8} style={{ background: '#1e40af', color: 'white' }} className="px-3 py-3 text-center font-bold tracking-widest uppercase border border-blue-700">
                    Peralatan Pelindung dan Sistem yang Digunakan untuk Melakukan Pekerjaan Ini
                  </th>
                </tr>
              </thead>
              <tbody>
                {ppe.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    {row.map((item, ci) => (
                      <Fragment key={ci}>
                        <td className={`border border-gray-200 px-3 py-2.5 text-gray-700 text-xs font-medium ${item.label === 'Others :' ? 'underline' : ''}`}>
                          {item.label}
                        </td>
                        <td className="border border-gray-200 w-10 text-center cursor-pointer select-none transition" onClick={() => togglePPE(ri, ci)} style={{ background: item.checked ? '#eff6ff' : undefined }}>
                          {item.checked
                            ? <span style={{ color: '#1d4ed8', fontSize: '16px', fontWeight: 700 }}>✓</span>
                            : <span style={{ color: '#cbd5e1', fontSize: '16px' }}>□</span>}
                        </td>
                      </Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2 italic">
              *Berikan tanda ✓ didalam kotak untuk peralatan pelindung dan sistem yang digunakan
            </p>
          </div>

          <div className="flex justify-end gap-3 py-6 px-8 border-t border-gray-100">
            <button
              onClick={() => router.push('/dashboard/pemohon/sika/pemeriksaan')}
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
              onClick={handleSubmit}
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