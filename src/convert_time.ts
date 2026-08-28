export function convertTime(rawTimeFormat: string) {
  return new Date(rawTimeFormat).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
