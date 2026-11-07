const baseUrl = (import.meta.env?.VITE_API_URL || "/api/saas").replace(/\/$/, "");
const tokenKey = "saas-crm-api-token";
export const getToken = () => globalThis.sessionStorage?.getItem(tokenKey) || null;
export function setToken(token) {
  if (token) globalThis.sessionStorage?.setItem(tokenKey, token);
  else globalThis.sessionStorage?.removeItem(tokenKey);
}
export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${baseUrl}/${path}`, {
    ...options,
    credentials: "omit",
    signal: options.signal || AbortSignal.timeout(30000),
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!result || typeof result !== "object") {
    const error = new Error(
      "The API returned an invalid response. Check the server URL and development proxy.",
    );
    error.status = response.status;
    throw error;
  }
  if (!response.ok || !result.success) {
    if (response.status === 401 && token && token === getToken()) {
      setToken(null);
      globalThis.window?.dispatchEvent(new Event("saas-session-expired"));
    }
    const error = new Error(result.message || result.data?.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}

export async function downloadInvoice(id, number) {
  const response = await fetch(`${baseUrl}/billing/${id}/pdf`, {
    credentials: "omit",
    headers: { Authorization: `Bearer ${getToken()}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error("Unable to download invoice.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `${number}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
