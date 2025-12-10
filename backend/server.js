const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");


const server = http.createServer(app);

server.listen(process.env.PORT,(()=>{
    console.log("Server is running on port 3000");
}))

