import Image from "next/image";
import logo from "@/MasterM/logo/Master M Barbershop Emblem.png";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size: number;
  className?: string;
  priority?: boolean;
  /** Pass an empty string when adjacent text already names the brand. */
  alt?: string;
}

/** The Master M emblem, sourced directly from the brand asset folder. */
export function BrandLogo({ size, className, priority = false, alt = SITE.logo.alt }: BrandLogoProps) {
  return (
    <Image
      src={logo}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}
