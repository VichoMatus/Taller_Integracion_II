// server.ts
import express from "express";
import routes from "./routes";
import morgan from "morgan";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(routes);

app.use((err: any, _req, res, _next) => {
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? "Internal Error" });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`BFF running on http://localhost:${port}`));
