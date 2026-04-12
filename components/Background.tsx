"use client";
import React from "react";
const Background = React.memo(() => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        background: `
          radial-gradient(circle at 80% 10%, rgba(88, 28, 135, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 10% 90%, rgba(30, 58, 138, 0.15) 0%, transparent 50%),
          #0f172a
        `
      }}
    />
  );
});

Background.displayName = "Background";
export default Background;