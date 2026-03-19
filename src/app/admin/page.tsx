"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Lock,
  LogOut,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioImage } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Portrait", "Animal", "Landscape", "Couple", "Child", "Other"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Check for stored session
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_auth");
    if (stored) setAuthed(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_auth", password);
        setAuthed(true);
      } else {
        setLoginError("Incorrect password");
      }
    } catch {
      setLoginError("Connection error");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 w-full max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-stone-900 text-white rounded-xl mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 text-center mb-6">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {loginError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {loginError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminPassword={sessionStorage.getItem("admin_auth") || ""} onLogout={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }} />;
}

function AdminDashboard({ adminPassword, onLogout }: { adminPassword: string; onLogout: () => void }) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Portrait");
  const [description, setDescription] = useState("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setImages(data.images || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);

      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setUploadSuccess(true);
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setTimeout(() => setUploadSuccess(false), 3000);
      fetchImages();
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Delete this image from portfolio?")) return;
    setDeleting(publicId);
    try {
      await fetch("/api/portfolio/upload", {
        method: "DELETE",
        headers: {
          "x-admin-password": adminPassword,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });
      setImages((prev) => prev.filter((img) => img.id !== publicId));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
          <p className="text-stone-500 text-sm">Manage your portfolio</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-stone-500">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Upload form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Artwork
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File upload */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                  preview
                    ? "border-stone-300"
                    : "border-stone-300 hover:border-stone-400"
                )}
                onClick={() => document.getElementById("admin-file")?.click()}
              >
                <input
                  id="admin-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      setPreview(URL.createObjectURL(f));
                    }
                  }}
                />
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    width={300}
                    height={200}
                    className="max-h-40 mx-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="py-6">
                    <Upload className="w-7 h-7 text-stone-400 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">Click to select artwork</p>
                  </div>
                )}
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Artwork title"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
              />

              {error && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}

              {uploadSuccess && (
                <p className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Uploaded successfully!
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!file || !title || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload to Portfolio
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Portfolio grid */}
        <div className="lg:col-span-3">
          <h2 className="font-semibold text-stone-900 mb-4">
            Portfolio ({images.length} artworks)
          </h2>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-16 text-stone-400">
              <p>No artworks yet. Upload your first piece!</p>
            </div>
          )}

          {!loading && images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden bg-stone-100 aspect-square"
                >
                  <Image
                    src={img.url}
                    alt={img.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <p className="text-white text-xs font-medium text-center px-2 truncate w-full text-center">
                      {img.title}
                    </p>
                    <span className="text-xs text-stone-300 bg-black/40 px-2 py-0.5 rounded-full">
                      {img.category}
                    </span>
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deleting === img.id}
                      className="mt-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 transition-colors"
                    >
                      {deleting === img.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
