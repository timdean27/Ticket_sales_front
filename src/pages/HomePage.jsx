import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Checkbox,
  Button,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CheckoutPage from "./CheckoutPage";

function HomePage({ tickets, purchases, concerts }) {
  const [concertsData, setConcerts] = useState(concerts);
  const [ticketsData, setTicketsData] = useState(tickets);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [newConcertName, setNewConcertName] = useState("");
  const [newConcertDate, setNewConcertDate] = useState("");
  const [seatsUnder50, setSeatsUnder50] = useState([]);
  const [seatsOver50, setSeatsOver50] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchTickets();
  }, [concertsData]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tickets/`);
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      setTicketsData(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleCreateConcert = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/concerts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newConcertName, date: newConcertDate }),
      });
      if (!response.ok) {
        throw new Error("Failed to create concert");
      }
      const data = await response.json();
      setConcerts([...concertsData, data]);
      setNewConcertName("");
      setNewConcertDate("");
      fetchTickets();
    } catch (error) {
      console.error("Error creating concert:", error);
    }
  };

  const handleDeleteConcert = async (concertId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/concerts/${concertId}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete concert");
      }
      setConcerts(concertsData.filter((concert) => concert.id !== concertId));
    } catch (error) {
      console.error("Error deleting concert:", error);
    }
  };

  const handleSelectConcert = (concert) => {
    setSelectedConcert(concert);
  };

  const handleAddTicket = (price) => {
    const nextSeat = getNextAvailableSeat(price);
    if (nextSeat !== null) {
      if (price === 65) {
        setSeatsUnder50((prevSeats) => [...prevSeats, nextSeat]);
      } else {
        setSeatsOver50((prevSeats) => [...prevSeats, nextSeat]);
      }
      setSelectedSeats((prevSeats) => [...prevSeats, nextSeat]);
      console.log(selectedSeats, "selectedSeats");
    } else {
      console.log("No available seats.");
    }
  };

  const getNextAvailableSeat = (price) => {
    let nextSeat = null;
    if (price === 65) {
      for (let i = 1; i <= 50; i++) {
        const filteredTicket = ticketsData.find(
          (ticket) =>
            ticket.is_sold === false &&
            ticket.concert === selectedConcert.id &&
            ticket.seat_number === i
        );
        if (filteredTicket && !selectedSeats.includes(filteredTicket)) {
          nextSeat = filteredTicket;
          break; // Stop iteration once a valid ticket is found
        }
      }
    } else if (price === 40) {
      for (let i = 51; i <= 100; i++) {
        const filteredTicket = ticketsData.find(
          (ticket) =>
            ticket.is_sold === false &&
            ticket.concert === selectedConcert.id &&
            ticket.seat_number === i
        );
        if (filteredTicket && !selectedSeats.includes(filteredTicket)) {
          nextSeat = filteredTicket;
          break; // Stop iteration once a valid ticket is found
        }
      }
    }
    return nextSeat;
  };

  return (
    <div>
<Link
  to="/checkout"
    state ={{selectedSeats :selectedSeats
  }}
>
  Go To Checkout
</Link>

 
      <Typography variant="h4">Concerts</Typography>
      <div>
        <TextField
          type="text"
          value={newConcertName}
          onChange={(e) => setNewConcertName(e.target.value)}
          label="Concert Name"
          variant="outlined"
        />
        <TextField
          type="date"
          value={newConcertDate}
          onChange={(e) => setNewConcertDate(e.target.value)}
          label="Concert Date"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateConcert}
        >
          Create Concert
        </Button>
      </div>
      <List>
        {concertsData.map((concert) => (
          <ListItem key={concert.id}>
            <ListItemText
              primary={`${concert.name} - ${concert.date}, ConcertID: ${concert.id}`}
            />
            <Checkbox
              checked={selectedConcert && selectedConcert.id === concert.id}
              onChange={() => handleSelectConcert(concert)}
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteConcert(concert.id)}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>

      <Typography variant="h4">Tickets</Typography>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddTicket(65)}
        >
          Tickets ($65)
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddTicket(40)}
        >
          Tickets ($40)
        </Button>
      </div>
      <div>
        <Typography variant="h5">Selected Seats:</Typography>
        <ul>
          <li>You selected {seatsUnder50.length} $65 seats:</li>
          {seatsUnder50.map((seat) => (
            <li key={seat.id}>
              Seat # {seat.seat_number} for concert {seat.concert} , ticket id{" "}
              {seat.id} , price {seat.price}, ticket_id {seat.ticket_id}
            </li>
          ))}
          <li>You selected {seatsOver50.length} $40 seats:</li>
          {seatsOver50.map((seat) => (
            <li key={seat.id}>
              Seat # {seat.seat_number} for concert {seat.concert} , ticket id{" "}
              {seat.id} , price {seat.price}, ticket_id {seat.ticket_id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
