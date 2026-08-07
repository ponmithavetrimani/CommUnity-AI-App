import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const current =
        await Location.getCurrentPositionAsync({});

      setLocation(current.coords);
    })();
  }, []);

  return location;
}