import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function Message({ content }) {
  return <p>{content}</p>;
}

const PaymentForm = ({ successfullPurchaseData }) => {
  const [initialOptions, setInitialOptions] = useState({
    "client-id": import.meta.env.VITE_REACT_APP_PAYPAL_CLIENT_ID,
    "enable-funding": "venmo,card",
    "disable-funding": "paylater",
    "data-sdk-integration-source": "integrationbuilder_sc",
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("initialOptions", initialOptions);
  }, [initialOptions]);

  const [message, setMessage] = useState("");
  const [payPalPurchaseData, setPayPalPurchaseData] = useState(null); // State to store successful purchase data
  const [FINALIZEDPurchaseData, setFINALIZEDPurchaseData] = useState(null);
  const BASE_URL_PAYPAL = import.meta.env.VITE_REACT_APP_BASE_URL_PAYPAL;

  useEffect(() => {
    if (successfullPurchaseData) {
      // If there is successful purchase data, log it and save it in state
      console.log("Successfull Purchase Data:", successfullPurchaseData);
      setPayPalPurchaseData(successfullPurchaseData);
    }
  }, [successfullPurchaseData]);

  useEffect(() => {
    console.log("FINALIZEDPurchaseData", FINALIZEDPurchaseData);
  }, [FINALIZEDPurchaseData]);

  return (
    <div className="App">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
          }}
          createOrder={async () => {
            try {
              // Check if payPalPurchaseData is available
              if (!payPalPurchaseData) {
                throw new Error("PayPal purchase data is not available.");
              }

              const response = await fetch(`${BASE_URL_PAYPAL}/api/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  cart: [
                    {
                      id: `${payPalPurchaseData.id}`,
                      concert: `${payPalPurchaseData.concert}`,
                      name: `${payPalPurchaseData.name}`,
                      email: `${payPalPurchaseData.email}`,
                      phone_number: `${payPalPurchaseData.phone_number}`,
                      date_of_purchase: `${payPalPurchaseData.date_of_purchase}`,
                      tickets: JSON.stringify(payPalPurchaseData.tickets),
                      quantity: `${payPalPurchaseData.tickets.length}`,
                      total_price: `${payPalPurchaseData.total_price}`,
                      purchase_id: `${payPalPurchaseData.purchase_id}`,
                    },
                  ],
                }),
              });

              const orderData = await response.json();

              if (orderData.id) {
                return orderData.id;
              } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                  ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                  : JSON.stringify(orderData);

                throw new Error(errorMessage);
              }
            } catch (error) {
              console.error(error);
              setMessage(`Could not initiate PayPal Checkout...${error}`);
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const response = await fetch(
                `${BASE_URL_PAYPAL}/api/orders/${data.orderID}/capture`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const orderData = await response.json();

              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
              } else if (errorDetail) {
                throw new Error(
                  `${errorDetail.description} (${orderData.debug_id})`
                );
              } else {
                const transaction =
                  orderData.purchase_units[0].payments.captures[0];
                setMessage(
                  `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                );
                console.log(
                  "Capture result",
                  orderData,
                  JSON.stringify(orderData, null, 2)
                );
                // Set the successful purchase data in state
                setFINALIZEDPurchaseData(orderData);
                window.location.href = 'https://greenlawnpresbyterian.com/';
              }
            } catch (error) {
              console.error(error);
              setMessage(
                `Sorry, your transaction could not be processed...${error}`
              );
            }
          }}
        />
      </PayPalScriptProvider>
      <Message content={message} />
    </div>
  );
};

export default PaymentForm;
