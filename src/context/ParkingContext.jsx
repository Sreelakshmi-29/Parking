  const bookSlot = ({ slotId, name, vehicleNumber, date, startTime, endTime, hours }) => {
    const slot = slots.find((s) => s.id === slotId);
    const booking = {
      id: Date.now(),
      slotId,
      name,
      vehicleNumber: vehicleNumber.toUpperCase(),
      date,
      startTime,
      endTime,
      hours,
      total: slot.hourlyRate * hours,
      createdAt: new Date().toLocaleString(),
    };
    setBookings((prev) => [booking, ...prev]);
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, occupied: true } : s))
    );
  };