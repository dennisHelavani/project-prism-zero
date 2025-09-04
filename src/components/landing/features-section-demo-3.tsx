import React from "react";
import {
  Vortex,
} from "@/components/ui/vortex";
import { SectionWrapper } from "./section-wrapper";

export function FeaturesSectionDemo3() {
  return (
    <SectionWrapper>
      <div className="w-full mx-auto rounded-md  h-auto overflow-hidden">
        <Vortex
          backgroundColor="black"
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        >
          <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
            The hell is this?
          </h2>
          <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
            This is vortex, a component that uses three.js to render a shader based on
            curl noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
              Order now
            </button>
            <button className="px-4 py-2  text-white ">Watch trailer</button>
          </div>
        </Vortex>
      </div>
    </SectionWrapper>
  );
}
