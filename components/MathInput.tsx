"use client";
import React, { useEffect, useRef } from "react";
import "mathlive";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MathInput({ value, onChange }: MathInputProps) {
  const mf = useRef<any>(null);

  const MathFieldTag = "math-field" as unknown as React.ElementType;

  useEffect(() => {
    const mathField = mf.current;
    if (!mathField) return;

    mathField.smartMode = true; 
    
    const handleInput = (evt: any) => {
      onChange(evt.target.value);
    };

    mathField.addEventListener("input", handleInput);

    return () => {
      mathField.removeEventListener("input", handleInput);
    };
  }, [onChange]);

  useEffect(() => {
    if (mf.current && mf.current.value !== value) {
      mf.current.value = value;
    }
  }, [value]);

  return (
    <div 
      className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-2 shadow-inner" 
      dir="ltr"
    >
      <MathFieldTag 
        ref={mf} 
        style={{
          width: "100%",
          backgroundColor: "transparent",
          color: "white",
          fontSize: "1.2rem",
          padding: "10px",
          outline: "none",
          border: "none",
          borderRadius: "8px",
          display: "block"
        }}
      >
        {value}
      </MathFieldTag>
      
      <div className="text-[10px] text-gray-500 mt-2 px-2 text-right border-t border-white/5 pt-1">
        💡 تلميح: يمكنك نسخ المعادلات من الوورد ولصقها هنا مباشرة
      </div>
    </div>
  );
}