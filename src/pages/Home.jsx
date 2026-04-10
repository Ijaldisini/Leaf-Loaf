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

  const renderStars = (rating, size = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} transition-colors duration-200`}
            style={{ color: star <= rating ? "#fbbf24" : "rgba(134,239,172,0.2)" }}
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        background: 'var(--bg-body)',
      }}>
        <div style={{ fontSize: '60px', animation: 'float 3s ease-in-out infinite' }}>🍃</div>
        <div className="spinner" />
        <p style={{ color: 'var(--leaf-400)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px' }}>
          Memuat Leaf & Loaf...
        </p>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* ===== NAVBAR ===== */}
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
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '24px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '28px', filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }}>🍃</span>
            <span className="text-gradient">Leaf & Loaf</span>
          </div>
          <Link to="/checkout" className="btn-3d" style={{ padding: '10px 24px', fontSize: '14px' }}>
            Pesan Sekarang
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px 120px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(7,26,15,0) 0%, rgba(15,51,33,0.3) 50%, rgba(7,26,15,0) 100%)',
      }}>
        {/* Floating leaf decorations */}
        <div className="leaf-deco" style={{ top: '10%', left: '8%', fontSize: '100px', animationDelay: '0s' }}>🥬</div>
        <div className="leaf-deco" style={{ top: '20%', right: '10%', fontSize: '70px', animationDelay: '-3s' }}>🌿</div>
        <div className="leaf-deco" style={{ bottom: '15%', left: '15%', fontSize: '60px', animationDelay: '-5s' }}>🍃</div>
        <div className="leaf-deco" style={{ bottom: '25%', right: '5%', fontSize: '90px', animationDelay: '-7s' }}>🥦</div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}
          className="animate-in"
        >
          <div className="badge badge-green" style={{ marginBottom: '24px', fontSize: '13px' }}>
            <span className="pulse-dot" />
            Fresh & Healthy
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-1.5px',
          }}>
            <span className="text-gradient">Healthy Sandwich,</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Praktis & Mengenyangkan!</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
            opacity: 0.85,
          }}>
            Solusi makan sehat di tengah padatnya aktivitas kampus Jember.
            Dibuat fresh setiap batch dengan isian melimpah. Tinggal pesan, kami
            antar langsung ke depan kos-mu!
          </p>
          <Link
            to="/checkout"
            className="btn-3d"
            style={{ padding: '18px 44px', fontSize: '18px', borderRadius: '20px' }}
          >
            Ikut PO Batch Ini 🚀
          </Link>
        </div>
      </section>

      {/* ===== MENU SECTION ===== */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            marginBottom: '12px',
          }}>
            <span className="text-gradient">Menu Andalan Kami</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Harganya transparan, porsinya bikin kenyang!
          </p>
          <div className="divider" style={{ maxWidth: '120px', margin: '24px auto 0' }} />
        </div>

        {/* Satuan Menu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: menuBundling.length > 0 ? '60px' : '0',
        }}>
          {menuSatuan.map((menu, idx) => (
            <div
              key={menu.id}
              className="glass-card card-3d animate-in"
              style={{
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <div className="card-3d-inner">
                {/* Corner glow */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 700,
                  marginBottom: '10px',
                  color: 'var(--text-primary)',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {menu.name}
                </h4>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  marginBottom: '24px',
                  lineHeight: 1.6,
                  minHeight: '44px',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {menu.description}
                </p>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 800,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <span className="text-gradient">Rp {menu.price.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bundling Menu */}
        {menuBundling.length > 0 && (
          <>
            <div className="divider" style={{ margin: '0 0 60px' }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              {menuBundling.map((menu, idx) => (
                <div
                  key={menu.id}
                  className="glass-card card-3d animate-in"
                  style={{
                    padding: '32px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderColor: 'rgba(251, 191, 36, 0.2)',
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div className="card-3d-inner">
                    {/* Gold corner glow */}
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      right: '-30px',
                      width: '120px',
                      height: '120px',
                      background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }} />
                    <div className="badge badge-gold" style={{ marginBottom: '16px' }}>
                      ⭐ BEST DEAL
                    </div>
                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '22px',
                      fontWeight: 700,
                      marginBottom: '10px',
                      color: 'var(--text-primary)',
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      {menu.name}
                    </h4>
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.6,
                      minHeight: '44px',
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      {menu.description}
                    </p>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '28px',
                      fontWeight: 800,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <span className="text-gradient-gold">Rp {menu.price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, rgba(15,51,33,0.2) 0%, rgba(7,26,15,0) 100%)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="animate-in" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              marginBottom: '16px',
            }}>
              <span className="text-gradient">Apa Kata Mereka?</span>
            </h2>

            {testimonials.length > 0 && (
              <div className="glass" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 28px',
                borderRadius: '100px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}>
                  {averageRating}
                </span>
                {renderStars(Math.round(averageRating), "w-7 h-7")}
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  ({testimonials.length} Ulasan)
                </span>
              </div>
            )}
            <div className="divider" style={{ maxWidth: '120px', margin: '24px auto 0' }} />
          </div>

          {testimonials.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '60px',
            }}>
              {testimonials.map((testi, idx) => (
                <div
                  key={testi.id}
                  className="glass-card animate-in"
                  style={{
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>{renderStars(testi.rating || 5)}</div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '16px',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    marginBottom: '20px',
                    flex: 1,
                    opacity: 0.9,
                  }}>
                    "{testi.content}"
                  </p>
                  <div className="divider" style={{ marginBottom: '16px' }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                    }}>
                      {testi.customer_name}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '11px' }}>
                      Batch {testi.batches?.name || "Lalu"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card animate-in" style={{
              textAlign: 'center',
              padding: '48px',
              marginBottom: '60px',
              color: 'var(--text-muted)',
              fontSize: '16px',
              fontStyle: 'italic',
            }}>
              Belum ada testimoni. Jadilah yang pertama memberikan ulasan di
              batch ini!
            </div>
          )}

          {/* Testimonial Form */}
          <div className="glass-card animate-in" style={{
            maxWidth: '580px',
            margin: '0 auto',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            borderColor: 'rgba(251, 191, 36, 0.2)',
          }}>
            {/* Gold top accent bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--gold-400), var(--gold-500), var(--gold-400))',
              borderRadius: '24px 24px 0 0',
            }} />

            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '26px',
              fontWeight: 800,
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}>
              Kasih Rating Dong! ⭐
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
              Pilih bintangmu dan ceritakan pengalaman makan Sandwich Leaf & Loaf!
            </p>

            <form onSubmit={handleSubmitTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Star rating */}
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
                  Rating Bintang <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewTestiRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.2s var(--ease-spring)',
                        transform: star <= newTestiRating ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      <svg
                        style={{
                          width: '40px',
                          height: '40px',
                          color: star <= newTestiRating ? '#fbbf24' : 'rgba(134,239,172,0.15)',
                          transition: 'color 0.2s, filter 0.2s',
                          filter: star <= newTestiRating ? 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' : 'none',
                        }}
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
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Nama Kamu <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newTestiName}
                  onChange={(e) => setNewTestiName(e.target.value)}
                  required
                  placeholder="Contoh: Rina Jember"
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
                  Isi Testimoni <span style={{ color: 'var(--tomato)' }}>*</span>
                </label>
                <textarea
                  value={newTestiContent}
                  onChange={(e) => setNewTestiContent(e.target.value)}
                  required
                  placeholder="Tuliskan jujur ya..."
                  rows="4"
                  className="input-glass"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d-gold btn-3d"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? "Sedang Mengirim..." : "Kirim Rating Saya! 🚀"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: '60px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(7,26,15,0) 0%, rgba(5,46,22,0.5) 100%)',
        borderTop: '1px solid var(--border-glass)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '24px',
            fontWeight: 800,
            marginBottom: '8px',
          }}>
            <span style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }}>🍃</span>{' '}
            <span className="text-gradient">Leaf & Loaf</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Healthy Sandwich for University Students Jember Area.
          </p>
          <div style={{
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            opacity: 0.6,
          }}>
            © 2026 Leaf & Loaf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
