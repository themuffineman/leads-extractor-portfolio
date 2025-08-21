import { Pause, Rewind, RotateCcw, Trash2 } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="w-full h-full flex items-end gap-4 p-8 justify-start">
      <div className="size-60 rounded-full [background-image:url('/pete.jpg')] [background-position:bottom] [background-size:cover] "></div>
      <div className="rounded-2xl ring-4 ring-neutral-600 bg-neutral-300 flex items-center justify-center">
        <div className="w-max flex items-center justify-center gap-4 px-4  py-2 ">
          <div className="bg-black rounded-2xl w-12 p-3 flex items-center justify-center aspect-square">
            <div className="aspect-square w-8 rounded-sm bg-neutral-300"></div>
          </div>
          <div>
            <Pause />
          </div>
          <div>
            <Rewind />
          </div>
          <div className="font-bold text-lg">5:00</div>
        </div>
        <div className="w-[2px] bg-neutral-700 h-full"></div>
        <div className="w-max flex items-center justify-center gap-4 px-4  py-2">
          <div>
            <RotateCcw />
          </div>
          <div>
            <Trash2 />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
