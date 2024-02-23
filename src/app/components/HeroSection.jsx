import React from "react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-7 place-self-center">
          <h1 className="text-white mb-4 text-4xl lg:text-6xl font-extrabold">
            Hello, I'm Uğurcan
          </h1>
          <p className="text-[#ADB7BE] text-lg mb-6 lg:text-xl">
            The digital craftsman who’s been turning coffee into code and dreams
            into pixel-perfect realities. With a heart that beats in HTML, CSS,
            JavaScript and Dart, and a mind that dreams in React and Flutter, I
            create web and mobile experiences that are not just seen but felt.
            Whether it’s animating the unanimate or architecting a digital
            masterpiece, I bring a blend of creativity, humor, and technical
            excellence to the table.
          </p>
          <div>
            <button className="px-6 py-3 rounded-full mr-4 bg-white hover:bg-slate-200 text-black">Let's Talk</button>
          </div>
        </div>
        <div className="col-span-5 place-self-center mt-4 lg:mt-0">
          <div className="rounded-full bg-[#121212] w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] relative">
            <Image
              src="/images/hero-image.png"
              alt="hero image"
              className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 right-1/2"
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
