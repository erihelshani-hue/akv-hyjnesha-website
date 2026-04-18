import { getRequestConfig } from "next-intl/server";

// App is German-only; no locale routing.
export default getRequestConfig(async () => ({
  locale: "de",
  messages: (await import("../../messages/de.json")).default,
}));
