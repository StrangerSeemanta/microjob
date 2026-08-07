"use client";

import { addSupportLink, getSupportLink } from "@/app/actions/addSupportLink";
import { toast } from "@/components/ui/toast";
import {  useEffect, useState } from "react";

export default function Page() {
  const [submitting, setSubmit] = useState(false);
  const [supportRedirectLink, setSupportRedirectLink] = useState<string>("");
  const [currLink, setCurrLink] = useState<string | null>(null);

  

  useEffect(() => {
    let isActive = true;

    const loadSupportLink = async () => {
      const data = await getSupportLink();
      if (!isActive) return;
      if (data.success) {
        setCurrLink(data.support_link);
      }
    };

    void loadSupportLink();

    return () => {
      isActive = false;
    };
  }, []);
  const handleSubmitSupportLink = async (e: FormData) => {
    try {
      setSubmit(true);
      const result = await addSupportLink(e);
      if (result.success) {
        toast.add({
          type: "success",
          title: "Support Link Added",
          description: "Support Link Added successfully to the server.",
        });
        window.location.reload()
      } else {
        toast.add({
          type: "error",
          title: "Failed To Support Link",
          description: result.message,
        });
        throw new Error(result.message);
      }

    } catch (error) {
      toast.add({
        type: "error",
        title: "Error happened",
        description: String(error),
      });
      setSubmit(false);
    } finally {
      setSubmit(false);
    }
  };
  return (
    <>
     { <h1 className="p-4 text-white font-bold">
        Current Support Link: {currLink && currLink}
      </h1>}
      <form action={handleSubmitSupportLink}>
        <div className="w-full min-h-screen flex flex-col flex-wrap gap-4 justify-center items-center">
          <label htmlFor="title" className="text-lg font-medium text-slate-200">
            ENTER YOUR SUPPORT LINK
          </label>
          <input
            type="url"
            name="support_link"
            id="support_link"
            value={supportRedirectLink}
            onChange={(e) =>
              setSupportRedirectLink(String(e.target.value.trim()))
            }
            placeholder="Enter your support link"
            className="w-3/4 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />{" "}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-cyan-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
