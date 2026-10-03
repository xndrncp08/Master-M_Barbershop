export const BARBERS = [
  {
    id: "any",
    name: "Any Available",
    description: "First open chair — the fastest way in.",
  },
  {
    id: "master",
    name: "Master Barber",
    description: "Signature fades, classic cuts & straight-razor work.",
  },
  {
    id: "senior",
    name: "Senior Stylist",
    description: "Modern styling, textured cuts & beard sculpting.",
  },
] as const;

export type BarberId = (typeof BARBERS)[number]["id"];
/** Barbers that actually hold appointments ("any" resolves to one of these). */
export type ChairBarberId = Exclude<BarberId, "any">;

export const BARBER_IDS = BARBERS.map((b) => b.id) as [BarberId, ...BarberId[]];
export const CHAIR_BARBER_IDS: ChairBarberId[] = ["master", "senior"];

export function getBarber(id: string | null | undefined) {
  return BARBERS.find((b) => b.id === id);
}
