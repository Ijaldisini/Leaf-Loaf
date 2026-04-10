import { supabase } from "../config/supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
    receiveMethod: "Pickup",
    addressDetail: "",
    latitude: null,
    longitude: null,
    paymentMethod: "COD",
  });

  const [qrisFile, setQrisFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data } = await supabase
        .from("menus")
        .select("*")
        .order("price", { ascending: true });
      if (data) setMenus(data);
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    let total = 0;
    Object.values(cart).forEach((item) => {
      total += item.price * item.qty;
    });
    setTotalPrice(total);
  }, [cart]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateCart = (menu, change) => {
    setCart((prev) => {
      const currentQty = prev[menu.id]?.qty || 0;
      const newQty = currentQty + change;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[menu.id];
        return newCart;
      }
      return {
        ...prev,
        [menu.id]: { qty: newQty, price: menu.price, name: menu.name },
      };
    });
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => alert("Gagal mengambil lokasi."),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(cart).length === 0)
      return alert("Pilih minimal 1 menu sebelum memesan!");

    if (
      formData.receiveMethod === "Delivery" &&
      (!formData.latitude || !formData.longitude)
    ) {
      return alert("Harap tandai lokasi pengiriman di peta!");
    }

    setIsLoading(true);

    try {
      const { data: activeBatch, error: batchError } = await supabase
        .from("batches")
        .select("id")
        .eq("status", "open")
        .single();
      if (batchError || !activeBatch)
        throw new Error("Maaf, saat ini PO sedang ditutup.");

      let qrisUrl = null;
      if (formData.paymentMethod === "QRIS") {
        if (!qrisFile) throw new Error("Harap unggah bukti pembayaran QRIS!");
        const fileName = `${Date.now()}-${Math.random()}.${qrisFile.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("qris-proofs")
          .upload(fileName, qrisFile);
        if (uploadError) throw uploadError;
        qrisUrl = supabase.storage.from("qris-proofs").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const poNumber = `PO-${Date.now()}`;

      const orderId = crypto.randomUUID();

      const { error: insertError } = await supabase.from("orders").insert([
        {
          id: orderId,
          po_number: poNumber,
          batch_id: activeBatch.id,
          customer_name: formData.name,
          phone: formData.phone,
          receive_method: formData.receiveMethod,
          address_detail:
            formData.receiveMethod === "Delivery"
              ? formData.addressDetail
              : null,
          latitude:
            formData.receiveMethod === "Delivery" ? formData.latitude : null,
          longitude:
            formData.receiveMethod === "Delivery" ? formData.longitude : null,
          notes: formData.notes,
          payment_method: formData.paymentMethod,
          qris_proof_url: qrisUrl,
          total_price: totalPrice,

          order_status:
            formData.paymentMethod === "COD" ? "accepted" : "pending",
        },
      ]);

      if (insertError) throw insertError;

      const orderItems = Object.keys(cart).map((menuId) => ({
        order_id: orderId,
        menu_id: menuId,
        quantity: cart[menuId].qty,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      navigate("/success", {
        state: {
          poNumber: poNumber,
          customerName: formData.name,
          paymentMethod: formData.paymentMethod,
          totalPrice: totalPrice,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 26, 15, 0.75)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px',
        }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '24px' }}>🍃</span>
            <span className="text-gradient">Leaf & Loaf</span>
          </Link>
          {totalItems > 0 && (
            <div className="badge badge-green" style={{ fontSize: '13px', padding: '6px 16px' }}>
              🛒 {totalItems} item · Rp {totalPrice.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page Header */}
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800,
            marginBottom: '8px',
          }}>
            <span className="text-gradient">Form Pemesanan</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Pilih menu favoritmu, isi data, dan pesan!
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* ===== STEP 1: MENU ===== */}
          <div className="glass-card animate-in" style={{ padding: '32px', animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div className="step-number">1</div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 700,
              }}>
                Pilih Menu <span style={{ color: 'var(--tomato)' }}>*</span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: cart[menu.id] ? 'rgba(34, 197, 94, 0.08)' : 'rgba(7, 26, 15, 0.4)',
                    borderRadius: '16px',
                    border: `1.5px solid ${cart[menu.id] ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-glass)'}`,
                    transition: 'all 0.3s var(--ease-smooth)',
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {menu.name}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>
                      {menu.description}
                    </p>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}>
                      <span className="text-gradient">Rp {menu.price.toLocaleString("id-ID")}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => updateCart(menu, -1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: '18px',
                      color: 'var(--text-primary)',
                      width: '28px',
                      textAlign: 'center',
                    }}>
                      {cart[menu.id]?.qty || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCart(menu, 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: 'var(--leaf-400)',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="divider" style={{ margin: '20px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Total:</span>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                fontWeight: 800,
              }}>
                <span className="text-gradient">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </span>
            </div>
          </div>

          {/* ===== STEP 2: PERSONAL DATA ===== */}
          <div className="glass-card animate-in" style={{ padding: '32px', animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div className="step-number">2</div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 700,
              }}>
                Data Diri
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Nama Lengkap <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  onChange={handleChange}
                  placeholder="Nama lengkap kamu"
                  className="input-glass"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Nomor WhatsApp <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="phone"
                  required
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="input-glass"
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Catatan Pesanan <span style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(Opsional)</span>
                </label>
                <textarea
                  name="notes"
                  placeholder="Contoh: Tanpa selada"
                  onChange={handleChange}
                  className="input-glass"
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* ===== STEP 3: RECEIVE METHOD ===== */}
          <div className="glass-card animate-in" style={{ padding: '32px', animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div className="step-number">3</div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 700,
              }}>
                Metode Penerimaan <span style={{ color: 'var(--tomato)' }}>*</span>
              </h2>
            </div>

            <div className="radio-pill-group" style={{ marginBottom: '20px' }}>
              <label
                className={`radio-pill ${formData.receiveMethod === "Pickup" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Pickup"
                  checked={formData.receiveMethod === "Pickup"}
                  onChange={handleChange}
                />
                📦 Pickup
              </label>
              <label
                className={`radio-pill ${formData.receiveMethod === "Delivery" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Delivery"
                  checked={formData.receiveMethod === "Delivery"}
                  onChange={handleChange}
                />
                🚚 Delivery
              </label>
            </div>

            {formData.receiveMethod === "Delivery" && (
              <div style={{
                padding: '24px',
                background: 'rgba(34, 197, 94, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                animation: 'fadeInUp 0.4s var(--ease-smooth)',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Alamat Detail <span style={{ color: 'var(--tomato)' }}>*</span>
                  </label>
                  <textarea
                    name="addressDetail"
                    required
                    onChange={handleChange}
                    placeholder="Nama kos/gang/jalan..."
                    className="input-glass"
                    rows="2"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Tandai Lokasi di Peta <span style={{ color: 'var(--tomato)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    className="btn-3d"
                    style={{ padding: '8px 18px', fontSize: '13px', marginBottom: '12px', borderRadius: '12px' }}
                  >
                    📍 Gunakan Lokasi Saat Ini
                  </button>
                  <div style={{
                    width: '100%',
                    height: '260px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-glass)',
                    position: 'relative',
                    zIndex: 0,
                  }}>
                    <MapContainer
                      center={[-8.1724, 113.6995]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap"
                      />
                      <MapEvents
                        onMapClick={(lat, lng) =>
                          setFormData({
                            ...formData,
                            latitude: lat,
                            longitude: lng,
                          })
                        }
                      />
                      <RecenterMap
                        lat={formData.latitude}
                        lng={formData.longitude}
                      />
                      {formData.latitude && formData.longitude && (
                        <Marker
                          position={[formData.latitude, formData.longitude]}
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== STEP 4: PAYMENT ===== */}
          <div className="glass-card animate-in" style={{ padding: '32px', animationDelay: '0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div className="step-number">4</div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 700,
              }}>
                Metode Pembayaran <span style={{ color: 'var(--tomato)' }}>*</span>
              </h2>
            </div>

            <div className="radio-pill-group" style={{ marginBottom: '20px' }}>
              <label
                className={`radio-pill ${formData.paymentMethod === "COD" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleChange}
                />
                💵 COD
              </label>
              <label
                className={`radio-pill ${formData.paymentMethod === "QRIS" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="QRIS"
                  checked={formData.paymentMethod === "QRIS"}
                  onChange={handleChange}
                />
                📱 QRIS
              </label>
            </div>

            {formData.paymentMethod === "QRIS" && (
              <div style={{
                padding: '24px',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                animation: 'fadeInUp 0.4s var(--ease-smooth)',
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Upload Bukti Transfer (JPG/PNG) <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  required
                  onChange={(e) => setQrisFile(e.target.files[0])}
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}
          </div>

          {/* ===== SUBMIT ===== */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-3d animate-in"
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '18px',
              borderRadius: '20px',
              animationDelay: '0.5s',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading
              ? "⏳ Memproses..."
              : `Kirim Pesanan (Rp ${totalPrice.toLocaleString("id-ID")}) 🚀`}
          </button>
        </form>
      </div>
    </div>
  );
}
