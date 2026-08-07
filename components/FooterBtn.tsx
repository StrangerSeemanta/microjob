"use client";
import { getSupportLink } from "@/app/actions/addSupportLink";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function FooterBtn() {
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
  return (
    <>
      {currLink && (
        <Link
          href={currLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Message Customer Support
        </Link>
      )}
    </>
  );
}

export default FooterBtn;
