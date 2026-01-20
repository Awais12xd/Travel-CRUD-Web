import express from "express"
import { createDestination, deleteDestination, getDestinations, searchDestinations, updateDestination } from "../controllers/destination.controller.js";
import { upload } from "../utils/multer.js";

const destinationRouter = express.Router();


destinationRouter.post("/create" ,  upload.array("images") , createDestination)
destinationRouter.get("/get-all" , getDestinations)
destinationRouter.get("/search"  , searchDestinations)
destinationRouter.put("/update/:id", updateDestination)
destinationRouter.delete("/delete/:id" , deleteDestination)

export default destinationRouter;
