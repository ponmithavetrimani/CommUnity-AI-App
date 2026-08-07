import axios from "axios";

export default axios.create({
  baseURL: "http://10.56.6.130:5000/api",
});