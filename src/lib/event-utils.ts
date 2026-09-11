export function formatEventType(eventType?: string) {
  if (!eventType) return "Unknown";
  const label = eventType
    .split("_")
    .map((part) => part.toLowerCase())
    .join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatEntityType(entityType: string) {
  return entityType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
