"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
type Banner = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  createdAt?: string;
};

export default function BannersPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [active, setActive] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // --------------------------------------------------
  // Fetch banners
  // --------------------------------------------------

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/banners", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch banners.");
      }

      setBanners(data.banners || []);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to fetch banners.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchBanners();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBanners]);

  // --------------------------------------------------
  // Select image
  // --------------------------------------------------

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select an image file.",
      });

      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image must be smaller than 10MB.",
      });

      return;
    }

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setMessage(null);
  }

  // --------------------------------------------------
  // Remove selected image
  // --------------------------------------------------

  function removeSelectedImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // --------------------------------------------------
  // Upload banner
  // --------------------------------------------------

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setMessage({
        type: "error",
        text: "Please select a banner image.",
      });

      return;
    }

    if (!title.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a banner title.",
      });

      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("title", title.trim());
      formData.append("linkUrl", linkUrl.trim());
      formData.append("active", String(active));

      const response = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload banner.");
      }

      setMessage({
        type: "success",
        text: "Banner uploaded successfully.",
      });

      // Reset form
      setTitle("");
      setLinkUrl("");
      setActive(true);

      removeSelectedImage();

      // Refresh banner list
      await fetchBanners();
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to upload banner.",
      });
    } finally {
      setUploading(false);
    }
  }

  // --------------------------------------------------
  // Delete banner
  // --------------------------------------------------

  async function handleDelete(banner: Banner) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${banner.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(banner._id);
      setMessage(null);

      const response = await fetch(`/api/admin/banners/${banner._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete banner.");
      }

      setBanners((previous) =>
        previous.filter((item) => item._id !== banner._id),
      );

      setMessage({
        type: "success",
        text: "Banner deleted successfully.",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to delete banner.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Banner Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload and manage banners displayed on your website.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          {/* Upload Form */}
          <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Banner
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload a new banner image.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Banner Image
                </label>

                {previewUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-16/6 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 text-center transition hover:border-gray-400 hover:bg-gray-100"
                  >
                    <span className="text-3xl">↑</span>

                    <span className="mt-2 text-sm font-medium text-gray-700">
                      Click to select an image
                    </span>

                    <span className="mt-1 text-xs text-gray-400">
                      PNG, JPG, WEBP — Max 10MB
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Summer Campaign"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {/* Link */}
              <div>
                <label
                  htmlFor="linkUrl"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Destination URL
                </label>

                <input
                  id="linkUrl"
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">Active</p>

                  <p className="text-xs text-gray-400">
                    Show this banner publicly
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Banner"}
              </button>
            </form>
          </section>

          {/* Banner List */}
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Existing Banners
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {banners.length} {banners.length === 1 ? "banner" : "banners"}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-gray-500">Loading banners...</p>
              </div>
            ) : banners.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="text-3xl">▧</div>

                <h3 className="mt-3 font-semibold text-gray-800">
                  No banners yet
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Upload your first banner using the form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {banners.map((banner) => (
                  <article
                    key={banner._id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* Banner Image */}
                    <div className="relative aspect-16/6 overflow-hidden bg-gray-100">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute left-3 top-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                            banner.active
                              ? "bg-green-100/90 text-green-700"
                              : "bg-gray-900/70 text-white"
                          }`}
                        >
                          {banner.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {banner.title}
                          </h3>

                          {banner.linkUrl && (
                            <p className="mt-1 truncate text-xs text-gray-400">
                              {banner.linkUrl}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(banner)}
                          disabled={deletingId === banner._id}
                          className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === banner._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
