import React from 'react';
import { Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { useLocation } from 'react-router-dom';

function CheckoutPage({ concerts, tickets, purchases }) {
    const { state } = useLocation();
    const checkoutSelectedSeats = state.selectedSeats;

    const handleCheckout = () => {
        // Perform checkout logic here
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>Checkout</Typography>
            <Typography variant="h5" gutterBottom>Selected Seats:</Typography>
            <List>
                {checkoutSelectedSeats.map((seat) => (
                    <ListItem key={seat.id}>
                        <ListItemText
                            primary={`Seat # ${seat.seat_number} for concert ${seat.concert}`}
                            secondary={`Ticket ID: ${seat.id}, Price: ${seat.price}`}
                        />
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleCheckout}>
                Checkout
            </Button>
        </div>
    );
}

export default CheckoutPage;
