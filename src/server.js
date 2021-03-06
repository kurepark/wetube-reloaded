import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middleware";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");
// const corsOptions = {
//     origin: "https://wetube-studying.herokuapp.com",
//     credential: true,
// };

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
// app.use(cors, (corsOptions));
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // string to js middleware
app.use("/convert", express.static("node_modules/@ffmpeg/core/dist"));
app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    // res.header("Access-Control-Allow-Origin", "https://wetube-studying.herokuapp.com");
    // res.header("Access-Control-Allow-Credentials", true);
    next();
});


app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 20000, // 20seconds, 쿠키 유지시간
    // },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }), //session saved mongo db
}));

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
