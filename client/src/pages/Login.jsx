import { useNavigate,Routes, Route } from "react-router-dom";
import { Button } from "reactstrap";
import React, { useState } from "react";
import axios from "axios";
import SessionList from "./Sessions";
import "../App.css";

function Login() {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      
      setMessage("Login successful");
      navigate("/sessions");
    } catch (err) {
      console.error(err.message);
      setMessage("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setMessage("Logout successful");
  };

 

  return (
    <>
      
      <div className="App">
        <h1>City Farm Volunteer Website</h1>
        <p>Please enter your email and password</p>

        <input
          type="username"
          placeholder="UserName"
          value={username}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        <Button onClick={handleLogin}>Login</Button>
        <Button onClick={handleLogout}>Logout</Button>

        <p>{message}</p>
      </div>
    </>
  );
}

export default Login;
