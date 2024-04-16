import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";

function Apps() {
  const [concerts, setConcerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = "http://127.0.0.1:8000"; // Corrected BASE_URL

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch concerts
        const concertsResponse = await fetch(`${BASE_URL}/api/concerts/`);
        if (!concertsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const concertsData = await concertsResponse.json();
        setConcerts(concertsData);
        console.log(concertsData)

        // Fetch tickets
        const ticketsResponse = await fetch(`${BASE_URL}/api/tickets/`);
        if (!ticketsResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
        console.log(ticketsData)
        // Fetch purchases
        const purchasesResponse = await fetch(`${BASE_URL}/api/purchases/`);
        if (!purchasesResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);
        console.log(purchasesData)
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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
    </Router>
  );
}

export default Apps;
