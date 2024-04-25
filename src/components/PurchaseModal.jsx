import React, { useState, useEffect } from "react";
import { TextField, Box, Button, Snackbar, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";

import PaymentForm from "./PaymentForm"

function PurchaseModal({
  checkoutSelectedSeats,
  totalPrice,
  checkoutSelectedConcert,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfPurchase, setDateOfPurchase] = useState(getCurrentDate());
  const [purchaseSelectedSeats, setPurchaseSelectedSeats] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [successfullPurchaseData, setSuccessfullPurchaseData] = useState("");


  const BASE_URL_DJANGO = import.meta.env.VITE_REACT_APP_BASE_URL_DJANGO;

  useEffect(() => {
    setPurchaseSelectedSeats(checkoutSelectedSeats);
  }, [checkoutSelectedSeats]);

  useEffect(() => {
    console.log("Successfull purchase data:", successfullPurchaseData);
  }, [successfullPurchaseData]);

  const handleSubmit = async () => {
    try {
      console.log("Submitting purchase...");

      if (!purchaseSelectedSeats || purchaseSelectedSeats.length === 0) {
        console.error("No selected seats to purchase.");
        return;
      }

      if (!validateEmail(email)) {
        setOpenSnackbar(true);
        return;
      }

      const ticketInstances = purchaseSelectedSeats.map((seat) => ({
        id: seat.id,
        concert: seat.concert,
        ticket_id: seat.ticket_id,
        is_sold: true,
        seat_number: seat.seat_number,
        price: seat.price,
        price_type: seat.price_type,
      }));

      const purchaseData = {
        concert: checkoutSelectedConcert.name,
        name: name,
        email: email,
        phone_number: phoneNumber,
        date_of_purchase: dateOfPurchase,
        tickets: ticketInstances,
        total_price: totalPrice,
      };

      console.log("Purchase data:", purchaseData);

      const response = await axios.post(
        `${BASE_URL_DJANGO}/api/purchases/`,
        purchaseData
      );

      console.log("Purchase submitted successfully:", response.data);
      setSuccessfullPurchaseData(response.data);

      try {
        await Promise.all(
          purchaseSelectedSeats.map(async (seat) => {
            try {
              const response = await axios.put(
                `${BASE_URL_DJANGO}/api/tickets/${seat.id}/`,
                {
                  ...seat,
                  is_sold: true,
                  price: seat.price,
                  price_type: seat.price_type,
                }
              );
              console.log(
                `Ticket ${seat.id} updated successfully:`,
                response.data
              );
            } catch (error) {
              console.error(`Error updating ticket ${seat.id}:`, error);
            }
          })
        );

        console.log("Tickets updated successfully.");

        // Open PayPal modal after POST and PUT are successfully completed
        setIsPayPalModalOpen(true);
      } catch (error) {
        console.error("Error updating tickets:", error);
      }

      setName("");
      setEmail("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error submitting purchase:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleClosePayPalModal = () => {
    setIsPayPalModalOpen(false);
  };

  // Function to get the current date in the format YYYY-MM-DD
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <Box
      sx={{
        width: 400,
        bgcolor: "background.paper",
        p: 4,
        borderRadius: 2,
        mt: 4,
      }}
    >
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Date of Purchase"
        variant="outlined"
        type="date"
        fullWidth
        value={dateOfPurchase}
        disabled // Make the field unchangeable
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
      {/* PayPal Modal */}
      <Modal
        open={isPayPalModalOpen}
        aria-labelledby="paypal-modal-title"
        aria-describedby="paypal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "lightgray",
            width: "90vw", // Adjust width for mobile and small screens
            maxWidth: "400px", // Set maximum width to prevent it from stretching too much on larger screens
            height: "70vh", // Adjust height
            border: "1px solid black", // Add border
            borderRadius: "8px", // Add border radius for rounded edges
          }}
        >
          <Button
            sx={{
              position: "absolute",
              alignItems: "center", 
            }}
            onClick={handleClosePayPalModal}
          >
            <CloseIcon />
          </Button>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Center horizontally
              justifyContent: "center", // Center vertically
              height: "100%", // Ensure the content takes full height
            }}
          >
            <PaymentForm successfullPurchaseData={successfullPurchaseData}/>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="error"
        >
          Please enter a valid email address.
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default PurchaseModal;
