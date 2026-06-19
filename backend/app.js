require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const { waitUntil } = require("@vercel/functions");
const { connectDB } = require("./db");

const app = express();

app.use(cors());
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

async function sendGupshupMessage(phone, message) {
    try {
        const params = new URLSearchParams({
            userid: GUPSHUP_CONFIG.userid,
            password: GUPSHUP_CONFIG.password,
            send_to: phone,
            v: GUPSHUP_CONFIG.v,
            format: GUPSHUP_CONFIG.format,
            msg_type: GUPSHUP_CONFIG.msg_type,
            method: GUPSHUP_CONFIG.method,
            msg: message,
        });

        const url = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?${params.toString()}`;
        const response = await fetch(url);
        const text = await response.text();
        console.log("[Gupshup] Response:", text);
    } catch (err) {
        console.error("[Gupshup] Failed to send message:", err.message);
    }
}

// ─── Collect endpoint (called by the form/bot) ───────────────────────────────

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
        const db = await connectDB();
        const campaign = await db.collection("campaigns").findOne({ city: normalizedCity });

        if (campaign && campaign.active) {
            const message = campaign.message.replace("{city}", city.trim());
            waitUntil(
                sleep(10 * 1000).then(() => sendGupshupMessage(phone, message))
            );
        }

        return res.status(200).json({
            success: true,
            message: campaign && campaign.active
                ? "Data received. Gupshup message will be sent in 10 seconds."
                : "Data received. No active campaign for this city.",
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

// ─── Admin: get all campaigns ─────────────────────────────────────────────────

app.get("/admin/campaigns", async (req, res) => {
    try {
        const db = await connectDB();
        const campaigns = await db.collection("campaigns").find({}).toArray();
        return res.status(200).json({ success: true, data: campaigns });
    } catch (err) {
        console.error("Error fetching campaigns:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch campaigns." });
    }
});

// ─── Admin: update a campaign ─────────────────────────────────────────────────

app.patch("/admin/campaigns/:city", async (req, res) => {
    try {
        const city = req.params.city.toLowerCase();
        const { active, template, message } = req.body;

        const update = { updatedAt: new Date() };
        if (typeof active === "boolean") update.active = active;
        if (template) update.template = template;
        if (message) update.message = message;

        const db = await connectDB();
        const result = await db.collection("campaigns").updateOne(
            { city },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "City not found." });
        }

        return res.status(200).json({ success: true, message: "Campaign updated." });
    } catch (err) {
        console.error("Error updating campaign:", err.message);
        return res.status(500).json({ success: false, message: "Failed to update campaign." });
    }
});

// ─── Admin: add a new city campaign ──────────────────────────────────────────

app.post("/admin/campaigns", async (req, res) => {
    try {
        const { city, displayName, template, message } = req.body;

        if (!city || !displayName || !message) {
            return res.status(400).json({ success: false, message: "city, displayName, and message are required." });
        }

        const db = await connectDB();
        const existing = await db.collection("campaigns").findOne({ city: city.toLowerCase() });

        if (existing) {
            return res.status(409).json({ success: false, message: "City already exists." });
        }

        await db.collection("campaigns").insertOne({
            city: city.toLowerCase(),
            displayName,
            active: true,
            template: template || "custom",
            message,
            updatedAt: new Date(),
        });

        return res.status(201).json({ success: true, message: "Campaign created." });
    } catch (err) {
        console.error("Error creating campaign:", err.message);
        return res.status(500).json({ success: false, message: "Failed to create campaign." });
    }
});

// ─── Admin: delete a city campaign ───────────────────────────────────────────

app.delete("/admin/campaigns/:city", async (req, res) => {
    try {
        const city = req.params.city.toLowerCase();
        const db = await connectDB();
        const result = await db.collection("campaigns").deleteOne({ city });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "City not found." });
        }

        return res.status(200).json({ success: true, message: "Campaign deleted." });
    } catch (err) {
        console.error("Error deleting campaign:", err.message);
        return res.status(500).json({ success: false, message: "Failed to delete campaign." });
    }
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
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