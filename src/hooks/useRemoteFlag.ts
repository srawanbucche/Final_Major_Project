export function useRemoteFlag() {
  return Boolean((import.meta.env.VITE_API_BASE_URL ?? '').trim())
}
