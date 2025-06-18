import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    phone: "",
    country: ""
  })

  const onChangeHandler = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

 const handlePlaceOrder = async (event) => {
  event.preventDefault();

  if (!token) {
    toast.error("Please login to place order.");
    return;
  }

  const orderItems = [];
  food_list.forEach(item => {
    const qty = cartItems[item._id] || 0;
    if (qty > 0) {
      orderItems.push({ ...item, quantity: qty });
    }
  });

  // ✅ Yahan ye check lagao
  if (orderItems.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  const orderData = {
    address: data,
    items: orderItems,
    amount: getTotalCartAmount() + 2
  };

  try {
    const res = await axios.post(
      `${url}/api/order/place`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.data.success) {
      window.location.replace(res.data.session_url);
    } else {
      toast.error("Error placing order.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Unable to place order.");
  }
};

const navigate = useNavigate();

useEffect(() =>{
  if (!token) {
    navigate('/cart')
  }
  else if (getTotalCartAmount() === 0)
  {
    navigate('/cart')
  }
})

  const deliveryFee = 2
  const subtotal = getTotalCartAmount()
  const totalAmount = subtotal === 0 ? 0 : subtotal + deliveryFee

  return (
    <form onSubmit={handlePlaceOrder} className="place-order">
      {/* Delivery Info */}
      <div className="place-order-right">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="First Name" />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Last Name" />
        </div>
        <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email Address" />
        <input required name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder="City" />
          <input name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder="Zip Code" />
          <input name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder="Country" />
        </div>
        <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder="Phone" />
      </div>

      {/* Cart Totals */}
      <div className="place-order-left">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${subtotal === 0 ? 0 : deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${totalAmount}</b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
