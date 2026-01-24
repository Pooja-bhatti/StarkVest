// NSE Holidays 2026
const HOLIDAYS = [
  "2026-01-15", "2026-01-26", "2026-03-03", "2026-03-26",
  "2026-03-31", "2026-04-03", "2026-04-14", "2026-05-01",
  "2026-05-28", "2026-06-26", "2026-09-14", "2026-10-02",
  "2026-10-20", "2026-11-10", "2026-11-24", "2026-12-25"
];

const order = (req, res, next) => {
  try {
    // ✅ Server Time (IST)
    const now = new Date();

    // Convert to IST explicitly
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, "0");
    const day = String(istTime.getDate()).padStart(2, "0");

    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const seconds = istTime.getSeconds();

    const weekday = istTime.getDay();

    const todayDate = `${year}-${month}-${day}`;

    console.log("📌 Server IST:", todayDate, `${hours}:${minutes}:${seconds}`);

    // Weekend Check
    if (weekday === 0 || weekday === 6) {
      return res.status(201).json({
        message: "Orders cannot be processed on weekends."
      });
    }

    // Holiday Check
    if (HOLIDAYS.includes(todayDate)) {
      return res.status(201).json({
        message: "Today is a holiday. Orders cannot be processed."
      });
    }

    // Market Hours Check
    const currentSeconds = hours * 3600 + minutes * 60 + seconds;

    const marketOpen = 9 * 3600 + 15 * 60;
    const marketClose = 15 * 3600 + 30 * 60;

    if (currentSeconds < marketOpen || currentSeconds > marketClose) {
      return res.status(201).json({
        message: `Orders allowed only between 09:15–15:30 IST.
Current Time: ${hours}:${minutes}:${seconds}`
      });
    }

    next();

  } catch (err) {
    console.error("Market Time Check Error:", err.message);
    return res.status(201).json({ error: "Failed to verify market status." });
  }
};

module.exports = order;