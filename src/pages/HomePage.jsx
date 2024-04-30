import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/HomePageStyles.css';
import CraigSchulmanImage from "../images/CraigSchulman.jpg";
import FPCG_Church_Image from "../images/FPCG_Church_Image.jpg";

function HomePage({ concerts, tickets, purchases }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const [concertsData, setConcerts] = useState([]);
  const [ticketsData, setTickets] = useState([]);
  const [purchasesData, setPurchases] = useState([]);
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
  const BASE_URL_DJANGO = import.meta.env.VITE_REACT_APP_BASE_URL_DJANGO;

  useEffect(() => {
    setConcerts(concerts);
    setTickets(tickets);
    setPurchases(purchases);
  }, [concerts, tickets, purchases]);

  useEffect(() => {
    calculateTotalPrice();
    console.log(selectedSeats)
  }, [selectedSeats]);

  useEffect(() => {
    async function fetchData() {
      try {
        const concertsResponse = await fetch(`${BASE_URL_DJANGO}/api/concerts/`);
        if (!concertsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const concertsData = await concertsResponse.json();
        setConcerts(concertsData);

        const ticketsResponse = await fetch(`${BASE_URL_DJANGO}/api/tickets/`);
        if (!ticketsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);

        const purchasesResponse = await fetch(`${BASE_URL_DJANGO}/api/purchases/`);
        if (!purchasesResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [concerts]);

  const handleCheckout = () => {
    setIsNavigating(true); // Set isNavigating to true
    navigate("/checkout", {
      state: { selectedSeats: selectedSeats, selectedConcert: selectedConcert }
    });
  };
  

  const handleCreateConcert = async () => {
    try {
      const response = await fetch(`${BASE_URL_DJANGO}/api/concerts/`, {
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
      const response = await fetch(`${BASE_URL_DJANGO}/api/concerts/${concertId}/`, {
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

  const handleAddTicket = (priceType, quantity = 1) => {
    if (!selectedConcert) {
      alert("Please select a concert first."); // Show notification if concert is not selected
      return;
    }
    if (selectedConcert) {
      // Find the next available ticket based on the selected price type
      const nextAvailableTickets = ticketsData.filter(
        (ticket) =>
          ticket.concert === selectedConcert.id &&
          ticket.is_sold === false &&
          !selectedSeats.find((seat) => seat.id === ticket.id) &&
          !selectedSeats.find((seat) => seat.ticket_id === ticket.ticket_id)
      );

      const availableQuantity = Math.min(nextAvailableTickets.length, quantity);

      if (availableQuantity > 0) {
        const ticketsToAdd = nextAvailableTickets.slice(0, availableQuantity);

        setSelectedSeats((prevSeats) => [
          ...prevSeats,
          ...ticketsToAdd.map((ticket) => ({
            ...ticket,
            price:
              priceType === "premium"
                ? "65.00"
                : priceType === "standard"
                ? "40.00"
                : "25.00",
            price_type: priceType,
          })),
        ]);

        // Increment quantity for the selected ticket type
        if (priceType === "premium") {
          setPremiumQuantity((prevQuantity) => prevQuantity + availableQuantity);
        } else if (priceType === "standard") {
          setStandardQuantity((prevQuantity) => prevQuantity + availableQuantity);
        } else if (priceType === "student") {
          setStudentQuantity((prevQuantity) => prevQuantity + availableQuantity);
        }

        // Calculate total price after adding new seats
        calculateTotalPrice();
      } else {
        console.error("No available tickets found that meet the conditions");
      }
    } else {
      console.error("No concert selected");
    }
  };

  const handleRemoveTicket = (tix_price_type, tix_price, quantity = 1) => {
    // Filter selected seats for the tickets being removed
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

    // Find the tickets to remove based on the quantity
    const ticketsToRemove = filteredSeats.slice(0, quantity);

    // Remove the tickets to remove from the selected seats
    setSelectedSeats((prevSeats) =>
      prevSeats.filter(
        (seat) => !ticketsToRemove.some((ticket) => ticket.id === seat.id)
      )
    );

    // Decrement quantity for the removed ticket type
    if (tix_price_type === "premium") {
      setPremiumQuantity((prevQuantity) => prevQuantity - quantity);
    } else if (tix_price_type === "standard") {
      setStandardQuantity((prevQuantity) => prevQuantity - quantity);
    } else if (tix_price_type === "student") {
      setStudentQuantity((prevQuantity) => prevQuantity - quantity);
    }

    calculateTotalPrice(); // Calculate total price after removing seats
  };

  const handleQuantityChange = (event, priceType) => {
    const newQuantity = parseInt(event.target.value);
    const diff = newQuantity - getQuantityForPriceType(priceType);
    if (diff > 0) {
      handleAddTicket(priceType, diff);
    } else if (diff < 0) {
      handleRemoveTicket(priceType, getPriceForPriceType(priceType), -diff);
    }
  };

  const getQuantityForPriceType = (priceType) => {
    switch (priceType) {
      case "premium":
        return premiumQuantity;
      case "standard":
        return standardQuantity;
      case "student":
        return studentQuantity;
      default:
        return 0;
    }
  };

  const getPriceForPriceType = (priceType) => {
    switch (priceType) {
      case "premium":
        return "65.00";
      case "standard":
        return "40.00";
      case "student":
        return "25.00";
      default:
        return "0.00";
    }
  };

  const calculateTotalPrice = () => {
    let price = selectedSeats.reduce(
      (accumulator, seat) => accumulator + parseFloat(seat.price),
      0
    );
    price = Math.round(price * 100) / 100;
    setTotalPrice(price);
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
          className="concert-image"
        />
      </div>
      <div className="right-section">
        <img
          src={FPCG_Church_Image}
          alt="First Presbyterian Church of Greenlawn"
          className="church-image"
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
      {/* Button to create a new concert */}
      <div className="create-concert-section">
        {/* Inputs for creating a new concert */}
        <Typography variant="h4">Create New Concert</Typography>
        <TextField
          label="Concert Name"
          value={newConcertName}
          onChange={(e) => setNewConcertName(e.target.value)}
        />
        <TextField
          label="Concert Date"
          type="date"
          value={newConcertDate}
          onChange={(e) => setNewConcertDate(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreateConcert}>Create Concert</Button>
      </div>

      {/* Button to delete a concert */}
      <div className="delete-concert-section">
        <Typography variant="h4">Delete Concert</Typography>
        <List>
          {concertsData.map((concert) => (
            <ListItem key={concert.id}>
              <ListItemText
                primary={`${concert.name} - ${concert.date}`}
              />
              <Button variant="contained" color="error" onClick={() => handleDeleteConcert(concert.id)}>
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
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
                  <TableCell>
                    <TextField
                      type="number"
                      value={premiumQuantity}
                      onChange={(e) => handleQuantityChange(e, "premium")}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell>${(premiumQuantity * 65).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveTicket("premium", "65.00")}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Standard</TableCell>
                  <TableCell>$40</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={standardQuantity}
                      onChange={(e) => handleQuantityChange(e, "standard")}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell>${(standardQuantity * 40).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveTicket("standard", "40.00")}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>$25</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={studentQuantity}
                      onChange={(e) => handleQuantityChange(e, "student")}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell>${(studentQuantity * 25).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveTicket("student", "25.00")}
                    >
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Charge</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{selectedSeats.length}</TableCell>
                  <TableCell>${totalPrice.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      {/* Checkout button */}
      <Button variant="contained" className="checkout-button" onClick={handleCheckout}>

          Go To Checkout

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