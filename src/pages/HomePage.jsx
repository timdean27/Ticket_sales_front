import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox
} from "@mui/material";

import CraigSchulmanImage from "../images/CraigSchulman.jpg";
import FPCG_Church_Image from "../images/FPCG_Church_Image.jpg";

function HomePage({ concerts, tickets, purchases }) {
  const [concertsData, setConcerts] = useState(concerts);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [newConcertName, setNewConcertName] = useState("");
  const [newConcertDate, setNewConcertDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [premiumQuantity, setPremiumQuantity] = useState(0);
  const [standardQuantity, setStandardQuantity] = useState(0);
  const [studentQuantity, setStudentQuantity] = useState(0);

  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    calculateTotalPrice(),
    console.log(selectedSeats)
  }, [selectedSeats]);

  useEffect(() => {
    // Fetching tickets can be added here if needed
  }, [concertsData]);

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

  const handleAddTicket = async (priceType) => {
    if (selectedConcert) {
      // Find the next available ticket based on the selected price type
      const nextAvailableTicket = tickets.find(ticket => (
          ticket.concert === selectedConcert.id &&
          ticket.is_sold === false &&
          !selectedSeats.find(seat => seat.id === ticket.id) &&
          !selectedSeats.find(seat => seat.ticket_id === ticket.ticket_id)
      ));

      if (nextAvailableTicket) {
        // Update ticket price and type
        const updatedTicket = {
          ...nextAvailableTicket,
          price: priceType === 'premium' ? "65.00" : (priceType === 'standard' ? "40.00" : "25.00"),
          price_type: priceType
        };

        // Make a POST request to update the ticket
        try {
          const response = await fetch(`${BASE_URL}/api/tickets/${updatedTicket.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTicket),
          });
          if (!response.ok) {
            throw new Error("Failed to update ticket");
          }
        } catch (error) {
          console.error("Error updating ticket:", error);
          return;
        }

        // Add the ticket to selected seats
        setSelectedSeats(prevSeats => [...prevSeats, updatedTicket]);

        // Increment quantity for the selected ticket type
        if (priceType === 'premium') {
          setPremiumQuantity(prevQuantity => prevQuantity + 1);
        } else if (priceType === 'standard') {
          setStandardQuantity(prevQuantity => prevQuantity + 1);
        } else if (priceType === 'student') {
          setStudentQuantity(prevQuantity => prevQuantity + 1);
        }

        // Print selected seats
        console.log("Selected Seats:", selectedSeats);

        // Calculate total price after adding a new seat
        calculateTotalPrice();
      } else {
        console.error("No available ticket found that meets the conditions");
      }
    } else {
      console.error("No concert selected");
    }
  };

  const handleRemoveTicket = (tix_price_type, tix_price) => {
    // Filter selected seats for the ticket being removed
    const filteredSeats = selectedSeats.filter(
      (seat) =>
        seat.price_type === tix_price_type && parseFloat(seat.price) === parseFloat(tix_price)
    );
  
    // Check if filteredSeats is empty
    if (filteredSeats.length === 0) {
      console.error("No tickets found with the specified price type and price.");
      return; // Exit the function if no tickets are found
    }
  
    // Find the ticket with the highest id among the filtered seats
    const highestIdTicket = filteredSeats.reduce(
      (prev, current) => (prev.id > current.id ? prev : current)
    );
  
    // Remove the ticket with the highest ID from the selected seats
    setSelectedSeats((prevSeats) =>
      prevSeats.filter((seat) => seat.id !== highestIdTicket.id)
    );
  
    // Decrement quantity for the removed ticket type
    if (highestIdTicket.price_type === "premium") {
      setPremiumQuantity((prevQuantity) => prevQuantity - 1);
    } else if (highestIdTicket.price_type === "standard") {
      setStandardQuantity((prevQuantity) => prevQuantity - 1);
    } else if (highestIdTicket.price_type === "student") {
      setStudentQuantity((prevQuantity) => prevQuantity - 1);
    }
  
    calculateTotalPrice(); // Calculate total price after removing a seat
  };
  
  
  const calculateTotalPrice = () => {
    let price = selectedSeats.reduce((accumulator, seat) => accumulator + parseFloat(seat.price), 0);
    price = Math.round(price * 100) / 100;
    setTotalPrice(price);
  };

  return (
    <div style={{ backgroundColor: "#d8f3dc", height: "100vh", padding: "20px", position: "relative" }}>
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Typography variant="h5">Craig Schulman on Broadway</Typography>
        <Typography variant="subtitle1">Sunday, June 9, 2024 at 3:00pm</Typography>
        <img src={CraigSchulmanImage} alt="Craig Schulman" style={{ maxWidth: "30%", marginTop: "10px" }} />
      </div>
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <img src={FPCG_Church_Image} alt="First Presbyterian Church of Greenlawn" style={{ maxWidth: "150px" }} />
        <Typography variant="subtitle2">First Presbyterian Church of Greenlawn</Typography>
        <Typography variant="subtitle2">497 Pulaski Road</Typography>
        <Typography variant="subtitle2">Greenlawn, New York 11722</Typography>
        <Typography variant="subtitle2">(631) 261-2150</Typography>
      </div>
      <div>
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
                onChange={() => setSelectedConcert(concert)}
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
      </div>
      <div>
        <Typography variant="h4">Tickets</Typography>
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddTicket("premium")}
          >
            Premium Ticket ($65)
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddTicket("standard")}
          >
            Standard Ticket ($40)
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddTicket("student")}
          >
            Student Ticket ($25)
          </Button>

        </div>
        <div>
          <Typography variant="h5">Selected Seats:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tickets</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Premium*</TableCell>
                  <TableCell>{premiumQuantity}</TableCell>
                  <TableCell>$65</TableCell>
                  <TableCell>${(premiumQuantity * 65).toFixed(2)}</TableCell>
                  <Button
  variant="contained"
  color="error"
  onClick={() => handleRemoveTicket("premium", "65.00")}
>
  Remove Ticket
</Button>
                </TableRow>
                <TableRow>
                  <TableCell>Standard</TableCell>
                  <TableCell>{standardQuantity}</TableCell>
                  <TableCell>$40</TableCell>
                  <TableCell>${(standardQuantity * 40).toFixed(2)}</TableCell>
                  <Button
            variant="contained"
            color="error"
            onClick={() => handleRemoveTicket("standard" , "40.00")}
          >
            Remove Ticket
          </Button>
                </TableRow>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>{studentQuantity}</TableCell>
                  <TableCell>$25</TableCell>
                  <TableCell>${(studentQuantity * 25).toFixed(2)}</TableCell>
                  <Button
            variant="contained"
            color="error"
            onClick={() => handleRemoveTicket("student" , "25.00")}
          >
            Remove Ticket
          </Button>
                </TableRow>
                <TableRow>
                  <TableCell>Total Charge</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>${totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <Link
          to={{
            pathname: "/checkout",
            state: { selectedSeats: selectedSeats },
          }}
        >
          Go To Checkout
        </Link>
      </div>
      <div>
        <Typography variant="body1">* Premium seats include seating in the front, and an after-concert reception, including a Question-and-Answer Meet-and-Greet with Mr. Schulman</Typography>
      </div>
    </div>
  );
}

export default HomePage;

