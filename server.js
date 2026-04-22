const express = require("express");
const app = express();

app.use(express.json());

const GUPSHUP_CONFIG = {
    userid: "2000233295",
    password: "t6yZNm2q",
    v: "1.1",
    format: "json",
    msg_type: "TEXT",
    method: "SENDMESSAGE",
};

async function sendGupshupMessage(phone, city) {
    try {
        console.log("\n📲 [Gupshup] Sending message to:", phone);

        const msg = `Hi,\n\nNext day delivery is now available in ${city}.\n\nFor any assistance or to know more, please visit your nearest store`;

        const params = new URLSearchParams({
            userid: GUPSHUP_CONFIG.userid,
            password: GUPSHUP_CONFIG.password,
            send_to: phone,
            v: GUPSHUP_CONFIG.v,
            format: GUPSHUP_CONFIG.format,
            msg_type: GUPSHUP_CONFIG.msg_type,
            method: GUPSHUP_CONFIG.method,
            msg: msg,
        });

        const url = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?${params.toString()}`;

        const response = await fetch(url);
        const text = await response.text();

        console.log("✅ [Gupshup] Response:", text);
    } catch (err) {
        console.error("❌ [Gupshup] Failed to send message:", err.message);
    }
}


app.post("/collect", async (req, res) => {
    try {
        const { phone, pincode, city } = req.body;

        if (!phone || !pincode || !city) {
            console.warn("⚠️  [collect] Missing fields in request body:", req.body);
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
            console.log(`\n⏳ [collect] Hyderabad detected. Sending Gupshup message...\n`);
            await sendGupshupMessage(phone, city.trim());
        } else {
            console.log(`\nℹ️  [collect] City is "${city}" — no message triggered.\n`);
        }

        return res.status(200).json({
            success: true,
            message: normalizedCity === "hyderabad"
                ? "Data received. Gupshup message sent."
                : "Data received. No message triggered for this city.",
            data: { phone, pincode, city },
        });

    } catch (err) {
        console.error("❌ [collect] Unexpected route error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
});

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