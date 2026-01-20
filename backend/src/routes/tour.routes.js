import express from "express"
import { createTour, deleteTour, getTours, searchTours, updateTour } from "../controllers/tour.controller.js";
import { upload } from "../utils/multer.js";

const tourRouter = express.Router();


tourRouter.post("/create" ,  upload.array("images") , createTour)
tourRouter.get("/get-all"  , getTours)
tourRouter.put("/update/:id" ,  upload.array("images") , updateTour)
tourRouter.get("/search"  , searchTours)
tourRouter.delete("/delete/:id"  , deleteTour)

export default tourRouter;
