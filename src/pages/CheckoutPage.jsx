import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useLocation } from "react-router-dom";

function CheckoutPage({ concerts, tickets, purchases }) {
  const { state } = useLocation();
  const [checkoutSelectedSeats, setCheckoutSelectedSeats] = useState(
    state.selectedSeats
  );

  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate number of tickets
  const numberOfTickets = checkoutSelectedSeats.length;

  useEffect(() => {
    calculateTotalPrice();
  }, [checkoutSelectedSeats, studentDiscount]);

  const calculateTotalPrice = () => {
    let price = 0;
    if (studentDiscount) {
      for (let seat of checkoutSelectedSeats) {
        if (seat.price == 40) {
          price += 25;
        } else if (seat.price == 65) {
          price += 65;
        }
      }
    } else {
      price = checkoutSelectedSeats.reduce(
        (accumulator, seat) => accumulator + parseFloat(seat.price),
        0
      );
    }
    // Round the total price to two decimal places
    price = Math.round(price * 100) / 100;
    setTotalPrice(price);
  };

  const handleCheckout = () => {
    // Perform checkout logic here
  };

  const removeTicket = (id) => {
    setCheckoutSelectedSeats(
      checkoutSelectedSeats.filter((seat) => seat.id !== id)
    );
  };

  const showPrice = () => {
    return (
      <div
        style={{
          marginTop: "20px",
          float: "left",
          width: "35%",
          backgroundColor: "#e6f7ff",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #66b3ff",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #66b3ff",
                  padding: "8px",
                  textAlign: "left",
                  width: "45%",
                }}
              >
                Tickets
              </th>
              <th
                style={{
                  border: "1px solid #66b3ff",
                  padding: "8px",
                  textAlign: "left",
                  width: "65%",
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {checkoutSelectedSeats.map((seat) => (
              <tr key={seat.id}>
                <td
                  style={{
                    border: "1px solid #66b3ff",
                    padding: "8px",
                    wordWrap: "break-word",
                  }}
                >
                  {seat.price == 65 ? (
                    <strong>Premium</strong>
                  ) : seat.price == 40 ? (
                    <strong>Standard</strong>
                  ) : (
                    <strong>Student</strong>
                  )}
                  : Seat #{seat.seat_number} for concert {seat.concert}
                </td>
                <td style={{ border: "1px solid #66b3ff", padding: "8px" }}>
                  {studentDiscount && seat.price == 40 ? (
                    `$25 (Student Discount)`
                  ) : (
                    `$${seat.price}`
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #66b3ff",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  <IconButton onClick={() => removeTicket(seat.id)}>
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
    <Typography variant="h4" gutterBottom>
      Checkout
    </Typography>
    <Typography variant="h5" gutterBottom>
      Selected Seats:
    </Typography>
    {showPrice()}

    <div style={{ marginTop: "20px", backgroundColor: "#e6f7ff", padding: "10px", borderRadius: "5px", border: "1px solid black" }}>
      <TextField
        label="Number of Tickets"
        variant="outlined"
        fullWidth
        margin="normal"
        value={numberOfTickets}
        InputProps={{ readOnly: true }} // Make the input read-only
      />
      <FormControlLabel
        control={<Checkbox checked={studentDiscount} onChange={(e) => setStudentDiscount(e.target.checked)} />}
        label="Student Discount"
      />
      <Typography variant="h6" style={{ marginLeft: "auto" }}>
        Total Price: ${totalPrice}
      </Typography>
    </div>

    <Typography variant="h5" gutterBottom>
      Enter Your Information:
    </Typography>
    <form>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        margin="normal"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
    </form>
    <Button variant="contained" color="primary" onClick={handleCheckout}>
      Checkout
    </Button>
  </div>
  );
}

export default CheckoutPage;
