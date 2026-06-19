import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgramData {
  lokasiKerja: string;
  namaPaket: string;
  noKontrak: string;
  tanggalKontrak: string;
  satKerjaPemberi: string;
  picPemberi: string;
  satKerjaPenanggung: string;
  picPenanggung: string;
  pelaksanaJenis: string;
  pelaksanaPerusahaan: string;
}

interface JSAData {
  jsaNo: string;
  kontraktor: string;
  lokasi: string;
  tanggalJSA: string;
  namaJSA: string;
  dokumen: string[];
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

interface SikaData {
  fungsiPerusahaan: string;
  lokasiInstalasi: string;
  peralatanNoIdentitas: string;
  uraianPekerjaan: string;
  peralatanDigunakan: string;
  pekerjaList: string[];
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

interface ProgramStore {
  program: ProgramData | null;
  jsa: JSAData | null;
  sika: SikaData | null;
  aktivitasList: AktivitasData[];
  pendingRTL: PendingRTL | null;
  rtlList: RTLData[];
  jsaStatus: 'draft' | 'request_review' | 'request_approval' | 'approved' | null;
  approveDate: string | null;
  savedWPs: string[];
  workPermitList: WorkPermitData[];
  // ── Sertifikat yang sudah diisi ──
  filledSertifikat: string[];

  setProgram: (data: ProgramData) => void;
  setJSA: (data: JSAData) => void;
  setSika: (data: SikaData) => void;
  addAktivitas: (data: Omit<AktivitasData, 'no'>) => void;
  removeAktivitas: (no: number) => void;
  setPendingRTL: (data: PendingRTL) => void;
  saveRTL: (data: RTLData) => void;
  setJsaStatus: (status: 'draft' | 'request_review' | 'request_approval' | 'approved') => void;
  setApproveDate: (date: string) => void;
  saveWPs: (wps: string[]) => void;
  addWorkPermit: (data: Omit<WorkPermitData, 'no'>) => void;
  updateWorkPermitStatus: (noWP: string, status: WorkPermitData['status']) => void;
  removeWorkPermit: (no: number) => void;
  // ── Actions sertifikat ──
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
      jsaStatus: null,
      approveDate: null,
      savedWPs: [],
      workPermitList: [],
      filledSertifikat: [],

      setProgram: (data) => set({ program: data }),
      setJSA: (data) => set({ jsa: data }),
      setSika: (data) => set({ sika: data }),

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
          jsaStatus: null,
          approveDate: null,
          savedWPs: [],
          workPermitList: [],
          filledSertifikat: [],
        }),
    }),
    { name: 'sika-program' }
  )
);