import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   DEBUG KEYS (TEMPORARY)
========================= */
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET);

/* =========================
   TEST ROUTE (Browser Test)
========================= */
app.get("/test-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MAIN CREATE ORDER ROUTE
========================= */
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.json(order);
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ROOT ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started");
});