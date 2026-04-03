// api/collect.js
const express = require("express");
const app = express();

app.use(express.json());

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const GUPSHUP_CONFIG = {
    userid: "2000233295",
    password: "t6yZNm2q",
    v: "1.1",
    format: "json",
    msg_type: "TEXT",
    method: "SENDMESSAGE",
};

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

// ─────────────────────────────────────────────
// POST /collect   →  becomes  /api/collect on Vercel
// ─────────────────────────────────────────────
app.post("/collect", async (req, res) => {
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
            console.log("⏳ Hyderabad detected → Sending Gupshup message...");
            // Send immediately (setTimeout is not reliable on Vercel)
            await sendGupshupMessage(phone);
        } else {
            console.log(`ℹ️ City "${city}" — no message triggered.`);
        }

        return res.status(200).json({
            success: true,
            message: normalizedCity === "hyderabad"
                ? "Data received. Gupshup message sent successfully."
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

// Health check
app.get("/collect/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        message: "Collect API is working on Vercel" 
    });
});

// Important: Export the Express app for Vercel
module.exports = app;
