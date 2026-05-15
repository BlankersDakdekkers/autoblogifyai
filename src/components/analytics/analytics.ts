import type { PostHog } from "posthog-js";

export const TRACKED_ANALYTICS_EVENTS = [
  "generate_lead",
  "phone_click",
  "whatsapp_click",
  "offerte_aanvraag",
  "contact_form_submit",
] as const;

export type TrackedAnalyticsEvent = (typeof TRACKED_ANALYTICS_EVENTS)[number];

let posthogClient: PostHog | null = null;
let posthogEnabled = false;

const shouldDebugLog = import.meta.env.DEV;

export const setPostHogClient = (client: PostHog) => {
  posthogClient = client;
  posthogEnabled = true;
};

export const isPostHogReady = () => posthogEnabled && Boolean(posthogClient);

export const trackAnalyticsEvent = (
  event: TrackedAnalyticsEvent,
  properties?: Record<string, unknown>,
) => {
  if (!isPostHogReady()) return;

  posthogClient?.capture(event, properties);

  if (shouldDebugLog) {
    console.info("[analytics] event tracked", event, properties ?? {});
  }
};

