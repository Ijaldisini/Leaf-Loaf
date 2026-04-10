import { useLocation, Link, Navigate } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const state = location.state;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '-10px',
            left: `${8 + i * 8}%`,
            width: `${6 + (i % 3) * 4}px`,
            height: `${6 + (i % 3) * 4}px`,
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            background: ['var(--leaf-400)', 'var(--gold-400)', 'var(--leaf-300)', '#60a5fa'][i % 4],
            animation: `confettiFall ${3 + (i % 3)}s ease-in ${i * 0.3}s infinite`,
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div className="glass-card animate-in" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '48px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Green top accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--leaf-500), var(--leaf-400), var(--leaf-500))',
          borderRadius: '24px 24px 0 0',
        }} />

        {/* Animated check icon */}
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.15), inset 0 0 20px rgba(34, 197, 94, 0.05)',
          animation: 'fadeInScale 0.6s var(--ease-spring)',
        }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--leaf-400)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.4))' }}
          >
            <path
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 40,
                animation: 'checkDraw 0.8s ease-out 0.3s both',
              }}
            />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '10px',
          color: 'var(--text-primary)',
        }}>
          Yeay, Pesanan Masuk! 🎉
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          marginBottom: '32px',
          lineHeight: 1.6,
          opacity: 0.85,
        }}>
          Terima kasih <strong style={{ color: 'var(--leaf-300)' }}>{state.customerName}</strong>, pesanan
          Sandwich-mu sudah kami terima dan akan segera diproses.
        </p>

        {/* Order details card */}
        <div style={{
          background: 'rgba(7, 26, 15, 0.5)',
          borderRadius: '18px',
          padding: '28px',
          marginBottom: '28px',
          textAlign: 'left',
          border: '1px solid var(--border-glass)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Order ID / Nomor PO
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '20px',
            fontWeight: 700,
            padding: '12px 16px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            letterSpacing: '1px',
          }}>
            <span className="text-gradient">{state.poNumber}</span>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-glass)',
              fontSize: '14px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Belanja</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Rp {state.totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
              <span className="badge badge-green" style={{ fontSize: '12px' }}>
                {state.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Payment info */}
        {state.paymentMethod === "QRIS" ? (
          <div style={{
            padding: '18px 20px',
            borderRadius: '14px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#93c5fd',
            fontSize: '14px',
            marginBottom: '28px',
            textAlign: 'left',
            lineHeight: 1.6,
          }}>
            ⏳ <strong>Info:</strong> Bukti transfer QRIS kamu sedang divalidasi
            oleh Admin kami. Pantau WhatsApp mu kalau kami menghubungi ya!
          </div>
        ) : (
          <div style={{
            padding: '18px 20px',
            borderRadius: '14px',
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            color: '#fdba74',
            fontSize: '14px',
            marginBottom: '28px',
            textAlign: 'left',
            lineHeight: 1.6,
          }}>
            💵 <strong>Info:</strong> Kamu memilih COD. Jangan lupa siapkan uang
            pas sebesar{" "}
            <strong>Rp {state.totalPrice.toLocaleString("id-ID")}</strong> saat
            pesanan selesai ya!
          </div>
        )}

        <Link
          to="/"
          className="btn-3d-dark btn-3d"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
          }}
        >
          🍃 Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
