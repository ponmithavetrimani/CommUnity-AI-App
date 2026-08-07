import React, {
  createContext,
  useContext,
  useState,
} from "react";

const JourneyContext =
  createContext<any>(null);

export const JourneyProvider = ({
  children,
}: any) => {
  const [journey, setJourney] =
    useState(null);

  return (
    <JourneyContext.Provider
      value={{
        journey,
        setJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourneyContext = () =>
  useContext(JourneyContext);