import type { SubmissionRecord, ApprovalLogEntry } from '@/store/programStore';
import { getOverallStatus, getNomorSika } from '@/store/programStore';

export type NotifSeverity = 'success' | 'danger' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  submissionId: string;
  title: string;
  message: string;
  severity: NotifSeverity;
  timestamp: string;
}

const MAX_HARI_REVALIDASI = 7;

// Sama seperti di monitoring page: berlakuHingga adalah 6 digit [D,D,M,M,Y,Y],
// bukan tanggal utuh — digabung dulu jadi ISO date yang valid.
function digitsToDateString(digits?: string[]): string | null {
  if (!digits || digits.length !== 6 || digits.some((d) => !d)) return null;
  const [d1, d2, m1, m2, y1, y2] = digits;
  const iso = `20${y1}${y2}-${m1}${m2}-${d1}${d2}`;
  return isNaN(new Date(iso).getTime()) ? null : iso;
}

function hitungSisaHari(tanggalBerakhir: string | null): number | null {
  if (!tanggalBerakhir) return null;
  const berakhir = new Date(tanggalBerakhir);
  if (isNaN(berakhir.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  berakhir.setHours(0, 0, 0, 0);
  return Math.round((berakhir.getTime() - today.getTime()) / 86400000);
}

function getHariKeIni(tanggalPengajuan: string): number {
  const start = new Date(tanggalPengajuan);
  if (isNaN(start.getTime())) return 1;
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
}

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

const AKSI_LABEL: Record<'approve' | 'reject', string> = { approve: 'disetujui', reject: 'ditolak' };
const DOKUMEN_LABEL: Record<'sika' | 'jsa' | 'perubahan', string> = {
  sika: 'SIKA',
  jsa: 'JSA',
  perubahan: 'Perubahan data',
};
const PERAN_LABEL: Record<'pemberi' | 'pja', string> = {
  pemberi: 'Pemberi Kerja',
  pja: 'Asset Holder (PJA)',
};

/**
 * Menghasilkan daftar notifikasi untuk PEMOHON, dari dua sumber:
 * 1. approvalHistory — event approve/reject asli dari Pemberi/PJA (real, sudah
 *    ada id & timestamp sendiri, jadi id notifikasi dipakai ulang dari log.id).
 * 2. Status submission saat ini — revalidasi jatuh tempo & masa berlaku SIKA,
 *    dihitung ulang tiap kali dipanggil (bukan disimpan), supaya selalu akurat
 *    terhadap tanggal hari ini tanpa perlu job/cron terpisah.
 */
export function getNotifications(
  submissions: SubmissionRecord[],
  approvalHistory: ApprovalLogEntry[]
): AppNotification[] {
  const notifs: AppNotification[] = [];
  const todayKey = toDateKey(new Date());

  // 1) Keputusan Pemberi/PJA/perubahan
  for (const log of approvalHistory) {
    if (log.peran === 'pemohon' || !log.submissionId) continue;
    if (log.aksi !== 'approve' && log.aksi !== 'reject') continue;

    const sub = submissions.find((s) => s.id === log.submissionId);
    if (!sub) continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);
    const dokLabel = DOKUMEN_LABEL[log.dokumen];
    const peranLabel = PERAN_LABEL[log.peran as 'pemberi' | 'pja'];
    const aksiLabel = AKSI_LABEL[log.aksi];

    notifs.push({
      id: log.id,
      submissionId: sub.id,
      title: `${dokLabel} ${aksiLabel}`,
      message:
        log.aksi === 'reject' && log.alasan
          ? `${namaProgram} — ${dokLabel} ditolak oleh ${peranLabel}: ${log.alasan}`
          : `${namaProgram} — ${dokLabel} ${aksiLabel} oleh ${peranLabel}.`,
      severity: log.aksi === 'approve' ? 'success' : 'danger',
      timestamp: log.timestamp,
    });
  }

  // 2) Revalidasi & masa berlaku SIKA
  for (const sub of submissions) {
    const overall = getOverallStatus(
      sub.sikaStatusPemberi,
      sub.jsaStatusPemberi,
      sub.sikaStatusPJA,
      sub.jsaStatusPJA
    );
    if (overall !== 'aktif' && overall !== 'closed') continue;
    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);

    if (overall === 'aktif') {
      const hariKe = getHariKeIni(sub.createdAt);
      const sudahValidasiHariIni = sub.riwayatRevalidasi.includes(todayKey);

      if (hariKe > MAX_HARI_REVALIDASI) {
        notifs.push({
          id: `revalidasi-limit-${sub.id}`,
          submissionId: sub.id,
          title: 'Batas revalidasi terlampaui',
          message: `${namaProgram} sudah melewati batas ${MAX_HARI_REVALIDASI} hari revalidasi — ajukan SIKA baru.`,
          severity: 'danger',
          timestamp: sub.updatedAt,
        });
      } else if (!sudahValidasiHariIni && sub.perubahanStatus !== 'menunggu') {
        notifs.push({
          id: `revalidasi-due-${sub.id}-${todayKey}`,
          submissionId: sub.id,
          title: 'Revalidasi harian menunggu',
          message: `${namaProgram} perlu divalidasi hari ini (hari ke-${hariKe} dari ${MAX_HARI_REVALIDASI}).`,
          severity: 'warning',
          timestamp: sub.updatedAt,
        });
      }
    }

    const tanggalBerakhir = digitsToDateString(sub.sika.berlakuHingga);
    const sisaHari = hitungSisaHari(tanggalBerakhir);
    if (sisaHari !== null && sisaHari <= 7) {
      notifs.push({
        id: `expiry-${sub.id}`,
        submissionId: sub.id,
        title: sisaHari < 0 ? 'SIKA sudah berakhir' : 'SIKA akan berakhir',
        message:
          sisaHari < 0
            ? `${namaProgram} berakhir ${Math.abs(sisaHari)} hari lalu.`
            : sisaHari === 0
            ? `${namaProgram} berakhir hari ini.`
            : `${namaProgram} berakhir dalam ${sisaHari} hari.`,
        severity: sisaHari <= 2 ? 'danger' : 'warning',
        timestamp: sub.updatedAt,
      });
    }
  }

  return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}