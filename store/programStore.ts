import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgramData {
  lokasiKerja: string;
  namaPaket: string;
  noKontrak: string;
  tanggalKontrak: string;
  satKerjaPemberi: string;
  pelaksanaJenis: string;
  pelaksanaPerusahaan: string;
  picPemberiList: string[];
  pimpinanPelaksanaList: string[];
  satKerjaPenanggung: string;
  fungsiIA: string;
  picPenanggungList: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface JSARow {
  id: string;
  langkah: string;
  peralatan: string;
  potensiBahaya: string;
  tingkatRisiko: string;
  mitigasi: string;
  penanggungjawab: string;
}

interface JSASection {
  key: string;
  label: string;
  rows: JSARow[];
}

interface JSAData {
  jsaNo: string;
  kontraktor: string;
  lokasi: string;
  tanggalJSA: string;
  namaJSA: string;
  dokumen: string[];
  judulPekerjaan: string;
  halaman: string;
  totalHalaman: string;
  status: 'baru' | 'revisi';
  sections: JSASection[];
  checkedPPE: string[];
}

interface AktivitasData {
  no: number;
  aktivitasPekerjaan: string;
  potensiBahaya: string;
  intensitas: string;
  historyKerjadian: string;
  kapabilitas: string;
  level: string;
  tingkatKeparahan: string;
  tingkatResiko: string;
  spesifikHazard: string;
  pengendalian: string;
}

interface PendingRTL {
  aktivitasNo: number;
  potensiBahaya: string;
  intensitas: string;
  historyKerjadian: string;
  kapabilitas: string;
  keparahan: string;
  level: string;
  tingkatResiko: string;
}

interface RTLData {
  aktivitasNo: number;
  dueDate: string;
  rencanaTindakLanjut: string;
  potensiBahayaSebelum: string;
  konsekuensiSebelum: string;
  kemungkinanSebelum: string;
  tingkatResikoSebelum: string;
  potensiBahayaSetelah: string;
  konsekuensiSetelah: string;
  kemungkinanSetelah: string;
  tingkatResikoSetelah: string;
}

interface SikaBasicData {
  fungsiPerusahaan: string;
  lokasiInstalasi: string;
  peralatanNoIdentitas: string;
  uraianPekerjaan: string;
  peralatanDigunakan: string;
  pekerjaList: string[];
  noSIKA: string;
  tanggalSIKA: string;
  tanggalTerbit: string[];
  berlakuHingga: string[];
  jamKerjaMulai: string;
  jamKerjaSelesai: string;
  waktuIsolasi: string;
  noSikaAreaFungsi: string;
  noSikaNomorUrut: string;
  lanjutanDariSika: string;
}

interface SikaPemeriksaanData {
  isolasi: string[];
  lampiran: string[];
  identifikasi: string[];
  identifikasiTambahan: string;
  pengendalian: string[];
  permintaanTambahan: string;
  sertifikat: string[];
  sifatPekerjaan: string;
  diisiPA: boolean;
  diperiksaIA: boolean;
}

type SikaData = SikaBasicData & SikaPemeriksaanData;

interface SertifikatData {
  nama: string;
  data: Record<string, any>;
  diisiOleh: string;
  diisiPada: string;
}

interface GasMonitoringRow {
  id: number;
  time: string;
  lel: string;
  o2: string;
  h2s: string;
  co2: string;
  co: string;
  temp: string;
  sign: string;
  remark: string;
}

interface GasMonitoringData {
  tanggal: string;
  diukurOleh: string;
  rows: GasMonitoringRow[];
}

interface WorkPermitData {
  no: number;
  noWP: string;
  jenisWP: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'Draft' | 'Open' | 'Closed' | 'Approved' | 'Rejected';
  sumberBahaya: string[];
  alatPelindung: string[];
  safetyChecklist: Record<string, boolean>;
}

type JSAStatus = 'draft' | 'request_review' | 'request_approval' | 'approved' | 'rejected';
type SIKAStatus = 'draft' | 'request' | 'approved' | 'rejected';
type ApprovalStatus = 'draft' | 'request' | 'waiting' | 'approved' | 'rejected';

interface ApprovalLogEntry {
  id: string;
  // 'revalidasi' = log seputar pemulihan status Suspend (lihat
  // ajukanRevalidasiSuspend/approveRevalidasiSuspend/rejectRevalidasiSuspend
  // di bawah) — SENGAJA dipisah dari 'perubahan' (itu untuk pengajuan
  // perubahan DATA seperti sertifikat/pekerja baru), karena keduanya
  // adalah alur approval yang berbeda meski sama-sama muncul di kolom
  // "Revalidasi" pada tabel Data Management.
  dokumen: 'sika' | 'jsa' | 'perubahan' | 'revalidasi';
  aksi: 'approve' | 'reject' | 'ajukan_ulang';
  oleh: string;
  peran: 'pemberi' | 'pja' | 'pemohon';
  alasan?: string;
  // Submission mana yang terkait log ini. Opsional supaya entri lama (dari
  // sebelum field ini ada) tidak error, tapi SEMUA log baru harus mengisi ini
  // — tanpanya, begitu ada 2+ submission, riwayat approval antar pengajuan
  // akan tercampur dan tidak bisa dibedakan.
  submissionId?: string;
  timestamp: string;
}

/* ============================================================
 * SubmissionRecord — satu pengajuan SIKA/JSA yang sudah di-submit
 * (Request Review) oleh pemohon.
 *
 * `program` / `sika` / `jsa` di root store (di bawah) tetap dipakai
 * sebagai "draft aktif" yang sedang diisi lewat halaman Program New →
 * SIKA New → JSA New → Detail Program — itu tidak berubah.
 *
 * Begitu pemohon menekan "Request Review", draft aktif itu di-snapshot
 * ke dalam `submissions[]` supaya riwayat pengajuan sebelumnya tidak
 * tertimpa saat pemohon membuat pengajuan baru. Field status approval
 * (Pemberi/PJA) & riwayat revalidasi disimpan per-submission di sini.
 * ============================================================ */
interface SubmissionRecord {
  id: string;
  program: ProgramData;
  sika: SikaData;
  jsa: JSAData;

  sikaStatusPemberi: ApprovalStatus;
  jsaStatusPemberi: ApprovalStatus;
  alasanTolakSikaPemberi: string | null;
  alasanTolakJsaPemberi: string | null;

  sikaStatusPJA: ApprovalStatus;
  jsaStatusPJA: ApprovalStatus;
  alasanTolakSikaPJA: string | null;
  alasanTolakJsaPJA: string | null;

  // Tanggal-tanggal (YYYY-MM-DD) saat revalidasi harian sudah dikonfirmasi,
  // maks. 7 hari sejak createdAt. Disimpan di sini (bukan React state lokal)
  // supaya tidak hilang saat reload / pindah halaman.
  riwayatRevalidasi: string[];

  // Pengajuan pemulihan setelah submission ini sempat berstatus "Suspend"
  // (lihat getRevalidasiOverride di bawah — kalau tanggal KEMARIN belum
  // tervalidasi, submission otomatis dianggap Suspend). null = tidak ada
  // pengajuan pemulihan yang sedang berjalan. BEDA dari revalidasi harian
  // biasa: revalidasi harian biasa cukup self-certify pemohon lewat
  // catatRevalidasi (tanpa approval), tapi PEMULIHAN dari Suspend WAJIB
  // lewat approval Pemberi Kerja — begitu disetujui baru tanggal yang
  // diajukan ditambahkan ke riwayatRevalidasi.
  revalidasiSuspendRequest: {
    tanggal: string;
    status: 'menunggu' | 'ditolak';
    alasanTolak?: string | null;
  } | null;

  // Perubahan data (sertifikat/pekerja baru, dll) yang diajukan pemohon
  // SETELAH submission ini aktif/closed — lihat "Kirim Konfirmasi Revalidasi"
  // di Detail Program. Sengaja TERPISAH dari sikaStatusPemberi/jsaStatusPemberi
  // di atas: submission yang sedang berjalan tidak boleh kehilangan status
  // 'aktif'/'closed'-nya hanya karena sedang menunggu Pemberi meninjau
  // perubahan ini.
  perubahanStatus: PerubahanStatus;
  // Catatan dari Pemberi Kerja saat meminta pemohon melengkapi/memperbaiki
  // pengajuan perubahan (perubahanStatus === 'revisi'). BUKAN penolakan
  // permanen — pemohon masih bisa mengajukan ulang lewat "Kirim Konfirmasi
  // Revalidasi" di Detail Program. Ditampilkan ke pemohon sebagai
  // "Catatan Revisi Sebelumnya".
  catatanRevisiPerubahan: string | null;
  // Catatan bebas dari pemohon yang menyertai pengajuan perubahan ini,
  // ditampilkan ke Pemberi Kerja saat mereka me-review (lihat halaman
  // Data Management Pemberi).
  catatanPerubahan: string | null;

  createdAt: string;
  updatedAt: string;
}

const defaultSika: SikaData = {
  fungsiPerusahaan: '',
  lokasiInstalasi: '',
  peralatanNoIdentitas: '',
  uraianPekerjaan: '',
  peralatanDigunakan: '',
  pekerjaList: [],
  noSIKA: '',
  tanggalSIKA: '',
  tanggalTerbit: Array(6).fill(''),
  berlakuHingga: Array(6).fill(''),
  jamKerjaMulai: '',
  jamKerjaSelesai: '',
  waktuIsolasi: '',
  noSikaAreaFungsi: '',
  noSikaNomorUrut: '',
  lanjutanDariSika: '',
  isolasi: [],
  lampiran: [],
  identifikasi: [],
  identifikasiTambahan: '',
  pengendalian: [],
  permintaanTambahan: '',
  sertifikat: [],
  sifatPekerjaan: '',
  diisiPA: false,
  diperiksaIA: false,
};

const makeLogEntry = (
  entry: Omit<ApprovalLogEntry, 'id' | 'timestamp'>
): ApprovalLogEntry => ({
  ...entry,
  id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  timestamp: new Date().toISOString(),
});

const makeSubmissionId = () =>
  `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Gabungan "Area/Fungsi-NomorUrut" untuk Nomor SIKA, konsisten dipakai di
 * Detail Program, JSA New, dan Data Management. `sika.noSIKA` TIDAK dipakai
 * karena field itu tidak pernah diisi lewat form manapun.
 */
export const getNomorSika = (
  sika: Pick<SikaBasicData, 'noSikaAreaFungsi' | 'noSikaNomorUrut'> | null | undefined
): string => {
  if (!sika || (!sika.noSikaAreaFungsi && !sika.noSikaNomorUrut)) return '-';
  return `${sika.noSikaAreaFungsi || '-'}-${sika.noSikaNomorUrut || '-'}`;
};

/**
 * Status gabungan Pemberi + PJA untuk satu submission. Dipakai bareng oleh
 * Data Management (badge status per baris) dan Detail Program (menentukan
 * apakah tombol yang tampil "Request Review" atau "Kirim Konfirmasi
 * Revalidasi" — lihat catatan di ProgramStore.openSubmission).
 *
 * CATATAN: 'suspend' TIDAK pernah dihasilkan oleh getOverallStatus di
 * bawah — status itu murni soal approval Pemberi/PJA. 'suspend' (dan
 * auto-'closed' karena lewat batas revalidasi) adalah lapisan TAMBAHAN
 * yang cuma berlaku ketika status dasarnya 'aktif', lihat
 * getRevalidasiOverride().
 */
export type OverallStatus = 'aktif' | 'pending' | 'ditolak' | 'closed' | 'draft' | 'suspend';

// Status pengajuan perubahan data (revalidasi dengan update) — lihat
// SubmissionRecord.perubahanStatus di bawah. 'revisi' (bukan 'ditolak'):
// perubahan dikembalikan ke pemohon untuk dilengkapi lagi, bukan ditutup
// permanen — SIKA & JSA yang sudah aktif tidak terpengaruh selama proses ini.
export type PerubahanStatus = 'none' | 'menunggu' | 'disetujui' | 'revisi';

export const getOverallStatus = (
  sikaPemberi: ApprovalStatus,
  jsaPemberi: ApprovalStatus,
  sikaPJA: ApprovalStatus,
  jsaPJA: ApprovalStatus
): OverallStatus => {
  if (sikaPemberi === 'rejected' || jsaPemberi === 'rejected' || sikaPJA === 'rejected' || jsaPJA === 'rejected') return 'ditolak';
  if (sikaPJA === 'approved' && jsaPJA === 'approved') return 'closed';
  if (sikaPemberi === 'approved' && jsaPemberi === 'approved') return 'aktif';
  if (sikaPemberi === 'request' || jsaPemberi === 'request') return 'pending';
  return 'draft';
};

// Batas maksimal revalidasi harian sejak tanggal pengajuan (createdAt).
// Diekspor supaya UI (Data Management, modal revalidasi, dst) pakai angka
// yang sama persis dengan logika di getRevalidasiOverride — tidak ada lagi
// duplikasi konstanta antara store dan halaman.
export const MAX_HARI_REVALIDASI = 7;

/**
 * Menentukan status "override" akibat (tidak)-nya revalidasi harian untuk
 * submission yang status dasarnya 'aktif'. Cuma dipanggil kalau
 * getOverallStatus(...) sudah menghasilkan 'aktif' — status 'draft' /
 * 'pending' / 'ditolak' / 'closed' tidak pernah kena override ini.
 *
 * Aturan:
 * - Hari ke-N (dihitung dari createdAt, hari pertama = hari ke-1) melewati
 *   MAX_HARI_REVALIDASI → otomatis 'closed' (wajib ajukan SIKA baru).
 * - Hari pertama (belum ada "hari sebelumnya" yang wajib divalidasi) →
 *   tidak ada override, tetap 'aktif'.
 * - Kalau tanggal KEMARIN belum ada di riwayatRevalidasi → 'suspend',
 *   sampai pemohon mengajukan pemulihan dan Pemberi Kerja menyetujuinya
 *   (lihat ajukanRevalidasiSuspend / approveRevalidasiSuspend).
 * - Selain itu → null (tidak ada override, tampil normal sebagai 'aktif').
 */
export const getRevalidasiOverride = (
  createdAt: string,
  riwayatRevalidasi: string[]
): 'suspend' | 'closed' | null => {
  const start = new Date(createdAt);
  if (isNaN(start.getTime())) return null;
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerHari = 1000 * 60 * 60 * 24;
  const hariKe = Math.round((today.getTime() - start.getTime()) / msPerHari) + 1;

  if (hariKe > MAX_HARI_REVALIDASI) return 'closed';
  if (hariKe <= 1) return null;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  return riwayatRevalidasi.includes(yesterdayKey) ? null : 'suspend';
};

interface ProgramStore {
  program: ProgramData | null;
  jsa: JSAData | null;
  sika: SikaData | null;
  aktivitasList: AktivitasData[];
  pendingRTL: PendingRTL | null;
  rtlList: RTLData[];
  jsaStatus: JSAStatus;
  sikaStatus: SIKAStatus;
  alasanTolakJSA: string | null;
  alasanTolakSIKA: string | null;
  approveDate: string | null;
  savedWPs: string[];
  workPermitList: WorkPermitData[];
  filledSertifikat: string[];

  // Status Pemberi/PJA untuk draft yang SEDANG AKTIF (mirror dari submission
  // yang activeSubmissionId-nya cocok). Dipertahankan flat di sini supaya
  // halaman Program New / SIKA New / JSA New / Detail Program tidak perlu
  // tahu soal `submissions[]` sama sekali.
  sikaStatusPemberi: ApprovalStatus;
  jsaStatusPemberi: ApprovalStatus;
  alasanTolakSikaPemberi: string | null;
  alasanTolakJsaPemberi: string | null;

  sikaStatusPJA: ApprovalStatus;
  jsaStatusPJA: ApprovalStatus;
  alasanTolakSikaPJA: string | null;
  alasanTolakJsaPJA: string | null;

  // --- Multi-pengajuan (Data Management) ---
  submissions: SubmissionRecord[];
  activeSubmissionId: string | null;

  approvalHistory: ApprovalLogEntry[];
  sertifikatData: Record<string, SertifikatData>;
  gasMonitoringData: Record<string, GasMonitoringData>;

  // --- Notifikasi (dibaca dari approvalHistory + submissions, lihat
  // lib/notifications.ts). Yang disimpan di store cuma id yang SUDAH dibaca
  // pemohon, supaya badge unread persist antar sesi tanpa perlu store baru.
  readNotificationIds: string[];

  setProgram: (data: ProgramData) => void;
  setJSA: (data: JSAData) => void;
  setSika: (data: SikaData) => void;
  setSikaBasic: (data: SikaBasicData) => void;
  setSikaPemeriksaan: (data: SikaPemeriksaanData) => void;
  addAktivitas: (data: Omit<AktivitasData, 'no'>) => void;
  removeAktivitas: (no: number) => void;
  setPendingRTL: (data: PendingRTL) => void;
  saveRTL: (data: RTLData) => void;
  setJsaStatus: (status: JSAStatus) => void;
  setSikaStatus: (status: SIKAStatus) => void;
  setAlasanTolak: (type: 'jsa' | 'sika', alasan: string) => void;
  setApproveDate: (date: string) => void;
  saveWPs: (wps: string[]) => void;
  addWorkPermit: (data: Omit<WorkPermitData, 'no'>) => void;
  updateWorkPermitStatus: (noWP: string, status: WorkPermitData['status']) => void;
  removeWorkPermit: (no: number) => void;
  markSertifikatFilled: (nama: string) => void;
  unmarkSertifikat: (nama: string) => void;
  setSertifikatData: (nama: string, data: Record<string, any>, diisiOleh: string) => void;
  removeSertifikatData: (nama: string) => void;
  setGasMonitoringData: (key: string, data: GasMonitoringData) => void;
  removeGasMonitoringData: (key: string) => void;

  // Submit draft aktif → dibuat/diupdate sebagai SubmissionRecord di `submissions[]`
  submitToPemberi: (oleh: string) => void;
  ajukanUlangSika: (oleh: string, id?: string) => void;
  ajukanUlangJsa: (oleh: string, id?: string) => void;

  // `id` opsional: default ke activeSubmissionId (draft yang sedang dibuka).
  // Data Management (yang menampilkan banyak baris) sebaiknya selalu kirim `id` eksplisit.
  approveSikaPemberi: (oleh: string, id?: string) => void;
  rejectSikaPemberi: (oleh: string, alasan: string, id?: string) => void;
  approveJsaPemberi: (oleh: string, id?: string) => void;
  rejectJsaPemberi: (oleh: string, alasan: string, id?: string) => void;

  approveSikaPJA: (oleh: string, id?: string) => void;
  rejectSikaPJA: (oleh: string, alasan: string, id?: string) => void;
  approveJsaPJA: (oleh: string, id?: string) => void;
  rejectJsaPJA: (oleh: string, alasan: string, id?: string) => void;

  // Kirim update data (sertifikat/pekerja baru, dll) untuk submission yang
  // SUDAH aktif/closed, sebagai konfirmasi revalidasi ke Pemberi Kerja.
  // Sengaja TIDAK memakai submitToPemberi — itu untuk pengajuan pertama kali
  // dan akan reset status Pemberi ke 'request' sehingga submission tampak
  // "belum berlaku" lagi. Di sini hanya `perubahanStatus` yang berubah;
  // sikaStatusPemberi/jsaStatusPemberi tetap 'approved' sepanjang proses.
  ajukanPerubahanRevalidasi: (oleh: string, catatan?: string, id?: string) => void;
  approvePerubahanRevalidasi: (oleh: string, id?: string) => void;
  // Pemberi Kerja meminta pemohon melengkapi/memperbaiki pengajuan
  // perubahan (perubahanStatus → 'revisi'). BUKAN penolakan permanen —
  // SIKA & JSA yang sudah aktif tidak ikut berubah. Dipakai di
  // Approval Management → RevalidasiMasukModal ("Minta Revisi").
  mintaRevisiPerubahan: (oleh: string, catatan: string, id?: string) => void;

  // Catat revalidasi harian untuk submission tertentu (idempotent per tanggal)
  catatRevalidasi: (id: string, tanggalKey: string) => void;

  // Pemohon mengajukan pemulihan setelah SIKA berstatus Suspend (telat
  // revalidasi kemarin). BUKAN langsung mengaktifkan kembali — status
  // berubah jadi 'menunggu' dan baru tercatat sebagai tervalidasi
  // (riwayatRevalidasi bertambah) setelah Pemberi Kerja approve lewat
  // approveRevalidasiSuspend. Lihat getRevalidasiOverride() untuk logika
  // penentuan kapan sebuah submission dianggap 'suspend'.
  ajukanRevalidasiSuspend: (oleh: string, id?: string) => void;
  approveRevalidasiSuspend: (oleh: string, id?: string) => void;
  rejectRevalidasiSuspend: (oleh: string, alasan: string, id?: string) => void;

  // Kosongkan draft aktif (program/sika/jsa + status) tanpa menghapus
  // riwayat `submissions[]` — dipanggil sebelum mulai pengajuan baru.
  startNewDraft: () => void;

  // Muat snapshot sebuah submission lama ke field draft aktif (program/sika/jsa
  // + status Pemberi/PJA), supaya halaman yang membaca state flat (Detail
  // Program, dst) otomatis menampilkan submission itu tanpa perlu diubah.
  // Dipanggil sebelum navigasi ke halaman Detail dari baris tabel manapun
  // di Data Management.
  openSubmission: (id: string) => void;

  // Tandai satu / semua notifikasi sudah dibaca (lihat readNotificationIds).
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;

  reset: () => void;
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set, get) => {
      // ---- helper internal: patch satu SubmissionRecord di array ----
      const patchSubmission = (id: string, patch: Partial<SubmissionRecord>) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
          ),
        }));
      };

      // ---- helper internal: approve/reject dengan guard + log + mirror ----
      const applyApproval = (
        id: string | undefined,
        dokumen: 'sika' | 'jsa',
        peran: 'pemberi' | 'pja',
        aksi: 'approve' | 'reject',
        oleh: string,
        alasan: string | undefined,
        guardAndPatch: (record: SubmissionRecord) => Partial<SubmissionRecord> | null
      ) => {
        const state = get();
        const targetId = id ?? state.activeSubmissionId;
        if (!targetId) return;
        const record = state.submissions.find((s) => s.id === targetId);
        if (!record) return;

        const patch = guardAndPatch(record);
        if (!patch) return;

        patchSubmission(targetId, patch);
        set((s) => ({
          // Mirror ke field flat HANYA kalau yang di-approve/reject adalah
          // draft yang sedang aktif dibuka — supaya status program lain
          // yang kebetulan sedang tidak dibuka tidak ikut "berubah" di layar.
          ...(targetId === s.activeSubmissionId ? (patch as Partial<ProgramStore>) : {}),
          approvalHistory: [...s.approvalHistory, makeLogEntry({ dokumen, aksi, oleh, peran, alasan, submissionId: targetId })],
        }));
      };

      return {
        program: null,
        jsa: null,
        sika: null,
        aktivitasList: [],
        pendingRTL: null,
        rtlList: [],
        jsaStatus: 'draft',
        sikaStatus: 'draft',
        alasanTolakJSA: null,
        alasanTolakSIKA: null,
        approveDate: null,
        savedWPs: [],
        workPermitList: [],
        filledSertifikat: [],

        sikaStatusPemberi: 'draft',
        jsaStatusPemberi: 'draft',
        alasanTolakSikaPemberi: null,
        alasanTolakJsaPemberi: null,

        sikaStatusPJA: 'draft',
        jsaStatusPJA: 'draft',
        alasanTolakSikaPJA: null,
        alasanTolakJsaPJA: null,

        submissions: [],
        activeSubmissionId: null,

        approvalHistory: [],
        sertifikatData: {},
        gasMonitoringData: {},

        readNotificationIds: [],

        // createdAt dipertahankan dari state sebelumnya kalau sudah ada (diisi
        // sekali saat program pertama kali dibuat), updatedAt selalu diperbarui.
        setProgram: (data) =>
          set((state) => ({
            program: {
              ...data,
              createdAt: state.program?.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          })),

        setJSA: (data) => set({ jsa: data }),
        setSika: (data) => set({ sika: data }),

        setSikaBasic: (data) =>
          set((state) => ({
            sika: { ...(state.sika ?? defaultSika), ...data },
          })),

        setSikaPemeriksaan: (data) =>
          set((state) => ({
            sika: { ...(state.sika ?? defaultSika), ...data },
          })),

        addAktivitas: (data) =>
          set((state) => ({
            aktivitasList: [
              ...state.aktivitasList,
              { no: state.aktivitasList.length + 1, ...data },
            ],
          })),

        removeAktivitas: (no) =>
          set((state) => ({
            aktivitasList: state.aktivitasList
              .filter((a) => a.no !== no)
              .map((a, i) => ({ ...a, no: i + 1 })),
          })),

        setPendingRTL: (data) => set({ pendingRTL: data }),

        saveRTL: (data) =>
          set((state) => ({
            rtlList: [
              ...state.rtlList.filter((r) => r.aktivitasNo !== data.aktivitasNo),
              data,
            ],
            pendingRTL: null,
          })),

        setJsaStatus: (status) => set({ jsaStatus: status }),
        setSikaStatus: (status) => set({ sikaStatus: status }),

        setAlasanTolak: (type, alasan) =>
          set(type === 'jsa' ? { alasanTolakJSA: alasan } : { alasanTolakSIKA: alasan }),

        setApproveDate: (date) => set({ approveDate: date }),

        saveWPs: (wps) => set({ savedWPs: wps }),

        addWorkPermit: (data) =>
          set((state) => ({
            workPermitList: [
              ...state.workPermitList,
              { no: state.workPermitList.length + 1, ...data },
            ],
          })),

        updateWorkPermitStatus: (noWP, status) =>
          set((state) => ({
            workPermitList: state.workPermitList.map((w) =>
              w.noWP === noWP ? { ...w, status } : w
            ),
          })),

        removeWorkPermit: (no) =>
          set((state) => ({
            workPermitList: state.workPermitList
              .filter((w) => w.no !== no)
              .map((w, i) => ({ ...w, no: i + 1 })),
          })),

        markSertifikatFilled: (nama) =>
          set((state) => ({
            filledSertifikat: state.filledSertifikat.includes(nama)
              ? state.filledSertifikat
              : [...state.filledSertifikat, nama],
          })),

        unmarkSertifikat: (nama) =>
          set((state) => ({
            filledSertifikat: state.filledSertifikat.filter((v) => v !== nama),
          })),

        setSertifikatData: (nama, data, diisiOleh) =>
          set((state) => ({
            sertifikatData: {
              ...state.sertifikatData,
              [nama]: {
                nama,
                data,
                diisiOleh,
                diisiPada: new Date().toISOString(),
              },
            },
          })),

        removeSertifikatData: (nama) =>
          set((state) => {
            const next = { ...state.sertifikatData };
            delete next[nama];
            return { sertifikatData: next };
          }),

        setGasMonitoringData: (key, data) =>
          set((state) => ({
            gasMonitoringData: { ...state.gasMonitoringData, [key]: data },
          })),

        removeGasMonitoringData: (key) =>
          set((state) => {
            const next = { ...state.gasMonitoringData };
            delete next[key];
            return { gasMonitoringData: next };
          }),

        submitToPemberi: (oleh) => {
          const state = get();
          if (!state.program || !state.sika || !state.jsa) return;

          const now = new Date().toISOString();
          const existingId =
            state.activeSubmissionId &&
            state.submissions.some((s) => s.id === state.activeSubmissionId)
              ? state.activeSubmissionId
              : null;

          let submissions: SubmissionRecord[];
          const targetId = existingId ?? makeSubmissionId();

          if (existingId) {
            // Submit ulang setelah revisi: perbarui snapshot & reset status ke 'request'
            submissions = state.submissions.map((s) =>
              s.id === existingId
                ? {
                    ...s,
                    program: state.program!,
                    sika: state.sika!,
                    jsa: state.jsa!,
                    sikaStatusPemberi: 'request',
                    jsaStatusPemberi: 'request',
                    updatedAt: now,
                  }
                : s
            );
          } else {
            const record: SubmissionRecord = {
              id: targetId,
              program: state.program,
              sika: state.sika,
              jsa: state.jsa,
              sikaStatusPemberi: 'request',
              jsaStatusPemberi: 'request',
              alasanTolakSikaPemberi: null,
              alasanTolakJsaPemberi: null,
              sikaStatusPJA: 'draft',
              jsaStatusPJA: 'draft',
              alasanTolakSikaPJA: null,
              alasanTolakJsaPJA: null,
              riwayatRevalidasi: [],
              revalidasiSuspendRequest: null,
              perubahanStatus: 'none',
              catatanRevisiPerubahan: null,
              catatanPerubahan: null,
              createdAt: now,
              updatedAt: now,
            };
            submissions = [...state.submissions, record];
          }

          set({
            submissions,
            activeSubmissionId: targetId,
            sikaStatusPemberi: 'request',
            jsaStatusPemberi: 'request',
            approvalHistory: [
              ...state.approvalHistory,
              makeLogEntry({ dokumen: 'sika', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId }),
              makeLogEntry({ dokumen: 'jsa', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId }),
            ],
          });
        },

        ajukanUlangSika: (oleh, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (targetId) {
            patchSubmission(targetId, { sikaStatusPemberi: 'request', alasanTolakSikaPemberi: null });
          }
          set((s) => ({
            ...(!targetId || targetId === s.activeSubmissionId
              ? { sikaStatusPemberi: 'request' as ApprovalStatus, alasanTolakSikaPemberi: null }
              : {}),
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'sika', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId ?? undefined }),
            ],
          }));
        },

        ajukanUlangJsa: (oleh, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (targetId) {
            patchSubmission(targetId, { jsaStatusPemberi: 'request', alasanTolakJsaPemberi: null });
          }
          set((s) => ({
            ...(!targetId || targetId === s.activeSubmissionId
              ? { jsaStatusPemberi: 'request' as ApprovalStatus, alasanTolakJsaPemberi: null }
              : {}),
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'jsa', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId ?? undefined }),
            ],
          }));
        },

        approveSikaPemberi: (oleh, id) =>
          applyApproval(id, 'sika', 'pemberi', 'approve', oleh, undefined, (record) =>
            record.sikaStatusPemberi === 'approved'
              ? null
              : { sikaStatusPemberi: 'approved', alasanTolakSikaPemberi: null, sikaStatusPJA: 'waiting' }
          ),

        rejectSikaPemberi: (oleh, alasan, id) =>
          applyApproval(id, 'sika', 'pemberi', 'reject', oleh, alasan, (record) =>
            record.sikaStatusPemberi === 'approved'
              ? null
              : { sikaStatusPemberi: 'rejected', alasanTolakSikaPemberi: alasan, sikaStatusPJA: 'draft' }
          ),

        approveJsaPemberi: (oleh, id) =>
          applyApproval(id, 'jsa', 'pemberi', 'approve', oleh, undefined, (record) =>
            record.sikaStatusPemberi !== 'approved' || record.jsaStatusPemberi === 'approved'
              ? null
              : { jsaStatusPemberi: 'approved', alasanTolakJsaPemberi: null, jsaStatusPJA: 'waiting' }
          ),

        rejectJsaPemberi: (oleh, alasan, id) =>
          applyApproval(id, 'jsa', 'pemberi', 'reject', oleh, alasan, (record) =>
            record.jsaStatusPemberi === 'approved'
              ? null
              : { jsaStatusPemberi: 'rejected', alasanTolakJsaPemberi: alasan, jsaStatusPJA: 'draft' }
          ),

        approveSikaPJA: (oleh, id) =>
          applyApproval(id, 'sika', 'pja', 'approve', oleh, undefined, (record) =>
            record.sikaStatusPJA === 'approved' || record.sikaStatusPemberi !== 'approved'
              ? null
              : { sikaStatusPJA: 'approved', alasanTolakSikaPJA: null }
          ),

        rejectSikaPJA: (oleh, alasan, id) =>
          applyApproval(id, 'sika', 'pja', 'reject', oleh, alasan, (record) =>
            record.sikaStatusPJA === 'approved'
              ? null
              : { sikaStatusPJA: 'rejected', alasanTolakSikaPJA: alasan }
          ),

        approveJsaPJA: (oleh, id) =>
          applyApproval(id, 'jsa', 'pja', 'approve', oleh, undefined, (record) =>
            record.jsaStatusPJA === 'approved' || record.jsaStatusPemberi !== 'approved'
              ? null
              : { jsaStatusPJA: 'approved', alasanTolakJsaPJA: null }
          ),

        rejectJsaPJA: (oleh, alasan, id) =>
          applyApproval(id, 'jsa', 'pja', 'reject', oleh, alasan, (record) =>
            record.jsaStatusPJA === 'approved'
              ? null
              : { jsaStatusPJA: 'rejected', alasanTolakJsaPJA: alasan }
          ),

        ajukanPerubahanRevalidasi: (oleh, catatan, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId || !state.program || !state.sika || !state.jsa) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record) return;

          patchSubmission(targetId, {
            program: state.program,
            sika: state.sika,
            jsa: state.jsa,
            perubahanStatus: 'menunggu',
            catatanRevisiPerubahan: null,
            catatanPerubahan: catatan?.trim() || null,
          });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'perubahan', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId }),
            ],
          }));
        },

        approvePerubahanRevalidasi: (oleh, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record || record.perubahanStatus !== 'menunggu') return;

          patchSubmission(targetId, { perubahanStatus: 'disetujui', catatanRevisiPerubahan: null });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'perubahan', aksi: 'approve', oleh, peran: 'pemberi', submissionId: targetId }),
            ],
          }));
        },

        mintaRevisiPerubahan: (oleh, catatan, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record || record.perubahanStatus !== 'menunggu') return;

          patchSubmission(targetId, { perubahanStatus: 'revisi', catatanRevisiPerubahan: catatan });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'perubahan', aksi: 'ajukan_ulang', oleh, peran: 'pemberi', alasan: catatan, submissionId: targetId }),
            ],
          }));
        },

        catatRevalidasi: (id, tanggalKey) =>
          set((state) => ({
            submissions: state.submissions.map((s) =>
              s.id !== id || s.riwayatRevalidasi.includes(tanggalKey)
                ? s
                : {
                    ...s,
                    riwayatRevalidasi: [...s.riwayatRevalidasi, tanggalKey],
                    updatedAt: new Date().toISOString(),
                  }
            ),
          })),

        ajukanRevalidasiSuspend: (oleh, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record) return;

          const todayKey = new Date().toISOString().split('T')[0];
          patchSubmission(targetId, {
            revalidasiSuspendRequest: { tanggal: todayKey, status: 'menunggu' },
          });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'revalidasi', aksi: 'ajukan_ulang', oleh, peran: 'pemohon', submissionId: targetId }),
            ],
          }));
        },

        approveRevalidasiSuspend: (oleh, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record?.revalidasiSuspendRequest || record.revalidasiSuspendRequest.status !== 'menunggu') return;

          const tanggal = record.revalidasiSuspendRequest.tanggal;
          patchSubmission(targetId, {
            riwayatRevalidasi: record.riwayatRevalidasi.includes(tanggal)
              ? record.riwayatRevalidasi
              : [...record.riwayatRevalidasi, tanggal],
            revalidasiSuspendRequest: null,
          });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'revalidasi', aksi: 'approve', oleh, peran: 'pemberi', submissionId: targetId }),
            ],
          }));
        },

        rejectRevalidasiSuspend: (oleh, alasan, id) => {
          const state = get();
          const targetId = id ?? state.activeSubmissionId;
          if (!targetId) return;
          const record = state.submissions.find((s) => s.id === targetId);
          if (!record?.revalidasiSuspendRequest || record.revalidasiSuspendRequest.status !== 'menunggu') return;

          patchSubmission(targetId, {
            revalidasiSuspendRequest: { ...record.revalidasiSuspendRequest, status: 'ditolak', alasanTolak: alasan },
          });
          set((s) => ({
            approvalHistory: [
              ...s.approvalHistory,
              makeLogEntry({ dokumen: 'revalidasi', aksi: 'reject', oleh, peran: 'pemberi', alasan, submissionId: targetId }),
            ],
          }));
        },

        startNewDraft: () =>
          set({
            program: null,
            jsa: null,
            sika: null,
            activeSubmissionId: null,
            jsaStatus: 'draft',
            sikaStatus: 'draft',
            alasanTolakJSA: null,
            alasanTolakSIKA: null,
            filledSertifikat: [],
            sikaStatusPemberi: 'draft',
            jsaStatusPemberi: 'draft',
            alasanTolakSikaPemberi: null,
            alasanTolakJsaPemberi: null,
            sikaStatusPJA: 'draft',
            jsaStatusPJA: 'draft',
            alasanTolakSikaPJA: null,
            alasanTolakJsaPJA: null,
          }),

        openSubmission: (id) => {
          const state = get();
          const record = state.submissions.find((s) => s.id === id);
          if (!record) return;
          set({
            activeSubmissionId: record.id,
            program: record.program,
            sika: record.sika,
            jsa: record.jsa,
            sikaStatusPemberi: record.sikaStatusPemberi,
            jsaStatusPemberi: record.jsaStatusPemberi,
            alasanTolakSikaPemberi: record.alasanTolakSikaPemberi,
            alasanTolakJsaPemberi: record.alasanTolakJsaPemberi,
            sikaStatusPJA: record.sikaStatusPJA,
            jsaStatusPJA: record.jsaStatusPJA,
            alasanTolakSikaPJA: record.alasanTolakSikaPJA,
            alasanTolakJsaPJA: record.alasanTolakJsaPJA,
          });
        },

        markNotificationRead: (id) =>
          set((state) =>
            state.readNotificationIds.includes(id)
              ? state
              : { readNotificationIds: [...state.readNotificationIds, id] }
          ),

        markAllNotificationsRead: (ids) =>
          set((state) => ({
            readNotificationIds: [...new Set([...state.readNotificationIds, ...ids])],
          })),

        reset: () =>
          set({
            program: null,
            jsa: null,
            sika: null,
            aktivitasList: [],
            pendingRTL: null,
            rtlList: [],
            jsaStatus: 'draft',
            sikaStatus: 'draft',
            alasanTolakJSA: null,
            alasanTolakSIKA: null,
            approveDate: null,
            savedWPs: [],
            workPermitList: [],
            filledSertifikat: [],
            sikaStatusPemberi: 'draft',
            jsaStatusPemberi: 'draft',
            alasanTolakSikaPemberi: null,
            alasanTolakJsaPemberi: null,
            sikaStatusPJA: 'draft',
            jsaStatusPJA: 'draft',
            alasanTolakSikaPJA: null,
            alasanTolakJsaPJA: null,
            submissions: [],
            activeSubmissionId: null,
            approvalHistory: [],
            sertifikatData: {},
            gasMonitoringData: {},
            readNotificationIds: [],
          }),
      };
    },
    { name: 'sika-program' }
  )
);

export type {
  ProgramData,
  JSAData,
  JSARow,
  JSASection,
  SikaData,
  SikaBasicData,
  SikaPemeriksaanData,
  AktivitasData,
  PendingRTL,
  RTLData,
  WorkPermitData,
  JSAStatus,
  SIKAStatus,
  ApprovalStatus,
  ApprovalLogEntry,
  SertifikatData,
  GasMonitoringData,
  GasMonitoringRow,
  SubmissionRecord,
};