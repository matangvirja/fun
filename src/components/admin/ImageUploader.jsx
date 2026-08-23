import { db } from '@/api/base44Client';
import React, { useState } from 'react';

import { Upload, X } from 'lucide-react';
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
        urls.push(file_url);
      }
      onChange([...(images || []), ...urls]);
    } finally { setUploading(false); e.target.value = ''; }
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
        <label className="aspect-square squircle-sm border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary text-muted-foreground">
          {uploading ? <span className="text-xs">Uploading…</span> : <><Upload className="w-5 h-5 mb-1" /><span className="text-xs">Upload</span></>}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Upload images. The first image is the cover.</p>
    </div>
  );
}
