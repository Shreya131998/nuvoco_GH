// Guest house room list, from the GUEST_HOUSE_ROOMS env var. Rooms are typed as
// free text at check-in, so this list is what lets us tell which rooms are vacant.
// Format: comma-separated rooms and/or numeric ranges, e.g. "1-16" or "101-110,Suite A".
// Defaults to the guest house's 16 rooms (1–16) when the env var isn't set.

const DEFAULT_ROOMS = "1-16";

/** Canonical form used to match a typed room against the configured list. */
export function roomKey(room: string): string {
  return room.trim().toUpperCase().replace(/\s+/g, " ");
}

export function getConfiguredRooms(): string[] {
  const raw = process.env.GUEST_HOUSE_ROOMS?.trim() || DEFAULT_ROOMS;
  const rooms: string[] = [];
  for (const part of raw.split(",")) {
    const item = part.trim();
    if (!item) continue;
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(item);
    if (range) {
      const [from, to] = [parseInt(range[1], 10), parseInt(range[2], 10)];
      for (let n = Math.min(from, to); n <= Math.max(from, to); n++) {
        rooms.push(String(n));
      }
    } else {
      rooms.push(item);
    }
  }
  // De-duplicate while keeping the configured order.
  const seen = new Set<string>();
  return rooms.filter((r) => {
    const k = roomKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface RoomStatus {
  room: string;
  occupied: boolean;
  /** Guest names currently in the room (incl. second guests). */
  guests: string[];
  /** True when guests are in a room that isn't in GUEST_HOUSE_ROOMS. */
  unlisted?: boolean;
}

/** Build the room grid from the configured list and in-house guests. */
export function buildRoomStatus(
  inHouse: { room: string; name: string; secondPerson: string }[]
): RoomStatus[] {
  const guestsByRoom = new Map<string, { label: string; guests: string[] }>();
  for (const v of inHouse) {
    // One booking can cover several rooms, typed like "8+9" or "10 & 11".
    for (const part of v.room.split(/\s*(?:[+&,/]|\band\b)\s*/i)) {
      const label = part.trim();
      if (!label) continue;
      const k = roomKey(label);
      const entry = guestsByRoom.get(k) ?? { label, guests: [] };
      entry.guests.push(v.name);
      if (v.secondPerson?.trim()) entry.guests.push(v.secondPerson.trim());
      guestsByRoom.set(k, entry);
    }
  }

  const result: RoomStatus[] = getConfiguredRooms().map((room) => {
    const k = roomKey(room);
    const entry = guestsByRoom.get(k);
    guestsByRoom.delete(k);
    return { room, occupied: !!entry, guests: entry?.guests ?? [] };
  });

  // Occupied rooms typed at check-in that aren't in the configured list.
  for (const { label, guests } of guestsByRoom.values()) {
    result.push({ room: label, occupied: true, guests, unlisted: true });
  }
  return result;
}
