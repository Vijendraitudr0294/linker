const ONBOARDING_PREFIX = "lv:onboarding:";

const getStorageKey = (userId: string) => `${ONBOARDING_PREFIX}${userId}`;

export const isOnboardingComplete = (userId: string | undefined | null): boolean => {
  if (typeof window === "undefined" || !userId) return false;
  return window.localStorage.getItem(getStorageKey(userId)) === "done";
};

export const markOnboardingComplete = (userId: string | undefined | null) => {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(getStorageKey(userId), "done");
};

export const clearOnboardingComplete = (userId: string | undefined | null) => {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.removeItem(getStorageKey(userId));
};
