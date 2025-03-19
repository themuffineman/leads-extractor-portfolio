"use client";
import Button from "@/components/Button";
import LeadsTable from "@/components/LeadTable";
import { WebSocketService } from "@/utils/websocket";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
type Leads = {
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
type Message = {
  type: "lead" | "status";
  data: MessageData | string;
};
type MessageData = {
  platform: "gMaps" | "yellowPages";
  leads: Leads;
};
export default function Home() {
  const [leads, setLeads] = useState<Leads>([]);
  const [location, setLocation] = useState("");
  const [job, setJob] = useState("");
  async function extractLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      WebSocketService.getInstance("ws://localhost:8080").subscribeToEvent(
        "message",
        (data) => {
          const dataObj: Message = JSON.parse(data);
          console.log(dataObj);
          toast(
            dataObj.type === "status"
              ? (dataObj.data as string)
              : `Received Lead from: ${(dataObj.data as MessageData).platform}`,
            {
              description: `${new Date().toLocaleTimeString()}`,
              action: {
                label: "OK",
                onClick: () => null,
              },
            }
          );
          if (dataObj.type === "lead") {
            setLeads((dataObj.data as MessageData).leads);
          }
        }
      );
      WebSocketService.getInstance().sendMessage("request");
      WebSocketService.getInstance().subscribeToEvent("error", () => {
        console.log("Error setting up websocket connection");
        toast("Error with connection ❌❌.", {
          description: `${new Date().toLocaleTimeString()}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
      });
      WebSocketService.getInstance().subscribeToEvent("close", () => {
        console.log("websocket connection closed");
        toast("Connection closed ❌.", {
          description: `${new Date().toLocaleTimeString()}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
      });
      WebSocketService.getInstance().subscribeToEvent("open", () => {
        console.log("websocket connection established");
        toast("Connection Established ✅✅.", {
          description: `${new Date().toLocaleTimeString()}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
      });
    } catch (error: any) {
      console.error(error.message);
      toast(`Error: ${error.message}❌`, {
        description: `${new Date().toLocaleTimeString()}`,
        action: {
          label: "OK",
          onClick: () => null,
        },
      });
    }
  }

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
        <form
          onSubmit={(e) => {
            extractLead(e);
          }}
          className="flex flex-col md:flex-row w-full items-center justify-center gap-5"
        >
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
          <Button type="submit">Extract Leads</Button>
        </form>
        <LeadsTable leads={leads} />
        <Button
          disabled={leads.length === 0}
          onClick={() => {
            leadsToCSV(leads);
          }}
        >
          Export to CSV
        </Button>
      </div>
    </main>
  );
}
