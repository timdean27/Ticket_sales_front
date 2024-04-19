import React, { useState, useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";
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
  Checkbox,
  Box,
} from "@mui/material";
import '../styles/HomePageStyles.css';
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

  const navigate = useNavigate();
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    calculateTotalPrice();
    console.log(selectedSeats);
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
        body: JSON.stringify({
          name: newConcertName,
          date: newConcertDate || "2024-06-09",
        }),
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

  const handleAddTicket = (priceType) => {
    if (selectedConcert) {
      // Find the next available ticket based on the selected price type
      const nextAvailableTicket = tickets.find(
        (ticket) =>
          ticket.concert === selectedConcert.id &&
          ticket.is_sold === false &&
          !selectedSeats.find((seat) => seat.id === ticket.id) &&
          !selectedSeats.find((seat) => seat.ticket_id === ticket.ticket_id)
      );
  
      if (nextAvailableTicket) {
        // Update selectedSeats state with the new selected seat
        setSelectedSeats((prevSeats) => [
          ...prevSeats,
          {
            ...nextAvailableTicket,
            price:
              priceType === "premium"
                ? "65.00"
                : priceType === "standard"
                ? "40.00"
                : "25.00",
            price_type: priceType,
          },
        ]);
  
        // Increment quantity for the selected ticket type
        if (priceType === "premium") {
          setPremiumQuantity((prevQuantity) => prevQuantity + 1);
        } else if (priceType === "standard") {
          setStandardQuantity((prevQuantity) => prevQuantity + 1);
        } else if (priceType === "student") {
          setStudentQuantity((prevQuantity) => prevQuantity + 1);
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
        seat.price_type === tix_price_type &&
        parseFloat(seat.price) === parseFloat(tix_price)
    );

    // Check if filteredSeats is empty
    if (filteredSeats.length === 0) {
      console.error(
        "No tickets found with the specified price type and price."
      );
      return; // Exit the function if no tickets are found
    }

    // Find the ticket with the highest id among the filtered seats
    const highestIdTicket = filteredSeats.reduce((prev, current) =>
      prev.id > current.id ? prev : current
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
    let price = selectedSeats.reduce(
      (accumulator, seat) => accumulator + parseFloat(seat.price),
      0
    );
    price = Math.round(price * 100) / 100;
    setTotalPrice(price);
  };

  const handleCheckout = async () => {
    // Make POST requests to update ticket prices and types
    try {
      await Promise.all(
        selectedSeats.map(async (seat) => {
          const response = await fetch(`${BASE_URL}/api/tickets/${seat.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              price: seat.price,
              price_type: seat.price_type,
            }),
          });
          if (!response.ok) {
            throw new Error(`Failed to update ticket ${seat.id}`);
          }
        })
      );
      console.log("All tickets updated successfully");
      // Redirect to checkout page
      // Use history.push("/checkout") if using useHistory hook
    } catch (error) {
      console.error("Error updating tickets:", error);
    }

  };

  return (
<div className="container">
<div className="left-section">
    <Typography variant="h5">Craig Schulman on Broadway</Typography>
    <Typography variant="subtitle1" style={{ fontSize: "1.2rem" }}>
      Sunday, June 9, 2024 at 3:00pm
    </Typography>
    <img
      src={CraigSchulmanImage}
      alt="Craig Schulman"
      className="concert-image" // Added class name for the image
    />
  </div>
  <div className="right-section">
    <img
      src={FPCG_Church_Image}
      alt="First Presbyterian Church of Greenlawn"
      className="church-image" // Added class name for the image
    />
    <Typography variant="subtitle2" className="address">
      First Presbyterian Church of Greenlawn
    </Typography>
    <Typography variant="subtitle2" className="address">
      497 Pulaski Road
    </Typography>
    <Typography variant="subtitle2" className="address">
      Greenlawn, New York 11722
    </Typography>
    <Typography variant="subtitle2" className="address">
      (631) 261-2150
    </Typography>
  </div>

  {/* Concerts section */}
  <div className="concerts-section">
    <Typography variant="h4">Concerts</Typography>
    <List>
      {concertsData.map((concert) => (
        <ListItem key={concert.id}>
          <Box display="flex" alignItems="center">
            <ListItemText
              primary={`${concert.name} - Sunday, June 9, 2024 at 3:00pm`}
            />
            <Checkbox
              checked={selectedConcert && selectedConcert.id === concert.id}
              onChange={() => setSelectedConcert(concert)}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  </div>

  {/* Tickets section */}
  <div className="tickets-section">
    <Typography variant="h4">Tickets</Typography>
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAddTicket("premium")}
        className="ticket-button"
      >
        Premium Ticket ($65)
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAddTicket("standard")}
        className="ticket-button"
      >
        Standard Ticket ($40)
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAddTicket("student")}
        className="ticket-button"
      >
        Student Ticket ($25)
      </Button>
    </div>
    <div className="selected-seats">
      <Typography variant="h5">Selected Seats:</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tickets</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>

              <TableCell>Total</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Premium*</TableCell>
              <TableCell>$65</TableCell>
              <TableCell>{premiumQuantity}</TableCell>

              <TableCell>${(premiumQuantity * 65).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveTicket("premium", "65.00")}
                >
                  Remove Ticket
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Standard</TableCell>
              <TableCell>$40</TableCell>
              <TableCell>{standardQuantity}</TableCell>

              <TableCell>${(standardQuantity * 40).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveTicket("standard", "40.00")}
                >
                  Remove Ticket
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>$25</TableCell>
              <TableCell>{studentQuantity}</TableCell>

              <TableCell>${(studentQuantity * 25).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveTicket("student", "25.00")}
                >
                  Remove Ticket
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Charge</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>${totalPrice.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  </div>

  {/* Checkout button */}
  <Button variant="contained" className="checkout-button">
  <Link
    to= "/checkout"
    state= {{ selectedSeats: selectedSeats}}
    style={{
      color: "black",
      textDecoration: "none",
    }}
  >
    Go To Checkout
  </Link>
</Button>


  {/* Note about Premium seats */}
  <div style={{ padding: ".5vh" }}>
    <Typography variant="body1" style={{ fontSize: "0.9rem" }}>
      * Premium seats include seating in the front, and an after-concert
      reception, including a Question-and-Answer Meet-and-Greet with Mr.
      Schulman
    </Typography>
  </div>
</div>

  );
}

export default HomePage;
