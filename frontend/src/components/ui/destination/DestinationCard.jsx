"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

const DestinationCard = ({ destination }) => {
  SwiperCore.use([Navigation]);

  // safe parser: returns an array of strings (image URLs)
  function parseJsonArrayField(field) {
    if (!field && field !== "") return []; // null/undefined -> empty

    // already an array
    if (Array.isArray(field)) return field.map(String);

    // only accept strings from here
    if (typeof field !== "string") return [];

    const trimmed = field.trim();
    if (trimmed === "") return [];

    // 1) try normal JSON.parse
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
      if (parsed && typeof parsed === "string") return [String(parsed)];
    } catch (e) {
      // ignore parse error and try recovery below
    }

    // 2) try to extract JSON arrays if multiple were concatenated like: "[] []"
    const arrMatches = [];
    const re = /\[[^\]]*]/g; // find [...], non-greedy-ish
    let m;
    while ((m = re.exec(trimmed)) !== null) {
      try {
        const p = JSON.parse(m[0]);
        if (Array.isArray(p)) arrMatches.push(...p.map(String));
      } catch (err) {
        // skip bad chunk
      }
    }
    if (arrMatches.length) {
      // dedupe and return
      return Array.from(new Set(arrMatches));
    }

    // 3) fallback: attempt to split simple comma-separated string of URLs
    const split = trimmed
      .split(/\s*,\s*/)
      .map((s) => s.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);

    // dedupe and return
    return Array.from(new Set(split));
  }

  const parsedImages = parseJsonArrayField(destination?.images);
  const [existingImages, setExistingImages] = useState(parsedImages);
  const [newImages, setNewImages] = useState([]);
  useEffect(() => {
    setExistingImages(parseJsonArrayField(destination?.images));
    setNewImages([]);
  }, [destination]);

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleNewFiles = (fileList) => {
    setNewImages((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [openUpdate, setOpenUpdate] = useState(false);
  const [name, setName] = useState(destination?.name);
  const [country, setCountry] = useState(destination?.country);
  const [region, setRegion] = useState(destination?.region);
  const [description, setDescription] = useState(destination?.description);
  const [bestSeason, setBestSeason] = useState(destination?.best_season);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(false);
    try {
      
      const formData = new FormData();

      formData.append("name", name);
      formData.append("country", country);
      formData.append("region", region); 
      formData.append("description", description); 
      formData.append("best_season", bestSeason); 
      
      formData.append("keepImages", JSON.stringify(existingImages || []));

      newImages && newImages.forEach((file) => {
        formData.append("images", file);
      });

      setLoading(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/update/${destination?.id}`,
        formData
      );
      if (res.data.success) {
        setLoading(false);
        window.location.reload(true);
        setOpenUpdate(false);
        toast.success(res.data.message);
      }
      if (res.data.success === false) {
        setLoading(false);
        toast.error(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(false);
    try {
      setLoadingDelete(true);
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/delete/${destination?.id}`,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setLoadingDelete(false);
        window.location.reload(true);
        toast.success(res.data.message);
      }
      if (res.data.success === false) {
        setLoadingDelete(false);
        toast.error(res.data.message);
      }
    } catch (error) {
      setLoadingDelete(false);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="rounded-3xl bg-[#f5f5f5] p-3 flex flex-col w-72  pb-4 hover:shadow-lg transition-shadow duration-300 h-95 justify-between">
      <div className="flex flex-col gap-y-3">
        <div className="w-full h-44 overflow-hidden rounded-2xl">
          <Swiper navigation={true}>
            {parsedImages &&
              parsedImages.map((image) => (
                <SwiperSlide key={image}>
                  <div
                    className="h-44"
                    style={{
                      background: `url(${image}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>

        <h1 className="text-lg font-semibold text-black line-clamp-1">
          {destination?.name}
        </h1>

        <div className="flex justify-between items-center">
          <h3 className="text-sm text-gray-600">
            {destination?.country},{" "}
            <span className="text-gray-500">{destination?.region}</span>
          </h3>

          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
            🌤 {destination?.best_season}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-gray-800">
          {destination?.description}
        </p>
      </div>
      <div className="flex justify-between items-center pt-2">
        <button
          className="bg-[#163d8c] rounded-full px-4 py-2 text-white text-sm hover:bg-[#102d67] transition w-36 cursor-pointer"
          onClick={() => setOpenUpdate(true)}
        >
          Update
        </button>

        <button
          disabled={loadingDelete}
          className="bg-red-500 rounded-full px-4 py-2 text-white text-sm hover:bg-red-600 transition w-20 cursor-pointer"
          onClick={handleDelete}
        >
          {loadingDelete ? "Deleting..." : "Delete"}
        </button>
      </div>
      {openUpdate && (
        <div className="absolute z-100 flex justify-center items-center w-full h-screen  bg-[#0000005f] top-0 left-0 ">
          <div className="w-[90%]  md:w-[50%] h-[90%] bg-white shadow rounded-sm pb-4 p-3 py-5 overflow-y-scroll relative">
            <div
              className="absolute top-4 right-4 "
              onClick={() => setOpenUpdate(false)}
            >
              <RxCross1 className="text-2xl font-semibold cursor-pointer" />
            </div>
            <h5 className="text-xl font-semibold text-black mb-3 text-center">
              Update Destination
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

              {/* Images */}
              <div>
                <label>Images</label>

                <div className="flex gap-3 flex-wrap mt-2">
                  {existingImages.map((url, idx) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`img-${idx}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {newImages.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`new-${idx}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* file input */}
                <input
                  id={`newImages-${destination?.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleNewFiles(e.target.files)}
                />
                <div className="mt-2">
                  <label
                    htmlFor={`newImages-${destination?.id}`}
                    className="cursor-pointer inline-flex  my-2items-center gap-2 text-sm text-gray-700"
                  >
                    <AiOutlinePlusCircle /> Add images
                  </label>
                </div>
              </div>
              <br />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 border rounded cursor-pointer"
              >
                {loading ? "Updating..." : "Update Destination"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationCard;
