// api/collect.js
const express = require("express");
const { waitUntil } = require("@vercel/functions");
const app = express();

app.use(express.json());

<<<<<<< HEAD
=======
// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749
const GUPSHUP_CONFIG = {
    userid: "2000233295",
    password: "t6yZNm2q",
    v: "1.1",
    format: "json",
    msg_type: "TEXT",
    method: "SENDMESSAGE",
};

<<<<<<< HEAD
const HYDERABAD_MSG = "Dear Customer,\n\nThis is in reference to your recent request via our bot.\n\nPlease find the relevant details below:\nNext Day Delivery – Now in Hyderabad  Get your order delivered the very next day when you shop from our exclusive collection.\n\nFeel free to reply to this message for any additional support.";

async function sendGupshupMessage(phone) {
    try {
        console.log("\n📲 [Gupshup] Sending message to:", phone);
=======
const HYDERABAD_MSG = `Dear Customer,

This is in reference to your recent request via our bot.

Please find the relevant details below:
Next Day Delivery – Now in Hyderabad  
Get your order delivered the very next day when you shop from our exclusive collection.

Feel free to reply to this message for any additional support.`;

// ─────────────────────────────────────────────
// Gupshup SMS sender
// ─────────────────────────────────────────────
async function sendGupshupMessage(phone) {
    try {
        console.log("📲 [Gupshup] Sending message to:", phone);
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749

        const params = new URLSearchParams({
            userid: GUPSHUP_CONFIG.userid,
            password: GUPSHUP_CONFIG.password,
            send_to: phone,
            v: GUPSHUP_CONFIG.v,
            format: GUPSHUP_CONFIG.format,
            msg_type: GUPSHUP_CONFIG.msg_type,
            method: GUPSHUP_CONFIG.method,
            msg: HYDERABAD_MSG,
        });

        const url = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?${params.toString()}`;

        const response = await fetch(url);
        const text = await response.text();

        console.log("✅ [Gupshup] Response:", text);
    } catch (err) {
        console.error("❌ [Gupshup] Failed to send message:", err.message);
    }
}

<<<<<<< HEAD

app.post("/collect", (req, res) => {
=======
// ─────────────────────────────────────────────
// POST /collect   →  becomes  /api/collect on Vercel
// ─────────────────────────────────────────────
app.post("/collect", async (req, res) => {
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749
    try {
        const { phone, pincode, city } = req.body;

        if (!phone || !pincode || !city) {
            console.warn("⚠️ Missing fields:", req.body);
            return res.status(400).json({
                success: false,
                message: "Missing required fields: phone, pincode, city",
            });
        }

        console.log("\n✅ [collect] Data received:");
        console.log("   Phone   :", phone);
        console.log("   Pincode :", pincode);
        console.log("   City    :", city);

        const normalizedCity = city.trim().toLowerCase();

        if (normalizedCity === "hyderabad") {
<<<<<<< HEAD
            console.log(`\n⏳ [collect] Hyderabad detected. Gupshup message scheduled in 5 seconds...\n`);

            // waitUntil keeps the Vercel function alive in the background
            // even after the response has already been sent to the client
            waitUntil(
                new Promise((resolve) => setTimeout(resolve, 5000))
                    .then(() => sendGupshupMessage(phone))
                    .catch((err) => {
                        console.error("❌ [waitUntil] Unhandled error in sendGupshupMessage:", err.message);
                    })
            );
        } else {
            console.log(`\nℹ️  [collect] City is "${city}" — no message triggered.\n`);
=======
            console.log("⏳ Hyderabad detected → Sending Gupshup message...");
            // Send immediately (setTimeout is not reliable on Vercel)
            await sendGupshupMessage(phone);
        } else {
            console.log(`ℹ️ City "${city}" — no message triggered.`);
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749
        }

        return res.status(200).json({
            success: true,
            message: normalizedCity === "hyderabad"
<<<<<<< HEAD
                ? "Data received. Gupshup message will be sent in 5 seconds."
=======
                ? "Data received. Gupshup message sent successfully."
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749
                : "Data received. No message triggered for this city.",
            data: { phone, pincode, city },
        });

    } catch (err) {
        console.error("❌ [collect] Error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
});

<<<<<<< HEAD
// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ─────────────────────────────────────────────
// Global crash guards
// ─────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
    console.error("❌ [Process] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("❌ [Process] Uncaught Exception:", err.message);
    console.error("   Stack:", err.stack);
});

// ─────────────────────────────────────────────
// Export for Vercel + listen for local
// ─────────────────────────────────────────────
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`   POST http://localhost:${PORT}/collect`);
        console.log(`   GET  http://localhost:${PORT}/health\n`);
        console.log(`Press Ctrl + C to stop the server.\n`);
    });
} else {
    // For Vercel / Serverless
    module.exports = app;
}
=======
// Health check
app.get("/collect/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        message: "Collect API is working on Vercel" 
    });
});

// Important: Export the Express app for Vercel
module.exports = app;
>>>>>>> 66d5168d0da380242f8070bf1df6d733bba35749
