import { useState } from "react";
import ConnectingScreen from "./ConnectingScreen";

export default function PreCallModal({ onClose }: any) {
  const [connecting, setConnecting] = useState(false);

  if (connecting) return <ConnectingScreen />;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Video Consultation
        </h2>

        <ul className="text-sm space-y-2 mb-4">
          <li>• Ensure good lighting</li>
          <li>• Show issue clearly</li>
          <li>• Be ready to explain</li>
        </ul>

        <button
          onClick={() => setConnecting(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Start Video Call
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}