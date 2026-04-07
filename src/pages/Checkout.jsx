import { supabase } from "../config/supabaseClient";
import { useState } from "react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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

      const testLat = formData.receiveMethod === "Delivery" ? -8.1724 : null;
      const testLng = formData.receiveMethod === "Delivery" ? 113.6995 : null;

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
          latitude: testLat,
          longitude: testLng,
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
        <div className="space-y-4">
          <div>
            <label className="block font-medium">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
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
              placeholder="Contoh: Tanpa timun"
              onChange={handleChange}
              className="w-full border p-2 rounded"
            ></textarea>
          </div>
        </div>

        <hr />

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

        {formData.receiveMethod === "Delivery" && (
          <div className="p-4 border border-green-300 bg-green-50 rounded-lg space-y-4 transition-all duration-300">
            <div>
              <label className="block font-medium">
                Alamat Detail (Patokan, Warna Pagar){" "}
                <span className="text-red-500 text-xl">*</span>
              </label>
              <textarea
                name="addressDetail"
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
                className="mb-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                📍 Gunakan Lokasi Saat Ini
              </button>

              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded border border-gray-300">
                <span className="text-gray-500">
                  Modul Google Maps API akan dimuat di sini
                </span>
              </div>
            </div>
          </div>
        )}

        <hr />

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
          className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
        >
          Kirim Pesanan
        </button>
      </form>
    </div>
  );
}
