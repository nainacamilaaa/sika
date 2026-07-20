'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROLE_REDIRECT } from '@/lib/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, login } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      router.push(ROLE_REDIRECT[user.role]);
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(email, password);
    if (!ok) {
      setError('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
      return;
    }
    const currentUser = useAuthStore.getState().user;
    if (currentUser) router.push(ROLE_REDIRECT[currentUser.role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: "url('/backgroundlogin.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex"
        style={{ minHeight: '520px' }}
      >
        <div className="flex-1 flex flex-col justify-between p-10 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <img
              src="/logosika.svg"
              alt="SIKA"
              className="h-12 object-contain"
            />
            <img
              src="/logopertaminagasfull.svg"
              alt="Pertamina Gas"
              className="h-10 object-contain"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat Datang di <span className="text-blue-600">SIKA!</span>
            </h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Sistem digital untuk pengelolaan JSA, SIKA, validasi pekerjaan,
              dan monitoring aktivitas kerja secara terintegrasi
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Masukkan email anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition pr-11"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-gray-400">
            <span>HSSE | Perusahaan Gas Negara</span>
            <span>© 2026</span>
          </div>
        </div>

        <div className="hidden md:block w-80 lg:w-96 relative shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.svg')" }}
          />
        </div>
      </div>
    </div>
  );
}