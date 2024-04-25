import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation } from "react-router-dom";
import PurchaseModal from "../components/PurchaseModal";

function CheckoutPage({ concerts, tickets, purchases }) {
  const { state } = useLocation();
  const [checkoutSelectedSeats, setCheckoutSelectedSeats] = useState([]);
  const [checkoutSelectedConcert, setCheckoutSelectedConcert] = useState(null); // Ensure it's initialized as null
  const [totalPrice, setTotalPrice] = useState(0);
  const [premiumQuantity, setPremiumQuantity] = useState(0);
  const [standardQuantity, setStandardQuantity] = useState(0);
  const [studentQuantity, setStudentQuantity] = useState(0);

  useEffect(() => {
    // Check if state is not null and contains selectedSeats
    if (state && state.selectedSeats) {
      setCheckoutSelectedSeats(state.selectedSeats);
      setCheckoutSelectedConcert(state.selectedConcert); // Set the selected concert
      updateQuantities(state.selectedSeats);
      console.log(checkoutSelectedConcert)
    }
  }, [state]);


  useEffect(() => {
    // Calculate total price based on checkoutSelectedSeats
    const totalPrice = checkoutSelectedSeats.reduce(
      (total, seat) => total + parseFloat(seat.price),
      0
    );
    setTotalPrice(totalPrice);
    console.log(checkoutSelectedSeats);
  }, [checkoutSelectedSeats]);

  const updateQuantities = (selectedSeats) => {
    // Reset quantities
    setPremiumQuantity(0);
    setStandardQuantity(0);
    setStudentQuantity(0);

    // Update quantities based on selected seats
    selectedSeats.forEach((seat) => {
      switch (seat.price_type) {
        case "premium":
          setPremiumQuantity((prevQuantity) => prevQuantity + 1);
          break;
        case "standard":
          setStandardQuantity((prevQuantity) => prevQuantity + 1);
          break;
        case "student":
          setStudentQuantity((prevQuantity) => prevQuantity + 1);
          break;
        default:
          break;
      }
    });
  };

  const handleRemoveTicket = (priceType, price) => {
    // Filter selected seats for the ticket being removed
    const filteredSeats = checkoutSelectedSeats.filter(
      (seat) =>
        seat.price_type === priceType &&
        parseFloat(seat.price) === parseFloat(price)
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
    setCheckoutSelectedSeats((prevSeats) =>
      prevSeats.filter((seat) => seat.id !== highestIdTicket.id)
    );

    // Decrement quantity for the removed ticket type
    switch (highestIdTicket.price_type) {
      case "premium":
        setPremiumQuantity((prevQuantity) => prevQuantity - 1);
        break;
      case "standard":
        setStandardQuantity((prevQuantity) => prevQuantity - 1);
        break;
      case "student":
        setStudentQuantity((prevQuantity) => prevQuantity - 1);
        break;
      default:
        break;
    }

    calculateTotalPrice(); // Calculate total price after removing a seat
  };

  return (
    <div>
      <Typography variant="h5">Checkout:</Typography>
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
                  <DeleteIcon />
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
                  <DeleteIcon />
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
                  <DeleteIcon />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Charge</TableCell>
              <TableCell></TableCell>
              <TableCell>{checkoutSelectedSeats.length}</TableCell>
              <TableCell>${totalPrice.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <PurchaseModal checkoutSelectedSeats={checkoutSelectedSeats} totalPrice={totalPrice} checkoutSelectedConcert={checkoutSelectedConcert}/>
    </div>
  );
}

export default CheckoutPage;
