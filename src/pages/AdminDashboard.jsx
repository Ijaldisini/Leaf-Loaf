import { useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabaseClient";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newBatchName, setNewBatchName] = useState("");
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (batchData) {
      setBatches(batchData);
      if (batchData.length > 0 && !selectedBatchFilter) {
        setSelectedBatchFilter(batchData[0].id);
      }
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    setIsAddingBatch(true);
    const { error } = await supabase
      .from("batches")
      .insert([{ name: newBatchName, status: "open" }]);

    if (error) {
      alert("Gagal menambah batch: " + error.message);
    } else {
      setNewBatchName("");
      fetchData();
    }
    setIsAddingBatch(false);
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

  const handleFilterChange = (value) => {
    setSelectedBatchFilter(value);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const activeBatch = batches.find((b) => b.id === selectedBatchFilter);

  let filteredOrders = [];
  if (selectedBatchFilter === "unbatched") {
    filteredOrders = orders.filter((o) => !o.batches?.name);
  } else if (activeBatch) {
    filteredOrders = orders.filter((o) => o.batches?.name === activeBatch.name);
  }

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (!session) {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="hidden md:block w-1/2">
          <img
            src="/dafabotak.jpeg"
            alt="Leaf n Loaff"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-gradient-to-b from-[#2db8e4] via-[#3D71B6] to-[#2d2864]">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white">Admin Login</h2>
              <p className="text-white/70 text-sm mt-2">
                Masuk untuk mengelola Leaf n Loaff
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-white/80 mb-2">Email</label>
              <div className="flex items-center border border-white/20 bg-white/10 rounded-2xl px-4 h-12">
                <input
                  type="email"
                  placeholder="leafnloaf@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none text-white placeholder-white/40"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-white/80 mb-2">
                Password
              </label>
              <div className="flex items-center border border-white/20 bg-white/10 rounded-2xl px-4 h-12">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent outline-none text-white placeholder-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#ebeacb] text-[#2d2864] font-black hover:scale-[1.02] transition"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>

            <p className="text-center text-white/50 text-xs mt-6">
              Leaf n Loaff Admin Panel
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 font-[var(--font-body)]">
      <nav className="glass-card sticky top-0 z-50 -mx-4 md:-mx-8 px-4 md:px-8 mb-8 border-t-0 border-x-0 rounded-none backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-[70px]">
          <div className="font-[var(--font-heading)] text-lg md:text-xl font-extrabold flex items-center gap-2 md:gap-3">
            <span className="text-gradient">Leaf n Loaff</span>
            <span className="badge badge-green text-[10px] md:text-xs">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-3d btn-3d-danger px-4 py-2 text-xs md:text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="glass-card animate-in p-5 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="font-[var(--font-heading)] text-xl md:text-2xl font-bold flex items-center flex-wrap gap-2">
                <span className="text-gradient">Manajemen Batch</span>
              </h2>
            </div>

            <form
              onSubmit={handleAddBatch}
              className="flex flex-col sm:flex-row w-full lg:w-auto gap-3"
            >
              <input
                type="text"
                placeholder="Nama Batch (misal: Batch 4)"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                required
                className="input-glass w-full sm:min-w-[220px]"
              />
              <button
                type="submit"
                disabled={isAddingBatch}
                className="btn-3d px-5 py-2.5 text-sm w-full sm:w-auto whitespace-nowrap"
              >
                {isAddingBatch ? "Memproses..." : "Tambah Batch"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="glass-card p-5 flex items-center gap-4 transition-all duration-300"
                style={{
                  background:
                    batch.status === "open"
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex-1">
                  <p className="font-[var(--font-heading)] font-bold text-base md:text-lg mb-1.5 text-white">
                    {batch.name}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={
                        batch.status === "open"
                          ? "pulse-dot"
                          : "pulse-dot pulse-dot-red"
                      }
                    />
                    <span
                      className={`text-xs font-bold uppercase ${
                        batch.status === "open"
                          ? "text-[var(--leaf-400)]"
                          : "text-red-400"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleBatchStatus(batch.id, batch.status)}
                  className={`btn-3d px-4 py-2 text-xs md:text-sm whitespace-nowrap ${
                    batch.status === "open" ? "btn-3d-danger" : ""
                  }`}
                >
                  {batch.status === "open" ? "Tutup PO" : "Buka PO"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card animate-in p-5 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="font-[var(--font-heading)] text-xl md:text-2xl font-bold flex items-center flex-wrap gap-2">
              <span className="text-gradient">Monitoring Pesanan</span>
              <span className="text-[var(--text-muted)] text-sm font-normal">
                {filteredOrders.length} pesanan
              </span>
            </h2>

            <div className="relative w-full sm:w-[250px]" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="input-glass w-full flex justify-between items-center cursor-pointer text-left focus:ring-2 focus:ring-[var(--leaf-400)]"
                style={{ background: "rgba(255, 255, 255, 0.12)" }}
              >
                <span className="truncate font-semibold text-white">
                  {batches.find((b) => b.id === selectedBatchFilter)?.name ||
                      "Pilih Batch"}
                </span>
                {/* <svg
                  className={`fill-current h-4 w-4 text-white transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg> */}
              </button>

              <div
                className={`absolute z-50 mt-2 w-full rounded-2xl border border-[var(--border-glass)] shadow-2xl transition-all duration-200 origin-top ${
                  isDropdownOpen
                    ? "opacity-100 scale-y-100 translate-y-0"
                    : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                }`}
                style={{
                  background: "rgba(61, 189, 229, 0.95)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <ul className="max-h-60 overflow-y-auto py-2">
                  {batches.map((batch) => (
                    <li
                      key={batch.id}
                      onClick={() => handleFilterChange(batch.id)}
                      className={`px-5 py-3 cursor-pointer text-sm transition-colors flex justify-between items-center ${
                        selectedBatchFilter === batch.id
                          ? "bg-[var(--leaf-400)] text-white font-bold"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{batch.name}</span>
                      {selectedBatchFilter === batch.id && <span>✓</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-glass)] bg-white/5">
                <table className="table-glass w-full min-w-[800px]">
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
                    {paginatedOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              fontSize: "14px",
                              marginBottom: "4px",
                            }}
                          >
                            {order.customer_name}
                          </div>
                          <a
                            href={`https://wa.me/${order.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "12px",
                              color: "var(--leaf-400)",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {order.phone}
                          </a>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Notes: {order.notes || "—"}
                          </div>
                        </td>

                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              marginBottom: "8px",
                            }}
                          >
                            {order.order_items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: "13px" }}>
                                <span
                                  style={{
                                    color: "var(--leaf-400)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {item.quantity}x
                                </span>{" "}
                                <span style={{ color: "var(--text-primary)" }}>
                                  {item.menus.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            <span className="text-gradient">
                              Rp {order.total_price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              order.receive_method === "Delivery"
                                ? "badge-blue"
                                : "badge-orange"
                            }`}
                          >
                            {order.receive_method === "Delivery" ? "🚚" : "📦"}{" "}
                            {order.receive_method}
                          </span>
                          {order.receive_method === "Delivery" && (
                            <div style={{ marginTop: "8px", fontSize: "12px" }}>
                              <p
                                style={{
                                  color: "var(--text-muted)",
                                  marginBottom: "4px",
                                }}
                              >
                                {order.address_detail}
                              </p>
                              <a
                                href={`http://googleusercontent.com/maps.google.com/?q=${order.latitude},${order.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "var(--leaf-400)",
                                  fontSize: "12px",
                                }}
                              >
                                📍 Maps
                              </a>
                            </div>
                          )}
                        </td>

                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              fontSize: "14px",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {order.payment_method}
                          </span>
                          {order.payment_method === "QRIS" &&
                            order.qris_proof_url && (
                              <a
                                href={order.qris_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "12px",
                                  color: "#f1a0aa",
                                }}
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
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {order.order_status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "accepted")
                                    }
                                    className="btn-3d"
                                    style={{
                                      padding: "6px 14px",
                                      fontSize: "12px",
                                      borderRadius: "10px",
                                    }}
                                  >
                                    ✅ Terima
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order.id, "rejected")
                                    }
                                    className="btn-3d btn-3d-danger"
                                    style={{
                                      padding: "6px 14px",
                                      fontSize: "12px",
                                      borderRadius: "10px",
                                    }}
                                  >
                                    ❌ Tolak
                                  </button>
                                </>
                              )}
                              {order.order_status === "accepted" && (
                                <span className="badge badge-green">
                                  ✅ Diterima
                                </span>
                              )}
                              {order.order_status === "rejected" && (
                                <span className="badge badge-red">
                                  ❌ Ditolak
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="btn-3d px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                  >
                    &laquo; Prev
                  </button>
                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="btn-3d px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                  >
                    Next &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full py-12 text-center rounded-2xl border border-[var(--border-glass)] border-dashed bg-white/5">
              <p className="text-[var(--text-muted)] text-sm">
                Belum ada pesanan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
