import { Elysia } from "elysia";
import { config } from "dotenv";
import checkAuthPlugin from "./middlewares/checkAuth";
config();
const app = new Elysia()

app.get("/", ({ set }) => {
  set.status = 200;
  return {
    status: "success",
    message: "Welcome to the Build Backend Service of Zyotra!",
    Time: new Date().toISOString(),
  };
});
app.listen(Number(process.env.PORT));

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);