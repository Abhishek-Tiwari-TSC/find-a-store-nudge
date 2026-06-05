const express = require("express");
const { waitUntil } = require("@vercel/functions");

// Load .env silently (suppress injection message)
require("dotenv").config({ quiet: true });

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendGupshupMessage(phone, city) {
    try {
        const msg = `Hi,\n\nGuaranteed Next Day Delivery is now available in ${city}.\n\nFor any assistance or to know more, please visit your nearest store`;

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

        console.log("[Gupshup] Response:", text);
    } catch (err) {
        console.error("[Gupshup] Failed to send message:", err.message);
    }
}

async function sendMumbaiMessage(phone, city) {
    try {
        const msg = `Hi,\n\nNo Cost EMI is now available in ${city}.\n\nFor any assistance or to know more, please visit your nearest store`;

        const params = new URLSearchParams({
            userid: GUPSHUP_CONFIG.userid,
            password: GUPSHUP_CONFIG.password,
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

        console.log("[Gupshup] Response:", text);
    } catch (err) {
        console.error("[Gupshup] Failed to send Mumbai message:", err.message);
    }
};

app.post("/collect", async (req, res) => {
    try {
        const { phone, pincode, city } = req.body;

        if (!phone || !pincode || !city) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: phone, pincode, city",
            });
        }

        const normalizedCity = city.trim().toLowerCase();

        if (normalizedCity === "hyderabad" || normalizedCity === "bengaluru") {
            waitUntil(
                sleep(10 * 1000).then(() => sendGupshupMessage(phone, city.trim()))
            );
        } else if (normalizedCity === "mumbai") {
            waitUntil(
                sleep(10 * 1000).then(() => sendMumbaiMessage(phone, city.trim()))
            );
        }

        return res.status(200).json({
            success: true,
            message: (normalizedCity === "" || normalizedCity === "" || normalizedCity === "mumbai")
                ? "Data received. Gupshup message will be sent in 10 seconds."
                : "Data received. No message triggered for this city.",
            data: { phone, pincode, city },
        });

    } catch (err) {
        console.error("Unexpected error in /collect:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
    });
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
    console.error("Stack:", err.stack);
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}