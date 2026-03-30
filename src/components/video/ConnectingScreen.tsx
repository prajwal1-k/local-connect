import { useEffect, useState } from "react";
import VideoCallUI from "./VideoCallUI";

export default function ConnectingScreen() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setTimeout(() => setConnected(true), 2000);
  }, []);

  if (connected) return <VideoCallUI />;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full mb-4"></div>
        <p>Finding an expert...</p>
      </div>
    </div>
  );
}