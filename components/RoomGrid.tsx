"use client";

import type { RoomStatus } from "@/lib/rooms";

/** Grid of guest house rooms: green = vacant, red = occupied. */
export default function RoomGrid({ rooms }: { rooms: RoomStatus[] | null }) {
  const listed = rooms?.filter((r) => !r.unlisted) ?? [];
  const unlisted = rooms?.filter((r) => r.unlisted) ?? [];
  const occupied = listed.filter((r) => r.occupied).length;
  const vacant = listed.length - occupied;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Room status</h2>
          <p className="text-xs text-slate-500">
            Vacant vs. currently occupied rooms
          </p>
        </div>
        {rooms && listed.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              {vacant} vacant
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
              {occupied} occupied
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {listed.length} total
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {rooms === null ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Loading rooms…
          </p>
        ) : listed.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No room list configured. Set <code>GUEST_HOUSE_ROOMS</code> (e.g.{" "}
            <code>1-16</code>) to see vacant rooms.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {listed.map((r) => (
              <RoomTile key={r.room} room={r} />
            ))}
          </div>
        )}

        {unlisted.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Occupied rooms not in the room list
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {unlisted.map((r) => (
                <RoomTile key={r.room} room={r} />
              ))}
            </div>
          </div>
        )}

        {listed.length > 0 && (
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <Legend className="border-emerald-200 bg-emerald-50" label="Vacant" />
            <Legend className="border-red-200 bg-red-50" label="Occupied" />
          </div>
        )}
      </div>
    </div>
  );
}

function RoomTile({ room }: { room: RoomStatus }) {
  const guests = room.guests.join(", ");
  return (
    <div
      title={room.occupied ? guests : "Vacant"}
      className={`rounded-lg border px-2 py-2 text-center ${
        room.occupied
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <p className="font-mono text-sm font-semibold">{room.room}</p>
      <p className="truncate text-[11px] opacity-80">
        {room.occupied ? guests || "Occupied" : "Vacant"}
      </p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded border ${className}`} />
      {label}
    </span>
  );
}
