import { useLocation, Link, Navigate } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const state = location.state;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#2db8e4_0%,#3D71B6_45%,#2d2864_100%)] flex items-center justify-center px-4 py-10 text-[#ebeacb] relative overflow-hidden">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#ebeacb]/10 border border-[#ebeacb]/20 flex items-center justify-center shadow-xl">
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ebeacb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-black mb-3">
          Pesanan Berhasil
        </h1>

        <p className="text-white/80 mb-8 leading-relaxed">
          Terima kasih{" "}
          <span className="font-bold text-[#ebeacb]">{state.customerName}</span>
          , pesananmu sudah kami terima dan sedang diproses.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left mb-6">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-2">
            Nomor Pesanan
          </p>

          <div className="bg-[#ebeacb]/10 border border-[#ebeacb]/20 rounded-2xl py-4 text-center mb-5">
            <p className="font-mono text-xl font-black tracking-wider">
              {state.poNumber}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/60">Total Belanja</span>
              <span className="font-bold">
                Rp {state.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Metode Pembayaran</span>
              <span className="px-3 py-1 rounded-full bg-[#ebeacb]/10 border border-[#ebeacb]/20 text-sm font-bold">
                {state.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {state.paymentMethod === "QRIS" ? (
          <div className="bg-blue-500/10 border border-blue-300/20 rounded-2xl p-4 text-sm text-left mb-8 text-blue-100">
            Bukti pembayaran sedang diverifikasi admin. Mohon tunggu konfirmasi melalui WhatsApp.
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-300/20 rounded-2xl p-4 text-sm text-left mb-8 text-yellow-100">
            💵 Siapkan pembayaran sebesar{" "}
            <span className="font-bold">
              Rp {state.totalPrice.toLocaleString("id-ID")}
            </span>{" "}
            saat pesanan diterima.
          </div>
        )}

        <Link
          to="/"
          className="block w-full bg-[#ebeacb] text-[#2d2864] font-black py-4 rounded-2xl text-lg hover:scale-[1.02] transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
