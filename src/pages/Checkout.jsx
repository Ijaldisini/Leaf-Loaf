import { supabase } from "../config/supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

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
  const [previewImage, setPreviewImage] = useState(null);

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

  const showAlert = ({ icon, title, text }) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#2d2864",
      confirmButtonText: "OK",
      background: "#ffffff",
    });
  };

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
        [menu.id]: {
          qty: newQty,
          price: menu.price,
          name: menu.name,
        },
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
        async () => {
          await showAlert({
            icon: "error",
            title: "Lokasi Gagal",
            text: "Gagal mengambil lokasi perangkat.",
          });
        },
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(cart).length === 0) {
      await showAlert({
        icon: "warning",
        title: "Menu Kosong",
        text: "Pilih minimal 1 menu sebelum memesan.",
      });
      return;
    }

    if (
      formData.receiveMethod === "Delivery" &&
      (!formData.latitude || !formData.longitude)
    ) {
      await showAlert({
        icon: "warning",
        title: "Lokasi Belum Dipilih",
        text: "Harap tandai lokasi pengiriman di peta.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: activeBatch, error: batchError } = await supabase
        .from("batches")
        .select("id")
        .eq("status", "open")
        .maybeSingle();

      if (batchError || !activeBatch) {
        await showAlert({
          icon: "warning",
          title: "Batch Belum Dibuka",
          text: "Saat ini belum ada batch pemesanan yang sedang dibuka.",
        });
        setIsLoading(false);
        return;
      }

      let qrisUrl = null;

      if (formData.paymentMethod === "QRIS") {
        if (!qrisFile) {
          setIsLoading(false);

          await showAlert({
            icon: "warning",
            title: "Bukti Belum Diunggah",
            text: "Harap unggah bukti pembayaran QRIS terlebih dahulu.",
          });

          return;
        }

        const fileName = `${Date.now()}-${Math.random()}.${qrisFile.name
          .split(".")
          .pop()}`;

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
          poNumber,
          customerName: formData.name,
          paymentMethod: formData.paymentMethod,
          totalPrice,
        },
      });
    } catch (error) {
      console.error(error);
      await showAlert({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.qty,
    0,
  );

  const sectionClass =
    "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl";

  const inputClass =
    "w-full bg-white/90 text-gray-800 border border-white/30 p-3 rounded-2xl outline-none focus:border-[#ebeacb] transition";

  const optionBase =
    "flex-1 border-2 p-4 rounded-2xl text-center cursor-pointer font-bold transition";

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#2db8e4_0%,#3D71B6_45%,#2d2864_100%)] text-[#ebeacb]">
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent py-8 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex flex-col pointer-events-auto">
          <ul className="flex justify-center md:justify-between items-center gap-8 md:gap-16 font-bold tracking-widest text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            <li className="cursor-pointer transition">
              <a href="/" className="!text-[#ebeacb] hover:!text-white">
                BERANDA
              </a>
            </li>
            <li className="cursor-pointer transition">
              <a href="/checkout" className="!text-[#ebeacb] hover:!text-white">
                PESAN
              </a>
            </li>
            <li className="cursor-pointer transition">
              <a href="/profile" className="!text-[#ebeacb] hover:!text-white">
                PROFIL
              </a>
            </li>
          </ul>
          <div className="w-full h-[2px] bg-[#ebeacb] rounded-full opacity-80 shadow-sm"></div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-25">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Form Pemesanan
          </h1>
          <p className="text-white/70">
            Pilih menu favoritmu, isi data, dan pesan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className={sectionClass}>
            <h2 className="text-2xl font-black mb-6">1. Pilih Menu</h2>

            <div className="space-y-4">
              {menus.map((menu) => {
                const active = cart[menu.id];

                return (
                  <div
                    key={menu.id}
                    className={`p-4 rounded-2xl border transition flex justify-between items-center ${
                      active
                        ? "bg-white/15 border-[#ebeacb]"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-lg">{menu.name}</h3>
                      <p className="text-sm text-white/70">
                        {menu.description}
                      </p>
                      <p className="font-black mt-1">
                        Rp {menu.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateCart(menu, -1)}
                        className="w-9 h-9 rounded-xl bg-red-500/20"
                      >
                        −
                      </button>

                      <span className="font-black">
                        {cart[menu.id]?.qty || 0}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCart(menu, 1)}
                        className="w-9 h-9 rounded-xl bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className="text-2xl font-black mb-6">2. Data Diri</h2>

            <div className="space-y-5">
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                placeholder="Nama lengkap"
                className={inputClass}
              />

              <input
                type="number"
                name="phone"
                required
                onChange={handleChange}
                placeholder="Nomor WhatsApp"
                className={inputClass}
              />

              <textarea
                name="notes"
                rows="3"
                required
                onChange={handleChange}
                placeholder="Catatan pesanan"
                className={inputClass}
              />
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className="text-2xl font-black mb-6">3. Metode Penerimaan</h2>

            <div className="flex gap-4">
              <label
                className={`${optionBase} ${
                  formData.receiveMethod === "Pickup"
                    ? "bg-white/15 border-[#ebeacb]"
                    : "border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Pickup"
                  checked={formData.receiveMethod === "Pickup"}
                  onChange={handleChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                Pickup
              </label>

              <label
                className={`${optionBase} ${
                  formData.receiveMethod === "Delivery"
                    ? "bg-white/15 border-[#ebeacb]"
                    : "border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Delivery"
                  checked={formData.receiveMethod === "Delivery"}
                  onChange={handleChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                Delivery
              </label>
            </div>

            {formData.receiveMethod === "Delivery" && (
              <div className="mt-6 space-y-4">
                <textarea
                  name="addressDetail"
                  required
                  rows="2"
                  onChange={handleChange}
                  placeholder="Alamat lengkap"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={handleGeolocation}
                  className="px-4 py-2 rounded-xl bg-white/15 border border-white/20"
                >
                  📍 Gunakan Lokasi Saat Ini
                </button>

                <div className="h-[260px] rounded-2xl overflow-hidden">
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
            )}
          </div>

          <div className={sectionClass}>
            <h2 className="text-2xl font-black mb-6">4. Metode Pembayaran</h2>

            <div className="flex gap-4">
              <label
                className={`${optionBase} ${
                  formData.paymentMethod === "COD"
                    ? "bg-white/15 border-[#ebeacb]"
                    : "border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                COD
              </label>

              <label
                className={`${optionBase} ${
                  formData.paymentMethod === "QRIS"
                    ? "bg-white/15 border-[#ebeacb]"
                    : "border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="QRIS"
                  checked={formData.paymentMethod === "QRIS"}
                  onChange={handleChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                QRIS
              </label>
            </div>

            {formData.paymentMethod === "QRIS" && (
              <div className="mt-6 bg-white/10 border border-white/20 rounded-3xl p-5">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <div className="text-center">
                    <p className="text-sm text-white/70 mb-3">
                      Scan QRIS untuk pembayaran
                    </p>
                    <img
                      src="/qris.jpeg"
                      alt="QRIS"
                      className="w-full max-w-[260px] mx-auto rounded-2xl shadow-xl"
                    />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm text-white/70 mb-3">
                      Upload bukti transfer
                    </p>

                    <label className="cursor-pointer bg-[#ebeacb] text-[#2d2864] font-bold px-5 py-3 rounded-2xl text-center hover:scale-[1.02] transition">
                      Pilih File
                      <input
                        type="file"
                        accept="image/jpeg, image/png"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setQrisFile(file);

                          if (file) {
                            setPreviewImage(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>

                    {qrisFile && (
                      <p className="mt-3 text-xs text-white/70">
                        {qrisFile.name}
                      </p>
                    )}

                    {previewImage && (
                      <div className="hidden md:block mt-5">
                        <p className="text-sm text-white/70 mb-2">
                          Preview bukti transfer
                        </p>
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full max-w-[280px] rounded-2xl border border-white/20 shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ebeacb] text-[#2d2864] font-black py-4 rounded-2xl text-lg hover:scale-[1.02] transition"
          >
            {isLoading
              ? "Memproses..."
              : `Kirim Pesanan (Rp ${totalPrice.toLocaleString("id-ID")})`}
          </button>
        </form>
      </main>
    </div>
  );
}
