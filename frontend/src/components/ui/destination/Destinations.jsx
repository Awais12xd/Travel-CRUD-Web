"use client";

import { useEffect, useState } from "react";
import DestinationCard from "./DestinationCard";
import { RxCross1 } from "react-icons/rx";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";

const Destinations = () => {
  const [destinations, setDestinations] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);


  useEffect(() => {
     const fetchDestinations = async () => {
        try {
          setLoadingDestinations(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/get-all`, {
          withCredentials : true
        },
      );
      if (res.data.success) {
        console.log(res.data)
        setDestinations(res.data.data)
      }
      if (res.data.success === false) {
        toast.error(res.data.message);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoadingDestinations(false);
    }
     };

     fetchDestinations();

  }, []);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [images, setImages] = useState([]);
  const [loadingCreate , setLoadingCreate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("images", image);
    });

    formData.append("name", name);
    formData.append("country", country);
    formData.append("region", region);
    formData.append("description", description);
    formData.append("best_season", bestSeason);
    setLoadingCreate(false);
    try {
      setLoadingCreate(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/create`,
        formData,
        {
          withCredentials:true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data.success) {
        setLoadingCreate(false);
        window.location.reload(true);
        setOpenCreate(false);
        toast.success(res.data.message);
        

        setName("");
        setBestSeason("");
        setCountry("")
        setDescription("");
        setImages(null);
        setRegion("")

      }
      if (res.data.success === false) {
        setLoadingCreate(false);
        toast.error(res.data.message);
      }
    } catch (err) {
      setLoadingCreate(false);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="mt-5 px-1 sm:px-3">
      <div className="flex justify-between flex-col sm:flex-row gap-y-2">
        <h1 className="text-xl md:text-3xl font-bold">Destinations</h1>
        <div className="flex justify-end ">
          <button
            className="bg-[#163d8c] rounded-xl px-3 py-3 text-white text-xs md:text-sm hover:bg-[#102d67] cursor-pointer"
            onClick={() => setOpenCreate(true)}
          >
            Create New Destination
          </button>
        </div>
      </div>

      {openCreate && (
        <div className="absolute flex justify-center items-center w-full h-screen  bg-[#0000005f] top-0 left-0 ">
          <div className="w-[90%]  md:w-[50%] h-[90%] bg-white shadow rounded-sm pb-4 p-3 py-5 overflow-y-scroll relative">
            <div
              className="absolute top-4 right-4 "
              onClick={() => setOpenCreate(false)}
            >
              <RxCross1 className="text-2xl font-semibold cursor-pointer" />
            </div>
            <h5 className="text-xl font-semibold text-black mb-3 text-center">
              Create New Destination
            </h5>

            <form onSubmit={handleSubmit}>
              <br />

              <div>
                <label>
                  Destination Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Enter destination name"
                />
              </div>

              <br />

              <div>
                <label>
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Enter country"
                />
              </div>

              <br />

              <div>
                <label>
                  Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Enter region"
                />
              </div>

              <br />

              <div>
                <label>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-2 border rounded px-3 pt-2"
                  placeholder="Describe the destination"
                />
              </div>

              <br />

              <div>
                <label>
                  Best Season <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bestSeason}
                  onChange={(e) => setBestSeason(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="e.g. Winter, Summer"
                />
              </div>

              <br />
             

              <div>
                <label>
                  Upload Images <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  id="upload"
                  className="hidden"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                />

                <div className="flex gap-3 flex-wrap mt-2">
                  <label htmlFor="upload" className="cursor-pointer">
                    <AiOutlinePlusCircle size={30} />
                  </label>

                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(img)}
                      className="w-24 h-24 object-cover rounded"
                      alt="preview"
                    />
                  ))}
                </div>
              </div>

              <br />

              <button
                type="submit"
                disabled={loadingCreate}
                className="w-full h-12 border rounded cursor-pointer"
              >
               {loadingCreate ? "Creating..." : "Create Destination"} 
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="my-3">
        <SearchDestination setDestinations={setDestinations} />
      </div>

      <div className="">
        <h1 className="text-md md:text-xl font-semibold ">Destinations Found({destinations?.length})</h1>
        <div className="mt-3 ">

          {
            loadingDestinations ? (
               <p className="w-full text-center text-lg font-semibold text-black mt-8 ">
                Loading...
               </p>
            ) : (
            <AllDestinations destinations={destinations} />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Destinations;

const SearchDestination = ({ setDestinations }) => {

  const [filters, setFilters] =  useState({
    name: '',
    country: '',
    best_season: '',
    sort: 'latest',
  });
  const [loadingSearch , setLoadingSearch] = useState(false);
 
  const handleSearch = async () => {
    const params = new URLSearchParams(filters);
    setLoadingSearch(false);
    try {
      setLoadingSearch(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/search?${params.toString()}`
      );
      if (res.data.success) {
        setLoadingSearch(false);
        window.location.reload(true);
        setDestinations(res.data.data)

      }
      if (res.data.success === false) {
        setLoadingSearch(false);
        toast.error(res.data.message);
      }
    } catch (err) {
      setLoadingSearch(false);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    }
    
  }
  

  return (
    <div className="my-4 bg-[#f5f5f5] rounded-xl px-3 py-4 w-full">
      {/* Filters */}
      <div className="w-full mb-4">
        <input
        className="appearance-none  px-3 py-2 border border-gray-300 rounded-md shadow-sm  outline-none focus:ring-blue-500 sm:text-sm sm:w-[48%] w-full mr-2 bg-white"
        placeholder="Search by name"
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      />

      <input
      className="appearance-none bg-white  px-3 py-2 border border-gray-300 rounded-md shadow-sm  outline-none focus:ring-blue-500 sm:text-sm sm:w-[48%] w-full mt-2 sm:mt-0"
        placeholder="Country"
        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
      />
      </div>

      <div className="flex flex-wrap items-center  justify-between gap-y-3">
        <div className="flex gap-y-2 flex-wrap">
          <select
      className="p-2 border  border-gray-600 rounded-lg mr-2"
        onChange={(e) => setFilters({ ...filters, best_season: e.target.value })}
      >
        <option value="">Any season</option>
        <option value="summer">Summer</option>
        <option value="winter">Winter</option>
        <option value="spring">Spring</option>
      </select>

      <select
      className="p-2 border  border-gray-600 rounded-lg"
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>
        </div>

      <button
      onClick={handleSearch}
      className="bg-[#163d8c] rounded-xl px-4 py-2 text-white  hover:bg-[#102d67] transition w-36 cursor-pointer">
         {loadingSearch ? "Searching..." : "Search"}
      </button>
      </div>

    </div>
  );
};

const AllDestinations = ({ destinations }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {
        destinations?.length === 0 && (
          <p className="pt-7 text-center w-full font-medium text-lg">No Destinations Found!</p>
        )
      }
      {destinations &&
        destinations?.map((item , index) => <DestinationCard destination={item} key={index} />)}
    </div>
  );
};
