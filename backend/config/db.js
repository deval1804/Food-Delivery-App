import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://devaldarji93795:185185@cluster0.l1kszyy.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}