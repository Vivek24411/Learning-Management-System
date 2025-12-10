const express = require("express");
const app = express();
const dbConnection = require("./utils/dbConnection");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const cors = require("cors");

dbConnection();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/user",userRouter);
app.use("/admin",adminRouter);

app.use("/user",userRouter);

module.exports = app;