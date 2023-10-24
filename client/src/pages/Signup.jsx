import React, { useState } from "react";
import axios from "axios";
import { Container, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {

    const response = await axios.post("http://localhost:5000/signup", {
      username,
      password,
    });
    e.preventDefault();

    setMessage("");

    try {
      const response = await axios.post("/signup", { username, password });

      const token = response.data.token;

      localStorage.setItem("token", token);

      window.location.href = "/login";
    } catch (err) {
      const message = err.response.data.message;
      setMessage(message);
    }
  };

  return (
    <Container>
    <h1>Sign up</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        <Button color="primary" type="submit">
          Sign up
        </Button>
      </Form>
      {message && <Alert color="success">{message}</Alert>}
    </Container>
  );
};
export default Signup;
