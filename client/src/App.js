import jwtdecode from "jwt-decode";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Sessions from "./pages/Sessions";
import Signup from "./pages/Signup";
import MySession from "./pages/MySession.jsx";

function useAuth() {
  const [user, setUser] = useState(null);

  function getToken() {
    return localStorage.getItem("token");
  }

  function setToken(token) {
    localStorage.setItem("token", token);
  }

  function removeToken() {
    localStorage.removeItem("token");
  }

  function getUser(token) {
    try {
      const id = jwtdecode(token);
      return id;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    const token = getToken();
    const user = getUser(token);
    setUser(user);
  }, []);

  return { user, setToken, removeToken };
}

function App() {
  const { user, setToken, removeToken } = useAuth();

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login/*" element={<Login />} />
        <Route path="/Sessions" element={<Sessions />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/mysessions/*" element={<MySession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
