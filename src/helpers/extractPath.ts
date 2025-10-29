export function extractSupabasePath(publicUrl: string): string {
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : "";
}
