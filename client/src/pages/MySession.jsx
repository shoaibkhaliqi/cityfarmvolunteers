import React,{ useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Alert,Container, Spinner, Button } from 'react-bootstrap';
import jwtDecode from 'jwt-decode';

const SessionList = () => {
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState([]); // An array of session objects
  const [loading, setLoading] = useState(false); // A boolean to indicate the loading status
  const [error, setError] = useState(null); // An error object or null

  const fetchSessions = async (id) => {
    try {
     

    axios.defaults.baseURL = 'http://localhost:5000';

    const response = await axios.get(`/mysessions/${id}`);


      if (response.status === 200) {
        setSessions(response.data.data.rows);
        setError(null);
      } else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');

        const payload = jwtDecode(token);

        const volunteerId = payload.id;
        
        const response = await axios.post(`/sessions/${sessionId}/cancel`, {volunteerId}, {
        headers: { 'x-access-token': token },
    });

      if (response.status === 200) {
        setMessage(`You Canceled session ${sessionId}`);
        fetchSessions(volunteerId);
      } else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = jwtDecode(token);
    const id = payload.id;

    fetchSessions(id);
  }, [sessions]);



  return (
    <Container>
      <h1 className="text-center">My Session List</h1>
      {loading && <Spinner animation="border" variant="primary" className="mx-auto d-block" />}
      {error && (
        <Alert variant="danger" className="text-center">
          {error.message}
        </Alert>
      )}
      {sessions.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.volunteer_Id || session.time}</td>
                <td><Button variant="danger" onClick={() => handleCancel(session.id)}>Cancel</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
            };
export default SessionList;
