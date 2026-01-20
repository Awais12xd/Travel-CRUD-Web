"use client";

import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import TourCard from "./TourCard";

const Tours = () => {
  
  const [tours, setTours] = useState(null);
  const [destinations, setDestinations] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/get-all`,
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          console.log(res.data);
          setDestinations(res.data.data);
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
      }
    };
    const fetchTours = async () => {
      try {
        setLoadingTours(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/get-all`
        );
        if (res.data.success) {
          console.log(res.data);
          setTours(res.data.data);
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
      }finally {
        setLoadingTours(false);
      }
    };
    fetchTours();
    fetchDestinations();
  }, []);
  
  

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState("");
  const [itinerary, setItinerary] = useState([]); 
  const [inclusions, setInclusions] = useState([]); 
  const [exclusions, setExclusions] = useState([]); 
  const [images, setImages] = useState([]);

  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
  
    images.forEach((image) => {
      formData.append("images", image);
    });

    formData.append("title", title);
    formData.append("price", price);
    formData.append("duration_days", durationDays);
    formData.append("destination_id", destinationId);
    formData.append("max_group_size", maxGroupSize);
    console.log(itinerary)

    formData.append("itinerary", JSON.stringify(itinerary));
    formData.append("inclusions", JSON.stringify(inclusions));
    formData.append("exclusions", JSON.stringify(exclusions));


    try {
      setLoadingCreate(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/create`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);

        setTitle("");
        setPrice("");
        setDurationDays("");
        setDestinationId("");
        setMaxGroupSize("");
        setItinerary([]);
        setInclusions([]);
        setExclusions([]);
        setImages([]);
        setOpenCreate(false);

        window.location.reload(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoadingCreate(false);
    }
  };

  useEffect(() => {
    const days = Number(durationDays);

    if (!days || days <= 0) {
      setItinerary([]);
      return;
    }

    const updated = Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      title: "",
      description: "",
    }));

    setItinerary(updated);
  }, [durationDays]);

  const handleItineraryChange = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  return (
    <div className="mt-5 px-1 sm:px-3">
      <div className="flex justify-between flex-col sm:flex-row gap-y-2">
        <h1 className="text-xl md:text-3xl font-bold">Tours</h1>
        <div className="flex justify-end ">
          <button
            className="bg-[#163d8c] rounded-xl px-3 py-3 text-white text-xs md:text-sm hover:bg-[#102d67] cursor-pointer"
            onClick={() => setOpenCreate(true)}
          >
            Create New Tour
          </button>
        </div>
      </div>

      {openCreate && (
        <div className="absolute flex justify-center items-center w-full h-screen bg-[#0000005f] top-0 left-0">
          <div className="w-[90%] md:w-[55%] h-[90%] bg-white shadow rounded-sm pb-4 p-4 overflow-y-scroll relative">
            <div
              className="absolute top-4 right-4"
              onClick={() => setOpenCreate(false)}
            >
              <RxCross1 className="text-2xl cursor-pointer" />
            </div>

            <h5 className="text-xl font-semibold text-center mb-4">
              Create New Tour
            </h5>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div>
                <label>
                  Tour Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="e.g. 7 Days Hunza Valley Tour"
                />
              </div>

              <br />

              {/* Price */}
              <div>
                <label>
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="e.g. 1200"
                />
              </div>

              <br />

              {/* Duration */}
              <div>
                <label>
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="e.g. 7"
                  max={8}
                  min={1}
                />
              </div>

              <br />

              {/* Destination */}
              <div>
                <label>
                  Destination <span className="text-red-500">*</span>
                </label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                >
                  <option value="">Select destination</option>
                  {/* map destinations here */}
                  {destinations &&
                    destinations.map((item) => (
                      <option
                        className="bg-white hover:bg-[#f5f5f5] transition duration-150"
                        key={item?.id}
                        value={item?.id}
                      >
                        {item?.name}
                      </option>
                    ))}
                </select>
              </div>

              <br />

              {/* Group Size */}
              <div>
                <label>
                  Max Group Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="e.g. 15"
                  max={20}
                  min={2}
                />
              </div>

              <br />

              {/* Itinerary */}
              <div>
                <label className="font-semibold">
                  Itinerary <span className="text-red-500">*</span>
                </label>

                {itinerary.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Please enter duration days first.
                  </p>
                )}

                <div className="mt-3 space-y-4">
                  {itinerary.length >= 9 ? (
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum 8 days are allowed only.
                    </p>
                  ) : (
                     itinerary.map((dayItem, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-gray-50"
                      >
                        <h6 className="font-medium mb-2">Day {dayItem.day}</h6>

                        <input
                          type="text"
                          placeholder="Day title (e.g. Arrival & City Tour)"
                          value={dayItem.title}
                          onChange={(e) =>
                            handleItineraryChange(
                              index,
                              "title",
                              e.target.value,
                            )
                          }
                          className="w-full h-9 border rounded px-3 mb-2"
                        />

                        <textarea
                          rows={3}
                          placeholder="Describe activities for this day"
                          value={dayItem.description}
                          onChange={(e) =>
                            handleItineraryChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full border rounded px-3 pt-2"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <br />

              {/* Inclusions */}
              <div>
                <label>Inclusions (comma separated)</label>
                <input
                  type="text"
                  onChange={(e) =>
                    setInclusions(
                      e.target.value.split(",").map((i) => i.trim()),
                    )
                  }
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Hotel, Transport, Guide"
                />
              </div>

              <br />

              {/* Exclusions */}
              <div>
                <label>Exclusions (comma separated)</label>
                <input
                  type="text"
                  onChange={(e) =>
                    setExclusions(
                      e.target.value.split(",").map((i) => i.trim()),
                    )
                  }
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Flights, Personal expenses"
                />
              </div>

              <br />

              {/* Images */}
              <div>
                <label>
                  Upload Images <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
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
                {loadingCreate ? "Creating..." : "Create Tour"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="my-3">
        <SearchTours setTours={setTours} destinations={destinations}  />
      </div>

      <div className="">
        <h1 className="text-md md:text-xl font-semibold ">Tours Found({tours?.length})</h1>
        <div className="mt-3">
            {
            loadingTours ? (
               <p className="w-full text-center text-lg font-semibold text-black mt-8 ">
                Loading...
               </p>
            ) : (
            <AllTours tours={tours}  />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Tours;

const SearchTours = ({ destinations = [], setTours }) => {
  const [filters, setFilters] = useState({
    name: "",
    duration_days: "",    
    max_group_size: "",    
    destination_id: "",     
    sort: "latest",
  });
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleSearch = async () => {
    const params = new URLSearchParams();

    if (filters.name) params.append("name", filters.name);
    if (filters.duration_days) params.append("duration_days", filters.duration_days);
    if (filters.max_group_size) params.append("max_group_size", filters.max_group_size);
    if (filters.destination_id) params.append("destination_id", filters.destination_id);
    if (filters.sort) params.append("sort", filters.sort);

    try {
      setLoadingSearch(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/search?${params.toString()}`
      );

      if (res.data.data) {
        setTours(res.data.data);
      } else {
        toast.error(res.data.message || "No tours found");
      }
    } catch (err) {
      if (err.response?.data?.message) toast.error(err.response.data.message);
      else toast.error(err.message || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="my-4 bg-[#f5f5f5] rounded-xl px-3 py-4 w-full">
      <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          placeholder="Search tour name"
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />

        <input
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          placeholder="Duration (days)"
          type="number"
          onChange={(e) => setFilters({ ...filters, duration_days: e.target.value })}
        />
      </div>

      <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          placeholder="Max group size"
          type="number"
          onChange={(e) => setFilters({ ...filters, max_group_size: e.target.value })}
        />

        <select
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          value={filters.destination_id}
          onChange={(e) => setFilters({ ...filters, destination_id: e.target.value })}
        >
          <option value="">All destinations</option>
          {destinations?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="price_asc">Price: Low → High</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="bg-[#163d8c] rounded-xl px-4 py-2 text-white hover:bg-[#102d67] transition"
          disabled={loadingSearch}
        >
          {loadingSearch ? "Searching..." : "Search Tours"}
        </button>
      </div>
    </div>
  );
};

const AllTours = ({ tours }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {tours?.length === 0 && (
        <p className="pt-7 text-center w-full font-medium text-lg">
          No Tours Found!
        </p>
      )}
      {tours &&
        tours?.map((item, index) => (
          <TourCard tour={item} key={index} />
        ))}
    </div>
  );
};
