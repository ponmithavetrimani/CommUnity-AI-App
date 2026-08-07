import { useState } from "react";

export default function useJourney() {
  const [journey, setJourney] = useState({
    source: "",
    destination: "",
    status: "inactive",
  });

  const startJourney = (
    source: string,
    destination: string
  ) => {
    setJourney({
      source,
      destination,
      status: "active",
    });
  };

  const endJourney = () => {
    setJourney((prev) => ({
      ...prev,
      status: "completed",
    }));
  };

  return {
    journey,
    startJourney,
    endJourney,
  };
}