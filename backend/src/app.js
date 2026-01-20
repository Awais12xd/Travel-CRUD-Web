import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import { errorMiddle } from "./middlewares/error.middleware.js";
import destinationRouter from "./routes/destination.routes.js";
import tourRouter from "./routes/tour.routes.js";



const app = express();

if(process.env.NODE_ENV !== "PRODUCTION"){
  dotenv.config({
    path:"./.env",
})
}


//cors config
const corsOptions = {
  origin: [ "https://travel-crud-web.vercel.app" ,  "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

//Middlewears
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
app.use("/api/destination" , destinationRouter);
app.use("/api/tour" , tourRouter);

//error handling
app.use(errorMiddle);

export {app}

