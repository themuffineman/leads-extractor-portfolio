"use client";
import Button from "@/components/Button";
import LeadsTable from "@/components/LeadTable";
import { useState } from "react";
const mockLeads = [
  {
    id: "1",
    businessName: "Acme Corporation",
    website: "acmecorp.com",
    phone: "(555) 123-4567",
  },
  {
    id: "2",
    businessName: "TechVision Inc.",
    website: "techvision.io",
    phone: "(555) 234-5678",
  },
  {
    id: "3",
    businessName: "Global Enterprises",
    website: "globalent.com",
    phone: "(555) 345-6789",
  },
  {
    id: "4",
    businessName: "InnovateTech Solutions",
    website: "innovatetech.co",
    phone: "(555) 456-7890",
  },
  {
    id: "5",
    businessName: "Sunrise Retail Group",
    website: "sunriseretail.net",
    phone: "(555) 567-8901",
  },
  {
    id: "6",
    businessName: "FutureTech Systems",
    website: "futuretech.co",
    phone: "(555) 678-9012",
  },
  {
    id: "7",
    businessName: "Evergreen Solutions",
    website: "evergreensol.com",
    phone: "(555) 789-0123",
  },
  {
    id: "8",
    businessName: "Pacific Dynamics",
    website: "pacificdyn.org",
    phone: "(555) 890-1234",
  },
  {
    id: "9",
    businessName: "NexGen Media",
    website: "nexgenmedia.com",
    phone: "(555) 901-2345",
  },
  {
    id: "10",
    businessName: "Urban Outfitters",
    website: "urbanoutfitters.com",
    phone: "(555) 012-3456",
  },
];
type Leads = {
  id: string;
  businessName: string;
  website: string;
  phone: string;
}[];
function leadsToCSV(leads: Leads) {
  const csv = leads.reduce((acc, lead) => {
    return `${acc}${lead.businessName},${lead.website},${lead.phone}\n`;
  }, "BUSINESS NAME,WEBSITE,PHONE\n");
  downloadCSV(csv);
}
function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${new Date().toISOString()}-leads.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
export default function Home() {
  const [leads, setLeads] = useState<Leads>([]);
  const [location, setLocation] = useState("");
  const [job, setJob] = useState("");
  return (
    <main className="flex flex-col w-full min-h-screen pt-20 items-center justify-center font-[family-name:var(--font-dm-sans)] ">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-black tracking-tighter ">
          Lead Extractor 9000
        </h1>
        <p className="text-lg text-gray-500">
          Extract leads from google maps and yellow pages
        </p>
      </div>
      <div className="w-full max-w-3xl p-4 space-y-4 flex flex-col items-center gap-5">
        <div className="flex flex-col md:flex-row w-full items-center justify-center gap-5">
          <div className="flex items-center gap-2">
            <label htmlFor="job">Occupation</label>
            <input
              onChange={(e) => setJob(e.target.value)}
              type="text"
              id="job"
              name="job"
              placeholder="Enter occupation"
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="location">Location</label>
            <input
              onChange={(e) => setLocation(e.target.value)}
              type="text"
              id="location"
              name="location"
              placeholder="Enter location"
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
          <Button>Extract Leads</Button>
        </div>
        <LeadsTable leads={mockLeads} />
        <Button
          disabled={mockLeads.length === 0}
          onClick={() => {
            leadsToCSV(mockLeads);
          }}
        >
          Export to CSV
        </Button>
      </div>
    </main>
  );
}
