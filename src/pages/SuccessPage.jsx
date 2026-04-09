import { useLocation, Link, Navigate } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const state = location.state;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500 transform transition-all">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg
            className="w-12 h-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-800 mb-2">
          Yeay, Pesanan sudah Masuk! 🎉
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Terima kasih <strong>{state.customerName}</strong>, pesanan
          Sandwich-mu sudah kami terima dan akan segera diproses.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Order ID / Nomor PO:</p>
          <p className="text-2xl font-mono font-bold text-green-700 mb-4 bg-green-50 p-2 rounded text-center border border-green-100">
            {state.poNumber}
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Total Belanja:</span>
              <span className="font-bold">
                Rp {state.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Metode Bayar:</span>
              <span className="font-bold">{state.paymentMethod}</span>
            </div>
          </div>
        </div>

        {state.paymentMethod === "QRIS" ? (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-8 border border-blue-100">
            ⏳ <strong>Info:</strong> Bukti transfer QRIS kamu sedang divalidasi
            oleh Admin kami. Pantau Whatsapp mu kalau kami menghubungi ya!
          </div>
        ) : (
          <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm mb-8 border border-orange-100">
            💵 <strong>Info:</strong> Kamu memilih COD. Jangan lupa siapkan uang
            pas sebesar{" "}
            <strong>Rp {state.totalPrice.toLocaleString("id-ID")}</strong> saat
            pesanan selesai ya!
          </div>
        )}

        <Link
          to="/"
          className="inline-block w-full bg-gray-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-1"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
