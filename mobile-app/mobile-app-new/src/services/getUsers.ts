import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const listenUsers = (
  callback: (users: any[]) => void
) => {
  const usersRef = ref(db, "users");

  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      callback(Object.values(data));
    } else {
      callback([]);
    }
  });
};