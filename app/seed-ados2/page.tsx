"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { seedAdos2LocalStorage } from "@/lib/ados2-seed-localstorage";

export default function SeedAdos2Page() {
  const router = useRouter();

  useEffect(() => {
    seedAdos2LocalStorage();
    router.replace("/");
  }, [router]);

  return null;
}
