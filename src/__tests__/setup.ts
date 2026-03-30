import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });
dotenv.config({ path: ".env" });

process.env.NODE_ENV = "test";
