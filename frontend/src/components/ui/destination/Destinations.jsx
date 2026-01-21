"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DestinationCard from "./DestinationCard";
import { RxCross1 } from "react-icons/rx";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import { getDestinations } from "@/utils/getDestinations";

const Destinations = () => {
  const [destinations, setDestinations] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      const data = await getDestinations();
      if (!data) {
        toast.error("error while getting destinations");
      }
      console.log(data, "data is here");
      setDestinations(data);
    };

    fetchDestinations();
  }, []);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [images, setImages] = useState([]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isDefault: images.length === 0 && index === 0, // first image default
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const setDefaultImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isDefault: i === index,
      })),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    images.forEach((img, index) => {
      formData.append("images", img.file);
      if (img.isDefault) {
        formData.append("defaultImageIndex", index);
      }
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
          withCredentials: true,
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
        setCountry("");
        setDescription("");
        setImages(null);
        setRegion("");
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
        <div className="absolute z-100 flex justify-center items-center w-full h-screen  bg-[#0000005f] top-0 left-0 ">
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
                  onChange={handleFileChange}
                />

                <div className="flex gap-3 flex-wrap mt-2">
                  <label htmlFor="upload" className="cursor-pointer">
                    <AiOutlinePlusCircle size={30} />
                  </label>

                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`relative w-24 h-24 rounded border-2 ${
                        img.isDefault ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      <img
                        src={img.preview}
                        className="w-full h-full object-cover rounded"
                        alt="preview"
                      />

                      {img.isDefault && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 rounded">
                          Default
                        </span>
                      )}

                      {!img.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultImage(index)}
                          className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs py-0.5 rounded"
                        >
                          Set default
                        </button>
                      )}
                    </div>
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
        <SearchDestination
          setDestinations={setDestinations}
          destinations={destinations}
        />
      </div>

      <div className="">
        <h1 className="text-md md:text-xl font-semibold ">
          Destinations Found ({destinations?.length})
        </h1>
        <div className="mt-3 ">
          {loadingDestinations ? (
            <p className="w-full text-center text-lg font-semibold text-black mt-8 ">
              Loading...
            </p>
          ) : (
            <AllDestinations destinations={destinations} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Destinations;

/**
 * SearchDestination
 * Props:
 *  - destinations: original array (full list) — used as source for local filtering
 *  - setDestinations: function to set the filtered list in parent
 *
 * NOTE: This component mutates no external state except via setDestinations.
 */

const SearchDestination = ({ setDestinations, destinations = [] }) => {
  const [filters, setFilters] = useState({
    name: "",
    country: "",
    best_season: "",
    sort: "latest",
  });

  // 🔒 Immutable source list (saved once)
  const originalListRef = useRef([]);

  // Save original destinations ONLY once
  useEffect(() => {
    if (originalListRef.current.length === 0 && destinations?.length > 0) {
      originalListRef.current = destinations;
    }
  }, [destinations]);

  // Filtering logic
  useEffect(() => {
    const source = originalListRef.current;

    const name = filters.name.toLowerCase().trim();
    const country = filters.country.toLowerCase().trim();
    const season = filters.best_season.toLowerCase();

    let result = source.filter((d) => {
      const matchName = name ? d.name?.toLowerCase().includes(name) : true;
      const matchCountry = country
        ? d.country?.toLowerCase().includes(country)
        : true;
      const matchSeason = season
        ? d.best_season?.toLowerCase() === season
        : true;

      return matchName && matchCountry && matchSeason;
    });

    if (filters.sort === "latest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setDestinations(result);
  }, [filters, setDestinations]);

  const handleChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="my-4 bg-[#f5f5f5] rounded-xl px-3 py-4 w-full">
      <div className="w-full mb-4">
        <input
          value={filters.name}
          placeholder="Search by name"
          className="px-3 py-2 border rounded-md w-full sm:w-[48%] mr-2"
          onChange={handleChange("name")}
        />

        <input
          value={filters.country}
          placeholder="Country"
          className="px-3 py-2 border rounded-md w-full sm:w-[48%] mt-2 sm:mt-0"
          onChange={handleChange("country")}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filters.best_season}
          onChange={handleChange("best_season")}
          className="p-2 border rounded-lg"
        >
          <option value="">Any season</option>
          <option value="summer">Summer</option>
          <option value="winter">Winter</option>
          <option value="spring">Spring</option>
        </select>

        <select
          value={filters.sort}
          onChange={handleChange("sort")}
          className="p-2 border rounded-lg"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
};

const AllDestinations = ({ destinations }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {destinations?.length === 0 && (
        <p className="pt-7 text-center w-full font-medium text-lg">
          No Destinations Found!
        </p>
      )}
      {destinations &&
        destinations?.map((item, index) => (
          <DestinationCard destination={item} key={index} />
        ))}
    </div>
  );
};
