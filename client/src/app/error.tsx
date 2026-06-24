"use client";

import { ErrorScreen } from "@/components/states/error-screen";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorScreen reset={reset} />;
}
