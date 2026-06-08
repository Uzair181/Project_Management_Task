"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { BrandLoader } from "@/components/ui/Loaders";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hydrated, router, token]);

  return <BrandLoader title="Loading Flowboard" subtitle="Preparing your workspace and checking your session." />;
}
