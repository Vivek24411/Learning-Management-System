const express = require("express");
const app = express();
const dbConnection = require("./utils/dbConnection");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const cors = require("cors");

dbConnection();


app.use(cors({
    origin: (origin, callback)=>{
        if(!origin || origin === "https://learning-management-system-mocha-seven.vercel.app/" || origin === "https://edvance.devx6.live" || origin.startsWith("http://localhost")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed"), false);
        }
    }
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/user",userRouter);
app.use("/admin",adminRouter);

app.use("/user",userRouter);

module.exports = app;