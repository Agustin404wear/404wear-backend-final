import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig } from "mercadopago";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
});
const Product = mongoose.model("Product", ProductSchema);

app.get("/api/productos", async (req, res) => {
  const productos = await Product.find();
  res.json(productos);
});

app.post("/api/crear-preferencia", async (req, res) => {
  try {
    const items = req.body.items.map((item) => ({
      title: item.title,
      quantity: 1,
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    const preference = await mercadopago.preferences.create({
      body: {
        items,
        back_urls: {
          success: "https://404wear.store/success",
          failure: "https://404wear.store/failure",
          pending: "https://404wear.store/pending"
        },
        auto_return: "approved"
      }
    });

    res.json({ id: preference.id });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
