import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const LoginPopup = ({ setShowLogin }) => {

  const { url, setToken } = useContext(StoreContext)

  const [currentState, setCurrentState] = useState("Login")
  const [loading, setLoading] = useState(false)

  //  NEW STATES
  const [loginType, setLoginType] = useState("PASSWORD") // PASSWORD / OTP
  const [step, setStep] = useState("EMAIL") // EMAIL → OTP
  const [otp, setOtp] = useState("")

  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  //  PASSWORD LOGIN
 
  const onLogin = async (event) => {
    event.preventDefault()

    let apiUrl = url + (currentState === "Login"
      ? "/api/user/login"
      : "/api/user/register")

    try {
      setLoading(true)

      const response = await axios.post(apiUrl, data)

      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem("token", response.data.token)

        toast.success(`${currentState} Successful!`)

        setTimeout(() => {
          setShowLogin(false)
        }, 1500)

      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error("Something went wrong!")
    } finally {
      setLoading(false)
    }
  }


  //  SEND OTP
  const sendOtp = async () => {
    try {
      setLoading(true)

      const res = await axios.post(url + "/api/user/send-otp", {
        email: data.email
      })

      if (res.data.success) {
        toast.success("OTP Sent")
        setStep("OTP")
      } else {
        toast.error(res.data.message)
      }

    } catch (err) {
      toast.error("Error sending OTP")
    } finally {
      setLoading(false)
    }
  }

  //  VERIFY OTP
  
  const verifyOtp = async () => {
    try {
      setLoading(true)

      const res = await axios.post(url + "/api/user/verify-otp", {
        email: data.email,
        otp
      })

      if (res.data.success) {
        setToken(res.data.token)
        localStorage.setItem("token", res.data.token)

        toast.success("Login Successful")

        setTimeout(() => {
          setShowLogin(false)
        }, 1000)

      } else {
        toast.error(res.data.message)
      }

    } catch (err) {
      toast.error("Error verifying OTP")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (!data.email) return false
    if (loginType === "PASSWORD" && !data.password) return false
    if (currentState === "Sign Up" && !data.name) return false
    return true
  }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">

        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>

        {/* 🔄 SWITCH LOGIN TYPE */}
        {currentState === "Login" && (
          <div style={{ marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setLoginType("PASSWORD")
                setStep("EMAIL")
              }}
            >
              Password Login
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("OTP")
                setStep("EMAIL")
              }}
              style={{ marginLeft: "10px" }}
            >
              OTP Login
            </button>
          </div>
        )}

        <div className="login-popup-input">

          {currentState === "Sign Up" && (
            <input
              name='name'
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder='Your Name'
              required
            />
          )}

          {/* EMAIL */}
          <input
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder='Your Email'
            required
          />

          {/* PASSWORD (only for password login) */}
          {loginType === "PASSWORD" && (
            <input
              name='password'
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder='Password'
              required
            />
          )}

          {/* OTP INPUT */}
          {loginType === "OTP" && step === "OTP" && (
            <input
              type="text"
              placeholder='Enter OTP'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          )}
        </div>

        {/* 🔘 BUTTONS */}
        {loginType === "PASSWORD" ? (
          <button type='submit' disabled={!isFormValid() || loading}>
            {loading ? "Please wait..." : currentState === "Sign Up" ? "Create account" : "Login"}
          </button>
        ) : (
          <>
            {step === "EMAIL" ? (
              <button type="button" onClick={sendOtp} disabled={!data.email || loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <button type="button" onClick={verifyOtp} disabled={!otp || loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            )}
          </>
        )}

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currentState === "Login" ? (
          <p>Create a new account? <span onClick={() => setCurrentState("Sign Up")}>Click Here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrentState("Login")}>Login Here</span></p>
        )}
      </form>

      <ToastContainer position="top-center" />
    </div>
  )
}

export default LoginPopup