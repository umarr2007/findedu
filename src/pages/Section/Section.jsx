import React from "react";

const Section = () => {
  return (
    <div className="relative w-full h-[600px] mt-[20px] bg-cover bg-center" style={{ backgroundImage: "url('/chair.jpg')" }}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="container relative z-10 flex justify-center items-center max-w-[1140px] mx-auto px-4 h-full">
        <div className="text-center">
          <h1 className="text-[55px] text-[#410791] font-[600] leading-[1.2] mb-6">
            Bir qidiruv - cheksiz imkoniyatlar
          </h1>
          <p className="text-[18px] text-white font-[500] leading-[1.6] max-w-[800px] mx-auto">
            {`Biz talabalarga dunyo bo'ylab eng yaxshi kurslar, markazlar va ta'lim
            imkoniyatlarini topishda yordam beramiz. Mutaxassislarning
            tavsiyalari va talabalarning haqiqiy sharhlari bilan ta'lim
            safaringizni osonlashtiramiz.`}
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default Section;
