import React from "react";

// Simplified Lead interface with only the required properties
export interface Lead {
  id: string;
  businessName: string;
  website: string;
  phone: string;
}

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  return (
    <div className="rounded-md w-full border border-neutral-200 ">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              BUSINESS NAME
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              WEBSITE
            </th>
            <th
              scope="col"
              className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              PHONE
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {!leads || leads.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-4 text-sm font-medium text-gray-900"
              >
                No leads found
              </td>
            </tr>
          ) : null}
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                {lead.businessName}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                {lead.website}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                {lead.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
