import { supabase } from "../config/supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 text-gray-900">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-700">
          Form Pemesanan Leaf & Loaf
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-xl font-bold mb-4">
              1. Pilih Menu <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-3">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="flex justify-between items-center bg-white p-3 border rounded shadow-sm"
                >
                  <div>
                    <h3 className="font-bold">{menu.name}</h3>
                    <p className="text-sm text-gray-500">{menu.description}</p>
                    <p className="font-bold text-green-600">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateCart(menu, -1)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold hover:bg-red-200"
                    >
                      -
                    </button>
                    <span className="font-bold w-6 text-center">
                      {cart[menu.id]?.qty || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCart(menu, 1)}
                      className="w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold hover:bg-green-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <h3 className="text-lg font-bold">
                Total:{" "}
                <span className="text-green-600">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">2. Data Diri</h2>
            <div>
              <label className="block font-medium">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Nomor WhatsApp *</label>
              <input
                type="number"
                name="phone"
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">
                Catatan Pesanan (Opsional)
              </label>
              <textarea
                name="notes"
                placeholder="Contoh: Tanpa selada"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              ></textarea>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. Metode Penerimaan *</h2>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Pickup"
                  checked={formData.receiveMethod === "Pickup"}
                  onChange={handleChange}
                />{" "}
                Pickup
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiveMethod"
                  value="Delivery"
                  checked={formData.receiveMethod === "Delivery"}
                  onChange={handleChange}
                />{" "}
                Delivery
              </label>
            </div>

            {formData.receiveMethod === "Delivery" && (
              <div className="p-4 border border-green-300 bg-green-50 rounded-lg space-y-4">
                <div>
                  <label className="block font-medium">Alamat Detail *</label>
                  <textarea
                    name="addressDetail"
                    required
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="block font-medium mb-2">
                    Tandai Lokasi di Peta *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    className="mb-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    📍 Gunakan Lokasi Saat Ini
                  </button>
                  <div className="w-full h-64 rounded border border-gray-300 overflow-hidden relative z-0">
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

          <div>
            <h2 className="text-xl font-bold mb-2">4. Metode Pembayaran *</h2>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleChange}
                />{" "}
                COD
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="QRIS"
                  checked={formData.paymentMethod === "QRIS"}
                  onChange={handleChange}
                />{" "}
                QRIS
              </label>
            </div>
            {formData.paymentMethod === "QRIS" && (
              <div className="p-4 border border-blue-300 bg-blue-50 rounded-lg">
                <label className="block font-medium">
                  Upload Bukti Transfer (JPG/PNG) *
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  required
                  onChange={(e) => setQrisFile(e.target.files[0])}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition shadow-lg text-lg"
          >
            {isLoading
              ? "Memproses..."
              : `Kirim Pesanan (Rp ${totalPrice.toLocaleString("id-ID")})`}
          </button>
        </form>
      </div>
    </div>
  );
}
