import React, { useState, useEffect } from "react";
import { useLocation} from "react-router-dom";

function CheckoutPage({ concerts, tickets, purchases }) {

  const { state } = useLocation();


  console.log("State:", state.selectedSeats); // Log the state object received from the previous page

  console.log("Concerts:", concerts); // Log the concerts prop
  console.log("Tickets:", tickets); // Log the tickets prop
  console.log("Purchases:", purchases); // Log the purchases prop

  return (
    <div>
      <h1>Checkout Page</h1>
      {/* You can add more components or content here if needed */}
    </div>
  );
}

export default CheckoutPage;
