import ky from "ky";

let authToken: string | null = null;

/**
 * Call this once after login to persist the token.
 * The client will attach it to every request automatically.
 */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/**
 * Base HTTP client — all API calls go through here.
 * Centralizes auth, error handling, retries, and base URL.
 */
export const apiClient = ky.create({
  prefixUrl: process.env["EXPO_PUBLIC_API_BASE_URL"] ?? "http://localhost:3000",
  timeout: 30_000,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        if (authToken) {
          request.headers.set("Authorization", `Bearer ${authToken}`);
        }
        request.headers.set("Content-Type", "application/json");
        request.headers.set("Accept", "application/json");
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          console.error("[API Error]", response.status, body);
        }
      },
    ],
  },
});
