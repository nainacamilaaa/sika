import type { SubmissionRecord, ApprovalLogEntry } from '@/store/programStore';
import { getOverallStatus, getNomorSika, getRevalidasiOverride, MAX_HARI_REVALIDASI } from '@/store/programStore';

export type NotifSeverity = 'success' | 'danger' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  submissionId: string;
  title: string;
  message: string;
  severity: NotifSeverity;
  timestamp: string;
}

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
const DOKUMEN_LABEL: Record<'sika' | 'jsa' | 'perubahan' | 'revalidasi', string> = {
  sika: 'SIKA',
  jsa: 'JSA',
  perubahan: 'Perubahan data',
  revalidasi: 'Pemulihan SIKA (Suspend)',
};
const PERAN_LABEL: Record<'pemberi' | 'pja', string> = {
  pemberi: 'Pemberi Kerja',
  pja: 'Asset Holder (PJA)',
};

export function getNotifications(
  submissions: SubmissionRecord[],
  approvalHistory: ApprovalLogEntry[]
): AppNotification[] {
  const notifs: AppNotification[] = [];
  const todayKey = toDateKey(new Date());

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
      title:
        log.dokumen === 'revalidasi'
          ? (log.aksi === 'approve' ? 'Pemulihan SIKA disetujui' : 'Pemulihan SIKA ditolak')
          : `${dokLabel} ${aksiLabel}`,
      message:
        log.aksi === 'reject' && log.alasan
          ? `${peranLabel} menolak ${dokLabel.toLowerCase()} untuk ${namaProgram}. Alasan: ${log.alasan}`
          : `${dokLabel} untuk ${namaProgram} telah ${aksiLabel} oleh ${peranLabel}.`,
      severity: log.aksi === 'approve' ? 'success' : 'danger',
      timestamp: log.timestamp,
    });
  }

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
      const override = getRevalidasiOverride(sub.createdAt, sub.riwayatRevalidasi);

      if (override === 'closed') {
        notifs.push({
          id: `revalidasi-limit-${sub.id}`,
          submissionId: sub.id,
          title: 'Batas revalidasi terlampaui',
          message: `${namaProgram} telah melewati batas ${MAX_HARI_REVALIDASI} hari revalidasi. SIKA berstatus Closed secara otomatis dan perlu diajukan kembali sebagai SIKA baru.`,
          severity: 'danger',
          timestamp: sub.updatedAt,
        });
      } else if (override === 'suspend') {
        const req = sub.revalidasiSuspendRequest;
        if (req?.status === 'menunggu') {
          notifs.push({
            id: `suspend-pending-${sub.id}`,
            submissionId: sub.id,
            title: 'Menunggu approval pemulihan',
            message: `Pengajuan pemulihan untuk ${namaProgram} sedang menunggu persetujuan Pemberi Kerja.`,
            severity: 'warning',
            timestamp: sub.updatedAt,
          });
        } else if (req?.status === 'ditolak') {
          notifs.push({
            id: `suspend-rejected-${sub.id}`,
            submissionId: sub.id,
            title: 'Pengajuan pemulihan ditolak',
            message: req.alasanTolak
              ? `Pemberi Kerja menolak pengajuan pemulihan untuk ${namaProgram}. Alasan: ${req.alasanTolak}`
              : `Pemberi Kerja menolak pengajuan pemulihan untuk ${namaProgram}. Silakan ajukan kembali melalui Data Management.`,
            severity: 'danger',
            timestamp: sub.updatedAt,
          });
        } else {
          notifs.push({
            id: `suspend-${sub.id}`,
            submissionId: sub.id,
            title: 'SIKA di-suspend',
            message: `${namaProgram} berstatus Suspend karena revalidasi kemarin belum dilakukan. Silakan ajukan pemulihan melalui Data Management.`,
            severity: 'danger',
            timestamp: sub.updatedAt,
          });
        }
      } else {
        const sudahValidasiHariIni = sub.riwayatRevalidasi.includes(todayKey);
        if (!sudahValidasiHariIni && sub.perubahanStatus !== 'menunggu') {
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

export function getPemberiNotifications(
  submissions: SubmissionRecord[],
  approvalHistory: ApprovalLogEntry[]
): AppNotification[] {
  const notifs: AppNotification[] = [];

  for (const log of approvalHistory) {
    if (log.peran !== 'pemohon' || log.aksi !== 'ajukan_ulang' || !log.submissionId) continue;

    const sub = submissions.find((s) => s.id === log.submissionId);
    if (!sub) continue;
    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);

    if (log.dokumen === 'sika' || log.dokumen === 'jsa') {
      notifs.push({
        id: log.id,
        submissionId: sub.id,
        title: 'Pengajuan baru masuk',
        message: `${namaProgram} baru diajukan oleh pemohon dan perlu ditinjau.`,
        severity: 'info',
        timestamp: log.timestamp,
      });
    } else if (log.dokumen === 'perubahan') {
      notifs.push({
        id: log.id,
        submissionId: sub.id,
        title: 'Revalidasi masuk',
        message: `Pemohon mengajukan perubahan data untuk ${namaProgram} dan perlu ditinjau.`,
        severity: 'warning',
        timestamp: log.timestamp,
      });
    } else if (log.dokumen === 'revalidasi') {
      notifs.push({
        id: log.id,
        submissionId: sub.id,
        title: 'Pengajuan pemulihan Suspend',
        message: `${namaProgram} sempat berstatus Suspend dan pemohon telah mengajukan pemulihan.`,
        severity: 'warning',
        timestamp: log.timestamp,
      });
    }
  }

  for (const sub of submissions) {
    const pemberiApproved = sub.sikaStatusPemberi === 'approved' && sub.jsaStatusPemberi === 'approved';
    if (!pemberiApproved) continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);
    const tanggalBerakhir = digitsToDateString(sub.sika.berlakuHingga);
    const sisaHari = hitungSisaHari(tanggalBerakhir);
    if (sisaHari !== null && sisaHari <= 7) {
      notifs.push({
        id: `pemberi-expiry-${sub.id}`,
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

// ============================================================
// NOTIFIKASI UNTUK PJA
// ============================================================

export function getPJANotifications(
  submissions: SubmissionRecord[],
  approvalHistory: ApprovalLogEntry[]
): AppNotification[] {
  const notifs: AppNotification[] = [];

  // 1) Event dari Pemberi Kerja yang perlu ditindaklanjuti PJA
  //    - Pemberi approve SIKA → PJA harus review
  //    - Pemberi approve JSA → PJA harus review
  for (const log of approvalHistory) {
    if (log.peran !== 'pemberi' || log.aksi !== 'approve' || !log.submissionId) continue;
    if (log.dokumen !== 'sika' && log.dokumen !== 'jsa') continue;

    const sub = submissions.find((s) => s.id === log.submissionId);
    if (!sub) continue;

    // Skip jika sudah di-approve oleh PJA
    if (log.dokumen === 'sika' && sub.sikaStatusPJA === 'approved') continue;
    if (log.dokumen === 'jsa' && sub.jsaStatusPJA === 'approved') continue;
    // Skip jika sudah di-reject oleh PJA
    if (log.dokumen === 'sika' && sub.sikaStatusPJA === 'rejected') continue;
    if (log.dokumen === 'jsa' && sub.jsaStatusPJA === 'rejected') continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);
    const dokLabel = log.dokumen === 'sika' ? 'SIKA' : 'JSA';

    notifs.push({
      id: `pja-review-${log.id}`,
      submissionId: sub.id,
      title: `${dokLabel} menunggu review PJA`,
      message: `${dokLabel} untuk ${namaProgram} telah disetujui oleh Pemberi Kerja dan menunggu verifikasi dari Asset Holder (PJA).`,
      severity: 'info',
      timestamp: log.timestamp,
    });
  }

  // 2) Event dari Pemohon yang perlu ditindaklanjuti PJA
  //    - Pemohon submit ulang setelah revisi
  for (const log of approvalHistory) {
    if (log.peran !== 'pemohon' || log.aksi !== 'ajukan_ulang' || !log.submissionId) continue;
    if (log.dokumen !== 'sika' && log.dokumen !== 'jsa') continue;

    const sub = submissions.find((s) => s.id === log.submissionId);
    if (!sub) continue;

    // Cek apakah sudah disetujui Pemberi dan PJA belum approve
    const pemberiApproved = log.dokumen === 'sika' 
      ? sub.sikaStatusPemberi === 'approved' 
      : sub.jsaStatusPemberi === 'approved';
    if (!pemberiApproved) continue;

    const pjaStatus = log.dokumen === 'sika' ? sub.sikaStatusPJA : sub.jsaStatusPJA;
    if (pjaStatus === 'approved' || pjaStatus === 'rejected') continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);
    const dokLabel = log.dokumen === 'sika' ? 'SIKA' : 'JSA';

    notifs.push({
      id: `pja-revisi-${log.id}`,
      submissionId: sub.id,
      title: `${dokLabel} diajukan ulang setelah revisi`,
      message: `${dokLabel} untuk ${namaProgram} telah diajukan ulang oleh pemohon. Mohon lakukan verifikasi ulang.`,
      severity: 'warning',
      timestamp: log.timestamp,
    });
  }

  // 3) Dokumen PJA yang perlu diupload (SIKA & JSA sudah di-approve Pemberi)
  for (const sub of submissions) {
    const pemberiApproved = sub.sikaStatusPemberi === 'approved' && sub.jsaStatusPemberi === 'approved';
    if (!pemberiApproved) continue;

    const pjaSikaApproved = sub.sikaStatusPJA === 'approved';
    const pjaJsaApproved = sub.jsaStatusPJA === 'approved';

    // Jika sudah di-approve PJA semua, skip
    if (pjaSikaApproved && pjaJsaApproved) continue;

    // Jika sudah di-reject PJA, skip (tidak perlu notif lagi)
    if (sub.sikaStatusPJA === 'rejected' || sub.jsaStatusPJA === 'rejected') continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);

    // Cek apakah dokumen sudah diupload
    const hasRemobilisasi = !!(sub as any).dokumenPJA?.remobilisasi;
    const hasMobilisasi = !!(sub as any).dokumenPJA?.mobilisasi;

    if (!hasRemobilisasi || !hasMobilisasi) {
      const missing = [];
      if (!hasRemobilisasi) missing.push('Remobilisasi');
      if (!hasMobilisasi) missing.push('Mobilisasi');

      notifs.push({
        id: `pja-dokumen-${sub.id}`,
        submissionId: sub.id,
        title: 'Dokumen PJA belum lengkap',
        message: `${namaProgram} memerlukan upload dokumen ${missing.join(' & ')} sebelum dapat disetujui.`,
        severity: 'warning',
        timestamp: sub.updatedAt,
      });
    } else {
      // Dokumen sudah lengkap, tapi PJA belum approve
      if (!pjaSikaApproved || !pjaJsaApproved) {
        const pending = [];
        if (!pjaSikaApproved) pending.push('SIKA');
        if (!pjaJsaApproved) pending.push('JSA');

        notifs.push({
          id: `pja-approve-${sub.id}`,
          submissionId: sub.id,
          title: 'Dokumen lengkap, menunggu approval PJA',
          message: `${namaProgram} sudah memiliki dokumen ${hasRemobilisasi ? 'Remobilisasi' : ''}${hasRemobilisasi && hasMobilisasi ? ' & ' : ''}${hasMobilisasi ? 'Mobilisasi' : ''}. Silakan lakukan verifikasi final.`,
          severity: 'info',
          timestamp: sub.updatedAt,
        });
      }
    }
  }

  // 4) SIKA yang sudah disetujui Pemberi tapi mau/sudah berakhir
  for (const sub of submissions) {
    const pemberiApproved = sub.sikaStatusPemberi === 'approved' && sub.jsaStatusPemberi === 'approved';
    if (!pemberiApproved) continue;

    const namaProgram = sub.program.namaPaket || getNomorSika(sub.sika);
    const tanggalBerakhir = digitsToDateString(sub.sika.berlakuHingga);
    const sisaHari = hitungSisaHari(tanggalBerakhir);
    if (sisaHari !== null && sisaHari <= 7) {
      notifs.push({
        id: `pja-expiry-${sub.id}`,
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