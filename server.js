const express = require("express");
const app = express();

app.use(express.json());

// ─────────────────────────────────────────────
// WhatsApp sender (replace body with real API)
// ─────────────────────────────────────────────
async function sendWhatsAppMessage(data) {
    try {
        console.log("\n📲 [WhatsApp] Triggering message for:", data.phone);
        console.log("   Pincode :", data.pincode);
        console.log("   City    :", data.city);
        console.log("   (Replace this block with your actual WhatsApp API call)\n");

        // ── Uncomment and fill in when you have the API ──
        // const response = await fetch("https://your-whatsapp-api.com/send", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: "Bearer YOUR_TOKEN",
        //     },
        //     body: JSON.stringify({
        //         phone: data.phone,
        //         message: `Hello from ${data.city}!`,
        //     }),
        // });
        // if (!response.ok) {
        //     throw new Error(`WhatsApp API responded with status ${response.status}`);
        // }
        // const result = await response.json();
        // console.log("[WhatsApp] API response:", result);

    } catch (err) {
        console.error("❌ [WhatsApp] Failed to send message:", err.message);
    }
}

// ─────────────────────────────────────────────
// POST /collect
// ─────────────────────────────────────────────
app.post("/collect", (req, res) => {
    try {
        const { phone, pincode, city } = req.body;

        if (!phone || !pincode || !city) {
            console.warn("⚠️  [collect] Missing fields in request body:", req.body);
            return res.status(400).json({
                success: false,
                message: "Missing required fields: phone, pincode, city",
            });
        }

        const data = { phone, pincode, city };

        console.log("\n✅ [collect] Data received:");
        console.log("   Phone   :", phone);
        console.log("   Pincode :", pincode);
        console.log("   City    :", city);
        console.log(`\n⏳ [collect] WhatsApp message scheduled in 20 seconds...\n`);

        setTimeout(() => {
            sendWhatsAppMessage(data).catch((err) => {
                console.error("❌ [setTimeout] Unhandled error in sendWhatsAppMessage:", err.message);
            });
        }, 20 * 1000);

        return res.status(200).json({
            success: true,
            message: "Data received. WhatsApp message will be sent in 20 seconds.",
            data,
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
// Health check — useful for uptime monitoring
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ─────────────────────────────────────────────
// Global crash guards — keep the server alive
// ─────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
    console.error("❌ [Process] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("❌ [Process] Uncaught Exception:", err.message);
    console.error("   Stack:", err.stack);
    // Log but do NOT exit — keeps server alive
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
    });
}