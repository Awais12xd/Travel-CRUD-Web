// import { connectDb } from "./config/db.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";


if(process.env.NODE_ENV !== "PRODUCTION"){
  dotenv.config({
    path:"./.env",
})
}

process.on("uncaughtException" , err => {
  console.log(`Error :` , err.message);
  console.log("Shutting down the server due to the uncaughtExceptions");
})

const PORT = process.env.PORT || 4000;

connectDb()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    

    process.on("unhandledRejection", err => {
      console.log(`Error :`, err.message);
      console.log("Shutting down the server due to the unhandledRejection");

      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.log("error during using connectDb :", error);
  });

