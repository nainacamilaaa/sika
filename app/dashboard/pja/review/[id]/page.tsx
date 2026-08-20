'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, FileText, History, Check, ArrowLeft } from 'lucide-react';
import { useProgramStore, getNomorSika } from '@/store/programStore';
import type { ApprovalStatus, SertifikatData, SikaData } from '@/store/programStore';
import { useAuthStore } from '@/store/authStore';

/* =========================================================================
 * Printed-form building blocks — sama persis dengan yang dipakai di halaman
 * Detail Program milik Pemohon dan Pemberi Review.
 * ======================================================================= */

function FormField({
  label,
  value,
  labelWidth = 'w-40',
}: {
  label: string;
  value?: string;
  labelWidth?: string;
}) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className={`${labelWidth} shrink-0 text-gray-700`}>{label}</span>
      <span className="text-gray-400">:</span>
      <span className="flex-1 font-medium text-gray-900 wrap-break-word">{value || '-'}</span>
    </div>
  );
}

function CheckList({ items, columns = 2 }: { items?: string[]; columns?: number }) {
  if (!items?.length) return <span className="text-gray-400 text-xs italic">Belum dipilih</span>;
  return (
    <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5 text-[11px]">
          <span className="w-3.5 h-3.5 mt-0.5 border border-gray-800 bg-blue-600 flex items-center justify-center shrink-0">
            <Check size={10} className="text-white" strokeWidth={3} />
          </span>
          <span className="text-gray-800">{item}</span>
        </div>
      ))}
    </div>
  );
}

function FullCheckList({ options, selected, columns = 2 }: { options: string[]; selected?: string[]; columns?: number }) {
  return (
    <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => {
        const checked = !!selected?.includes(opt);
        return (
          <div key={opt} className="flex items-start gap-1.5 text-[11px]">
            <span
              className={`w-3.5 h-3.5 mt-0.5 border flex items-center justify-center shrink-0 ${
                checked ? 'border-gray-800 bg-blue-600' : 'border-gray-400 bg-white'
              }`}
            >
              {checked && <Check size={10} className="text-white" strokeWidth={3} />}
            </span>
            <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-400'}>{opt}</span>
          </div>
        );
      })}
    </div>
  );
}

const ISOLASI_OPTIONS = [
  'Electrical Circuits', 'Gas Valve', 'Water Valves',
  'Air Instrument Valves', 'Mekanik', 'Pneumatic/Hydraulic',
];

const LAMPIRAN_OPTIONS = [
  'JSA', 'TKO, TKI, TKPA', 'P&ID, Underground Maps',
  'Koordinator PLN', 'Koordinator Telcom', 'Koordinator PDAM',
  'Koordinator BPJN', 'BA Sosialisasi', 'Perizinan Lahan',
];

const IDENTIFIKASI_OPTIONS = [
  'Gas Lemas, mudah terbakar/beracun', 'Kekurangan Oksigen',
  'Nyala Api/Kebakaran/Ledakan', 'Bising',
  'Bahan berbahaya dan beracun', 'Peralatan jalan/listrik hidup/tersengat',
  'Mesin bergetar/berputar',
  'Cairan/gas bertekanan', 'Longsoran',
  'Benda bergerak/mesin yang berputar', 'Pengangkatan benda berat',
  'Kerja di ketinggian', 'Radiasi radioaktif', 'Kontaminasi tanah',
  'Temperatur ekstrim (dingin/panas)', 'Pengangkatan manual/alat angkat',
  'Ruang terbatas/kekurangan oksigen', 'Bahaya pencemaran lingkungan',
  'Faktor ergonomis', 'Paparan debu', 'Dampak visual',
  'Biohazard', 'Iritasi mata/kulit', 'Gangguan pernapasan',
  'Faktor fisik/biologis', 'Gangguan keamanan', 'Pencurian',
];

const PENGENDALIAN_OPTIONS = [
  'HSE Plan', 'Topi/Sepatu/Coverall keselamatan',
  'Kacamata keselamatan yang sesuai', 'Pelindung telinga yang sesuai',
  'Sarung tangan keselamatan', 'Harness/tali pengaman',
  'Masker debu/gas', 'Masker kimia', 'Tali pembatas daerah', 'Absoren',
  'Peralatan disolasi/dilepas', 'Pengetesan gas sebelum mulai kerja (LEL, O2, Toxic)',
  'Tanda Keselamatan', 'Tambahan lampu penerangan',
  'Scaffolding/perancah/tangga', 'Pos Pemeriksaan (barang dan data pribadi)',
  'Pengetesan HC gas secara teratur', 'Alat anti percikan api (Anti Sparks Tool)',
  'Tanda peringatan/rintangan', 'Peralatan tanpa tekanan',
  'Peralatan dikosongkan/dibersihkan(flushing)', 'Tempat kerja di-ventilasi',
  'PPE sand blasting', 'Alat bantu pernapasan udara tekan',
  'Tirai pelindung semprotan pasir', 'PPE bahan kimia',
  'Alat penampung cairan B3', 'Lapor kepada petugas keamanan',
  'Lapisan penahan percikan las', 'Tirai pelindung percikan las',
  'Tirai air di perlukan', 'Peralatan di-purging dengan N₂',
  'Bebas dari endapan yang eksplosif/toxic',
  'Didinginkan secara mekanis',
  'Memenuhi persyaratan sertifikat kerja',
];

const SERTIFIKAT_OPTIONS = [
  'Sertifikat Kerja Panas (SKP)',
  'Sertifikat Kerja Dingin (SKD)',
  'Sertifikat Kerja Ruang Terbatas (SKRT)',
  'Sertifikat Kerja Radiografi (SKR)',
  'Sertifikat Kerja Isolasi Listrik (SKL)',
  'Sertifikat Kerja Penggalian (SKG)',
  'Sertifikat Kerja Pengangkatan (SKA)',
  'Sertifikat Kerja Di Ketinggian (SKK)',
  'Sertifikat Kerja Pengambilan Fotografi (SKPF)',
];

const SIFAT_OPTIONS = ['Normal', 'Proyek', 'T/A', 'Emergency'];

const PPE_OPTIONS = [
  'Safety Helmet', 'Goggles / Face Shield', 'Leather / Chemical Gloves', 'Safety Sign',
  'Safety Shoes', 'Earplug / Earmuff', 'Safety Harness / Lifelines', 'SIKA',
  'Safety Glasses', 'Dust / Welding Mask', 'Life Vest', 'Radio Communication',
  'Coveralls', 'Catridge / Filter Mask', 'Fire Extinguisher', 'Others :',
];

