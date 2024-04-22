import React, { useState, useEffect } from 'react';
import { TextField, Box, Button, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

function PurchaseModal({ checkoutSelectedSeats, totalPrice , checkoutSelectedConcert }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfPurchase, setDateOfPurchase] = useState('');
  const [purchaseSelectedSeats, setPurchaseSelectedSeats] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const BASE_URL_DJANGO = import.meta.env.VITE_REACT_APP_BASE_URL_DJANGO;

  useEffect(() => {
    setPurchaseSelectedSeats(checkoutSelectedSeats);
  }, [checkoutSelectedSeats]);

  const handleSubmit = async () => {
    try {
      console.log('Submitting purchase...');
  
      if (!purchaseSelectedSeats || purchaseSelectedSeats.length === 0) {
        console.error('No selected seats to purchase.');
        return;
      }
  
      // Check if email is valid
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
        price_type: seat.price_type
      }));
  
      const purchaseData = {
        concert: checkoutSelectedConcert.name,
        name: name,
        email: email,
        phone_number: phoneNumber,
        date_of_purchase: dateOfPurchase,
        tickets: ticketInstances,
        total_price: totalPrice
      };
  
      console.log('Purchase data:', purchaseData);
  
      const response = await axios.post(`${BASE_URL}/api/purchases/`, purchaseData);
  
      console.log('Purchase submitted successfully:', response.data);
  
      try {
        // Update tickets
        await Promise.all(
          purchaseSelectedSeats.map(async (seat) => {
            try {
              const response = await axios.put(`${BASE_URL}/api/tickets/${seat.id}/`, {
                ...seat, // Spread the seat object
                is_sold: true,
                price: seat.price,
                price_type: seat.price_type,
              });
              console.log(`Ticket ${seat.id} updated successfully:`, response.data);
            } catch (error) {
              console.error(`Error updating ticket ${seat.id}:`, error);
              // Handle error as needed
            }
          })
        );
      } catch (error) {
        console.error('Error updating tickets:', error);
        // Handle error as needed
      }
      
      
      console.log('Tickets updated successfully.');
  
      setName('');
      setEmail('');
      setPhoneNumber('');
      setDateOfPurchase('');
  
    } catch (error) {
      console.error('Error submitting purchase:', error);
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const validateEmail = (email) => {
    // Regular expression for validating email
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  return (
    <Box
      sx={{
        width: 400,
        bgcolor: 'background.paper',
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
        onChange={(e) => setDateOfPurchase(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
          Please enter a valid email address.
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default PurchaseModal;
