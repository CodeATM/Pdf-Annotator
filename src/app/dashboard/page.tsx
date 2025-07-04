import AppLayout from "@/components/molecues/global/Applayout";
import React from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "./data.json";

const page = () => {
  return (
    <div>
      <AppLayout>
        <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-6 px-4 lg:px-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </AppLayout>
    </div>
  );
};

export default page;
