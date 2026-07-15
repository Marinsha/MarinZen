const STORAGE_KEY = "marinzen_personalization";

export const savePersonalization = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving personalization data to localStorage:", error);
  }
};

export const getPersonalization = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(
      "Error reading personalization data from localStorage:",
      error,
    );
    return null;
  }
};

export const clearPersonalization = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "Error clearing personalization data from localStorage:",
      error,
    );
  }
};
