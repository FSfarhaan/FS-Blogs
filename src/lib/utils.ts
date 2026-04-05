export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatViewCount(value?: number | null) {
  const normalizedValue = Math.max(0, Math.round(value ?? 0));

  if (normalizedValue < 1000) {
    return normalizedValue.toLocaleString();
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(normalizedValue);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const tagTones = [
  {
    backgroundColor: "rgba(239, 109, 67, 0.16)",
    borderColor: "rgba(239, 109, 67, 0.3)",
    color: "#d96c46",
  },
  {
    backgroundColor: "rgba(107, 91, 210, 0.16)",
    borderColor: "rgba(107, 91, 210, 0.3)",
    color: "#7d69f2",
  },
  {
    backgroundColor: "rgba(78, 176, 127, 0.16)",
    borderColor: "rgba(78, 176, 127, 0.3)",
    color: "#49a66f",
  },
  {
    backgroundColor: "rgba(91, 166, 255, 0.16)",
    borderColor: "rgba(91, 166, 255, 0.3)",
    color: "#4f97f0",
  },
  {
    backgroundColor: "rgba(255, 181, 71, 0.18)",
    borderColor: "rgba(255, 181, 71, 0.34)",
    color: "#db8d1f",
  },
  {
    backgroundColor: "rgba(237, 101, 170, 0.16)",
    borderColor: "rgba(237, 101, 170, 0.28)",
    color: "#d55897",
  },
];

export function getTagTone(tag: string, index = 0) {
  const normalizedTag = tag.trim().toLowerCase();
  const hash = normalizedTag.split("").reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return tagTones[(hash + index) % tagTones.length];
}

const notionColorTones: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
  default: {
    backgroundColor: "rgba(245, 239, 232, 0.08)",
    borderColor: "rgba(245, 239, 232, 0.18)",
    color: "#f3ddca",
  },
  gray: {
    backgroundColor: "rgba(148, 163, 184, 0.14)",
    borderColor: "rgba(148, 163, 184, 0.24)",
    color: "#cbd5e1",
  },
  brown: {
    backgroundColor: "rgba(180, 120, 90, 0.16)",
    borderColor: "rgba(180, 120, 90, 0.28)",
    color: "#e7c7b6",
  },
  orange: {
    backgroundColor: "rgba(239, 109, 67, 0.16)",
    borderColor: "rgba(239, 109, 67, 0.3)",
    color: "#ffb091",
  },
  yellow: {
    backgroundColor: "rgba(255, 181, 71, 0.18)",
    borderColor: "rgba(255, 181, 71, 0.32)",
    color: "#ffd38a",
  },
  green: {
    backgroundColor: "rgba(78, 176, 127, 0.16)",
    borderColor: "rgba(78, 176, 127, 0.3)",
    color: "#9cdfb7",
  },
  blue: {
    backgroundColor: "rgba(91, 166, 255, 0.16)",
    borderColor: "rgba(91, 166, 255, 0.3)",
    color: "#9ed0ff",
  },
  purple: {
    backgroundColor: "rgba(141, 115, 255, 0.16)",
    borderColor: "rgba(141, 115, 255, 0.3)",
    color: "#c0b0ff",
  },
  pink: {
    backgroundColor: "rgba(237, 101, 170, 0.16)",
    borderColor: "rgba(237, 101, 170, 0.28)",
    color: "#ffaad0",
  },
  red: {
    backgroundColor: "rgba(239, 92, 92, 0.16)",
    borderColor: "rgba(239, 92, 92, 0.3)",
    color: "#ffaaaa",
  },
};

export function getNotionTagTone(color?: string | null, fallbackTag?: string) {
  const normalizedColor = color?.trim().toLowerCase();

  if (normalizedColor && normalizedColor in notionColorTones) {
    return notionColorTones[normalizedColor];
  }

  if (fallbackTag) {
    return getTagTone(fallbackTag);
  }

  return notionColorTones.default;
}

export function absoluteUrl(path = "") {
  return new URL(path, `${siteOrigin()}/`).toString();
}

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
