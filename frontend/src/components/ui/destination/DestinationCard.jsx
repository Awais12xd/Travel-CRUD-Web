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

const DestinationCard = ({ destination }) => {
  SwiperCore.use([Navigation]);

  function parseImagesField(field) {
    if (field == null) return [];

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

    try {
      const parsed = JSON.parse(trimmed);
      return parseImagesField(parsed);
    } catch {}

    const matches = trimmed.match(/\[[\s\S]*?\]/g) || [];
    const results = [];
    for (const chunk of matches) {
      try {
        const parsed = JSON.parse(chunk);
        results.push(...parseImagesField(parsed));
      } catch {
      }
    }

    const map = new Map();
    for (const img of results) {
      if (img && img.url) map.set(img.url, img);
    }
    return Array.from(map.values());
  }

  const getDisplayImages = () => {
    const imgs = parseImagesField(destination?.images);
    return [...imgs].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  };

  const imagesToDisplay = getDisplayImages();
  const [existingImages, setExistingImages] = useState(() =>
    parseImagesField(destination?.images)
  );
  const [newImages, setNewImages] = useState([]);
  useEffect(() => {
    setExistingImages(parseImagesField(destination?.images));
    setNewImages([]);
  }, [destination]);

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

  const [openUpdate, setOpenUpdate] = useState(false);
  const [name, setName] = useState(destination?.name);
  const [country, setCountry] = useState(destination?.country);
  const [region, setRegion] = useState(destination?.region);
  const [description, setDescription] = useState(destination?.description);
  const [bestSeason, setBestSeason] = useState(destination?.best_season);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    setName(destination?.name || "");
    setCountry(destination?.country || "");
    setRegion(destination?.region || "");
    setDescription(destination?.description || "");
    setBestSeason(destination?.best_season || "");
  }, [destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const combined = [
        ...existingImages.map((img) => ({ type: "existing", url: img.url, isDefault: !!img.isDefault })),
        ...newImages.map((n) => ({ type: "new", preview: n.preview, isDefault: !!n.isDefault })),
      ];
      const defaultIndex = combined.findIndex((c) => c.isDefault);
      const finalDefaultIndex = defaultIndex === -1 ? 0 : defaultIndex;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("country", country);
      formData.append("region", region);
      formData.append("description", description);
      formData.append("best_season", bestSeason);

      formData.append("keepImages", JSON.stringify(existingImages || []));

      newImages.forEach((n) => {
        formData.append("images", n.file);
      });

      formData.append("defaultImageIndex", String(finalDefaultIndex));

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/update/${destination?.id}`,
        formData,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Updated");
        setOpenUpdate(false);
        window.location.reload();
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      if (err?.response?.data?.message) toast.error(err.response.data.message);
      else toast.error(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/destination/delete/${destination?.id}`,
        {
          withCredentials: true,
        }
      );
      if (res.data?.success) {
        toast.success(res.data.message);
        window.location.reload();
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="rounded-3xl bg-[#f5f5f5] p-3 flex flex-col w-72  pb-4 hover:shadow-lg transition-shadow duration-300 h-95 justify-between">
      <div className="flex flex-col gap-y-3">
        <div className="w-full h-44 overflow-hidden rounded-2xl">
          <Swiper navigation={true}>
            {imagesToDisplay &&
              imagesToDisplay.map((image, index) => (
                <SwiperSlide key={image.url + index}>
                  <div
                    className="h-44"
                    style={{
                      background: `url(${image.url}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  />
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
            <div className="absolute top-4 right-4 " onClick={() => setOpenUpdate(false)}>
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

                <input
                  id={`newImages-${destination?.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="mt-2">
                  <label
                    htmlFor={`newImages-${destination?.id}`}
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
