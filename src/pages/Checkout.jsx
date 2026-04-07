import { supabase } from "../config/supabaseClient";
import { useState, useEffect } from "react";

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
    if (lat && lng) {
      map.flyTo([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

export default function Checkout() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () =>
          alert(
            "Gagal mengambil lokasi. Pastikan GPS/Izin Lokasi browser aktif.",
          ),
      );
    } else {
      alert("Browser Anda tidak mendukung fitur lokasi.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      formData.receiveMethod === "Delivery" &&
      (!formData.latitude || !formData.longitude)
    ) {
      alert("Harap tandai lokasi pengiriman di peta!");
      setIsLoading(false);
      return;
    }

    try {
      const { data: activeBatch, error: batchError } = await supabase
        .from("batches")
        .select("id")
        .eq("status", "open")
        .single();

      if (batchError || !activeBatch) {
        alert("Maaf, saat ini PO sedang ditutup (Tidak ada Batch yang buka).");
        setIsLoading(false);
        return;
      }

      let qrisUrl = null;

      if (formData.paymentMethod === "QRIS") {
        if (!qrisFile) {
          alert("Harap unggah bukti pembayaran QRIS!");
          setIsLoading(false);
          return;
        }

        const fileExt = qrisFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("qris-proofs")
          .upload(fileName, qrisFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("qris-proofs")
          .getPublicUrl(fileName);

        qrisUrl = publicUrlData.publicUrl;
      }

      const poNumber = `PO-${Date.now()}`;
      const dummyTotalPrice = 25000;

      const { error: insertError } = await supabase.from("orders").insert([
        {
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
          total_price: dummyTotalPrice,
        },
      ]);

      if (insertError) throw insertError;

      alert(`Pesanan Berhasil Disimpan! Nomor PO: ${poNumber}`);

      setFormData({
        ...formData,
        name: "",
        phone: "",
        notes: "",
        addressDetail: "",
        latitude: null,
        longitude: null,
      });
      setQrisFile(null);
    } catch (error) {
      console.error("Error detail:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Form Pemesanan Leaf & Loaf
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTITAS DASAR */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              required
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium">
              Nomor WhatsApp (Cth: 628...){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
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
              value={formData.notes}
              placeholder="Contoh: Tanpa timun"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <hr />

        {/* METODE PENERIMAAN */}
        <div>
          <label className="block font-medium mb-2">
            Metode Penerimaan <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
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
        </div>

        {/* PROGRESSIVE DISCLOSURE: DELIVERY & MAPS */}
        {formData.receiveMethod === "Delivery" && (
          <div className="p-4 border border-green-300 bg-green-50 rounded-lg space-y-4 transition-all duration-300">
            <div>
              <label className="block font-medium">
                Alamat Detail (Patokan, Warna Pagar){" "}
                <span className="text-red-500 text-xl">*</span>
              </label>
              <textarea
                name="addressDetail"
                value={formData.addressDetail}
                required
                onChange={handleChange}
                className="w-full border p-2 rounded"
              ></textarea>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Tandai Lokasi di Peta{" "}
                <span className="text-red-500 text-xl">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeolocation}
                className="mb-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                📍 Gunakan Lokasi Saat Ini
              </button>

              {/* MODUL PETA LEAFLET */}
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

              {formData.latitude && (
                <p className="text-xs text-gray-500 mt-1">
                  Titik dikunci: {formData.latitude.toFixed(5)},{" "}
                  {formData.longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>
        )}

        <hr />

        {/* PEMBAYARAN */}
        <div>
          <label className="block font-medium mb-2">
            Metode Pembayaran <span className="text-red-500">*</span>
          </label>
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
            <div className="p-4 border border-blue-300 bg-blue-50 rounded-lg transition-all duration-300">
              <label className="block font-medium">
                Upload Bukti Transfer (JPG/PNG){" "}
                <span className="text-red-500">*</span>
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
          className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {isLoading ? "Memproses..." : "Kirim Pesanan"}
        </button>
      </form>
    </div>
  );
}
