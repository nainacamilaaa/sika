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
}

type SikaData = SikaBasicData & SikaPemeriksaanData;

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

const defaultSika: SikaData = {
  fungsiPerusahaan: '',
  lokasiInstalasi: '',
  peralatanNoIdentitas: '',
  uraianPekerjaan: '',
  peralatanDigunakan: '',
  pekerjaList: [],
  noSIKA: '',
  tanggalSIKA: '',
  isolasi: [],
  lampiran: [],
  identifikasi: [],
  identifikasiTambahan: '',
  pengendalian: [],
  permintaanTambahan: '',
  sertifikat: [],
  sifatPekerjaan: '',
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
  reset: () => void;
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set) => ({
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

      setProgram: (data) => set({ program: data }),

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
        }),
    }),
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
};