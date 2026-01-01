const mongoose = require('mongoose');
const connectDB = async()=>{
console.log("🔗 MONGO_URI value:", process.env.MONGO_URI);
await mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected successfully"))


}

module.exports = connectDB;
