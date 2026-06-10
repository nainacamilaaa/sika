export type UserRole = 'pemohon' | 'pemberi' | 'pja';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jabatan: string;
  department: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}