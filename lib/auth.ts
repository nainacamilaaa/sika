import { User } from '@/types';

export const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'pelaksana@pgn.co.id',
    password: 'sika123',
    role: 'pemohon',
    jabatan: 'Pelaksana Kerja',
    department: 'Operasi',
  },
  {
    id: '2',
    name: 'Rina Kusuma',
    email: 'pemberi@pgn.co.id',
    password: 'sika123',
    role: 'pemberi',
    jabatan: 'Pemberi Kerja',
    department: 'HSSE',
  },
  {
    id: '3',
    name: 'Ahmad Fauzi',
    email: 'pja@pgn.co.id',
    password: 'admin123',
    role: 'pja',
    jabatan: 'Super Admin',
    department: 'IT',
  },
];

export const ROLE_REDIRECT: Record<string, string> = {
  pemohon: '/dashboard/pemohon',
  pemberi: '/dashboard/pemberi',
  pja: '/dashboard/pja',
};