"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  currentUrl?: string | null;
  folder: "teams" | "players";
  placeholder?: string;
  onUpload: (url: string | null) => void;
}

export default function ImageUpload({ currentUrl, folder, placeholder = "◉", onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("fsl-images")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("[upload]", error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("fsl-images").getPublicUrl(path);
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!preview) return;
    try {
      const url = new URL(preview);
      const parts = url.pathname.split("/fsl-images/");
      if (parts[1]) {
        const supabase = createClient();
        await supabase.storage.from("fsl-images").remove([parts[1]]);
      }
    } catch {}
    setPreview(null);
    onUpload(null);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        {preview ? (
          <>
            <img src={preview} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
            <button onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] flex items-center justify-center transition-colors">
              ✕
            </button>
          </>
        ) : (
          <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 text-2xl">
            {placeholder}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40">
          {uploading ? "アップロード中..." : preview ? "画像を変更" : "画像をアップロード"}
        </button>
        {preview && (
          <button onClick={handleRemove}
            className="px-4 py-1.5 rounded-lg text-xs text-red-400/70 hover:text-red-400 border border-red-900/30 hover:border-red-900/60 transition-colors">
            削除
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}
