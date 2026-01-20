"use client";

import axios from "axios";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";

const DestinationCard = ({ destination }) => {
  
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
      setLoading(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/update/${destination?.id}`,
        {
          name,
          country,
          region,
          description,
          best_season: bestSeason,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
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
          <img
            className="w-full h-full object-cover"
            src={destination?.images?.[0]}
            alt="destination"
          />
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
        <div className="absolute flex justify-center items-center w-full h-screen  bg-[#0000005f] top-0 left-0 ">
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
              {/* <div>
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
                </div> */}

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
