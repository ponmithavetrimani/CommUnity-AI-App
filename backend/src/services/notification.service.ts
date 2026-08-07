export const sendPushNotification =
  async (
    title: string,
    message: string
  ) => {
    console.log(
      `Notification: ${title} - ${message}`
    );

    return true;
  };

export const notifyEmergencyContacts =
  async (
    contacts: string[],
    location: any
  ) => {
    return {
      notified: true,
      contacts,
      location,
    };
  };