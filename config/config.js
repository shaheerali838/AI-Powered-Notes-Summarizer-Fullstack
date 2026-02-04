import dotenv from "dotenv";

dotenv.config();

export const config = {
  deepseekKey: process.env.DEEPSEEK_API_KEY || "dummy_key_here",
};
