"use client";

import Destinations from "@/components/ui/destination/Destinations";
import Sidebar from "@/components/ui/Sidebar.jsx";
import Tours from "@/components/ui/tour/Tours";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [active, setActive] = useState(1);

  return (
    <div className="w-full max-w-7xl mx-auto flex justify-between  h-[99vh]">
      <div className="w-[17%] sm:w-[20%] h-full ">
        <Sidebar active={active} setActive={setActive} />
      </div>
      <div className="w-[82%] sm:w-[79%] bg-white overflow-y-auto pb-5">
        {active === 1 && (
          <div className="">
            <Destinations />
          </div>
        )}
        {active === 2 && (
          <div className="">
            <Tours />
          </div>
        )}
      </div>
    </div>
  );
}
