export const SERVICE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "cuts", label: "Cuts" },
  { id: "beard", label: "Beard" },
  { id: "shave", label: "Shaves" },
  { id: "combos", label: "Combos" },
] as const;

export type ServiceCategoryId = (typeof SERVICE_CATEGORIES)[number]["id"];
export type ServiceCategory = Exclude<ServiceCategoryId, "all">;

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  /** Price in Canadian dollars. */
  priceCad: number;
  durationMin: number;
  description: string;
  /** Shown first in the booking engine's service step. */
  featured?: boolean;
}

// Prices are placeholders pending confirmation from the shop.
export const SERVICES = [
  {
    id: "haircut",
    name: "Haircut",
    category: "cuts",
    priceCad: 35,
    durationMin: 30,
    description: "Consultation, precision scissor or clipper cut, wash & style.",
    featured: true,
  },
  {
    id: "fade-line-up",
    name: "Fade & Line Up",
    category: "cuts",
    priceCad: 40,
    durationMin: 45,
    description: "Skin, low, mid or high fade blended seamlessly with a razor-sharp line up.",
  },
  {
    id: "kids-cut",
    name: "Kids Cut (12 & Under)",
    category: "cuts",
    priceCad: 28,
    durationMin: 30,
    description: "A patient, clean cut for young clients.",
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    category: "beard",
    priceCad: 20,
    durationMin: 15,
    description: "Shape-up & length trim with clean neck and cheek lines.",
  },
  {
    id: "beard-grooming",
    name: "Beard Grooming",
    category: "beard",
    priceCad: 30,
    durationMin: 30,
    description: "Full beard sculpting with straight-razor edges, hot towel & beard oil.",
    featured: true,
  },
  {
    id: "hot-towel-shave",
    name: "Hot Towel Shave",
    category: "shave",
    priceCad: 40,
    durationMin: 45,
    description: "Traditional straight-razor shave with hot towels, lather & cooling balm.",
    featured: true,
  },
  {
    id: "head-shave",
    name: "Head Shave",
    category: "shave",
    priceCad: 35,
    durationMin: 30,
    description: "Smooth straight-razor head shave finished with a hot towel.",
  },
  {
    id: "cut-and-beard",
    name: "Cut & Beard Trim",
    category: "combos",
    priceCad: 50,
    durationMin: 45,
    description: "Haircut paired with a beard trim for a matched, finished look.",
  },
  {
    id: "executive-combo",
    name: "Executive Combo",
    category: "combos",
    priceCad: 75,
    durationMin: 75,
    description: "Haircut, full beard grooming & hot towel finish — the complete experience.",
    featured: true,
  },
] as const satisfies readonly Service[];

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SERVICE_IDS = SERVICES.map((s) => s.id) as [ServiceId, ...ServiceId[]];

export function getService(id: string | null | undefined): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function isServiceCategoryId(value: unknown): value is ServiceCategoryId {
  return SERVICE_CATEGORIES.some((c) => c.id === value);
}

/** Resolve a `?category=` query value, falling back to "all" for anything unknown. */
export function resolveCategory(value: string | string[] | null | undefined): ServiceCategoryId {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim().toLowerCase();
  return isServiceCategoryId(normalized) ? normalized : "all";
}

export function getServicesByCategory(category: ServiceCategoryId): Service[] {
  return category === "all" ? [...SERVICES] : SERVICES.filter((s) => s.category === category);
}

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(priceCad: number): string {
  return cadFormatter.format(priceCad);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}
