import axios from "axios";
import { toast } from "react-toastify";



export const getTours = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/tour/get-all`
        );
        if (res.data.success) {
          return res.data.data;
        }
        if (res.data.success === false) {
          toast.error(res.data.message);
        }
      } catch (err) {
        console.log("error while getting all tours.");
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error(err.message);
        }
      }
};