import pool from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadMultipleToCloudinary } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createTour = async (req, res, next) => {
  console.log("req is coming ");
  const {
    title,
    price,
    duration_days,
    destination_id,
    itinerary,
    inclusions,
    exclusions,
    max_group_size,
    defaultImageIndex
  } = req.body;

  const itineraryJSON = JSON.stringify(itinerary);
  const inclusionsJSON = JSON.stringify(inclusions);
  const exclusionsJSON = JSON.stringify(exclusions);

  if (!title || !price || !duration_days || !destination_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const files = req.files;
  if (!files || files.length === 0) {
    return next(new errorHandler("Please upload at least one image", 400));
  }

  const cloudinaryResults = await uploadMultipleToCloudinary(files);
   const images = cloudinaryResults.map((result, index) => ({
    url: result.url,
    isDefault: Number(defaultImageIndex) === index,
  }));

  if (!images.some((img) => img.isDefault)) {
    images[0].isDefault = true;
  }
  const imagesJSON = JSON.stringify(images);

  try {
    const result = await pool.query(
      `INSERT INTO tours
        (title, price, duration_days, destination_id, itinerary, inclusions, exclusions, max_group_size,  images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        title,
        price,
        duration_days,
        destination_id,
        itineraryJSON || [],
        inclusionsJSON || [],
        exclusionsJSON || [],
        max_group_size || null,
        imagesJSON || [],
      ],
    );

    res
      .status(201)
      .json(new apiResponse(201, "Tour created successfully!", result.rows[0]));
  } catch (err) {
    return next(new errorHandler("Error while creating tour", 500));
  }
};

export const getTours = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, d.name as destination_name
       FROM tours t
       JOIN destinations d ON t.destination_id = d.id
       ORDER BY t.created_at DESC`,
    );
    res
      .status(201)
      .json(new apiResponse(201, "Tours found successfully!", result.rows));
  } catch (err) {
    return next(new errorHandler("Error while getting all tour", 500));
  }
};

// GET single tour by ID
export const getTourById = async (req, res , next) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tours WHERE id=$1", [id]);
    if (!result.rows[0])
      return res.status(404).json({ error: "Tour not found" });
    res
      .status(201)
      .json(new apiResponse(201, "Tour found successfully!", result.rows));
  } catch (err) {
    return next(new errorHandler("Error while getting tour by id", 500));
  }
};

export const updateTour = async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    price,
    duration_days,
    keepImages,
    itinerary,
    inclusions,
    exclusions,
    max_group_size,
    defaultImageIndex
  } = req.body;
  console.log(req.body);

  let safeImages;
  const files = req.files;
  if (!files || files.length === 0) {
    console.log("No images to upload on cloudinary")
    safeImages = keepImages;
  } else {
    const cloudinaryResults = await uploadMultipleToCloudinary(files);
    const images = cloudinaryResults.map((result, index) => ({
      url: result.url,
      isDefault: false,
    }));
    const imagesJSON = JSON.stringify(images);
    const newImages = keepImages + imagesJSON;
    safeImages = JSON.stringify(newImages);
  }

  try {
    const result = await pool.query(
      `UPDATE tours
       SET title = COALESCE($1, title),
           price = COALESCE($2, price),
           duration_days = COALESCE($3, duration_days),
           itinerary = COALESCE($4, itinerary),
           inclusions = COALESCE($5, inclusions),
           exclusions = COALESCE($6, exclusions),
           max_group_size = COALESCE($7, max_group_size),
           images = COALESCE($8, images),
           updated_at = NOW()
       WHERE id=$9
       RETURNING *`,
      [
        title,
        price,
        duration_days,
        itinerary,
        inclusions,
        exclusions,
        max_group_size,
        safeImages,
        id,
      ],
    );

    if (!result.rows[0])
      return res.status(404).json({ error: "Tour not found" });
    res
      .status(201)
      .json(new apiResponse(201, "Tour Updated successfully!", result.rows[0]));
  } catch (err) {
    return next(new errorHandler(`Error while updating tour ${err}`, 500));
  }
};

export const deleteTour = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tours WHERE id=$1 RETURNING *",
      [id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Tour not found" });

    res
      .status(201)
      .json(new apiResponse(201, "Tour Deleted successfully!", result.rows[0]));
  } catch (err) {
    return next(new errorHandler("Error while deleting tour", 500));
  }
};

export const searchTours = async (req, res, next) => {
  const { name, duration_days, max_group_size, destination_id, sort } =
    req.query;

  let query = `
    SELECT
      t.*,
      d.name AS destination_name
    FROM tours t
    LEFT JOIN destinations d ON t.destination_id = d.id
    WHERE 1=1
  `;
  const values = [];
  let idx = 1;

  if (name) {
    query += ` AND t.title ILIKE $${idx++}`;
    values.push(`%${name}%`);
  }

  if (duration_days) {
    // exact match (you can change to range if needed)
    query += ` AND t.duration_days = $${idx++}`;
    values.push(Number(duration_days));
  }

  if (max_group_size) {
    // filter tours with max_group_size >= provided number
    query += ` AND t.max_group_size >= $${idx++}`;
    values.push(Number(max_group_size));
  }

  if (destination_id) {
    query += ` AND t.destination_id = $${idx++}`;
    values.push(destination_id);
  }

  // Sorting
  if (sort === "latest") {
    query += ` ORDER BY t.created_at DESC`;
  } else if (sort === "oldest") {
    query += ` ORDER BY t.created_at ASC`;
  } else if (sort === "price_desc") {
    query += ` ORDER BY t.price DESC`;
  } else if (sort === "price_asc") {
    query += ` ORDER BY t.price ASC`;
  } else {
    query += ` ORDER BY t.created_at DESC`;
  }

  try {
    const result = await pool.query(query, values);
    return res
      .status(201)
      .json(new apiResponse(201, "Tours Found Successfully!", result.rows));
  } catch (err) {
    console.error("searchTours error:", err);
    return next(new errorHandler("Error while searching tours", 500));
  }
};
