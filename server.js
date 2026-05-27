require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const aiMessage =
            response.data.choices[0].message.content;

        res.json({
            reply: aiMessage
        });

    } catch (error) {

        const upstreamStatus = error.response?.status;
        const upstreamData = error.response?.data;

        console.error("---- /chat error ----");
        console.error("status:", upstreamStatus);
        console.error("data:", JSON.stringify(upstreamData, null, 2));
        console.error("message:", error.message);
        console.error("---------------------");

        res.status(upstreamStatus || 500).json({
            error: "Upstream request failed",
            upstreamStatus: upstreamStatus || null,
            upstreamMessage:
                upstreamData?.error?.message ||
                upstreamData?.error ||
                error.message,
            details: upstreamData || null
        });

    }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
