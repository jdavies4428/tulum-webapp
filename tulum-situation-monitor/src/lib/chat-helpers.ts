/** Generate deterministic conversation ID for two users */
export function conversationIdFor(a: string, b: string): string {
  return [a, b].sort().join("_");
}

/** Get the other participant's user ID from a conversation */
export function otherParticipantId(
  participant1: string,
  participant2: string,
  currentUserId: string
): string {
  return participant1 === currentUserId ? participant2 : participant1;
}

/** Format relative timestamp for chat list */
export function formatChatTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Format time for message bubbles */
export function formatMessageTime(timestamp: number | string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format last seen */
export function formatLastSeen(timestamp: number | null | undefined): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 5) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;

  return new Date(timestamp).toLocaleDateString();
}
