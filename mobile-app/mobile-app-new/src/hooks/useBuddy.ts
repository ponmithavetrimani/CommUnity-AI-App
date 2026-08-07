import { useState } from "react";

export default function useBuddy() {
  const [buddy, setBuddy] = useState<any>(null);

  const connectBuddy = (data: any) => {
    setBuddy(data);
  };

  const disconnectBuddy = () => {
    setBuddy(null);
  };

  return {
    buddy,
    connectBuddy,
    disconnectBuddy,
  };
}