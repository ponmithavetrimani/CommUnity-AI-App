import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  return status === "granted";
};

export const getCurrentLocation = async () => {
  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

export const watchLocation = async (
  callback: (location: any) => void
) => {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 15000,
    },
    (location) => {
      callback(location);
    }
  );
};