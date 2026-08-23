import { db } from '@/api/supabaseClient';
import React, { useState } from 'react';

import { Upload, X, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await db.integrations.Core.UploadFile({ file });
        if (file_url) urls.push(file_url);
      }
      onChange([...(images || []), ...urls]);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {(images || []).map((img, i) => (
          <div key={i} className="relative group aspect-square squircle-sm overflow-hidden bg-secondary">
            <Image src={img} alt="" fittingType="fill" className="w-full h-full" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-forest/80 text-paper rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
          </div>
        ))}
        <label className="aspect-square squircle-sm border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary text-muted-foreground transition">
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 animate-spin text-forest" />
              <span className="text-xs">Uploading…</span>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 mb-1 text-forest" />
              <span className="text-xs">Upload</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={uploading} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Upload images to Supabase Storage. The first image is the cover.</p>
    </div>
  );
}
