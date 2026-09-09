export const atlasNavigationItems = [
  { href: "/brands", label: "Brands" },
  { href: "/manufacturers", label: "Manufacturers" },
  { href: "/technologies", label: "Technologies" },
  { href: "/events", label: "Events" },
] as const;

export const primaryNavigationItems = [
  { href: "/news", label: "News" },
  { href: "/vehicles", label: "Vehicles" },
  ...atlasNavigationItems,
] as const;
