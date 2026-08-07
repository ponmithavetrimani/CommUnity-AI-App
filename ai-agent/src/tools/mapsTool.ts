import axios from "axios";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY;

export class MapsTool {
  static async getRoute(
    source: string,
    destination: string
  ) {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        {
          params: {
            origin: source,
            destination,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async calculateETA(
    source: string,
    destination: string
  ) {
    const route =
      await this.getRoute(
        source,
        destination
      );

    return route?.routes?.[0]?.legs?.[0]
      ?.duration?.text;
  }
}