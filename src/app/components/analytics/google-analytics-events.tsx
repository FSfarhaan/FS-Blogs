"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = {
  measurementId: string;
};

export function GoogleAnalyticsEvents({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartRef = useRef(0);

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag?.("config", measurementId, {
      page_path: pagePath,
    });
    window.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });

    pageStartRef.current = Date.now();

    return () => {
      const secondsOnPage = Math.max(
        1,
        Math.round((Date.now() - pageStartRef.current) / 1000),
      );

      window.gtag?.("event", "time_on_page", {
        page_path: pagePath,
        page_title: document.title,
        value: secondsOnPage,
      });
    };
  }, [measurementId, pathname, searchParams]);

  useReportWebVitals((metric) => {
    const value =
      metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);

    window.gtag?.("event", metric.name, {
      value,
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
