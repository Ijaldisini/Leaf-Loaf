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

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-900">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
            Admin Login
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-green-800">
          🍃 Leaf & Loaf Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">
          Manajemen Batch (Open/Close PO)
        </h2>
        <div className="flex gap-4 flex-wrap">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-4 border rounded-lg flex items-center gap-4 ${batch.status === "open" ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-100"}`}
            >
              <div>
                <p className="font-bold">{batch.name}</p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      batch.status === "open"
                        ? "text-green-600 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {batch.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => toggleBatchStatus(batch.id, batch.status)}
                className={`px-4 py-2 rounded text-white font-bold ${batch.status === "open" ? "bg-red-500" : "bg-green-500"}`}
              >
                {batch.status === "open" ? "Tutup PO" : "Buka PO"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Monitoring Pesanan Masuk</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Pelanggan</th>
              <th className="p-3 border">Pesanan (Menu)</th>
              <th className="p-3 border">Logistik</th>
              <th className="p-3 border">Pembayaran</th>
              <th className="p-3 border">Validasi QRIS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 border">
                  <strong>{order.customer_name}</strong>
                  <br />
                  <a
                    href={`https://wa.me/${order.phone}`}
                    target="_blank"
                    className="text-blue-500 text-sm"
                  >
                    WA: {order.phone}
                  </a>
                  <br />
                  <span className="text-xs text-gray-500">
                    Notes: {order.notes || "-"}
                  </span>
                </td>

                <td className="p-3 border">
                  <ul className="list-disc ml-4 text-sm mb-2">
                    {order.order_items.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x{" "}
                        <span className="font-semibold">{item.menus.name}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="font-bold text-green-700">
                    Total: Rp {order.total_price.toLocaleString("id-ID")}
                  </span>
                </td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 text-xs rounded font-bold ${order.receive_method === "Delivery" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {order.receive_method}
                  </span>
                  {order.receive_method === "Delivery" && (
                    <div className="mt-2 text-xs">
                      <p>{order.address_detail}</p>
                      <a
                        href={`http://maps.google.com/?q=${order.latitude},${order.longitude}`}
                        target="_blank"
                        className="text-blue-500 underline"
                      >
                        📍 Buka di Maps
                      </a>
                    </div>
                  )}
                </td>
                <td className="p-3 border">
                  <strong>{order.payment_method}</strong>
                  <br />
                  {order.payment_method === "QRIS" && order.qris_proof_url && (
                    <a
                      href={order.qris_proof_url}
                      target="_blank"
                      className="text-blue-500 text-xs underline"
                    >
                      Lihat Bukti
                    </a>
                  )}
                </td>
                <td className="p-3 border">
                  {order.payment_method === "COD" ? (
                    <span className="text-green-600 font-bold text-sm">
                      ✅ COD
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      {order.order_status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "accepted")
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "rejected")
                            }
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {order.order_status === "accepted" && (
                        <span className="text-green-600 font-bold text-sm">
                          ✅ Diterima
                        </span>
                      )}
                      {order.order_status === "rejected" && (
                        <span className="text-red-600 font-bold text-sm">
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
    </div>
  );
}
