/**
 * Baca respons JSON dari API kita dengan aman. Kalau server/platform
 * mengembalikan halaman error non-JSON (mis. timeout "An error occurred
 * ..."), `res.json()` biasa melempar "Unexpected token ... is not valid
 * JSON". Di sini diganti dengan pesan yang bisa dimengerti pengguna.
 */
export async function readJsonResponse<T = Record<string, unknown>>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // bukan JSON — ditangani di bawah
  }

  if (!res.ok) {
    const apiError =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : null;
    if (apiError) throw new Error(apiError);
    if (res.status === 504 || res.status === 408) {
      throw new Error("Server terlalu lama merespons. Coba lagi sebentar lagi.");
    }
    throw new Error(`${fallbackMessage} (kode ${res.status})`);
  }
  if (data === null || typeof data !== "object") {
    throw new Error(fallbackMessage);
  }
  return data as T;
}
