import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

const TypewriterText = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [isIntersecting, text, speed]);

  return <span ref={ref}>{displayedText}</span>;
};

const TypewriterJustify = ({ text, speed = 25, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    let i = 0;
    let timer;

    const timeout = setTimeout(() => {
      setIsTyping(true);
      timer = setInterval(() => {
        setDisplayedText(text.substring(0, i));
        i++;
        if (i > text.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [isIntersecting, text, speed, delay]);

  return (
    <div className="relative w-full text-justify" ref={ref}>
      <div className="opacity-0 pointer-events-none select-none w-full">
        {text}
      </div>

      <div className="absolute top-0 left-0 w-full h-full text-justify">
        {displayedText}
        <span
          className={`inline-block w-[2px] md:w-[3px] h-[0.8em] bg-[#ebeacb] ml-1 align-baseline transition-opacity duration-100 ${isTyping ? "animate-pulse" : "opacity-0"}`}
        ></span>
      </div>
    </div>
  );
};

const MenuCard = ({ menu, isBundling }) => {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      to="/checkout"
      className="flex flex-col items-center justify-center group cursor-pointer w-full text-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-64 h-64 mb-6 transition-transform duration-500 transform group-hover:scale-110 group-hover:-translate-y-6">
        {isBundling && (
          <div className="absolute -top-2 -right-2 bg-[#f4d053] text-[#2c4c44] text-xs font-black px-4 py-1 rounded-full shadow-xl z-20 rotate-12">
            BEST DEAL
          </div>
        )}

        <img
          src="/sandwich-ayam.png"
          alt={menu.name}
          className={`absolute w-full h-full object-contain drop-shadow-2xl transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
        />

        <video
          ref={videoRef}
          src="/sandwich-ayam.mp4"
          muted
          playsInline
          className={`absolute w-full h-full object-contain drop-shadow-2xl transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="transition-transform duration-500 group-hover:-translate-y-2">
        <h4 className="text-3xl font-black mb-1 text-[#2c4c44] drop-shadow-sm transition-colors duration-300 group-hover:text-[#f4d053]">
          {menu.name}
        </h4>
        <div className="text-xl font-bold text-[#e6e2d1] bg-[#2c4c44] px-4 py-1 rounded-full inline-block shadow-lg mt-2 group-hover:bg-[#f4d053] group-hover:text-[#2c4c44] transition-colors duration-300">
          Rp {menu.price.toLocaleString("id-ID")}
        </div>
      </div>
    </Link>
  );
};

const HeroSection = () => {
  return (
    <section className="sticky top-0 z-0 w-full h-screen bg-[#819757] overflow-hidden flex items-center justify-center">
      <img
        src="/vector-1-kiri-atas-layer1.png"
        alt="Decoration"
        className="absolute top-[10%] md:top-[150px] left-[-20%] md:left-[-200px] w-[250px] md:w-[550px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300"
      />

      <img
        src="/vector-2-kanan-bawah-layer1.png"
        alt="Decoration"
        className="absolute bottom-[-5%] md:bottom-[-10px] right-[-20%] md:right-[-50px] lg:right-[-50px] w-[300px] md:w-[607px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300"
      />

      <img
        src="/vector-3-kiri-bawah-layer1.png"
        alt="Decoration"
        className="absolute bottom-5 left-5 md:bottom-[-100px] md:left-[173px] w-[150px] md:w-[250px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300"
      />

      <div className="relative z-10 w-[60%] sm:w-[45%] md:w-[480px] mx-auto mt-16 md:mt-0 drop-shadow-2xl animate-fade-up flex justify-center items-center">
        <img
          src="/logo-hd.png"
          alt="Hero Leaf and Loaf"
          className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
        />
      </div>
    </section>
  );
};

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
            className={`w-5 h-5 ${star <= rating ? "text-[#f4d053]" : "text-gray-300"}`}
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
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-[#728f59] bg-[#f9f8f3]">
        Memuat Leaf & Loaf...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-gray-900 font-sans">
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent py-8 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex flex-col pointer-events-auto">
          <ul className="flex justify-center md:justify-between items-center gap-8 md:gap-16 font-bold tracking-widest text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            <li className="cursor-pointer transition">
              <a href="#" className="!text-[#ebeacb] hover:!text-white">
                HOME
              </a>
            </li>
            <li className="cursor-pointer transition">
              <a href="#products" className="!text-[#ebeacb] hover:!text-white">
                OUR PRODUCTS
              </a>
            </li>
            <li className="cursor-pointer transition">
              <a href="#contact" className="!text-[#ebeacb] hover:!text-white">
                CONTACT
              </a>
            </li>
          </ul>
          <div className="w-full h-[2px] bg-[#ebeacb] rounded-full opacity-80 shadow-sm"></div>
        </div>
      </nav>

      <HeroSection />

      <div className="relative z-10 bg-[#f9f8f3]">
        <section
          id="history"
          className="relative w-full min-h-screen overflow-x-hidden pt-28 md:pt-40 pb-40 md:pb-64 bg-[#092317]"
        >
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="hidden md:block">
              <div className="w-full flex justify-center mb-24">
                <img
                  src="/group-1-tengah-atas-layer2.png"
                  alt="Title Ornamen"
                  className="w-[80%] max-w-[800px] h-auto object-contain drop-shadow-2xl"
                />
              </div>

              <div className="flex flex-row justify-between items-start w-full gap-16">
                <div className="w-1/2 font-medium text-lg lg:text-xl leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="Leaf & Loaf was born out of a simple need: finding healthy, quick, and satisfying meals during busy university days. We realized that most fast-food options lacked nutrition, while healthy food was often too expensive or hard to find."
                    speed={25}
                    delay={200}
                  />
                </div>

                <div className="w-1/2 font-medium text-lg lg:text-xl leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="So, we started creating our own wholesome sandwiches, packed with fresh vegetables and flavorful fillings. What started as a personal quest soon became a mission to provide our fellow students with accessible, nutritious, and delicious meals that keep them energized throughout the day."
                    speed={25}
                    delay={2500}
                  />
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              <div className="w-full flex justify-center mb-10">
                <img
                  src="/group-1-tengah-atas-layer2.png"
                  alt="Title Ornamen"
                  className="w-[110%] max-w-none h-auto object-contain drop-shadow-2xl translate-y-6 -mt-12"
                />
              </div>

              <div className="flex flex-col w-full gap-8">
                <div className="w-full font-medium text-base leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="Leaf & Loaf was born out of a simple need: finding healthy, quick, and satisfying meals during busy university days. We realized that most fast-food options lacked nutrition, while healthy food was often too expensive or hard to find."
                    speed={25}
                    delay={200}
                  />
                </div>

                <div className="w-full font-medium text-base leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="So, we started creating our own wholesome sandwiches, packed with fresh vegetables and flavorful fillings. What started as a personal quest soon became a mission to provide our fellow students with accessible, nutritious, and delicious meals that keep them energized throughout the day."
                    speed={25}
                    delay={2500}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
            <div
              className="w-full"
              style={{
                animation: "sailX 35s ease-in-out infinite alternate",
                willChange: "transform",
              }}
            >
              <img
                src="/group-2-tengah-bawah-layer2.png"
                alt="Ornamen Ombak Desktop"
                className="w-[210%] h-auto object-contain opacity-80 origin-bottom translate-x-1 scale-130"
                style={{
                  animation: "bobY 4s ease-in-out infinite alternate",
                  willChange: "transform",
                }}
              />
            </div>
          </div>

          <div className="block md:hidden absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
            <div
              className="w-full"
              style={{
                animation: "sailX 35s ease-in-out infinite alternate",
                willChange: "transform",
              }}
            >
              <img
                src="/group-2-tengah-bawah-layer2.png"
                alt="Ornamen Ombak Mobile"
                className="w-[180%] max-w-none h-auto object-contain opacity-80 origin-bottom -translate-x-75 -translate-y-4 scale-115"
                style={{
                  animation: "bobY 4s ease-in-out infinite alternate",
                  willChange: "transform",
                }}
              />
            </div>
          </div>

          <style>
            {`
              @keyframes sailX {
                0% { transform: translateX(-8%); }
                100% { transform: translateX(4%); }
              }
              @keyframes bobY {
                0% { transform: translateY(25px); } 
                100% { transform: translateY(20px); }
              }
            `}
          </style>
        </section>

        <section id="products" className="py-24 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-24 border-b-2 border-[#e6e2d1] pb-10 mt-10">
            <h2 className="text-5xl font-black text-[#2c4c44]">Our Products</h2>
            <p className="text-[#728f59] mt-3 text-lg font-medium">
              Pilih sandwich sehatmu, klik untuk memesan!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-8 mb-16">
            {menuSatuan.map((menu) => (
              <MenuCard key={menu.id} menu={menu} isBundling={false} />
            ))}
          </div>

          {menuBundling.length > 0 && (
            <div className="border-t border-[#e6e2d1] pt-24 mt-16">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-8">
                {menuBundling.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} isBundling={true} />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-[#e6e2d1]/30 py-24 px-4 border-t border-[#e6e2d1]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 pb-10 border-b-2 border-[#e6e2d1] flex flex-col items-center">
              <h2 className="text-4xl font-black text-[#2c4c44] mb-4">
                Apa Kata Mereka?
              </h2>
              {testimonials.length > 0 && (
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-[#e6e2d1]">
                  <span className="text-3xl font-black text-[#2c4c44]">
                    {averageRating}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-8 h-8 ${star <= Math.round(averageRating) ? "text-[#f4d053]" : "text-gray-300"}`}
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
                    className="bg-white p-7 rounded-3xl shadow-sm relative group hover:shadow-xl hover:border-[#f4d053] border border-[#e6e2d1] transition-all"
                  >
                    <div className="mb-4">{renderStars(testi.rating || 5)}</div>
                    <p className="text-gray-700 italic mb-6 leading-relaxed relative z-10 text-lg">
                      "{testi.content}"
                    </p>
                    <div className="flex justify-between items-center relative z-10 mt-auto pt-4 border-t border-gray-100 group-hover:border-[#e6e2d1] transition-colors">
                      <div className="font-bold text-[#2c4c44]">
                        {testi.customer_name}
                      </div>
                      <div className="text-xs text-[#728f59] bg-[#728f59]/10 px-3 py-1 rounded-full font-bold">
                        Batch {testi.batches?.name || "Lalu"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-10 rounded-3xl shadow-sm mb-16 text-gray-500 italic text-lg border border-[#e6e2d1]">
                Belum ada testimoni.
              </div>
            )}

            <div className="max-w-xl mx-auto mt-20 bg-white p-8 md:p-10 rounded-3xl shadow-xl border-2 border-[#f4d053] transform relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-[#f4d053]"></div>
              <h3 className="text-3xl font-black text-[#2c4c44] mb-2">
                Kasih Rating Dong!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Pilih bintangmu dan ceritakan pengalaman makan Sandwich Leaf &
                Loaf!
              </p>
              <form onSubmit={handleSubmitTestimonial} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#2c4c44] mb-2 leading-tight">
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
                          className={`w-10 h-10 transition-colors ${star <= newTestiRating ? "text-[#f4d053]" : "text-gray-200 hover:text-[#f4d053]/50"}`}
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
                  <label className="block text-sm font-bold text-[#2c4c44] mb-1 leading-tight">
                    Nama Kamu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTestiName}
                    onChange={(e) => setNewTestiName(e.target.value)}
                    required
                    placeholder="Contoh: Rina Jember"
                    className="w-full border-2 border-[#e6e2d1] p-3 rounded-xl focus:border-[#f4d053] focus:ring-0 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2c4c44] mb-1 leading-tight">
                    Isi Testimoni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newTestiContent}
                    onChange={(e) => setNewTestiContent(e.target.value)}
                    required
                    placeholder="Tuliskan jujur ya..."
                    rows="4"
                    className="w-full border-2 border-[#e6e2d1] p-3 rounded-xl focus:border-[#f4d053] focus:ring-0 transition outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2c4c44] text-[#e6e2d1] font-black py-4 rounded-xl text-lg hover:bg-[#1f3630] transition shadow-lg transform hover:-translate-y-1 disabled:bg-gray-400 disabled:text-gray-200"
                >
                  {isSubmitting
                    ? "Sedang Mengirim..."
                    : "Kirim Rating Saya! 🚀"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer
          id="contact"
          className="bg-[#2c4c44] text-[#e6e2d1] py-12 text-center"
        >
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-black text-2xl mb-2">🍃 Leaf & Loaf</p>
            <p className="text-sm opacity-80">
              Healthy Sandwich for University Students Jember Area.
            </p>
            <div className="text-xs opacity-60 mt-8 pt-8 border-t border-[#728f59]">
              © 2026 Leaf & Loaf. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
