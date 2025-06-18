// import { json } from "body-parser";
// import orderModel from "../models/orderModels.js";
// import userModel from "../models/userModels.js";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // INR to USD cents conversion
// const inrToUsdCents = (inrAmount) => {
//   const conversionRate = 80;
//   return Math.round((inrAmount / conversionRate) * 100);
// };

// // 📝 Place Order Controller
// const placeOrder = async (req, res) => {
//   const frontend_url = "http://localhost:5173";

//   try {
//     const userId = req.userId;   // <-- yaha se lena hai
//     const { items, amount, address } = req.body;

//     if (!userId || !items || !amount || !address) {
//       return res.status(400).json({ success: false, message: "Incomplete order details" });
//     }

//     const newOrder = new orderModel({ userId, items, amount, address });
//     await newOrder.save();

//     await userModel.findByIdAndUpdate(userId, { cartdata: {} });

//     const line_items = items.map((item) => ({
//       price_data: {
//         currency: "USD",
//         product_data: { name: item.name },
//         unit_amount: inrToUsdCents(item.price),
//       },
//       quantity: item.quantity,
//     }));

//     line_items.push({
//       price_data: {
//         currency: "USD",
//         product_data: { name: "Delivery Charges" },
//         unit_amount: inrToUsdCents(200),
//       },
//       quantity: 1,
//     });

//     const session = await stripe.checkout.sessions.create({
//       line_items,
//       mode: "payment",
//       success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//       cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
//     });

//     res.json({ success: true, session_url: session.url });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error placing order" });
//   }
// };


// // ✅ Verify Order Payment
// const verifyOrder = async (req, res) => {
//   const { orderId, success } = req.body;

//   try {
//     if (!orderId) {
//       return res.status(400).json({ success: false, message: "OrderId is required" });
//     }

//     if (success === "true") {
//       await orderModel.findByIdAndUpdate(orderId, { payment: true });
//       res.json({ success: true, message: "Payment successful" });
//     } else {
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false, message: "Payment failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error verifying order" });
//   }
// };

// // ✅ Get User Orders
// const userOrders = async (req, res) => {
//   try {
//     const userId = req.userId;
//     if (!userId) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     const orders = await orderModel.find({ userId });
//     res.json({ success: true, data: orders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error fetching orders" });
//   }
// };

// // Listing orders for admin panel
// const listOrders = async (req, res) => {
//   try {
//     const orders = await orderModel.find({});
//     res, json({ success: true, data: orders })
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error" })

//   }
// }

// export { placeOrder, verifyOrder, userOrders, listOrders };

import orderModel from "../models/orderModels.js";
import userModel from "../models/userModels.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// INR to USD cents conversion
const inrToUsdCents = (inrAmount) => {
  const conversionRate = 80;
  return Math.round((inrAmount / conversionRate) * 100);
};

// ✅ Place Order Controller
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";

  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    if (!userId || !items || !amount || !address) {
      return res.status(400).json({ success: false, message: "Incomplete order details" });
    }

    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartdata: {} });

    const line_items = items.map((item) => ({
      price_data: {
        currency: "USD",
        product_data: { name: item.name },
        unit_amount: inrToUsdCents(item.price),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "USD",
        product_data: { name: "Delivery Charges" },
        unit_amount: inrToUsdCents(200),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// ✅ Verify Order Payment
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (!orderId) {
      return res.status(400).json({ success: false, message: "OrderId is required" });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying order" });
  }
};

// ✅ Get User Orders
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const orders = await orderModel.find({ userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// ✅ List All Orders for Admin Panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// api for updataing order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });

  }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
