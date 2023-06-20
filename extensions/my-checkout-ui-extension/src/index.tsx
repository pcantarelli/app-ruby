import React, { useState, useEffect } from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  useTranslate,
  TextField,
  useExtensionCapability,
  useBuyerJourneyIntercept,
} from '@shopify/checkout-ui-extensions-react';

// Set the entry point for the extension
render("Checkout::Contact::RenderAfter", () => <App />);

function App() {
  // Set the target age that a buyer must be to complete an order
  const ageTarget = 18;

  // Set up the app state
  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");

  // Merchants can toggle the `block_progress` capability behavior within the checkout editor
  // To give the best preview experience, ensure that your extension updates its UI accordingly
  // For this example, the extension subscribes to `capabilities`, and updates the `label` and `required` attributes for the `TextField` component
  const canBlockProgress = useExtensionCapability("block_progress");
  const label = canBlockProgress ? "Your age" : "Your age (optional)";

  // Use the `buyerJourney` intercept to conditionally block checkout progress
  // The ability to block checkout progress isn't guaranteed.
  // Refer to the "Check for the ability to block checkout progress" section for more information.
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && !isAgeSet()) {
      return {
        behavior: "block",
        reason: "Age is required",
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setValidationError("Enter your age");
          }
        },
      };
    }

    if (canBlockProgress && !isAgeValid()) {
      return {
        behavior: "block",
        reason: `Age is less than ${ageTarget}.`,
        errors: [
          {
            // Show a validation error on the page
            message:
              "You're not legally old enough to buy some of the items in your cart.",
          },
        ],
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });

  function isAgeSet() {
    return age !== "";
  }

  function isAgeValid() {
    return Number(age) >= ageTarget;
  }

  function clearValidationErrors() {
    setValidationError("");
  }

  // Render the extension
  return (
    <TextField
      label={label}
      type="number"
      value={age}
      onChange={setAge}
      onInput={clearValidationErrors}
      required={canBlockProgress}
      error={validationError}
    />
  );
}
