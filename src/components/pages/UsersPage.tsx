import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  petName: string;
  status: "Active" | "Inactive";
}

const mockUsers: User[] = [
  { id: "user-1", name: "Aarav", email: "aarav.patel@example.com", petName: "Bruno (Golden Retriever)", status: "Active" },
  { id: "user-2", name: "Priya Singh", email: "priya.singh@example.com", petName: "Luna (Persian Cat)", status: "Active" },
  { id: "user-3", name: "Rohan Das", email: "rohan.das@example.com", petName: "Rocky (German Shepherd)", status: "Inactive" },
  { id: "user-4", name: "Ananya Iyer", email: "ananya.iyer@example.com", petName: "Milo (Beagle)", status: "Active" }
];

export function UsersPage() {
  const [users] = useState<User[]>(mockUsers);

  return (
    <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden w-full">
      <div className="border-b border-teal-100 px-5 py-4">
        <h3 className="text-lg font-bold text-clinic-ink">Client List</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
            <tr>
              <th className="px-5 py-4">Owner Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Registered Pets</th>
              <th className="px-5 py-4">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((usr) => (
              <tr key={usr.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 font-bold">
                      {usr.name.substring(0, 1)}
                    </div>
                    <p className="font-bold text-clinic-ink">{usr.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{usr.email}</td>
                <td className="px-5 py-4 text-sm text-slate-600 font-bold">{usr.petName}</td>
                <td className="px-5 py-4">
                  <span className={`rounded px-3 py-1 text-xs font-bold ${
                    usr.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {usr.status}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-semibold">
                  No registered clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
