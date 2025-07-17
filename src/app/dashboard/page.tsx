"use client"
import AppLayout from "@/components/molecues/global/Applayout";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import TableFilters from "@/components/molecues/global/TableFilters";
import { useDataTableStore } from "@/hooks/stores/useDataTableStore";

const page = () => {
  // Ensure skeleton shows immediately on navigation/reload
  const { loading, setLoading } = useDataTableStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setLoading(true); // Always start in loading state
    setIsInitialLoad(true);
    // Wait for the first data fetch to complete
    const timeout = setTimeout(() => setIsInitialLoad(false), 1000); // fallback in case fetch is too fast
    return () => clearTimeout(timeout);
  }, [setLoading]);

  return (
    <div>
      <AppLayout>
        <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-6 px-4 lg:px-6">
          <TableFilters />
          <DataTable forceInitialLoading={isInitialLoad} />
        </div>
      </AppLayout>
    </div>
  );
};

export default page;
