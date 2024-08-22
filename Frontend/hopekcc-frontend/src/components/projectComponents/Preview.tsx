import React, { useEffect, useRef } from "react";

interface PreviewProps {
  previewDoc: string;
  onNavigate: (filename: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({ previewDoc, onNavigate }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "navigate") {
        onNavigate(event.data.file);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onNavigate]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = previewDoc;
    }
  }, [previewDoc]);

  return (
    <div className={`transition-all duration-300 ease-in-out w-full`}>
      <iframe ref={iframeRef} className={"w-full h-full"} title="Preview" />
    </div>
  );
};
