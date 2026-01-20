"use client"

import { AiOutlineCompass, AiOutlineHeatMap } from "react-icons/ai";
import {MdTour} from "react-icons/md"
import { useRouter } from "next/navigation";


const Sidebar = ({ active, setActive }) => {
  const router = useRouter();

   
  
  return (
    <div className="flex flex-col justify-between py-5 w-full h-full bg-[#f5f5f5] px-2 md:px-4 border-r-0">
      <div className="">
        <div className="py-4 flex items-center justify-center mb-8">
          <img
            src={
              "https://toptiertravel.vip/_next/image?url=https%3A%2F%2Fapp.toptiertravel.vip%2Fuploads%2Fglobal%2F%2Flogo.png&w=256&q=75"
            }
            className="h-20 w-40 object-contain"
          />
        </div>
        <div className={`py-2  transition duration-200 rounded-lg cursor-pointer ${active === 1 ? "bg-[#163d8c] text-white" : ""}`} onClick={() => setActive(1)}>
          <p className="pl-2 flex items-center gap-x-2">
             <AiOutlineCompass size={25} /> <span className="hidden sm:block">Destinatons</span>
          </p>
        </div>
        <div className={`py-2  transition duration-200 rounded-lg cursor-pointer ${active === 2 ? "bg-[#163d8c] text-white" : ""}`} onClick={() => setActive(2)}>
          <p className="pl-2 flex items-center gap-x-2">
            <MdTour size={25} />  <span className="hidden sm:block">Tours</span>
          </p>
        </div>
      </div>
      <div ></div>
    </div>
  );
};

export default Sidebar;
