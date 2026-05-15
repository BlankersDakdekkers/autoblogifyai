import { ReactNode, useEffect, useRef } from "react";
import { setPostHogClient } from "@/components/analytics/analytics";

interface PostHogProviderProps {
  children: ReactNode;
}

const CONSENT_STORAGE_KEYS = [
  "analytics_consent",
  "cookie_consent",
  "cookie-consent",
  "cookieConsent",
  "cookieconsent_status",
  "consent_preferences",
] as const;
const CONSENT_STORAGE_KEY_SET = new Set<string>(CONSENT_STORAGE_KEYS);

const CONSENT_ACCEPTED_VALUES = ["true", "accepted", "allow", "granted", "yes", "all"];

const shouldDebugLog = import.meta.env.DEV;

const parseConsentValue = (rawValue: string | null | undefined): boolean => {
  if (!rawValue) return false;

  const normalized = rawValue.trim().toLowerCase();
  if (CONSENT_ACCEPTED_VALUES.includes(normalized)) return true;

  try {
    const parsed = JSON.parse(rawValue);

    if (typeof parsed === "boolean") return parsed;
    if (typeof parsed === "string") return CONSENT_ACCEPTED_VALUES.includes(parsed.toLowerCase());

    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const candidates = [record.analytics, record.statistics, record.measurement, record.all];

      return candidates.some((value) => value === true || value === "true" || value === "accepted");
    }
  } catch {
    return false;
  }

  return false;
};

const decodeCookieValue = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const hasAnalyticsConsent = (): boolean => {
  if (typeof window === "undefined") return false;

  for (const key of CONSENT_STORAGE_KEYS) {
    const localValue = window.localStorage.getItem(key);
    if (parseConsentValue(localValue)) return true;

    const sessionValue = window.sessionStorage.getItem(key);
    if (parseConsentValue(sessionValue)) return true;
  }

  const consentCookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .map((cookie) => {
      const [rawKey, ...rawValueParts] = cookie.split("=");
      return {
        key: rawKey,
        value: rawValueParts.join("="),
      };
    })
    .filter((cookie) => CONSENT_STORAGE_KEY_SET.has(cookie.key));

  return consentCookies.some((cookie) => parseConsentValue(cookie.value ? decodeCookieValue(cookie.value) : null));
};

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const posthogKey = import.meta.env.NEXT_PUBLIC_POSTHOG_KEY as string | undefined;
    const posthogHost = import.meta.env.NEXT_PUBLIC_POSTHOG_HOST as string | undefined;

    if (!posthogKey || !posthogHost) return;

    const initializePostHog = async () => {
      if (hasInitializedRef.current || isInitializingRef.current || !hasAnalyticsConsent()) return;

      isInitializingRef.current = true;

      if (shouldDebugLog) {
        console.info("[analytics] consent accepted");
      }

      try {
        const posthogModule = await import("posthog-js");
        const posthog = posthogModule.default;

        posthog.init(posthogKey, {
          api_host: posthogHost,
          capture_pageview: true,
          capture_pageleave: true,
          persistence: "localStorage+cookie",
        });

        setPostHogClient(posthog);
        hasInitializedRef.current = true;

        if (shouldDebugLog) {
          console.info("[analytics] posthog initialized");
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    const handleConsentUpdate = () => {
      void initializePostHog();
    };

    void initializePostHog();

    window.addEventListener("storage", handleConsentUpdate);
    window.addEventListener("cookie-consent-accepted", handleConsentUpdate);
    window.addEventListener("cookieconsent:accepted", handleConsentUpdate);
    window.addEventListener("consent:accepted", handleConsentUpdate);
    window.addEventListener("analytics-consent-granted", handleConsentUpdate);

    return () => {
      window.removeEventListener("storage", handleConsentUpdate);
      window.removeEventListener("cookie-consent-accepted", handleConsentUpdate);
      window.removeEventListener("cookieconsent:accepted", handleConsentUpdate);
      window.removeEventListener("consent:accepted", handleConsentUpdate);
      window.removeEventListener("analytics-consent-granted", handleConsentUpdate);
    };
  }, []);

  return <>{children}</>;
};
