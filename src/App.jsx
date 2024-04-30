import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";

function Apps() {
  const [concerts, setConcerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
 
  const BASE_URL_DJANGO = import.meta.env.VITE_REACT_APP_BASE_URL_DJANGO;

  console.log("run");
  useEffect(() => {
    console.log("Concerts from apps page fetch",concerts)
    console.log("Tickets from apps page fetch",tickets)
    console.log("Purchases from apps page fetch",purchases)
  }, [concerts,tickets,purchases]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch concerts
        const concertsResponse = await fetch(`${BASE_URL_DJANGO}/api/concerts/`);
        if (!concertsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const concertsData = await concertsResponse.json();
        setConcerts(concertsData);

        // Fetch tickets
        const ticketsResponse = await fetch(`${BASE_URL_DJANGO}/api/tickets/`);
        if (!ticketsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);

        // Fetch purchases
        const purchasesResponse = await fetch(`${BASE_URL_DJANGO}/api/purchases/`);
        if (!purchasesResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const resetTicketProperties = async () => {
    try {
      const updatedTickets = await Promise.all(
        tickets.map((ticket) =>
          fetch(`${BASE_URL_DJANGO}/api/tickets/${ticket.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...ticket,
              is_sold: false,
              price: "40.00",
              price_type: "standard",
            }),
          })
        )
      );

      if (updatedTickets.every((response) => response.ok)) {
        window.location.reload(); // Full page reload
      } else {
        console.error("Error updating tickets");
      }
    } catch (error) {
      console.error("Error updating tickets:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              concerts={concerts}
              tickets={tickets}
              purchases={purchases}
            />
          }
        ></Route>
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              concerts={concerts}
              tickets={tickets}
              purchases={purchases}
            />
          }
        ></Route>
      </Routes>
      <button onClick={resetTicketProperties}>Reset Ticket Properties</button>
    </Router>
  );
}

export default Apps;
