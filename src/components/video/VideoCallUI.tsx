import { useState } from "react";
import PostCallModal from "./PostCallModal";

export default function VideoCallUI() {
  const [ended, setEnded] = useState(false);

  if (ended) return <PostCallModal />;

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      
      {/* Top Bar */}
      <div className="p-3 flex justify-between text-sm">
        <span>👨‍🔧 Expert • ⭐4.8</span>
        <span>02:14</span>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 w-full h-full flex items-center justify-center">
          📹 Live Video
        </div>
      </div>

      {/* Estimate */}
      <div className="bg-white text-black p-3">
        ₹500–₹1200 • Pipe Fix
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-around bg-black">
        <button>Mute</button>
        <button>Flip</button>
        <button>Capture</button>
      </div>

      {/* End */}
      <button
        onClick={() => setEnded(true)}
        className="bg-red-600 p-4"
      >
        End Call
      </button>
    </div>
  );
}