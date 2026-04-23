import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "./middlewares/error.middleware";
import apiRoutes from "./routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", apiRoutes);

app.use(errorMiddleware);

export default app;
