export function BookingButton() {
  const bookNow = async () => {
    const res = await fetch("http://localhost:5000/book", {
      method: "POST",
    });
    const data = await res.json();
    alert("Provider assigned instantly!");
  };

  return (
    <button
      onClick={bookNow}
      className="bg-green-500 text-white px-6 py-3 rounded-2xl"
    >
      Book Now (Instant)
    </button>
  );
}