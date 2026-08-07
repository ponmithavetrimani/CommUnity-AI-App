import { ref, set } from "firebase/database";
import { db } from "../firebase";

export const updateLocation = (
  userId: string,
  name: string,
  latitude: number,
  longitude: number
) => {
  set(ref(db, "users/" + userId), {
    name,
    latitude,
    longitude,
  });
};