"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SERVICE_CATEGORIES, type ServiceCategoryId } from "@/lib/services";
import { cn } from "@/lib/utils";

/** Category filter as links, so every view is deep-linkable and back/forward friendly. */
export function CategoryTabs({ active }: { active: ServiceCategoryId }) {
  return (
    <nav aria-label="Service categories" className="-mx-4 overflow-x-auto px-4">
      <ul className="inline-flex gap-1 rounded-full border hairline bg-ink-850 p-1.5">
        {SERVICE_CATEGORIES.map((category) => {
          const isActive = category.id === active;
          return (
            <li key={category.id}>
              <Link
                href={category.id === "all" ? "/services" : `/services?category=${category.id}`}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors duration-150",
                  isActive ? "text-ink-950" : "text-cream-muted hover:text-cream",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="service-category-pill"
                    className="absolute inset-0 rounded-full bg-gold-300"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                ) : null}
                <span className="relative">{category.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
