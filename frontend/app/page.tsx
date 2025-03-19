"use client";
import Button from "@/components/Button";
import LeadsTable from "@/components/LeadTable";
import { WebSocketService } from "@/utils/websocket";
import { Loader } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
type Leads = {
  name: string;
  url: string;
  phone: string;
}[];
function leadsToCSV(leads: Leads) {
  const csv = leads.reduce((acc, lead) => {
    return `${acc}${lead.name},${lead.url},${lead.phone}\n`;
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
  type: "lead" | "status" | "complete";
  data: MessageData | string;
};
type MessageData = {
  platform: "gMaps" | "yellowPages";
  lead: {
    name: string;
    url: string;
    phone: string;
  };
};
export default function Home() {
  const [leads, setLeads] = useState<Leads>([]);
  const [location, setLocation] = useState("");
  const [job, setJob] = useState("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  async function extractLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let wsService: null | WebSocketService = null;
    try {
      setIsFetching(true);
      // Ensure WebSocket is fully connected before making any calls
      wsService = await WebSocketService.getInstance("ws://localhost:8090");

      wsService.subscribeToEvent("message", async (data) => {
        await new Promise((res, _) => {
          setTimeout(() => {
            res("Delayed");
          }, 5000);
        });
        const dataObj: Message = JSON.parse(data);
        toast(
          dataObj.type === "status" || dataObj.type === "complete"
            ? (dataObj.data as string)
            : `Received Lead from: ${(dataObj.data as MessageData).platform}`,
          {
            description: `${new Date().toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}`,
            action: {
              label: "OK",
              onClick: () => null,
            },
          }
        );
        if (dataObj.type === "lead") {
          setLeads((prevLeads) => {
            if (prevLeads.length > 0) {
              console.log("old leads", prevLeads);
              const newLeads = [
                ...prevLeads,
                (dataObj.data as MessageData).lead,
              ];
              return newLeads;
            } else {
              return [(dataObj.data as MessageData).lead];
            }
          });
        }
        if (dataObj.type === "complete") {
          wsService?.close();
        }
      });

      wsService.sendMessage(
        "request",
        JSON.stringify({
          location,
          job,
        })
      );

      wsService.subscribeToEvent("error", () => {
        setIsFetching(false);
        console.log("Error setting up websocket connection");
        wsService?.close();
        toast("Error with connection ❌❌.", {
          description: `${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
      });

      wsService.subscribeToEvent("close", () => {
        console.log("WebSocket connection closed");
        setIsFetching(false);
        toast("Connection closed ❌.", {
          description: `${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
        wsService?.close();
      });

      wsService.subscribeToEvent("open", () => {
        console.log("WebSocket connection established");
        toast("Connection Established ✅✅.", {
          description: `${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}`,
          action: {
            label: "OK",
            onClick: () => null,
          },
        });
      });
    } catch (error: any) {
      setIsFetching(false);
      console.error(error.message);
      toast(`Error with connection. Try again. ❌`, {
        description: `${new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
        action: {
          label: "OK",
          onClick: () => null,
        },
      });
      wsService?.close();
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
          <Button
            type="submit"
            className=" inline-flex items-center gap-2 justify-between w-max"
          >
            Extract Leads{" "}
            {isFetching && (
              <Loader size={16} className="animate-spin stroke-white" />
            )}
          </Button>
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
