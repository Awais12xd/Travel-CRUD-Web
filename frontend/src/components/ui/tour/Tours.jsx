"use client";

import { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import TourCard from "./TourCard";
import { getTours } from "@/utils/getTours";
import { getDestinations } from "@/utils/getDestinations";

const Tours = () => {
  
  const [tours, setTours] = useState(null);
  const [destinations, setDestinations] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  useEffect(() => {
    const fetchBoth = async () => {
      const toursData = await getTours();
      const destinationData = await getDestinations();

      if(!toursData){
        console.log("Error while getting tours");
      }
      console.log(toursData , "Tour Data")
      if(!destinationData){
        console.log("Error while getting destnations");
      }

      setTours(toursData);
      setDestinations(destinationData);
      
    };
    fetchBoth();
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isDefault: images.length === 0 && index === 0, 
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
    formData.append("title", title);
    formData.append("price", price);
    formData.append("duration_days", durationDays);
    formData.append("destination_id", destinationId);
    formData.append("max_group_size", maxGroupSize);

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
        <div className="absolute z-100 flex justify-center items-center w-full h-screen bg-[#0000005f] top-0 left-0">
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
                {loadingCreate ? "Creating..." : "Create Tour"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="my-3">
        <SearchTours setTours={setTours} destinations={destinations} tours={tours} />
      </div>

      <div className="">
        <h1 className="text-md md:text-xl font-semibold ">Tours Found ({tours?.length})</h1>
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

const SearchTours = ({ destinations = [], tours = [], setTours }) => {
  const [filters, setFilters] = useState({
    name: "",
    duration_days: "",
    max_group_size: "",
    destination_id: "",
    sort: "latest",
  });

  // 🔒 Immutable source list (stored once)
  const originalToursRef = useRef([]);

  // Save original tours only once
  useEffect(() => {
    if (originalToursRef.current.length === 0 && tours?.length > 0) {
      originalToursRef.current = tours;
    }
  }, [tours]);

  // 🔍 Local filtering logic (runs on every change)
  useEffect(() => {
    const source = originalToursRef.current;

    const name = filters.name.toLowerCase().trim();
    const duration = Number(filters.duration_days);
    const maxGroup = Number(filters.max_group_size);
    const destinationId = filters.destination_id;

    let result = source.filter((t) => {
      const matchName = name
        ? t.title?.toLowerCase().includes(name)
        : true;

      const matchDuration = duration
        ? Number(t.duration_days) === duration
        : true;

      const matchGroup = maxGroup
        ? Number(t.max_group_size) <= maxGroup
        : true;

      const matchDestination = destinationId
        ? t.destination_id === destinationId
        : true;

      return (
        matchName &&
        matchDuration &&
        matchGroup &&
        matchDestination
      );
    });

    // 🔃 Sorting
    switch (filters.sort) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;

      case "price_asc":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price_desc":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      default: // latest
        result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    setTours(result);
  }, [filters, setTours]);

  const handleChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="my-4 bg-[#f5f5f5] rounded-xl px-3 py-4 w-full">
      <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          className="px-3 py-2 border rounded-md bg-white"
          placeholder="Search tour name"
          value={filters.name}
          onChange={handleChange("name")}
        />

        <input
          className="px-3 py-2 border rounded-md bg-white"
          placeholder="Duration (days)"
          type="number"
          value={filters.duration_days}
          onChange={handleChange("duration_days")}
        />
      </div>

      <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          className="px-3 py-2 border rounded-md bg-white"
          placeholder="Max group size"
          type="number"
          value={filters.max_group_size}
          onChange={handleChange("max_group_size")}
        />

        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filters.destination_id}
          onChange={handleChange("destination_id")}
        >
          <option value="">All destinations</option>
          {destinations?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-md bg-white"
          value={filters.sort}
          onChange={handleChange("sort")}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="price_asc">Price: Low → High</option>
        </select>
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
