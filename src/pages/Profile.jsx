import React, { useRef, useState } from "react";

const TiltProfileCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -6;
    const rotateY = ((x - width / 2) / (width / 2)) * 6;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
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
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={`relative w-[300px] md:w-[360px] aspect-[16/9] rounded-[18px] transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/50 ${className}`}
    >
      {children}
    </div>
  );
};

const profileCards = [
  {
    id: "natasya",
    type: "image",
    imageSrc: "/id-card-natasya.png",
    imageAlt: "Kartu profil Natasya",
  },
  {
    id: "habibah",
    type: "image",
    imageSrc: "/id-card-habibah.png",
    imageAlt: "Kartu profil Habibah",
  },
  {
    id: "daffa",
    type: "image",
    imageSrc: "/id-card-daffa.png",
    imageAlt: "Kartu profil Daffa",
  },
  {
    id: "raditya",
    type: "image",
    imageSrc: "/id-card-radit.png",
    imageAlt: "Kartu profil Raditya",
  },
];

const Profile = () => {
  return (
    <>
      <main className="w-full min-h-screen bg-[linear-gradient(180deg,rgba(45,184,228,1)_0%,rgba(61,113,182,1)_100%)] relative overflow-hidden font-sans">
        <nav className="fixed top-0 left-0 w-full z-50 bg-transparent py-8 pointer-events-none">
          <div className="max-w-5xl mx-auto px-6 flex flex-col pointer-events-auto">
            <ul className="flex justify-center md:justify-between items-center gap-8 md:gap-16 font-bold tracking-widest text-sm mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              <li className="cursor-pointer transition">
                <a href="/" className="!text-[#ebeacb] hover:!text-white">
                  BERANDA
                </a>
              </li>
              <li className="cursor-pointer transition">
                <a
                  href="/checkout"
                  className="!text-[#ebeacb] hover:!text-white"
                >
                  PESAN
                </a>
              </li>
              <li className="cursor-pointer transition">
                <a
                  href="/profile"
                  className="!text-[#ebeacb] hover:!text-white"
                >
                  PROFIL
                </a>
              </li>
            </ul>
            <div className="w-full h-[2px] bg-[#ebeacb] rounded-full opacity-80 shadow-sm"></div>
          </div>
        </nav>

        <img
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[90px] md:w-[120px] opacity-70 pointer-events-none z-20"
          alt="Ornament Top"
          src="/image-bunga-pinktua.png"
        />
        <img
          className="absolute bottom-[25px] right-[45px] w-[40px] md:w-[280px] scale-125 md:scale-45 object-contain pointer-events-none z-10"
          alt="Ornament Bottom Right"
          src="/image-batu-rumput.png"
        />
        <img
          className="absolute left-8 bottom-[50px] md:bottom-80 w-[45px] md:w-[110px] object-contain pointer-events-none z-1"
          alt="Left Seaweed"
          src="/image-rumput-laut.png"
        />
        <img
          className="absolute bottom-[-270px] md:bottom-[-190px] left-0 w-full h-full scale-260 md:scale-108 object-contain pointer-events-none z-0"
          alt="Underwater Path"
          src="/image-pasir-jalan.png"
        />
        <img
          className="absolute bottom-[0px] md:bottom-[0px] left-[0px] w-full h-[50%] md:h-[130%] object-cover pointer-events-none z-10"
          alt="Sand Base"
          src="/image-bikini-bottom.png"
        />
        <img
          className="absolute bottom-0 left-0 w-full h-[30%] md:h-[40%] object-cover object-top select-none pointer-events-none z-10"
          alt="Sand bottom"
          src="/image-gradasi-to-footer-profil.png"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 pt-32 pb-24 md:pt-40 flex flex-col items-center justify-center min-h-screen">
          <div className="relative w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 place-items-center lg:hidden">
              {profileCards.map((card) => (
                <div
                  key={card.id}
                  className="scale-75 sm:scale-90 origin-center -mt-8 sm:-mt-4"
                >
                  <ProfileCardRenderer card={card} />
                </div>
              ))}
            </div>

            <div className="hidden lg:block relative w-full h-[580px]">
              <div className="absolute top-[10px] left-[90px] rotate-[-2deg] transform-gpu">
                <ProfileCardRenderer card={profileCards[0]} />
              </div>

              <div className="absolute top-[10px] right-[90px] rotate-[2deg] transform-gpu">
                <ProfileCardRenderer card={profileCards[1]} />
              </div>

              <div className="absolute bottom-[110px] left-[90px] rotate-[1deg] transform-gpu">
                <ProfileCardRenderer card={profileCards[2]} />
              </div>

              <div className="absolute bottom-[110px] right-[90px] rotate-[-1deg] transform-gpu">
                <ProfileCardRenderer card={profileCards[3]} />
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute top-[55%] left-[50%] translate-x-[-50%] translate-y-[-50%] pointer-events-none z-30">
            <img
              src="/image-batu-rumput-laut.png"
              alt="Center Ornament"
              className="w-[63px] opacity-80"
            />
          </div>
        </div>
      </main>

      <footer
        id="footer"
        className="bg-[#2d2864] text-[#f1a0aa] py-12 text-center"
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
    </>
  );
};

const ProfileCardRenderer = ({ card }) => {
  if (card.type === "image") {
    return (
      <TiltProfileCard className="shadow-lg">
        <img
          className="w-full h-full object-fill"
          alt={card.imageAlt}
          src={card.imageSrc}
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        />
      </TiltProfileCard>
    );
  }
};

export default Profile;
