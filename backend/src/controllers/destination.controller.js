import pool from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadMultipleToCloudinary } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createDestination = async (req, res, next) => {
  const { name, country, region, description, best_season } = req.body;

  if (!name || !country) {
    return res.status(400).json({ error: "Name and country are required" });
  }

  const files = req.files;
  if (!files || files.length === 0) {
    return next(new errorHandler("Please upload at least one image", 400));
  }

  const cloudinaryResults = await uploadMultipleToCloudinary(files);
  const images = cloudinaryResults.map((result) => result.url);

  try {
    const result = await pool.query(
      `INSERT INTO destinations 
        (name, country, region, description, images, best_season)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        country,
        region || null,
        description || null,
        JSON.stringify(images),
        best_season || null,
      ],
    );

    res
      .status(201)
      .json(
        new apiResponse(
          201,
          "Destination created successfully!",
          result.rows[0],
        ),
      );
  } catch (err) {
    return next(new errorHandler("Error while creating destination", 500));
  }
};

export const getDestinations = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM destinations ORDER BY created_at DESC",
    );
    res
      .status(200)
      .json(
        new apiResponse(201, "Destinations Found Successfully", result.rows),
      );
  } catch (err) {
    return next(new errorHandler("Error while getting all destinations", 500));
  }
};

export const getDestinationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM destinations WHERE id=$1", [
      id,
    ]);
    if (!result.rows[0])
      return res.status(404).json({ error: "Destination not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

export const updateDestination = async (req, res, next) => {
  console.log("req is coming");
  console.log(req.params);
  console.log(req.body);
  const { id } = req.params;
  const { name, country, region, keepImages , description, best_season } = req.body;

  let safeImages;
  const files = req.files;
  if (!files || files.length === 0) {
    console.log("No images to upload on cloudinary")
    safeImages = keepImages;
  } else {
    const cloudinaryResults = await uploadMultipleToCloudinary(files);
    const images = cloudinaryResults.map((result) => result.url);
    const imagesJSON = JSON.stringify(images);
    const newImages = keepImages + imagesJSON;
    safeImages = JSON.stringify(newImages);
  }

  try {
    const result = await pool.query(
      `UPDATE destinations
       SET name = COALESCE($1, name),
           country = COALESCE($2, country),
           region = COALESCE($3, region),
           description = COALESCE($4, description),
           best_season = COALESCE($5, best_season),
           images = COALESCE($6, images),
           updated_at = NOW()
       WHERE id=$7
       RETURNING *`,
      [
        name,
        country,
        region || null,
        description || null,
        best_season || null,
        safeImages,
        id || null,
      ],
    );
    console.log(result);

    if (!result.rows[0])
      return res.status(404).json({ error: "Destination not found" });
    res
      .status(201)
      .json(
        new apiResponse(
          201,
          "Destination Updated Successfully!",
          result.rows[0],
        ),
      );
  } catch (err) {
    return next(new errorHandler("Error while updating destination", 500));
  }
};


export const searchDestinations = async (req, res , next) => {
  console.log("req is coming")
  const { name, country, best_season, sort } = req.query;

  let query = `SELECT * FROM destinations WHERE 1=1`;
  const values = [];
  let index = 1;

  if (name) {
    query += ` AND name ILIKE $${index++}`;
    values.push(`%${name}%`);
  }

  if (country) {
    query += ` AND country ILIKE $${index++}`;
    values.push(`%${country}%`);
  }

  if (best_season) {
    query += ` AND best_season ILIKE $${index++}`;
    values.push(`%${best_season}%`);
  }

  if (sort === 'latest') {
    query += ` ORDER BY created_at DESC`;
  } else if (sort === 'oldest') {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`; // 
  }

  try {
    const result = await pool.query(query, values);
    res.status(201).json(new apiResponse(201 , "Destinations Found Successfully!" , result.rows))

  } catch (err) {
    return next(new errorHandler("Error while searching destination", 500));

  }
};


export const deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM destinations WHERE id=$1 RETURNING *",
      [id],
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "Destination not found" });

    res
      .status(201)
      .json(
        new apiResponse(
          201,
          "Destination Deleted Successfully!",
          result.rows[0],
        ),
      );
  } catch (err) {
    return next(new errorHandler("Error while updating destination", 500));
  }
};
