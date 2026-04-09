import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newTestiName, setNewTestiName] = useState("");
  const [newTestiContent, setNewTestiContent] = useState("");
  const [newTestiRating, setNewTestiRating] = useState(5); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHomeData = async () => {
    const { data: menuData } = await supabase
      .from("menus")
      .select("*")
      .order("price", { ascending: true });

    const { data: testimonialData } = await supabase
      .from("testimonials")
      .select("*, batches(name)")
      .order("created_at", { ascending: false })
      .limit(6);

    const { data: batchData } = await supabase
      .from("batches")
      .select("id")
      .eq("status", "open")
      .single();

    if (menuData) setMenus(menuData);
    if (testimonialData) setTestimonials(testimonialData);
    if (batchData) setActiveBatch(batchData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!activeBatch) {
      alert("Maaf, testimoni belum bisa dikirim karena PO sedang tutup.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("testimonials").insert([
        {
          customer_name: newTestiName,
          content: newTestiContent,
          batch_id: activeBatch.id,
          rating: newTestiRating,
        },
      ]);

      if (error) throw error;

      alert("Terima kasih! Ulasan dan rating bintangmu sudah terbit.");
      setNewTestiName("");
      setNewTestiContent("");
      setNewTestiRating(5); 
      fetchHomeData();
    } catch (error) {
      alert("Gagal mengirim testimoni: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuSatuan = menus.filter((m) => m.type === "satuan");
  const menuBundling = menus.filter((m) => m.type === "bundling");

  const averageRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
          testimonials.length
        ).toFixed(1)
      : 0;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-green-700 bg-gray-50">
        Memuat Leaf & Loaf...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-green-700">
            🍃 Leaf & Loaf
          </h1>
          <Link
            to="/checkout"
            className="bg-green-600 text-white px-5 py-2 rounded-full font-bold hover:bg-green-700 transition shadow-md"
          >
            Pesan Sekarang
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-24 px-4 text-center border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-green-950 mb-6 leading-tight">
            Healthy Sandwich, <br /> Praktis & Mengenyangkan!
          </h2>
          <p className="text-lg text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto">
            Solusi makan sehat di tengah padatnya aktivitas kampus Jember.
            Dibuat fresh setiap batch dengan isian melimpah. Tinggal pesan, kami
            antar langsung ke depan kos-mu!
          </p>
          <Link
            to="/checkout"
            className="bg-green-600 text-white px-10 py-4 rounded-full font-extrabold text-xl hover:bg-green-700 transition shadow-xl inline-block hover:-translate-y-1 transform"
          >
            Ikut PO Batch Ini 🚀
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16 border-b-2 border-green-100 pb-10">
          <h2 className="text-4xl font-black text-gray-800">
            Menu Andalan Kami
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Harganya transparan, porsinya bikin kenyang!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {menuSatuan.map((menu) => (
            <div
              key={menu.id}
              className="bg-white p-7 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 transform relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <h4 className="text-2xl font-bold mb-3 text-gray-900 relative z-10">
                {menu.name}
              </h4>
              <p className="text-gray-600 text-sm mb-6 h-12 leading-relaxed relative z-10">
                {menu.description}
              </p>
              <div className="text-3xl font-black text-green-600 relative z-10">
                Rp {menu.price.toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </div>

        {menuBundling.length > 0 && (
          <div className="border-t border-gray-100 pt-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuBundling.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-gradient-to-br from-orange-50 to-white p-7 rounded-3xl shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full inline-block mb-4 shadow">
                    BEST DEAL
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-gray-900">
                    {menu.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-6 h-12 leading-relaxed">
                    {menu.description}
                  </p>
                  <div className="text-3xl font-black text-orange-600">
                    Rp {menu.price.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-gray-100 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 pb-10 border-b-2 border-gray-200 flex flex-col items-center">
            <h2 className="text-4xl font-black text-gray-800 mb-4">
              Apa Kata Mereka?
            </h2>
            {testimonials.length > 0 && (
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
                <span className="text-3xl font-black text-gray-800">
                  {averageRating}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-8 h-8 ${star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 font-medium">
                  ({testimonials.length} Ulasan)
                </span>
              </div>
            )}
          </div>

          {testimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {testimonials.map((testi) => (
                <div
                  key={testi.id}
                  className="bg-white p-7 rounded-2xl shadow-md relative group hover:shadow-lg hover:border-yellow-200 border border-transparent transition-all"
                >
                  <div className="mb-4">{renderStars(testi.rating || 5)}</div>
                  <p className="text-gray-700 italic mb-6 leading-relaxed relative z-10 text-lg">
                    "{testi.content}"
                  </p>
                  <div className="flex justify-between items-center relative z-10 mt-auto pt-4 border-t border-gray-100 group-hover:border-green-100 transition-colors">
                    <div className="font-bold text-gray-900">
                      {testi.customer_name}
                    </div>
                    <div className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-bold">
                      Batch {testi.batches?.name || "Lalu"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-10 rounded-2xl shadow mb-16 text-gray-500 italic text-lg border border-gray-100">
              Belum ada testimoni. Jadilah yang pertama memberikan ulasan di
              batch ini!
            </div>
          )}

          <div className="max-w-xl mx-auto mt-20 bg-white p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-yellow-300 transform relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
            <h3 className="text-3xl font-black text-gray-800 mb-2">
              Kasih Rating Dong!
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Pilih bintangmu dan ceritakan pengalaman makan Sandwich Leaf &
              Loaf!
            </p>

            <form onSubmit={handleSubmitTestimonial} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 leading-tight">
                  Rating Bintang <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewTestiRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 transition-colors ${star <= newTestiRating ? "text-yellow-400" : "text-gray-200 hover:text-yellow-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 leading-tight">
                  Nama Kamu (Akan ditampilkan publik){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTestiName}
                  onChange={(e) => setNewTestiName(e.target.value)}
                  required
                  placeholder="Contoh: Rina Jember"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-yellow-400 focus:ring-0 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 leading-tight">
                  Isi Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTestiContent}
                  onChange={(e) => setNewTestiContent(e.target.value)}
                  required
                  placeholder="Tuliskan jujur ya..."
                  rows="4"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-yellow-400 focus:ring-0 transition"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-yellow-400 font-black py-4 rounded-xl text-lg hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-1 disabled:bg-gray-400 disabled:text-gray-200"
              >
                {isSubmitting ? "Sedang Mengirim..." : "Kirim Rating Saya! 🚀"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-green-950 text-green-100 py-12 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-black text-2xl mb-2">🍃 Leaf & Loaf</p>
          <p className="text-sm opacity-80">
            Healthy Sandwich for University Students Jember Area.
          </p>
          <div className="text-xs opacity-60 mt-8 pt-8 border-t border-green-900">
            © 2026 Leaf & Loaf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
