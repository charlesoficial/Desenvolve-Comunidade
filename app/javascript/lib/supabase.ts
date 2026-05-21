const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type SupabaseRequestOptions = RequestInit & {
  schema?: string;
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseUrl() {
  return supabaseUrl;
}

export function getSupabaseAnonKey() {
  return supabaseAnonKey;
}

export async function supabaseRest<T>(path: string, options: SupabaseRequestOptions = {}): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase client is not configured");
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path.replace(/^\//, "")}`;
  const { schema, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  headers.set("apikey", supabaseAnonKey);
  headers.set("Authorization", `Bearer ${supabaseAnonKey}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (schema) {
    headers.set("Accept-Profile", schema);
    headers.set("Content-Profile", schema);
  }

  const controller = fetchOptions.signal ? undefined : new AbortController();
  const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : undefined;

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || controller?.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function supabaseStorageUpload(bucket: string, path: string, file: File) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase client is not configured");
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${path}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase storage upload failed (${response.status}): ${message}`);
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}
