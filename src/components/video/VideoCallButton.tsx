import { useState } from "react";
import PreCallModal from "./PreCallModal";

export default function VideoCallButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white p-5 rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition"
      >
        <h3 className="text-lg font-semibold">📞 Show Your Problem</h3>
        <p className="text-sm opacity-90">
          Get instant help before booking
        </p>
      </div>

      {open && <PreCallModal onClose={() => setOpen(false)} />}
    </>
  );
}