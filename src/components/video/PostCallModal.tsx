export default function PostCallModal() {
  return (
    <div className="fixed inset-0 bg-white z-50 p-6">
      <h2 className="text-xl font-bold mb-4">
        Your Diagnosis
      </h2>

      <p>Pipe leakage detected</p>
      <p className="mt-2">Estimated: ₹500–₹1200</p>

      <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg">
        Book This Provider
      </button>
    </div>
  );
}