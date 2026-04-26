import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import SplashCursor from "./SplashCursor";

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

const TiltCardLink = ({ to, className, src, alt }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = ((y - height / 2) / (height / 2)) * -8;
    const rotateY = ((x - width / 2) / (width / 2)) * 8;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.1s ease-out",
      zIndex: 50,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform:
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
      zIndex: 10,
    });
  };

  return (
    <Link
      to={to}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className={`${className} rounded-3xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/40`}
    >
      <img
        className="w-full h-full object-contain drop-shadow-xl"
        alt={alt}
        src={src}
      />
    </Link>
  );
};

const HeroSection = () => {
  return (
    <section className="sticky top-0 z-0 w-full h-screen bg-gradient-to-b from-[#3D71B6] to-[#8CDCF0] overflow-hidden flex items-center justify-center">
      <SplashCursor
        RAINBOW_MODE={false}
        COLOR="#EBCBE5"
        SPLAT_RADIUS={0.5}
        SPLAT_FORCE={6000}
        DENSITY_DISSIPATION={2.0}
        VELOCITY_DISSIPATION={1.5}
      />

      <img
        src="/image-bunga-kuningkecoklatan.png"
        alt="Decoration"
        className="absolute top-[10%] md:top-[70px] left-[-20%] md:left-[-100px] w-[250px] md:w-[400px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300 z-10"
      />

      <img
        src="/image-bunga-pinktua.png"
        alt="Decoration"
        className="absolute bottom-[-5%] md:bottom-[520px] right-[-20%] md:right-[-50px] lg:right-[-50px] w-[300px] md:w-[250px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300 z-10"
      />

      <img
        src="/image-bunga-pinktua2.png"
        alt="Decoration"
        className="absolute bottom-5 left-5 md:bottom-[-80px] md:left-[1073px] w-[150px] md:w-[250px] h-auto pointer-events-none opacity-50 md:opacity-100 transition-all duration-300 z-10"
      />

      <div className="relative z-20 w-[60%] sm:w-[45%] md:w-[480px] mx-auto mt-16 md:mt-0 drop-shadow-2xl animate-fade-up flex justify-center items-center pointer-events-none">
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
      .maybeSingle();

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
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-[#728f59] bg-[#2db8e4]">
        <img
          src="logo-hd.png"
          alt="Leaf n Loaff"
          className="max-w-[200px] h-auto"
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f9f8f3] text-gray-900 font-sans">
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

      <HeroSection />

      <div className="relative z-10 bg-[#f9f8f3]">
        <section
          id="history"
          className="relative w-full min-h-screen overflow-x-hidden pt-28 md:pt-40 pb-40 md:pb-64 bg-[url('/background-pasir.png')] bg-[length:auto] bg-center bg-no-repeat"
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
                    text="Leaf n Loaff was born from a very real struggle: Kita sering susah nemuin makanan yang healthy, cepat, tapi tetap enak di tengah hectic-nya kehidupan kampus. Karena kebanyakan fast food mengandung nutrisi yang sedikit, sementara makanan sehat sering kali terasa pricey atau susah dicari. Dari situlah kami perkenalkan Leaf n Loaff sebagai sandwich yang praktis dengan isian fresh veggies, flavorful fillings."
                    speed={25}
                    delay={200}
                  />
                </div>

                <div className="w-1/2 font-medium text-lg lg:text-xl leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="What started as a simple need slowly turned into something bigger. Leaf n Loaff hadir untuk memberi kamu pilihan makanan yang lebih sehat, lebih simple, dan tetap satisfying tanpa harus ribet atau overbudget. Because eating better shouldn’t be complicated, it should fit your pace, your lifestyle, and your everyday moments."
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
                    text="Leaf n Loaff was born from a very real struggle: Kita sering susah nemuin makanan yang healthy, cepat, tapi tetap enak di tengah hectic-nya kehidupan kampus. Karena kebanyakan fast food mengandung nutrisi yang sedikit, sementara makanan sehat sering kali terasa pricey atau susah dicari. Dari situlah kami perkenalkan Leaf n Loaff sebagai sandwich yang praktis dengan isian fresh veggies, flavorful fillings."
                    speed={25}
                    delay={200}
                  />
                </div>

                <div className="w-full font-medium text-base leading-relaxed tracking-wide text-[#FFFFFF] drop-shadow-md">
                  <TypewriterJustify
                    text="What started as a simple need slowly turned into something bigger. Leaf n Loaff hadir untuk memberi kamu pilihan makanan yang lebih sehat, lebih simple, dan tetap satisfying tanpa harus ribet atau overbudget. Because eating better shouldn’t be complicated, it should fit your pace, your lifestyle, and your everyday moments."
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
                className="w-[220%] h-auto object-contain opacity-80 origin-bottom translate-x-1 translate-y-0.5 scale-135"
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
                className="w-[190%] max-w-none h-auto object-contain opacity-80 origin-bottom -translate-x-75 -translate-y-4 scale-130"
                style={{
                  animation: "bobY 4s ease-in-out infinite alternate",
                  willChange: "transform",
                }}
              />
            </div>
          </div>

          <img
            src="/image-batu-kecil.png"
            alt="Batu kecil"
            className="absolute bottom-24 left-12 md:left-24 w-12 md:w-[120px] h-auto z-[2] pointer-events-none"
          />

          <img
            src="/image-bintang-laut.png"
            alt="Bintang laut"
            className="absolute bottom-28 right-10 md:right-28 w-10 md:w-[184px] h-auto z-[2] pointer-events-none rotate-12"
          />

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

        <section
          id="products"
          className="bg-[#2db8e4] w-full min-h-screen relative overflow-hidden flex items-center justify-center py-24"
        >
          <img
            className="absolute bottom-[20px] right-[-50px] md:bottom-[-1px] md:right-[-50px] w-[200px] md:w-[447px] h-auto pointer-events-none z-0"
            alt="Decoration Right"
            src="/image-bunga-kuningkecoklatan.png"
          />

          <img
            className="absolute top-[20px] left-[-30px] md:top-[150px] md:left-[-100px] w-[150px] md:w-[415px] h-auto pointer-events-none z-0"
            alt="Decoration Top Left"
            src="/image-bunga-pinktua.png"
          />

          <img
            className="absolute bottom-[10px] left-[-20px] md:bottom-[10px] md:left-100 w-[120px] md:w-[258px] h-auto pointer-events-none z-0"
            alt="Decoration Bottom Left"
            src="/image-bunga-pinktua2.png"
          />

          <img
            className="absolute bottom-[1010px] left-[10px] md:bottom-[650px] md:left-100 w-[50px] md:w-[70px] h-auto pointer-events-none z-0 opacity-70"
            alt="bubble atas"
            src="/image-gelembung-putih.png"
          />

          <img
            className="absolute bottom-[900px] left-[330px] md:bottom-[500px] md:left-350 w-[50px] md:w-[70px] h-auto pointer-events-none z-0 opacity-70"
            alt="bubble atas"
            src="/image-gelembung-putih.png"
          />

          <img
            className="absolute bottom-[450px] left-[305px] md:bottom-[350px] md:left-140 w-[50px] md:w-[70px] h-auto pointer-events-none z-0 opacity-70"
            alt="bubble atas"
            src="/image-gelembung-putih.png"
          />

          <img
            className="absolute bottom-[150px] left-[-18px] md:bottom-[150px] md:left-240 w-[50px] md:w-[70px] h-auto pointer-events-none z-0 opacity-70"
            alt="bubble atas"
            src="/image-gelembung-putih.png"
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col xl:flex-row items-center justify-center gap-12 lg:gap-16">
            <TiltCardLink
              to="/checkout"
              className="w-[280px] sm:w-[300px] h-[380px] sm:h-[400px] z-10 cursor-pointer"
              src="/menu-1-ayam-teriyaki.png"
              alt="Card 1"
            />

            <TiltCardLink
              to="/checkout"
              className="w-[280px] sm:w-[300px] h-[380px] sm:h-[400px] z-10 cursor-pointer"
              src="/menu-2-telur-mayo.png"
              alt="Card 2"
            />

            <TiltCardLink
              to="/checkout"
              className="w-[280px] sm:w-[300px] h-[380px] sm:h-[400px] z-10 cursor-pointer"
              src="/menu-3-bundling.png"
              alt="Card 3"
            />
          </div>
        </section>

        <section
          id="testimoni"
          className="relative w-full min-h-screen bg-[#2db8e4] py-16 md:py-24 overflow-hidden flex items-center"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0"
            alt="Underwater background"
            src="/image-ladang.png"
          />

          <img
            className="absolute bottom-0 left-0 w-full h-[30%] md:h-[40%] object-cover object-top select-none pointer-events-none z-0"
            alt="Sand bottom"
            src="/image-gradasi-to-footer.png"
          />

          <img
            className="absolute w-[20%] md:w-[8%] min-w-[60px] h-auto top-[48%] md:top-[45%] right-[1%] select-none pointer-events-none z-10 opacity-90 md:opacity-100"
            alt="Decoration Top Right"
            src="/image-ubur-ubur.png"
          />
          <img
            className="absolute w-[25%] md:w-[14%] min-w-[100px] h-auto bottom-0 right-[-5%] md:right-[5%] select-none pointer-events-none z-10 opacity-60 md:opacity-100"
            alt="Decoration Bottom Right"
            src="/image-group-gelembung.png"
          />
          <img
            className="hidden md:block absolute w-[10%] min-w-[150px] h-auto bottom-[170px] right-[45%] select-none pointer-events-none z-10"
            alt="Decoration Bottom Center"
            src="/image-group-gelembung.png"
          />
          <img
            className="absolute w-[25%] md:w-[18%] min-w-[100px] md:min-w-[150px] h-auto bottom-[50px] md:bottom-[280px] left-[-5%] md:left-[-2%] select-none pointer-events-none z-10 opacity-60 md:opacity-100"
            alt="Decoration Bottom Left"
            src="/image-group-gelembung.png"
          />

          <div className="max-w-7xl mx-auto px-4 relative z-20 flex flex-col lg:flex-row gap-12 lg:gap-16 w-full">
            <div className="lg:w-1/2 flex flex-col pt-4 md:pt-0">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-4">
                  Apa Kata Mereka?
                </h2>

                {testimonials.length > 0 && (
                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/30">
                    <span className="text-2xl md:text-3xl font-black text-white drop-shadow-md">
                      {averageRating}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 md:w-8 md:h-8 drop-shadow-md ${star <= Math.round(averageRating) ? "text-[#f4d053]" : "text-gray-300/50"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-white font-medium text-sm md:text-base drop-shadow-md">
                      ({testimonials.length} Ulasan)
                    </span>
                  </div>
                )}
              </div>

              <div className="relative flex-1 min-h-[350px] md:min-h-[400px] max-h-[400px] md:max-h-[500px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/30 backdrop-blur-md p-4 shadow-2xl flex flex-col">
                {testimonials.length > 0 ? (
                  <div className="flex-1 overflow-y-auto touch-pan-y overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <div className="flex flex-col gap-4 pb-2">
                      {testimonials.map((testi) => (
                        <div
                          key={testi.id}
                          className="bg-white/20 backdrop-blur-md p-5 md:p-6 rounded-2xl shadow-lg border border-white/20 shrink-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2 sm:gap-0">
                            <div>
                              <div className="font-bold text-[#2db8e4] text-base md:text-lg">
                                {testi.customer_name}
                              </div>
                              <div className="text-[10px] md:text-xs text-[#2db8e4]/80 bg-[#2db8e4]/10 px-3 py-1 rounded-full font-bold w-max mt-1">
                                Batch {testi.batches?.name || "Lalu"}
                              </div>
                            </div>
                            <div className="flex">
                              {renderStars(testi.rating || 5)}
                            </div>
                          </div>

                          <p className="text-gray-700 italic mt-2 md:mt-3 text-sm md:text-base leading-relaxed">
                            "{testi.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-white/80 italic font-medium text-lg">
                    Belum ada testimoni.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/2 flex items-center justify-center mt-8 lg:mt-0 z-20 pb-10 md:pb-0">
              <div className="bg-black/35 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-white/20 relative overflow-hidden">
                <h3 className="text-2xl md:text-3xl font-black text-[#2db8e4] mb-2 mt-2">
                  Kasih Rating Dong!
                </h3>
                <p className="text-white mb-6 md:mb-8 text-sm md:text-lg">
                  Pilih bintangmu dan ceritakan pengalaman makan Sandwich Leaf n
                  Loaff!
                </p>

                <form
                  onSubmit={handleSubmitTestimonial}
                  className="space-y-4 md:space-y-6"
                >
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-[#2db8e4] mb-2 leading-tight">
                      Rating Bintang <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1 md:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewTestiRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${star <= newTestiRating ? "text-[#f4d053] drop-shadow-md" : "text-gray-300 hover:text-[#f4d053]/50"}`}
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
                    <label className="block text-xs md:text-sm font-bold text-[#2db8e4] mb-1 leading-tight">
                      Nama Kamu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTestiName}
                      onChange={(e) => setNewTestiName(e.target.value)}
                      required
                      placeholder="Contoh: Radit Ganteng"
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#2db8e4] focus:ring-0 transition outline-none bg-white text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-bold text-[#2db8e4] mb-1 leading-tight">
                      Isi Testimoni <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newTestiContent}
                      onChange={(e) => setNewTestiContent(e.target.value)}
                      required
                      placeholder="BUHHHH MANTAP EUYYYY"
                      rows="3"
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#2db8e4] focus:ring-0 transition outline-none bg-white text-sm md:text-base"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2db8e4] text-white font-black py-3 md:py-4 rounded-xl text-base md:text-lg hover:bg-[#1a9ac2] transition shadow-lg transform hover:-translate-y-1 disabled:bg-gray-400 disabled:text-gray-200"
                  >
                    {isSubmitting ? "Sedang Mengirim..." : "Kirim Rating!"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer
          id="footer"
          className="bg-black text-[#f1a0aa] py-12 text-center"
        >
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-black text-2xl mb-2">Leaf n Loaff</p>
            <p className="text-sm opacity-80">
              Sandwich Sehat Berasal dari Universitas jember.
            </p>
            <div className="text-xs opacity-60 mt-8 pt-8 border-t border-[#f1a0aa]">
              © 2026 Leaf n Loaff. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
