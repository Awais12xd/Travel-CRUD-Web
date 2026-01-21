"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

const TourCard = ({ tour }) => {
  SwiperCore.use([Navigation]);
  
  function parseImagesField(field) {
    if (field == null) return [];

    // Already an array → normalize to {url, isDefault}
    if (Array.isArray(field)) {
      return field
        .map((item) => {
          if (typeof item === "string") {
            return { url: item, isDefault: false };
          }
          if (item && typeof item === "object" && item.url) {
            return {
              url: String(item.url),
              isDefault: Boolean(item.isDefault),
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (typeof field !== "string") return [];

    const trimmed = field.trim();
    if (!trimmed) return [];

    // 1) try direct parse
    try {
      const parsed = JSON.parse(trimmed);
      return parseImagesField(parsed);
    } catch {}

    // 2) extract all JSON array chunks like '[...]' (handles concatenated arrays)
    const matches = trimmed.match(/\[[\s\S]*?\]/g) || [];
    const results = [];
    for (const chunk of matches) {
      try {
        const parsed = JSON.parse(chunk);
        results.push(...parseImagesField(parsed));
      } catch {
        // ignore chunk
      }
    }

    // 3) dedupe by URL (last occurrence wins)
    const map = new Map();
    for (const img of results) {
      if (img && img.url) map.set(img.url, img);
    }
    return Array.from(map.values());
  }

   const getDisplayImages = () => {
    const imgs = parseImagesField(tour?.images);
    // sort default to front (stable-ish)
    return [...imgs].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  };

  const imagesToDisplay = getDisplayImages();

  const [existingImages, setExistingImages] = useState(() =>
    parseImagesField(tour?.images)
  );
  const [newImages, setNewImages] = useState([]); 

  useEffect(() => {
    setExistingImages(parseImagesField(tour?.images));
    setNewImages([]);
  }, [tour]);

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

   const setDefaultByCombinedIndex = (combinedIndex) => {
    const eLen = existingImages.length;
    if (combinedIndex < 0) return;

    if (combinedIndex < eLen) {
      setExistingImages((prev) =>
        prev.map((img, i) => ({ ...img, isDefault: i === combinedIndex }))
      );
      setNewImages((prev) => prev.map((n) => ({ ...n, isDefault: false })));
    } else {
      const newIndex = combinedIndex - eLen;
      setNewImages((prev) =>
        prev.map((img, i) => ({ ...img, isDefault: i === newIndex }))
      );
      setExistingImages((prev) => prev.map((e) => ({ ...e, isDefault: false })));
    }
  };

   const setDefaultImage = (index) => {
    setDefaultByCombinedIndex(index);
  };

const removeExistingImage = (url) => {
    setExistingImages((prev) => {
      const updated = prev.filter((img) => img.url !== url);

      if (!updated.some((img) => img.isDefault)) {
        if (updated.length > 0) {
          updated[0].isDefault = true;
        } else if (newImages.length > 0) {
          setNewImages((prevNew) =>
            prevNew.map((n, i) => ({ ...n, isDefault: i === 0 }))
          );
        }
      }
      return updated;
    });
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => {
      const removed = prev[idx];
      const updated = prev.filter((_, i) => i !== idx);
      if (removed?.isDefault) {
        if (existingImages.length > 0) {
          setExistingImages((prevE) =>
            prevE.map((e, i) => ({ ...e, isDefault: i === 0 }))
          );
        } else if (updated.length > 0) {
          updated[0].isDefault = true;
        }
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const haveDefault =
      existingImages.some((i) => i.isDefault) ||
      newImages.some((n) => n.isDefault);
    const newObjs = files.map((file, idx) => ({
      id: makeId(),
      file,
      preview: URL.createObjectURL(file),
      isDefault: !haveDefault && idx === 0, 
    }));

    setNewImages((prev) => [...prev, ...newObjs]);
  };

  const handleNewFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const haveDefault =
      existingImages.some((i) => i.isDefault) ||
      newImages.some((n) => n.isDefault);
    const newObjs = files.map((file, idx) => ({
      id: makeId(),
      file,
      preview: URL.createObjectURL(file),
      isDefault: !haveDefault && idx === 0,
    }));

    setNewImages((prev) => [...prev, ...newObjs]);
  };


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

      const combined = [
        ...existingImages.map((img) => ({ type: "existing", url: img.url, isDefault: !!img.isDefault })),
        ...newImages.map((n) => ({ type: "new", preview: n.preview, isDefault: !!n.isDefault })),
      ];
      const defaultIndex = combined.findIndex((c) => c.isDefault);
      const finalDefaultIndex = defaultIndex === -1 ? 0 : defaultIndex;

      const formData = new FormData();

      formData.append("title", title);
      formData.append("price", Number(price));
      formData.append("duration_days", Number(durationDays)); 
      if (maxGroupSize) formData.append("max_group_size", Number(maxGroupSize));

      formData.append("itinerary", JSON.stringify(itinerary || []));
      formData.append("inclusions", JSON.stringify(inclusions || []));
      formData.append("exclusions", JSON.stringify(exclusions || []));

      formData.append("keepImages", JSON.stringify(existingImages || []));

      newImages && newImages.forEach((n) => {
        formData.append("images", n.file);
      });

      formData.append("defaultImageIndex", String(finalDefaultIndex));

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/update/${tour?.id}`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Tour updated");
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
          {/* Slider */}
          <Swiper navigation={true}>
            {imagesToDisplay &&
              imagesToDisplay.map((image , index) => (
                <SwiperSlide key={image.url + index}>
                  <div
                    className="h-44"
                    style={{
                      background: `url(${image.url}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </SwiperSlide>
              ))}
          </Swiper>
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
        <div className="absolute flex z-100 justify-center items-center w-full h-screen bg-[#0000005f] top-0 left-0">
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

             {/* Images */}
              <div>
                <label>Images</label>

                <div className="flex gap-3 flex-wrap mt-2">
                  {existingImages.map((img, idx) => (
                    <div key={img.url} className="relative">
                      <img
                        src={img.url}
                        className={`w-24 h-24 object-cover rounded ${
                          img.isDefault ? "ring-4 ring-blue-500" : ""
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setDefaultImage(idx)}
                        className="absolute bottom-1 left-1 bg-white text-xs px-2 py-1 rounded shadow"
                      >
                        {img.isDefault ? "Default" : "Set Default"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {newImages.map((fileObj, idx) => (
                    <div key={fileObj.id} className="relative">
                      <img
                        src={fileObj.preview}
                        alt={`new-${idx}`}
                        className={`w-24 h-24 object-cover rounded ${
                          fileObj.isDefault ? "ring-4 ring-blue-500" : ""
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setDefaultByCombinedIndex(existingImages.length + idx)}
                        className="absolute bottom-1 left-1 bg-white text-xs px-2 py-1 rounded shadow"
                      >
                        {fileObj.isDefault ? "Default" : "Set Default"}
                      </button>

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
                  id={`newImages-${tour?.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="mt-2">
                  <label
                    htmlFor={`newImages-${tour?.id}`}
                    className="cursor-pointer inline-flex my-2items-center gap-2 text-sm text-gray-700"
                  >
                    <AiOutlinePlusCircle /> Add images
                  </label>
                </div>
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