function DateBoxes({ digits }: { digits?: string[] }) {
  const cells = digits && digits.length === 6 ? digits : Array(6).fill('');
  const labels = ['D', 'D', 'M', 'M', 'Y', 'Y'];
  return (
    <div className="flex gap-0.5">
      {cells.map((d, i) => (
        <div key={i} className={`flex flex-col items-center ${i === 1 || i === 3 ? 'mr-1' : ''}`}>
          <span className="text-[8px] text-gray-400 leading-none mb-0.5">{labels[i]}</span>
          <div className="w-4 h-5 border border-gray-800 flex items-center justify-center text-[11px] font-semibold bg-white">
            {d || ''}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionRail({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ width: 26, background: color }}>
      <span
        className="text-white text-[11px] font-bold tracking-widest"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {text}
      </span>
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-blue-50 border-y border-gray-300 px-4 py-2.5">
      <span className="text-[12px] font-bold text-blue-900 tracking-wide">{title}</span>
      {right}
    </div>
  );
}

const getRiskBadgeStyle = (value: string) => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return { bg: '#f1f5f9', text: '#94a3b8' };
  if (v.includes('tinggi') || v.includes('high')) return { bg: '#fef2f2', text: '#b91c1c' };
  if (v.includes('sedang') || v.includes('medium') || v.includes('med')) return { bg: '#fefce8', text: '#a16207' };
  if (v.includes('rendah') || v.includes('low')) return { bg: '#f0fdf4', text: '#15803d' };
  return { bg: '#f1f5f9', text: '#64748b' };
};

/* =========================================================================
 * Detail Sertifikat Kerja
 * ======================================================================= */

function YesNoCell({ active, type }: { active: boolean; type: 'yes' | 'no' }) {
  if (!active) return <span className="w-6 h-6 rounded-full border-2 border-gray-200 mx-auto block" />;
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${type === 'yes' ? 'bg-green-500' : 'bg-red-500'}`}>
      {type === 'yes' ? (
        <Check size={13} className="text-white" strokeWidth={3} />
      ) : (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </span>
  );
}

function ChecklistResultTable({
  checklist,
  checklistDocs,
}: {
  checklist?: { label: string; value: string | null }[];
  checklistDocs?: Record<string, { name: string; size: number; type: string } | null>;
}) {
  if (!checklist?.length) return <span className="text-gray-400 text-xs italic">Belum diisi</span>;
  return (
    <div className="rounded overflow-hidden border border-blue-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-200">
            <th className="text-left text-blue-700 font-semibold px-4 py-2.5 w-8 text-xs">No</th>
            <th className="text-left text-blue-700 font-semibold px-4 py-2.5 text-xs">Item Pemeriksaan</th>
            <th className="text-center text-green-600 font-bold px-4 py-2.5 w-16 text-xs">YES</th>
            <th className="text-center text-red-500 font-bold px-4 py-2.5 w-16 text-xs">NO</th>
            <th className="text-center text-blue-600 font-bold px-4 py-2.5 w-40 text-xs">Dokumen</th>
          </tr>
        </thead>
        <tbody>
          {checklist.map((item, index) => {
            const val = item.value;
            const doc = checklistDocs?.[String(index)];
            return (
              <tr
                key={index}
                className={`border-b border-gray-100 ${
                  val === 'yes' ? 'bg-green-50' : val === 'no' ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="px-4 py-2 text-gray-900 text-xs font-mono">{String(index + 1).padStart(2, '0')}</td>
                <td className="px-4 py-2 text-gray-900 text-xs leading-relaxed">{item.label}</td>
                <td className="px-4 py-2 text-center"><YesNoCell active={val === 'yes'} type="yes" /></td>
                <td className="px-4 py-2 text-center"><YesNoCell active={val === 'no'} type="no" /></td>
                <td className="px-4 py-2 text-center">
                  {doc ? (
                    <span
                      className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-[11px] text-gray-700 max-w-[150px] truncate"
                      title={doc.name}
                    >
                      <FileText size={11} className="text-blue-500 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VerifikasiResultPanel({
  title, sub, nama, tanggal,
}: { title: string; sub: string; nama?: string; tanggal?: string }) {
  return (
    <div className="rounded border-2 border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-xs font-bold text-gray-700">{title}</p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
      <div className="px-4 py-3 space-y-2 text-xs">
        <div className="flex gap-2">
          <span className="w-16 text-gray-500 shrink-0">Nama</span>
          <span className="font-medium text-gray-900">{nama || '-'}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-16 text-gray-500 shrink-0">Tanggal</span>
          <span className="font-medium text-gray-900">{tanggal || '-'}</span>
        </div>
      </div>
    </div>
  );
}

function GasMonitoringResultTable({ rows, diukurOleh }: { rows?: any[]; diukurOleh?: string }) {
  const filled = rows?.filter((r) => r.time || r.lel || r.o2 || r.h2s || r.co2 || r.co || r.temp || r.sign || r.remark);
  if (!filled?.length) return null;
  return (
    <div className="rounded border border-blue-200 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between flex-wrap gap-1">
        <span className="text-xs font-bold text-blue-700 uppercase">Pemeriksaan Kondisi Gas</span>
        <span className="text-xs text-gray-600">Diukur oleh: <span className="font-medium">{diukurOleh || '-'}</span></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-blue-200 px-2 py-1.5">No</th>
              <th className="border border-blue-200 px-2 py-1.5">Time</th>
              <th className="border border-blue-200 px-2 py-1.5">LEL %</th>
              <th className="border border-blue-200 px-2 py-1.5">O2 %</th>
              <th className="border border-blue-200 px-2 py-1.5">H2S ppm</th>
              <th className="border border-blue-200 px-2 py-1.5">CO2 ppm</th>
              <th className="border border-blue-200 px-2 py-1.5">CO ppm</th>
              <th className="border border-blue-200 px-2 py-1.5">Temp °C</th>
              <th className="border border-blue-200 px-2 py-1.5">Sign</th>
              <th className="border border-blue-200 px-2 py-1.5">Remark</th>
            </tr>
          </thead>
          <tbody>
            {filled.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="border border-gray-100 px-2 py-1 text-center font-mono">{String(i + 1).padStart(2, '0')}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.time || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.lel || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.o2 || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.h2s || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.co2 || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.co || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.temp || '-'}</td>
                <td className="border border-gray-100 px-2 py-1 text-center">{row.sign || '-'}</td>
                <td className="border border-gray-100 px-2 py-1">{row.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CertSectionHeader({
  title, bg, color, right,
}: { title: string; bg: string; color: string; right?: ReactNode }) {
  return (
    <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2" style={{ backgroundColor: bg }}>
      <span className="font-bold text-[11px] tracking-wide uppercase" style={{ color }}>{title}</span>
      {right}
    </div>
  );
}

const CERT_SAFETY_NOTES: Record<string, string[]> = {
  'Sertifikat Kerja Panas (SKP)': [
    'Bahaya dalam melaksanakan pekerjaan sekaligus sebagai penyebab dasar kecelakaan adalah karena 3 faktor utama yaitu TIDAK TAHU, TIDAK MAMPU dan/atau TIDAK MAU.',
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader /pengawas pekerjaan.',
    'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk /bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
    'Bahaya utama dari pekerjaan PANAS adalah kebakaran/Peledakan, pastikan jangan sampai terjadi perteuan  ketiga unsur pembentuk API dalam kegiatan tersebut.',
    'Setiap akan memulai pekerjaan, lakukan koordinasi dan komunikasi dengan para pihak terkait dan  pastikan lokasi kerja bebas dari material yang bisa menimbulkan kebakaran/peledakan.',
    'Pastikan kondisi Operasi APAR dan tempatkan di lokasi yang sesuai, dan mudah dijangkau.',
    'Bila pekerjaan panas dilakukan pada ketinggian, pastikan fasilitas yang berpotensi terkena percikan di tutup dengan cover terutma untuk fasilitas yang dimungkinkan terjadi bocoran.',
    'Pastikan semua anggota memahami tindakan dalam keadaan darurat, termasuk No. telepon dan/atau petugas yang bisa dihubungi.',
  ],
  'Sertifikat Kerja Dingin (SKD)': [
    'Bahaya dalam melaksanakan pekerjaan sekaligus sebagai penyebab dasar kecelakaan adalah karena 3 faktor utama yaitu TIDAK TAHU, TIDAK MAMPU dan/atau TIDAK MAU',
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader /pengawas pekerjaan.',
    'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk /bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
    'Setiap akan memulai pekerjaan, melakukan koordinasi dan komunikasi dengan para pihak terkait dan pastikan fasilitas yang akan dikerjakan benar-benar aman',
    'Pastikan semua anggota memahami tindakan dalam keadaan darurat, termasuk No. telepon dan/atau petugas yang bisa dihubungi.',
  ],
  'Sertifikat Kerja Ruang Terbatas (SKRT)': [
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
    'PASAL-5: P=Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk / bisa diterima — lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
    'Pekerja yang kompeten dan berpengalaman serta paham mengikuti atau mendapatkan penjelasan tentang bahaya-bahaya bekerja di dalam ruang tertutup.',
    'Bila ruangan memungkinkan lakukan pekerjaan ini dari luar dan pastikan ada satu orang pengawas berjaga diluar yang memonitor kegiatan dengan peralatan yang cukup, yang sewaktu-waktu siap melakukan pertolongan jika dibutuhkan.',
    'Gunakan lifeline/tali penyelamatan/rescure untuk dipergunakan apabila diperlukan untuk penyelamatan dalam kondisi darurat.',
    'Apabila dipandang perlu (tergantung dari kompleksitas dan besarnya risiko) dapat ditambahkan tim rescue dengan perlengkapannya di lokasi kerja, untuk keperluan emergency rescue.',
    'Selama melakukan pekerjaan di dalam ruangan tertutup maka harus dilakukan monitoring kondisi udara di dalamnya untuk memastikan kecukupannya untuk bernafas (min 20% O2).',
    'Lakukan pemeriksaan kondungan udara setiap akan memasuki ruangan tertutup dan setelah istirahat siang.',
    'Buat/catat nama orang-orang yang masuk kedalam ruang tertutup/bejana dan tuliskan pada papan kontrol, pastikan catatan tersebut selalu terbaharui.',
    'Amankan lokasi/tempat masuk/keluar ruang tertutup apabila akan istirahat atau ditunda untuk pekerjaan kesokan harinya. Pasang tanda peringatan "DILARANG MASUK BERBAHAYA".',
    'Pasang barricade/diskelling lokasi kerja untuk memastikan hanya pekerja yang berkepentingan yang diijinkan berada di lokasi kerja.',
  ],
  'Sertifikat Kerja Radiografi (SKR)': [
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
    'PASAL-5: P=Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk/bisa diterima — lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
    'Pelaksana kerja melapor sebelum dan sesudah melaksanakan kegiatan, disarankan pelaksanaan dilakukan pada saat jam istirahat/tidak banyak orang kerja.',
    'Ketahui 3 prinsip keselamatan pelaksanaan pekerjaan radiography; yaitu WAKTU-sesingkat mungkin, Jaga JARAK AMAN saat shooting dan gunakan SHIELDING/Pelindung.',
    'Gunakan radiasi secukupnya sehingga dapat memperkecil jarak tambah.',
    'Pastikan Containment/wadah sumber radiasi dalam kondisi yang baik, menghindari dari kebocoran.',
    'Gunakan/pakailah Dosimeter, seperti Film atau TLD badges.',
    'Hindari kontak dengan kontaminasi.',
    'Bawa dan pastikan, transportasi sumber radiasi dengan cara yang aman.',
    'Pasang barricade dan tanda peringatan selama pelaksanaan kegiatan radiography.',
  ],
  'Sertifikat Kerja Isolasi Listrik (SKL)': [
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
    'PASAL-5: P=Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk/bisa diterima — lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing pekerja.',
    'PENGISOLASIAN: Saya menyatakan bahwa saya menerima tanggung jawab atas pekerjaan yang disebutkan dalam izin ini dan tidak akan ada pekerjaan yang akan dilakukan pada bagian lain dari sistem oleh saya ataupun bawahan saya.',
    'PELEPASAN ISOLASI: Saya dengan ini menyatakan bahwa peralatan dapat dioperasikan kembali.',
    'Untuk tegangan 4,16 KV keatas dilaksanakan oleh fungsi listrik/perawatan yang kompeten.',
  ],
  'Sertifikat Kerja Penggalian (SKG)': [
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja group leader/pengawas pekerjaan.',
    'PASAL-5: P= Patuhi Procedure kerja, pastikan Action/tindakan kerja selalu aman, memiliki Skill/keahlian/pengalaman yang cukup, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat LOW risk /bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing.',
    'Ingat bahaya-bahaya penggalian adalah dinding tanah galian runtuh, biss tertimbun galian, atau kejatuhan tumpukan tanah galian.',
    'Bahaya kekurangan oksigen untuk bernafas, atau gas beracun lainnya, sir ganguan atau karena sir banjir atau hujan deras.',
    'Bahaya dari rusaknya utilitas lain seperti kabel listrik, telekomunikasi atau pipa gas eksisting dan pipa air serta bahaya pekerjaan saat LOWERING PIPA.',
    'Untuk semua galian harus disediakan fasilitas akses, untuk keluar masuk ke lokasi galian dalam kondisi normal dan utamanya dalam keadaan darurat.',
    'Lokasi kerja/galian diberi barricade untuk menghindari orang terperosok.',
    'Pada saat ada kecelakaan / orang bekerja di dalam lokasi galian harus ada orang lain yang mengawasi dari luar.',
    'Letakkan material kerja pada posisi yang aman jauh dari tepi galian agar tidak jatuh kedalaman galian.',
    'Rencana penyelematan RESCUE harus dibuat untuk penggalian yang dalam.',
    'Pasang rambu-rambu peringatan disekitar lokasi kegiatan/penggalian.',
    'Lakukan koordinasi dan komunikasi yang efektif saat akan melakukan lowering pipa dan atau saat ada kegiatan yang dekat dengan fasilitas/utilitas eksisting yang terkena dampak.',
    'Beri tanda pembatas/safety line/barricade pada jarak yang aman agar kendaraan berat tidak melewati dekat lokasi galian.',
  ],
  'Sertifikat Kerja Pengangkatan (SKA)': [
    'Bahaya dalam melaksanakan pekerjaan sekaligus sebagai penyebab dasar kecelakaan adalah karena 3 faktor utama yaitu TIDAK TAHU, TIDAK MAMPU dan/atau TIDAK MAU.',
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader /pengawas pekerjaan.',
    'Selama melakukan kegiatan pengangkatan pengaturan cara regular.',
    'HINDARI mengangkat beban melebihi fasilitas yang hidup, properti pipa air bertekanan, kabel listrik, apabila hal tersebut HARUS dilakukan maka pengerjaan keselamatan yang cukup untuk melindungi bahaya harus dikerjakan.',
    'Rigger/Signalman diperlukan untuk pengangkatan beban yang kompleks dan sangat berat.',
    'Komunikasi dan koordinasi dengan operator/forklift terlibat diperlukan dan status diperlukan bila anda ragu.',
  ],
  'Sertifikat Kerja Di Ketinggian (SKK)': [
    'Pastikan setiap pekerja telah melakukan PERSONAL ASSESSMENT - PASAL 5 dan sebelum memulai kerja group kerja melakukan Tool Box Meeting dipimpin oleh group leader/pengawas pekerjaan.',
    'PASAL-5: PT Pertamina (Persero). Pastikan action/tindakan kerja selalu aman, berperilaku/Attitude aman dalam bekerja dan usahakan bahaya pekerjaan pada tingkat yang rendah LOW risk/bisa diterima - lakukan 5 menit sebelum berangkat ke lokasi kerja oleh masing-masing.',
    'Pelaksana kerja melaporkan ke Field Operator/Pengawas (Proses) sebelum dan sesudah melaksanakan kegiatan, disarankan pelaksanaan dilakukan pada saat tidak banyak orang kerja atau aktivitas mandi berhenti untuk menghindari potensi bahaya dari tindakan LOW risk bahaya dengan kegiatan kerja.',
    'Perancah yang belum di inspeksi/belum dipasang label, DILARANG untuk digunakan.',
    'Perancah dan perlengkapannya yang sudah rusak DILARANG dipergunakan, perikendap bagian atas harus dipasang apabila terdapat potensi bahaya dari atas.',
    'Pijakan perancah harus kuat, keras dan mampu menahan beban maksimum, naikkan dan menurunkan material harus menggunakan tali.',
    'Semua material diatas perancah harus disimpan dengan aman dari kemungkinan jatuh.',
  ],
  'Sertifikat Kerja Pengambilan Fotografi (SKPF)': [
    'Peralatan foto harus dibawa pada saat mengajukan ijin untuk diperiksa kondisinya.',
    'Bila menggunakan lampu blitz, pengetesan gas yang mudah terbakar harus dilakukan sebelum pengambilan foto.',
    'Untuk external (Kontraktor dan Tamu) harus didampingi oleh Sponsor/fungsi ybs.',
    'Surat izin ini harus diperlihatkan ke Petugas Security di Pos pemeriksaan sebelum masuk area terbatas.',
  ],
};

const CERT_HERO_STYLE: Record<string, { color: string; formCode?: string }> = {
  'Sertifikat Kerja Panas (SKP)': { color: '#ff0000', formCode: 'F-011/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Dingin (SKD)': { color: '#0070c0', formCode: 'F-012/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Ruang Terbatas (SKRT)': { color: '#6b7280', formCode: 'F-013/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Radiografi (SKR)': { color: '#7030a0', formCode: 'F-014/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Isolasi Listrik (SKL)': { color: '#ff6600', formCode: 'F-015/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Penggalian (SKG)': { color: '#7B3F00', formCode: 'F-012/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Pengangkatan (SKA)': { color: '#00b050', formCode: 'F-017/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Di Ketinggian (SKK)': { color: '#0070c0', formCode: 'F-01W/B-003/PG0300/2026-S9' },
  'Sertifikat Kerja Pengambilan Fotografi (SKPF)': { color: '#7030a0', formCode: 'F-019/E-003/PG0300/2026-S9' },
};

function SertifikatHero({
  nama, data, diisiOleh, diisiPada, totalChecklist, totalFilled,
}: {
  nama: string;
  data: any;
  diisiOleh?: string;
  diisiPada?: string;
  totalChecklist: number;
  totalFilled: number;
}) {
  const style = CERT_HERO_STYLE[nama] || { color: '#1d4ed8' };

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-2 bg-white">
        {diisiOleh && diisiPada ? (
          <span className="text-[10px] text-green-600 font-semibold">
            Diisi oleh {diisiOleh} · {new Date(diisiPada).toLocaleDateString('id-ID')}
          </span>
        ) : <span />}
        {style.formCode && <span className="text-[10px] text-gray-400 font-mono">{style.formCode}</span>}
      </div>
      <div className="flex border-t border-gray-200">
        <div className="flex items-center gap-3 px-5 py-3 border-r border-gray-200 shrink-0 bg-white">
          <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Rujukan SIKA No.</span>
          <span className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-700 bg-gray-50 min-w-[120px] text-center truncate">
            {data?.rujukanSikaNo || '-'}
          </span>
        </div>
        <div style={{ flex: 3, backgroundColor: style.color, minHeight: '64px' }} className="flex items-center justify-center px-6 py-3">
          <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: '16px', letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>
            {nama}
          </h2>
        </div>
        <div
          className="border-l border-gray-200 bg-white"
          style={{
            flex: 1,
            minHeight: '64px',
            backgroundImage: 'url(/logopertaminagaswhite.svg)',
            backgroundSize: '90%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left center',
          }}
        />
      </div>
      <div className="px-5 py-2 bg-blue-50 border-t border-b border-blue-200 flex items-center justify-end gap-2">
        <div className={`w-2 h-2 rounded-full ${totalChecklist > 0 && totalFilled === totalChecklist ? 'bg-green-500' : 'bg-amber-400'}`} />
        <span className="text-[10px] text-gray-500">{totalFilled}/{totalChecklist} item checklist terisi</span>
      </div>
    </>
  );
}

function SertifikatDetailCard({
  nama, record, sika,
}: { nama: string; record?: SertifikatData; sika: SikaData | null | undefined }) {
  const data = record?.data as any;
  const yesCount = data?.checklist?.filter((c: any) => c.value === 'yes').length ?? 0;
  const noCount = data?.checklist?.filter((c: any) => c.value === 'no').length ?? 0;
  const totalChecklist = data?.checklist?.length ?? 0;
  const totalFilled = yesCount + noCount;
  const totalDocs = data?.checklistDocs ? Object.values(data.checklistDocs).filter(Boolean).length : 0;
  const safetyNotesForCert = CERT_SAFETY_NOTES[nama];

  return (
    <div className="border-t-2 border-gray-900">
      {!record ? (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2.5">
          <span className="text-white text-[12px] font-bold tracking-wide uppercase">{nama}</span>
          <span className="text-[10px] text-gray-300 italic">Belum diisi</span>
        </div>
      ) : (
        <SertifikatHero
          nama={nama}
          data={data}
          diisiOleh={record.diisiOleh}
          diisiPada={record.diisiPada}
          totalChecklist={totalChecklist}
          totalFilled={totalFilled}
        />
      )}

      {!data ? (
        <div className="px-4 py-6 text-center text-gray-400 text-xs italic">
          Sertifikat ini dipilih tetapi datanya belum diisi.
        </div>
      ) : (
        <div className="bg-white">
          <CertSectionHeader title="Bagian 1 — Tanggal Terbit" bg="#dbeafe" color="#1d4ed8" />
          <div className="grid grid-cols-3 gap-6 px-4 py-3">
            <FormField label="Tanggal Terbit" value={data.tanggalTerbit} labelWidth="w-32" />
            <FormField
              label="Jam Kerja"
              value={data.jamMulai && data.jamSelesai ? `${data.jamMulai} s/d ${data.jamSelesai}` : undefined}
              labelWidth="w-32"
            />
            <FormField label="Berlaku Hingga" value={data.berlakuHingga} labelWidth="w-32" />
          </div>

          <CertSectionHeader
            title="Bagian 2 — Jenis Pekerjaan"
            bg="#dbeafe"
            color="#1d4ed8"
            right={<span className="text-[10px] italic" style={{ color: '#60a5fa' }}>Data dari Jenis Pekerjaan</span>}
          />
          <div className="px-4 py-3 grid grid-cols-2 gap-x-10 gap-y-1">
            <FormField label="Fungsi / Perusahaan" value={sika?.fungsiPerusahaan} labelWidth="w-44" />
            <FormField label="Lokasi / Instalasi" value={sika?.lokasiInstalasi} labelWidth="w-44" />
            <FormField label="Peralatan / No. Identitas" value={sika?.peralatanNoIdentitas} labelWidth="w-44" />
            <FormField label="Jumlah Pekerja" value={sika?.pekerjaList?.length ? `${sika.pekerjaList.length} orang` : undefined} labelWidth="w-44" />
          </div>
          <div className="px-4 pb-3">
            <FormField label="Uraian Pekerjaan" value={sika?.uraianPekerjaan} labelWidth="w-44" />
            <FormField label="Peralatan Digunakan" value={sika?.peralatanDigunakan} labelWidth="w-44" />
          </div>

          <CertSectionHeader
            title="Bagian 3 — Pemeriksaan"
            bg="#FFFF00"
            color="#000000"
            right={
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${data.lainnya?.diisiOlehIA ? 'bg-green-100 text-green-700' : 'bg-white/60 text-gray-500'}`}>
                  {data.lainnya?.diisiOlehIA ? '✓' : '—'} Diisi oleh IA
                </span>
                <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Yes: {yesCount}</span>
                <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">No: {noCount}</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Dokumen: {totalDocs}</span>
              </div>
            }
          />
          <div className="px-4 py-3">
            <ChecklistResultTable checklist={data.checklist} checklistDocs={data.checklistDocs} />
          </div>

          <CertSectionHeader title="Bagian 4 — Verifikasi Lapangan" bg="#00b050" color="#ffffff" />
          <div className="px-4 py-3 grid grid-cols-2 gap-4">
            <VerifikasiResultPanel
              title="Pelaksana Pekerjaan (PA)"
              sub="Performing Authority · Pemberi Kerja"
              nama={data.verifikasi?.paNama}
              tanggal={data.verifikasi?.paTanggal}
            />
            <VerifikasiResultPanel
              title="Asset Holder / IA"
              sub="Issuing Authority · Penanggung Jawab"
              nama={data.verifikasi?.iaNama}
              tanggal={data.verifikasi?.iaTanggal}
            />
          </div>

          <CertSectionHeader
            title="Bagian 5 — Kegiatan"
            bg="#993366"
            color="#ffffff"
            right={
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white" style={{
                backgroundColor: data.gasMonitoring === 'ya' ? '#2563eb' : data.gasMonitoring === 'tidak' ? '#ef4444' : 'rgba(255,255,255,0.25)',
              }}>
                Pengukuran &amp; monitoring gas: {data.gasMonitoring === 'ya' ? 'Ya' : data.gasMonitoring === 'tidak' ? 'Tidak' : 'Belum dipilih'}
              </span>
            }
          />
          <div className="px-4 py-4 space-y-4">
            {data.gasMonitoring === 'ya' && (
              <GasMonitoringResultTable rows={data.gasRows} diukurOleh={data.diukurOleh} />
            )}

            {!!safetyNotesForCert?.length && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                    Hal-hal yang harus menjadi perhatian untuk keselamatan pekerjaan
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden border border-green-200 divide-y divide-green-100">
                  {safetyNotesForCert.map((text, i) => (
                    <div key={i} className={`flex items-start gap-2.5 px-3 py-2 ${i % 2 === 0 ? 'bg-white' : 'bg-green-50'}`}>
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                      <p className="text-[11px] text-gray-900 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            <div className="flex items-center px-4 py-2 shrink-0" style={{ backgroundColor: '#c8b89a', minWidth: '120px' }}>
              <span className="text-[10px] font-bold text-black uppercase tracking-widest">Distribusi:</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-4 py-2 border-l border-gray-300" style={{ backgroundColor: '#ffffff' }}>
              <span className="text-[10px] font-semibold text-black">Putih — Arsip PA</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-4 py-2 border-l border-white/40" style={{ backgroundColor: '#92d050' }}>
              <span className="text-[10px] font-bold text-black">Hijau — Arsip HSE</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-4 py-2 border-l border-yellow-200" style={{ backgroundColor: '#ffff00' }}>
              <span className="text-[10px] font-bold text-black">Kuning — Arsip SIKA Controller</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 * STATUS BADGE untuk PJA — hanya display
 * ======================================================================= */

const STATUS_LABEL: Record<ApprovalStatus, { label: string; bg: string; text: string }> = {
  draft:    { label: 'Draft',     bg: '#8A94A6', text: 'white' },
  request:  { label: 'Request',   bg: '#0E76BC', text: 'white' },
  waiting:  { label: 'Menunggu',  bg: '#F2A900', text: 'white' },
  approved: { label: 'Disetujui', bg: '#00954E', text: 'white' },
  rejected: { label: 'Ditolak',   bg: '#E31E24', text: 'white' },
};

function StatusBadgePJA({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_LABEL[status];
  return (
    <span
      className="inline-flex items-center h-5 leading-none text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-white shadow-sm"
      style={{ background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

/* =========================================================================
 * MAIN PAGE — PJA REVIEW (VIEW ONLY, TIDAK ADA APPROVAL)
 * ======================================================================= */

export default function PJAReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // FIX: `approvalHistory` sebelumnya diambil dari `record.approvalHistory`,
  // padahal properti itu tidak pernah ada di SubmissionRecord — approvalHistory
  // adalah array TERPISAH di level store (lihat interface ProgramStore di
  // programStore.ts). record.approvalHistory selalu undefined secara tipe,
  // itu sebabnya muncul error merah. Sekarang diambil langsung dari store lalu
  // difilter berdasarkan submissionId.
  const { submissions, sertifikatData, approvalHistory } = useProgramStore();

  const record = submissions.find((s) => s.id === id);

  useEffect(() => {
    if (!record) {
      router.replace('/dashboard/pja/approval-management');
    }
  }, [record, router]);

  const [showHistory, setShowHistory] = useState(false);

  if (!record) return null;

  const { program, sika, jsa } = record;

  const noSikaGabungan = getNomorSika(sika);
  const hasLangkahKerja = jsa?.sections?.some((sec) => sec.rows.some((r) => r.langkah.trim() !== ''));

  // Riwayat khusus submission INI — diambil dari approvalHistory milik store,
  // bukan dari record (lihat catatan FIX di atas).
  const relevantHistory = approvalHistory
    .filter((h) => h.submissionId === id)
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

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ paddingLeft: '35px' }}>
          <div className="flex flex-col leading-tight border-l-4 border-blue-600 pl-3">
            <span className="text-sm font-bold text-gray-800 tracking-tight">Detail Review</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Penanggung Jawab Aset (PJA) — View Only
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-6">
          <img
            src="/logopertaminagasfull.svg"
            alt="Pertamina Gas"
            className="h-8 object-contain"
          />
        </div>
      </div>

      {/* ================= BUTTON BACK ================= */}
      <div className="px-4 sm:px-8 lg:px-14 xl:px-20 pt-4">
        <button
          onClick={() => router.push('/dashboard/pja/approval-management')}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={14} />
          Kembali ke Approval Management
        </button>
      </div>

      {/* ================= DOKUMEN ================= */}
      <div className="px-4 sm:px-8 lg:px-14 xl:px-20 py-4">
        <div
          className="mx-auto w-full bg-white border-2 border-gray-900 text-[13px] text-gray-800 shadow-[0_4px_28px_rgba(15,23,42,0.10)]"
          style={{ maxWidth: '1680px' }}
        >
          {/* ---- Judul dokumen ---- */}
          <div className="grid grid-cols-[300px_1fr_260px] border-b-2 border-gray-900">
            <div className="border-r-2 border-gray-900 p-4">
              <span className="font-bold text-[13px]">Nomor SIKA :</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="border border-gray-500 bg-gray-50 px-2.5 py-1.5 text-[11px] text-center flex-1 truncate">
                  {sika?.noSikaAreaFungsi || '-'}
                </div>
                <span className="text-[11px]">-</span>
                <div className="border border-gray-500 bg-gray-50 px-2.5 py-1.5 text-[11px] text-center flex-1 truncate">
                  {sika?.noSikaNomorUrut || '-'}
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                <span className="shrink-0 text-gray-600">Lanjutan dari SIKA No</span>
                <span className="border-b border-gray-400 flex-1 text-center font-medium">
                  {sika?.lanjutanDariSika || ''}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-3">
              <h1 className="font-bold text-xl tracking-wide text-center">SURAT IZIN KERJA AMAN</h1>
              <span className="text-sm font-bold tracking-widest mt-0.5">( SIKA )</span>
            </div>
            <div className="flex items-center justify-center p-3">
              <img src="/logopertaminagasfull.svg" alt="Pertamina Gas" className="h-10 object-contain" />
            </div>
          </div>

          {/* ---- Bagian 1 ---- */}
          <div className="flex items-center gap-8 flex-wrap border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
            <span className="font-bold text-[12px]">BAGIAN 1 - TANGGAL TERBIT</span>
            <DateBoxes digits={sika?.tanggalTerbit} />
            <span className="font-bold text-[12px] ml-2">JAM KERJA</span>
            <span className="text-[12px]">{sika?.jamKerjaMulai || '-'} s/d {sika?.jamKerjaSelesai || '-'}</span>
            <span className="font-bold text-[12px] ml-2">W.I</span>
            <span className="text-[12px]">{sika?.waktuIsolasi || '-'}</span>
            <span className="font-bold text-[12px] ml-auto">BERLAKU HINGGA</span>
            <DateBoxes digits={sika?.berlakuHingga} />
          </div>

          {/* ---- Body utama ---- */}
          <div className="grid grid-cols-[1fr_320px]">
            <div className="border-r-2 border-gray-900">
              {/* Program */}
              <div className="flex">
                <SectionRail color="#334155" text="PROGRAM" />
                <div className="flex-1">
                  <SectionHeader title="DATA PROGRAM / KONTRAK" />
                  <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                    <FormField label="Lokasi Kerja" value={program?.lokasiKerja} labelWidth="w-52" />
                    <FormField label="Nama Paket Pekerjaan" value={program?.namaPaket} labelWidth="w-52" />
                    <FormField label="No Kontrak" value={program?.noKontrak} labelWidth="w-52" />
                    <FormField label="Tanggal Kontrak" value={program?.tanggalKontrak} labelWidth="w-52" />
                    <FormField label="Fungsi (Penanggung Jawab Pekerjaan)" value={program?.satKerjaPemberi} labelWidth="w-52" />
                    <FormField label="Fungsi (Penanggung Jawab Aset)" value={program?.satKerjaPenanggung} labelWidth="w-52" />
                    <FormField label="Fungsi IA (Issuing Authority)" value={program?.fungsiIA} labelWidth="w-52" />
                    <FormField
                      label="Pelaksana (Penanggung Jawab Aset)"
                      value={`${program?.pelaksanaPerusahaan || '-'} (${program?.pelaksanaJenis || '-'})`}
                      labelWidth="w-52"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-6 px-4 pb-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">PA / PIC (Pemberi Kerja)</span>
                      <CheckList items={program?.picPemberiList?.filter(Boolean)} columns={1} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Pimpinan Pelaksana (PPA)</span>
                      <CheckList items={program?.pimpinanPelaksanaList?.filter(Boolean)} columns={1} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">PIC IA (Penanggung Jawab Aset)</span>
                      <CheckList items={program?.picPenanggungList?.filter(Boolean)} columns={1} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Jenis Pekerjaan */}
              <div className="flex border-t-2 border-gray-900">
                <SectionRail color="#2563eb" text="PERMINTAAN" />
                <div className="flex-1">
                  <SectionHeader
                    title="BAGIAN 2 - JENIS PEKERJAAN"
                    right={<span className="text-[10px] text-red-600 font-semibold">Diisi oleh Pelaksana Pekerjaan (PA)</span>}
                  />
                  <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                    <FormField label="Fungsi / Perusahaan" value={sika?.fungsiPerusahaan} />
                    <FormField label="Lokasi / Instalasi" value={sika?.lokasiInstalasi} />
                    <FormField label="Peralatan / No. Identitas" value={sika?.peralatanNoIdentitas} />
                    <FormField label="Jumlah Pekerja" value={`${sika?.pekerjaList?.length || 0} orang`} />
                  </div>
                  <div className="px-4 pb-3">
                    <FormField label="Uraian Pekerjaan" value={sika?.uraianPekerjaan} />
                    <FormField label="Peralatan yang digunakan" value={sika?.peralatanDigunakan} />
                  </div>
                  {!!sika?.pekerjaList?.length && (
                    <div className="px-4 pb-4">
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Nama Pekerja</span>
                      <CheckList items={sika.pekerjaList} columns={3} />
                    </div>
                  )}
                </div>
              </div>

              {/* Pemeriksaan */}
              <div className="flex border-t-2 border-gray-900">
                <SectionRail color="#ca8a04" text="PERSIAPAN" />
                <div className="flex-1">
                  <SectionHeader
                    title="BAGIAN 3 - PEMERIKSAAN"
                    right={
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sika?.diisiPA ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {sika?.diisiPA ? '✓' : '—'} Diisi PA
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sika?.diperiksaIA ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                          {sika?.diperiksaIA ? '✓' : '—'} Diperiksa IA
                        </span>
                      </div>
                    }
                  />
                  <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Isolasi Peralatan</span>
                      <FullCheckList options={ISOLASI_OPTIONS} selected={sika?.isolasi} columns={2} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-600 mb-1">Lampiran (Mandatory)</span>
                      <FullCheckList options={LAMPIRAN_OPTIONS} selected={sika?.lampiran} columns={3} />
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <span className="block text-[11px] font-semibold text-gray-600 mb-1">Identifikasi Bahaya</span>
                    <FullCheckList options={IDENTIFIKASI_OPTIONS} selected={sika?.identifikasi} columns={4} />
                    {sika?.identifikasiTambahan && (
                      <div className="mt-1.5"><FormField label="Identifikasi Tambahan" value={sika.identifikasiTambahan} /></div>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <span className="block text-[11px] font-semibold text-gray-600 mb-1">Pengendalian Bahaya</span>
                    <FullCheckList options={PENGENDALIAN_OPTIONS} selected={sika?.pengendalian} columns={3} />
                    {sika?.permintaanTambahan && (
                      <div className="mt-1.5"><FormField label="Permintaan Tambahan" value={sika.permintaanTambahan} /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* JSA */}
              <div className="flex border-t-2 border-gray-900">
                <SectionRail color="#16a34a" text="PELAKSANAAN" />
                <div className="flex-1">
                  <SectionHeader title="BAGIAN 4 - JOB SAFETY ANALYSIS (JSA)" />
                  <div className="p-4 grid grid-cols-2 gap-x-10 gap-y-1.5">
                    <FormField label="No. SIKA" value={jsa?.jsaNo} />
                    <FormField label="Judul Pekerjaan" value={jsa?.judulPekerjaan} />
                    <FormField label="Tanggal" value={jsa?.tanggalJSA} />
                    <FormField label="Lokasi" value={jsa?.lokasi} />
                    <FormField label="Halaman" value={jsa?.halaman ? `${jsa.halaman} dari ${jsa.totalHalaman}` : undefined} />
                    <FormField label="Status" value={jsa?.status === 'revisi' ? 'Revisi' : jsa?.status === 'baru' ? 'Baru' : undefined} />
                  </div>

                  <div className="px-4 pb-4">
                    <span className="block text-[11px] font-semibold text-blue-900 uppercase mb-1.5">Langkah Kerja</span>
                    {hasLangkahKerja ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="border border-gray-400 px-1 py-1 w-6">No</th>
                              <th className="border border-gray-400 px-2 py-1 text-left">Langkah Pekerjaan</th>
                              <th className="border border-gray-400 px-2 py-1 text-left">Peralatan/Material</th>
                              <th className="border border-gray-400 px-2 py-1 text-left">Potensi Bahaya</th>
                              <th className="border border-gray-400 px-2 py-1">Tingkat Risiko</th>
                              <th className="border border-gray-400 px-2 py-1 text-left">Mitigasi</th>
                              <th className="border border-gray-400 px-2 py-1 text-left">Penanggungjawab</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jsa?.sections?.map((sec) => (
                              <Fragment key={sec.key}>
                                <tr className="bg-blue-100">
                                  <td className="border border-gray-400 px-1 py-1 text-center font-bold">{sec.key}</td>
                                  <td colSpan={6} className="border border-gray-400 px-2 py-1 font-bold uppercase">{sec.label}</td>
                                </tr>
                                {sec.rows
                                  .filter((r) => r.langkah.trim() !== '' || r.potensiBahaya.trim() !== '')
                                  .map((row, i) => {
                                    const risk = getRiskBadgeStyle(row.tingkatRisiko);
                                    return (
                                      <tr key={row.id}>
                                        <td className="border border-gray-400 px-1 py-1 text-center text-gray-400">{i + 1}</td>
                                        <td className="border border-gray-400 px-2 py-1">{row.langkah || '-'}</td>
                                        <td className="border border-gray-400 px-2 py-1">{row.peralatan || '-'}</td>
                                        <td className="border border-gray-400 px-2 py-1">{row.potensiBahaya || '-'}</td>
                                        <td className="border border-gray-400 px-2 py-1 text-center">
                                          <span
                                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                            style={{ background: risk.bg, color: risk.text }}
                                          >
                                            {row.tingkatRisiko || '-'}
                                          </span>
                                        </td>
                                        <td className="border border-gray-400 px-2 py-1">{row.mitigasi || '-'}</td>
                                        <td className="border border-gray-400 px-2 py-1">{row.penanggungjawab || '-'}</td>
                                      </tr>
                                    );
                                  })}
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Belum diisi</span>
                    )}
                  </div>

                  <div className="px-4 pb-4 pt-3 border-t border-dashed border-gray-300">
                    <span className="block text-[11px] font-semibold text-gray-600 mb-1">Peralatan Pelindung (APD) Digunakan</span>
                    <FullCheckList options={PPE_OPTIONS} selected={jsa?.checkedPPE} columns={4} />
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: FORMULIR SIKA */}
            <div className="bg-sky-50 flex flex-col">
              <div className="bg-sky-500 text-white text-center font-bold text-sm py-2 tracking-wide">
                FORMULIR SIKA
              </div>
              <div className="p-4">
                <FullCheckList options={SERTIFIKAT_OPTIONS} selected={sika?.sertifikat} columns={1} />
                <span className="block text-[11px] font-bold underline mt-4 mb-2">Sifat Pekerjaan</span>
                <div className="space-y-1">
                  {SIFAT_OPTIONS.map((sifat) => {
                    const active = sika?.sifatPekerjaan === sifat;
                    return (
                      <div key={sifat} className="flex items-center gap-1.5 text-[11px]">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            active ? 'bg-blue-600 border-blue-600' : 'border-gray-500 bg-white'
                          }`}
                        >
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className={sifat === 'Emergency' ? 'text-red-600 font-semibold' : 'text-gray-800'}>
                          {sifat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DETAIL SERTIFIKAT KERJA */}
          {!!sika?.sertifikat?.length && (
            <div>
              <div className="bg-gray-900 px-4 py-2.5">
                <span className="text-white text-[12px] font-bold tracking-widest uppercase">
                  Detail Sertifikat Kerja
                </span>
              </div>
              {sika.sertifikat.map((nama) => (
                <SertifikatDetailCard key={nama} nama={nama} record={sertifikatData?.[nama]} sika={sika} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= STATUS PJA (tanpa tombol approval) ================= */}
      <div className="px-4 sm:px-8 lg:px-14 xl:px-20 pb-8">
        <div
          className="mx-auto w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          style={{ maxWidth: '1680px' }}
        >
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-white/70" />
              <div>
                <span className="text-white font-bold text-xs tracking-wide">STATUS PENGAJUAN</span>
                <p className="text-blue-200 text-[10px] mt-0.5">
                  Ref. No. SIKA: <span className="font-semibold">{noSikaGabungan}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-[10px] font-semibold px-3 py-1.5 transition"
            >
              <History size={12} /> Riwayat
            </button>
          </div>

          <div className="px-6 py-5 flex flex-wrap gap-6 items-center">
            {/* Status SIKA */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">SIKA:</span>
              <StatusBadgePJA status={record.sikaStatusPJA} />
            </div>

            {/* Status JSA */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">JSA:</span>
              <StatusBadgePJA status={record.jsaStatusPJA} />
            </div>

            {/* Status Pemberi */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">Status Pemberi:</span>
              <StatusBadgePJA status={record.sikaStatusPemberi} />
              <StatusBadgePJA status={record.jsaStatusPemberi} />
            </div>

            {/* Informasi tambahan */}
            <div className="border-l border-gray-200 pl-4 flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Diperbarui: {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '-'}
              </span>
            </div>
          </div>

          {/* Catatan jika sudah selesai */}
          {record.sikaStatusPJA === 'approved' && record.jsaStatusPJA === 'approved' && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle size={16} className="text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  SIKA dan JSA telah disetujui oleh Penanggung Jawab Aset. Pengajuan ini <span className="font-bold">selesai</span>.
                </p>
              </div>
            </div>
          )}

          {record.sikaStatusPJA === 'rejected' && (
            <div className="px-6 pb-4">
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-700 font-medium">Pengajuan ini ditolak oleh Penanggung Jawab Aset.</p>
                  {(record.alasanTolakSikaPJA || record.alasanTolakJsaPJA) && (
                    <p className="text-xs text-red-600 mt-1">
                      Alasan: {record.alasanTolakSikaPJA || record.alasanTolakJsaPJA}
                    </p>
                  )}
                  <p className="text-[10px] text-red-500 mt-1">Menunggu pemohon mengajukan ulang setelah revisi.</p>
                </div>
              </div>
            </div>
          )}

          {record.sikaStatusPJA === 'waiting' && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <Clock size={16} className="text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700 font-medium">
                  Pengajuan ini sedang <span className="font-bold">dalam proses</span> review oleh Penanggung Jawab Aset.
                </p>
              </div>
            </div>
          )}

          {record.sikaStatusPJA === 'draft' && record.jsaStatusPJA === 'draft' && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <Clock size={16} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                  Pengajuan ini <span className="font-bold">menunggu</span> review oleh Penanggung Jawab Aset.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= HISTORY MODAL ================= */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div>
                <p className="text-white font-bold text-sm">Riwayat Approval</p>
                <p className="text-blue-200 text-xs mt-0.5">SIKA, JSA &amp; Revalidasi &middot; Ref. {noSikaGabungan}</p>
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
                    const dokumenLabel = h.dokumen === 'sika' ? 'SIKA' : h.dokumen === 'jsa' ? 'JSA' : h.dokumen === 'perubahan' ? 'Perubahan Data' : 'Revalidasi';
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
                          <span className="text-gray-400"> ({h.peran})</span>
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