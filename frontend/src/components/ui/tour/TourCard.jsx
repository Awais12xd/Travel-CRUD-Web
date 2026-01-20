"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const TourCard = ({ tour }) => {
  const [openUpdate, setOpenUpdate] = useState(false);

  const [title, setTitle] = useState(tour?.title || "");
  const [price, setPrice] = useState(tour?.price || "");
  const [durationDays, setDurationDays] = useState(tour?.duration_days || 1);
  const [maxGroupSize, setMaxGroupSize] = useState(tour?.max_group_size || "");
  const [itinerary, setItinerary] = useState(
    Array.isArray(tour?.itinerary)
      ? tour.itinerary
      : tour?.itinerary
        ? JSON.parse(tour.itinerary)
        : [],
  );
  const [inclusions, setInclusions] = useState(
    Array.isArray(tour?.inclusions)
      ? tour.inclusions
      : tour?.inclusions
        ? JSON.parse(tour.inclusions)
        : [],
  );
  const [exclusions, setExclusions] = useState(
    Array.isArray(tour?.exclusions)
      ? tour.exclusions
      : tour?.exclusions
        ? JSON.parse(tour.exclusions)
        : [],
  );

  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const days = Number(durationDays);

    if (!days || days <= 0) {
      setItinerary([]);
      return;
    }

    setItinerary((prev) => {
      const prevItinerary = Array.isArray(prev) ? prev : [];

      if (prevItinerary.length === 0) {
        return Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          title: "",
          description: "",
        }));
      }

      if (days > prevItinerary.length) {
        const extraDays = Array.from(
          { length: days - prevItinerary.length },
          (_, i) => ({
            day: prevItinerary.length + i + 1,
            title: "",
            description: "",
          }),
        );

        return [...prevItinerary, ...extraDays];
      }

      if (days < prevItinerary.length) {
        return prevItinerary.slice(0, days);
      }

      return prevItinerary;
    });
  }, [durationDays]);

  const handleItineraryChange = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !durationDays) {
      toast.error("Title, price and duration are required");
      return;
    }

    setLoading(true);
    try {
      const data = {
        title,
        price: Number(price),
        duration_day: Number(durationDays),
        max_group_size: Number(maxGroupSize),
        itinerary: JSON.stringify(itinerary || []),
        inclusions: JSON.stringify(inclusions || []),
        exclusions: JSON.stringify(exclusions || []),
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/update/${tour?.id}`,
        data,
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Tor  updated");
        setOpenUpdate(false);
        window.location.reload();
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) toast.error(err.response.data.message);
      else toast.error(err.message || "Update error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(false);
    try {
      setLoadingDelete(true);
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/delete/${tour?.id}`,
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
    <div className="rounded-3xl bg-[#f5f5f5] p-3 flex flex-col w-72 pb-4 hover:shadow-lg transition-shadow duration-300 h-fit justify-between">
      <div className="flex flex-col gap-y-3">
        <div className="w-full h-44 overflow-hidden rounded-2xl bg-gray-100">
          <Swiper
            spaceBetween={50}
            slidesPerView={3}
            onSlideChange={() => console.log("slide change")}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {
              tour?.images && tour?.images.map((image) => (

                <SwiperSlide>
                  <img src={image} alt="tour" />
                </SwiperSlide>
              ))
            }
            ...
          </Swiper>
          <img
            className="w-full h-full object-cover"
            src={
              Array.isArray(tour?.images)
                ? tour.images[0]
                : tour?.images
                  ? JSON.parse(tour.images || "[]")[0] || ""
                  : ""
            }
            alt={tour?.title || "tour image"}
          />
        </div>

        <h1 className="text-lg font-semibold text-black line-clamp-1">
          {tour?.title}
        </h1>

        <div className="flex justify-between items-center">
          <h3 className="text-sm text-gray-600">
            {tour?.destination_name}{" "}
            <span className="text-gray-500">• {tour?.duration_days} days</span>
          </h3>

          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
            ${tour?.price}
          </span>
        </div>

        <div className="space-y-2">
          {(() => {
            const itinerary = Array.isArray(tour?.itinerary)
              ? tour.itinerary
              : JSON.parse(tour?.itinerary || "[]");

            return itinerary.slice(0, 3).map((day) => (
              <div key={day.day} className="flex gap-2 items-center">
                <span className="shrink-0 bg-indigo-100 text-indigo-700 text-[8px] font-semibold px-2 py-1 rounded-full">
                  Day {day.day}
                </span>
                <p className="text-[10px] text-gray-800 line-clamp-1">
                  {day.description}
                </p>
              </div>
            ));
          })()}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(() => {
            const inclusions = Array.isArray(tour?.inclusions)
              ? tour.inclusions
              : JSON.parse(tour?.inclusions || "[]");
            const exclusions = Array.isArray(tour?.exclusions)
              ? tour.exclusions
              : JSON.parse(tour?.exclusions || "[]");

            return (
              <>
                {inclusions.slice(0, 4).map((item, idx) => (
                  <span
                    key={`inclusion-${idx}`}
                    className="bg-green-100 text-green-700 text-[10px] font-medium px-2 py-1 rounded-full"
                  >
                    ✓ {item}
                  </span>
                ))}
                {exclusions.slice(0, 4).map((item, idx) => (
                  <span
                    key={`exclusion-${idx}`}
                    className="bg-red-100 text-red-700 text-[10px] font-medium px-2 py-1 rounded-full"
                  >
                    ❌ {item}
                  </span>
                ))}
              </>
            );
          })()}
        </div>
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
        <div className="absolute flex justify-center items-center w-full h-screen bg-[#0000005f] top-0 left-0">
          <div className="w-[90%] md:w-[50%] h-[90%] bg-white shadow rounded-sm pb-4 p-3 py-5 overflow-y-scroll relative">
            <div
              className="absolute top-4 right-4"
              onClick={() => setOpenUpdate(false)}
            >
              <RxCross1 className="text-2xl font-semibold cursor-pointer" />
            </div>

            <h5 className="text-xl font-semibold text-black mb-3 text-center">
              Update Tour
            </h5>

            <form onSubmit={handleSubmit}>
              <br />

              <div>
                <label>
                  Tour Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Enter tour title"
                />
              </div>

              <br />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full mt-2 h-9 border rounded px-3"
                    placeholder="e.g. 200"
                  />
                </div>

                <div>
                  <label>
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full mt-2 h-9 border rounded px-3"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>

              <br />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Max Group Size</label>
                  <input
                    type="number"
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(e.target.value)}
                    className="w-full mt-2 h-9 border rounded px-3"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <br />

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

              <div>
                <label>Inclusions (comma separated)</label>
                <input
                  type="text"
                  onChange={(e) =>
                    setInclusions(
                      e.target.value.split(",").map((i) => i.trim()),
                    )
                  }
                  value={inclusions}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Hotel, Transport, Guide"
                />
              </div>

              <br />

              <div>
                <label>Exclusions (comma separated)</label>
                <input
                  type="text"
                  onChange={(e) =>
                    setExclusions(
                      e.target.value.split(",").map((i) => i.trim()),
                    )
                  }
                  value={exclusions}
                  className="w-full mt-2 h-9 border rounded px-3"
                  placeholder="Flights, Personal expenses"
                />
              </div>

              <br />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 border rounded cursor-pointer bg-[#163d8c] text-white"
              >
                {loading ? "Updating..." : "Update Tour"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourCard;
