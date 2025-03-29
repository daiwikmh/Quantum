"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[200px] pt-[200px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black ">
              Your Crypto Agent Companion <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Quantum Finance
              </span>
            </h1>
          </>
        }
      >
        <img
          src="https://ui.aceternity.com/_next/image?url=%2Flinear.webp&w=3840&q=75"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
