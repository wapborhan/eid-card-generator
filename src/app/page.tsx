"use client";

import { Suspense } from "react";
import EidCardGenerator from "./components/EidCardGenerator";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EidCardGenerator />
    </Suspense>
  );
}
