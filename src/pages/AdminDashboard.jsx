import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Login Gagal: " + error.message);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
    setBatches([]);
  };

  const fetchData = async () => {
    const { data: orderData } = await supabase
      .from("orders")
      .select(
        `
        *,
        batches(name),
        order_items (
          quantity,
          menus (name)
        )
      `,
      )
      .order("created_at", { ascending: false });

    const { data: batchData } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (orderData) setOrders(orderData);
    if (batchData) setBatches(batchData);
  };

  const toggleBatchStatus = async (batchId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    await supabase
      .from("batches")
      .update({ status: newStatus })
      .eq("id", batchId);
    fetchData();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);
    fetchData();
  };

  /* ===== LOGIN SCREEN ===== */
  if (!session) {
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
        {/* Floating decorations */}
        <div className="leaf-deco" style={{ top: '15%', left: '10%', fontSize: '80px' }}>🌿</div>
        <div className="leaf-deco" style={{ bottom: '20%', right: '10%', fontSize: '100px', animationDelay: '-4s' }}>🍃</div>

        <form
          onSubmit={handleLogin}
          className="glass-card animate-in"
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '44px 36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--leaf-500), var(--leaf-400), var(--leaf-500))',
            borderRadius: '24px 24px 0 0',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '42px',
              marginBottom: '16px',
              filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.4))',
            }}>
              🍃
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '26px',
              fontWeight: 800,
              marginBottom: '6px',
            }}>
              <span className="text-gradient">Admin Login</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Masuk untuk mengelola Leaf & Loaf
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="admin@leafnloaf.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass"
                required
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-3d"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? '⏳ Memproses...' : '🔐 Masuk'}
          </button>
        </form>
      </div>
    );
  }

  /* ===== DASHBOARD ===== */
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'var(--font-body)',
      padding: '0 24px 80px',
    }}>

      {/* Header */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 26, 15, 0.75)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid var(--border-glass)',
        margin: '0 -24px',
        padding: '0 24px',
        marginBottom: '32px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>🍃</span>
            <span className="text-gradient">Leaf & Loaf</span>
            <span className="badge badge-green" style={{ fontSize: '10px' }}>ADMIN</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-3d-danger btn-3d"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* ===== BATCH MANAGEMENT ===== */}
        <div className="glass-card animate-in" style={{ padding: '32px', marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            <span className="text-gradient">Manajemen Batch</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400, marginLeft: '12px' }}>
              Open / Close PO
            </span>
          </h2>

          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {batches.map((batch) => (
              <div
                key={batch.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: '18px',
                  background: batch.status === 'open'
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(7, 26, 15, 0.4)',
                  border: `1.5px solid ${batch.status === 'open' ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-glass)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.3s var(--ease-smooth)',
                  minWidth: '260px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}>
                    {batch.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={batch.status === 'open' ? 'pulse-dot' : 'pulse-dot pulse-dot-red'} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: batch.status === 'open' ? 'var(--leaf-400)' : '#f87171',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {batch.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBatchStatus(batch.id, batch.status)}
                  className={`btn-3d ${batch.status === 'open' ? 'btn-3d-danger' : ''}`}
                  style={{ padding: '8px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {batch.status === "open" ? "Tutup PO" : "Buka PO"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ORDERS TABLE ===== */}
        <div className="glass-card animate-in" style={{
          padding: '32px',
          overflow: 'hidden',
          animationDelay: '0.15s',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 700,
            }}>
              <span className="text-gradient">Monitoring Pesanan</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400, marginLeft: '12px' }}>
                {orders.length} pesanan
              </span>
            </h2>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Pesanan (Menu)</th>
                  <th>Logistik</th>
                  <th>Pembayaran</th>
                  <th>Validasi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    {/* Customer */}
                    <td>
                      <div style={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        marginBottom: '4px',
                      }}>
                        {order.customer_name}
                      </div>
                      <a
                        href={`https://wa.me/${order.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--leaf-400)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        📱 {order.phone}
                      </a>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Notes: {order.notes || "—"}
                      </div>
                    </td>

                    {/* Order items */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                        {order.order_items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '13px' }}>
                            <span style={{ color: 'var(--leaf-400)', fontWeight: 700 }}>{item.quantity}x</span>{' '}
                            <span style={{ color: 'var(--text-primary)' }}>{item.menus.name}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}>
                        <span className="text-gradient">
                          Rp {order.total_price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>

                    {/* Logistics */}
                    <td>
                      <span className={`badge ${order.receive_method === "Delivery" ? "badge-blue" : "badge-orange"}`}>
                        {order.receive_method === "Delivery" ? "🚚" : "📦"} {order.receive_method}
                      </span>
                      {order.receive_method === "Delivery" && (
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {order.address_detail}
                          </p>
                          <a
                            href={`http://maps.google.com/?q=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--leaf-400)', fontSize: '12px' }}
                          >
                            📍 Buka di Maps
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Payment */}
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '4px',
                      }}>
                        {order.payment_method}
                      </span>
                      {order.payment_method === "QRIS" && order.qris_proof_url && (
                        <a
                          href={order.qris_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: '#60a5fa' }}
                        >
                          🖼 Lihat Bukti
                        </a>
                      )}
                    </td>

                    {/* Validation */}
                    <td>
                      {order.payment_method === "COD" ? (
                        <span className="badge badge-green">✅ COD</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {order.order_status === "pending" && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, "accepted")}
                                className="btn-3d"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                  borderRadius: '10px',
                                }}
                              >
                                ✅ Terima
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, "rejected")}
                                className="btn-3d btn-3d-danger"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                  borderRadius: '10px',
                                }}
                              >
                                ❌ Tolak
                              </button>
                            </>
                          )}
                          {order.order_status === "accepted" && (
                            <span className="badge badge-green">✅ Diterima</span>
                          )}
                          {order.order_status === "rejected" && (
                            <span className="badge badge-red">❌ Ditolak</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
