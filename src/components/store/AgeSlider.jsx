import React, { useState } from 'react';

export default function AgeSlider({ value = 3, onChange }) {
  const [age, setAge] = useState(value);
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Ages</span>
        <span className="font-display text-2xl font-semibold text-forest">{age} {age === 1 ? 'yr' : 'yrs'}</span>
      </div>
      <input
        type="range" min={0} max={12} value={age}
        onChange={e => { setAge(+e.target.value); onChange?.(+e.target.value); }}
        className="w-full accent-[hsl(var(--terracotta))]"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0</span><span>12</span></div>
    </div>
  );
}