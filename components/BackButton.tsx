"use client";
import { ArrowLeftIcon } from "lucide-react";
import React from "react";

function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="bg-white p-2 rounded-full shadow hover:bg-blue-100 transition"
      aria-label="Back to admin"
    >
      <ArrowLeftIcon size={25} />
    </button>
  );
}

export default BackButton;
