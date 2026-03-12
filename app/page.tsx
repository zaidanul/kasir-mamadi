import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 text-center animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
        {/* Welcome Text */}
        <h1 className="mb-4 text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-400">
          Selamat Datang,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Mamaku!
          </span>
        </h1>
        
        <p className="mb-10 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Sistem Point of Sale (POS) modern untuk mengelola warung dengan lebih mudah, cepat, dan profesional.
        </p>

        {/* Action Cards / Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/transaction" className="group p-[1px] rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[15px] bg-white dark:bg-zinc-950 p-8 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-zinc-900/80">
              <div className="rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Kasir / Transaksi</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Lakukan transaksi penjualan baru</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard" className="group p-[1px] rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[15px] bg-white dark:bg-zinc-950 p-8 transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/80">
              <div className="rounded-full bg-zinc-100 p-4 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard Produk</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola daftar menu dan harga</p>
              </div>
            </div>
          </Link>
          
          <Link href="/salesreport" className="group col-span-1 md:col-span-2 p-[1px] rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex h-full flex-col md:flex-row items-center justify-center gap-4 rounded-[15px] bg-white dark:bg-zinc-950 p-6 transition-colors group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/80">
              <div className="rounded-full bg-zinc-100 p-3 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Laporan Penjualan</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Lihat riwayat dan detail transaksi kasir</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

