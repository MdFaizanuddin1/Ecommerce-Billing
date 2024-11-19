import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { Customer } from "../../models/sales/customer.models.js";
import { Product } from "../../models/products.models.js";
import { SalesPerson } from "../../models/sales/seller.models.js";
import { Bill } from "../../models/sales/bill.modles.js";

const createBill = asyncHandler(async (req, res) => {
  const {
    products,
    isOnline,
    transactionId,
    billNo,
    paymentMode,
    paymentStatus,
    discountValue,
    discountType,
  } = req.body;
  // console.log(discountValue, discountType);

  // let salesPersonId = req.body.salesPersonId || req.seller._id;
  let salesPersonId = req.body.salesPersonId || req.user._id;
  const salesPerson = await SalesPerson.findById(salesPersonId);

  //--------

  const { name, email, phoneNumber } = req.body; // customer info

  ///----------------------------------------------

  // Validate that required fields are provided
  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products provided" });
  }

  if (!salesPersonId || !paymentMode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if it's an online or offline transaction
  if (isOnline && !transactionId) {
    return res
      .status(400)
      .json({ message: "Transaction ID is required for online transactions" });
  }
  if (!isOnline && !billNo) {
    return res
      .status(400)
      .json({ message: "Bill No is required for offline transactions" });
  }

  // // Validate products
  // const productDetails = await Promise.all(
  //   products.map(async (prod) => {
  //     const product = await Product.findById(prod.productId);
  //     if (!product) {
  //       throw new Error(`Product with ID ${prod.productId} not found`);
  //     }
  //     // Calculate the total price for this product (price * quantity)
  //     const total = parseFloat(product.price) * parseInt(prod.quantity);
  //     return {
  //       productId: product._id,
  //       name: product.productname,
  //       quantity: prod.quantity,
  //       price: product.price,
  //       total,
  //     };
  //   })
  // );
  // Validate products
  const productDetails = await Promise.all(
    products.map(async (prod) => {
      let product;

      // Check if productId or barcode is provided
      if (prod.productId) {
        product = await Product.findById(prod.productId);
      } else if (prod.barcodeNumber) {
        product = await Product.findOne({ barcodeNumber: prod.barcodeNumber });
      }

      if (!product) {
        throw new Error(`Product with provided details not found`);
      }

      // Check if enough stock is available
      if (product.stock < prod.quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.productname}`
        );
      }

      // Decrease stock after sale
      product.stock -= prod.quantity;
      await product.save(); // Save the updated stock

      // Calculate the total price for this product (price * quantity)
      const total = parseFloat(product.price) * parseInt(prod.quantity);

      return {
        productId: product._id,
        barcodeNumber: product.barcodeNumber, // Include the barcode in the response
        name: product.productname,
        quantity: prod.quantity,
        price: product.price,
        total,
      };
    })
  );

  // Calculate total amount for the bill

  //----------------
  const subtotalAmount = productDetails.reduce(
    (acc, prod) => acc + prod.total,
    0
  );

  // Calculate discount amount
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (discountValue / 100) * subtotalAmount;
  } else if (discountType === "fixed") {
    discountAmount = discountValue;
  }

  // Ensure discount does not exceed subtotal
  if (discountAmount > subtotalAmount) {
    return res
      .status(400)
      .json({ message: "Discount cannot exceed subtotal amount." });
  }

  // Calculate final amount

  const finalAmount = subtotalAmount - discountAmount;
  const totalAmount = finalAmount;

  //----------------

  //------------------------

  let customerInDb;
  if (email) {
    customerInDb = await Customer.findOne({ email });
    // if (!customerInDb) {
    //   throw new ApiError(400, "customer with email not exists");
    // }
  }

  if (!customerInDb) {
    customerInDb = await Customer.create({
      name,
      email,
      phoneNumber,
    });
  }

  customerInDb = await Customer.findById(customerInDb._id);
  //   console.log("customer in db", customerInDb);

  //----------------------------

  const newBill = new Bill({
    isOnline,
    transactionId: isOnline ? transactionId : undefined,
    billNo: !isOnline ? billNo : undefined,
    customerId: customerInDb._id,
    salesPersonId,
    products: productDetails,
    totalAmount,
    discountType,
    discountValue,
    subtotalAmount,
    discountAmount,
    paymentMode,
    paymentStatus: paymentStatus || "pending", // Default to "pending" if not provided
  });

  await newBill.save();

  if (!newBill) {
    throw new ApiError(500, "failed to create bill");
  }
  console.log(newBill);

  // Update the salesperson to include the new bill ID

  if (salesPerson) {
    salesPerson.bills.push(newBill._id); // Add the new bill ID to the bills array
    salesPerson.incrementTotalSales(totalAmount);
    salesPerson.totalSalesCount += 1; // Increment total sales count
    await salesPerson.save(); // Save the updated salesperson
  }

  //------------------------------------------------

  // Populate the salesPersonId in the new bill with only name and _id
  const populatedBill = await Bill.findById(newBill._id).populate({
    path: "salesPersonId",
    select: "fullname _id total barcodeNumber", // Specify the fields to include
  });

  return res
    .status(200)
    .json(new ApiResponse(200, populatedBill, "bill created successfully"));
});

const handleCompleteReturn = asyncHandler(async (req, res) => {
  const { billId } = req.body;

  // Find the existing bill by ID
  const bill = await Bill.findById(billId);
  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  // Update stock for each product in the bill
  await Promise.all(
    bill.products.map(async (prod) => {
      const product = await Product.findById(prod.productId);
      if (product) {
        console.log(product.stock, prod.quantity);
        product.stock += prod.quantity; // Restock returned products
        await product.save();
        console.log(product.stock, prod.quantity);
      } else {
        throw new ApiError(404, `Product with ID ${prod.productId} not found`);
      }
    })
  );

  // Update sales info for salesperson
  const salesPerson = await SalesPerson.findById(bill.salesPersonId);
  if (salesPerson) {
    salesPerson.totalSales -= bill.totalAmount; // Reduce total sales by the bill's total amount
    salesPerson.totalSalesCount -= 1; // Decrement total sales count (if applicable)
    await salesPerson.save();
  }

  // Mark the bill as returned
  bill.isReturned = true; // You can add a flag in your Bill schema
  await bill.save();

  return res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill fully returned successfully"));
});

// Controller to update or return a bill
const handlePartialReturnProducts = asyncHandler(async (req, res) => {
  const { billId, updatedProducts } = req.body;

  // Find the existing bill by ID
  const bill = await Bill.findById(billId);
  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  if (bill.isReturned) {
    throw new ApiError(404, "bill is already returned");
  }

  // Update stock and calculate total amount for returned products
  let totalReturnAmount = 0;
  // console.log("bill is", bill);
  await Promise.all(
    updatedProducts.map(async (prod) => {
      const product = await Product.findById(prod.productId);
      if (product) {
        product.stock += prod.quantity; // Restock returned products
        await product.save(); // Save product immediately after updating stock

        // Find the product in the bill and update its quantity
        const billProd = bill.products.find((billProd) =>
          billProd.productId.equals(prod.productId)
        );
        if (billProd) {
          billProd.quantity -= prod.quantity; // Decrease the quantity in the bill

          // If quantity becomes 0, remove the product from the bill's products array
          if (billProd.quantity === 0) {
            bill.products = bill.products.filter(
              (p) => !p.productId.equals(billProd.productId) // Remove the product with zero quantity
            );
          } else {
            // If the product still has quantity, update the total
            billProd.total = parseFloat(billProd.price) * billProd.quantity; // Update total for the bill product
          }
          // Calculate the total amount for returned products
          const total = parseFloat(product.price) * parseInt(prod.quantity);
          totalReturnAmount += total;
        }
      } else {
        throw new ApiError(404, `Product with ID ${prod.productId} not found`);
      }
    })
  );

  // Adjust total sales for the salesperson
  const salesPerson = await SalesPerson.findById(bill.salesPersonId);
  if (salesPerson) {
    salesPerson.totalSales -= totalReturnAmount; // Reduce total sales
    // salesPerson.totalSalesCount -= updatedProducts.length; // Adjust sales count based on the number of returned products
    await salesPerson.save();
  }

  // Update the bill's total amount by subtracting the return amount
  // console.log("bill.totalAmount", bill.totalAmount);
  // console.log("totalReturnAmount", totalReturnAmount);
  bill.totalAmount -= totalReturnAmount;
  // console.log("bill.totalAmount", bill.totalAmount);

  // Optionally, you can remove the returned products from the bill if required
  bill.products = bill.products.filter(
    (prod) =>
      !updatedProducts.some(
        (updatedProd) => updatedProd.productId === prod.productId
      )
  );

  // Mark the bill as returned if all products are returned
  if (bill.products.length === 0) {
    bill.isReturned = true; // You can add a flag in your Bill schema
  }

  // console.log("bill before save", bill);
  try {
    await bill.save();
    // console.log("bill after save", bill); // Log after successful save
  } catch (error) {
    console.error("Error saving the bill:", error);
    throw new ApiError(500, "Failed to save the bill"); // Optionally, throw an error
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        bill,
        `total return amount is ${totalReturnAmount} Products partial-returned successfully`
      )
    );
});

const handlePartialReturnAndExchange = asyncHandler(async (req, res) => {
  const { originalBillId, newProducts, productsToKeep, productsToReturn } =
    req.body;

  // 1. Find the existing bill by ID
  const originalBill = await Bill.findById(originalBillId);
  if (!originalBill) {
    throw new ApiError(404, "Original bill not found");
  }

  // console.log("original bill is", originalBill);

  // 2. Update stock for returned products and calculate the total return amount
  let totalReturnedAmount = 0;
  // console.log("Initial totalReturnedAmount:", totalReturnedAmount);

  await Promise.all(
    productsToReturn.map(async (prod) => {
      // Find the product in the Product collection
      const product = await Product.findById(prod.productId);
      if (product) {
        // console.log("Product to return:", product);

        // Restock returned products
        product.stock += prod.quantity;
        await product.save();

        // Find the corresponding product in the original bill
        const originalProd = originalBill.products.find(
          (p) => p.productId.toString() === prod.productId.toString()
        );
        // console.log("Found original product in bill:", originalProd);

        if (originalProd) {
          // Calculate total amount for returned products
          const returnedAmount = originalProd.price * prod.quantity;
          totalReturnedAmount += returnedAmount;

          // console.log(
          //   `Returning ${prod.quantity} of ${originalProd.name} at $${originalProd.price} each. Total returned for this product: $${returnedAmount}`
          // );

          // console.log("Updated totalReturnedAmount:", totalReturnedAmount);

          // Adjust quantity in the bill for returned products
          originalProd.quantity -= prod.quantity;
          // console.log(
          //   `Remaining quantity of ${originalProd.name} in the bill:`,
          //   originalProd.quantity
          // );

          //--- my logic
          // update the price of the product
          originalProd.total = originalProd.price * originalProd.quantity;

          // If quantity becomes 0, remove the product from the bill
          if (originalProd.quantity <= 0) {
            originalBill.products = originalBill.products.filter(
              (p) => p.productId.toString() !== prod.productId.toString()
            );
          }
        }
      } else {
        throw new ApiError(404, `Product with ID ${prod.productId} not found`);
      }
    })
  );

  // console.log("Total returned amount:", totalReturnedAmount);

  // 3. Calculate total amount for kept products and ensure quantities remain unchanged
  const keptProductDetails = originalBill.products.filter((prod) =>
    productsToKeep.includes(prod.productId.toString())
  );
  // console.log("Kept product details:", keptProductDetails);

  const totalKeptAmount = keptProductDetails.reduce(
    (acc, prod) => acc + prod.price * prod.quantity,
    0
  );
  // console.log("Total kept amount:", totalKeptAmount);

  // 4. Add the new products (exchanged items) to the bill
  const newProductDetails = await Promise.all(
    newProducts.map(async (newProd) => {
      const product = await Product.findById(newProd.productId);
      if (!product) {
        throw new ApiError(
          404,
          `Product with ID ${newProd.productId} not found`
        );
      }

      // Adjust stock for new products
      product.stock -= newProd.quantity;
      if (product.stock < 0) {
        throw new ApiError(
          400,
          `Not enough stock for product ${product.productname}`
        );
      }
      await product.save();

      const total = parseFloat(product.price) * parseInt(newProd.quantity);
      // console.log("Total of new product:", total);
      return {
        productId: product._id,
        name: product.productname,
        quantity: newProd.quantity,
        price: product.price,
        total,
        barcodeNumber: product.barcodeNumber,
      };
    })
  );

  // Calculate the total amount for the new products
  const totalNewProductAmount = newProductDetails.reduce(
    (acc, prod) => acc + prod.total,
    0
  );
  // console.log("Total new product amount:", totalNewProductAmount);

  // 5. Calculate the total amount for the bill (kept products + new products)
  const totalAmount = totalKeptAmount + totalNewProductAmount;
  // console.log("Total amount (kept + new):", totalAmount);

  //----- my logic
  const originalPrice = originalBill.totalAmount;
  // console.log("original bill price is", originalPrice);

  const newTotal = originalPrice - totalReturnedAmount + totalNewProductAmount;
  // console.log("new total is", newTotal);

  // 6. Calculate the difference amount (customer needs to pay or get a refund)
  const difference = originalPrice - newTotal;
  // console.log("diffrece is ", difference);
  // const newTotalAmount = originalBill.totalAmount -

  // 7. Create a new bill for the updated products (kept + new)
  const updatedBillProducts = [...keptProductDetails, ...newProductDetails];

  const newBill = new Bill({
    isOnline: originalBill.isOnline,
    transactionId: originalBill.transactionId,
    billNo: originalBill.billNo,
    customerId: originalBill.customerId,
    salesPersonId: originalBill.salesPersonId,
    products: updatedBillProducts, // Track the updated quantities
    totalAmount: totalAmount,
    paymentMode: originalBill.paymentMode,
    // paymentStatus: differenceAmount > 0 ? "pending payment" : "pending refund",
  });

  await newBill.save();

  // 8. Update sales info for the salesperson
  const salesPerson = await SalesPerson.findById(originalBill.salesPersonId);
  if (salesPerson) {
    if (difference < 0) {
      // If the customer needs to pay extra
      salesPerson.totalSales += Math.abs(difference);
    } else if (difference > 0) {
      // If the customer gets a refund
      salesPerson.totalSales -= Math.abs(difference);
    }
    salesPerson.bills.push(originalBill._id);
    salesPerson.exchangeBillIds.push(newBill._id);
    await salesPerson.save();
  }

  // 9. Update the original bill by removing returned products
  originalBill.products = keptProductDetails;
  originalBill.isExchangedOrReturned = true;
  await originalBill.save();

  // 10. Respond with the new bill and the calculated difference
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newBill,
        `Exchange successful. ${
          difference < 0
            ? `Please pay the difference of ${Math.abs(difference)}`
            : `You will receive a refund of ${Math.abs(difference)}`
        }.`
      )
    );
});

const getAllBill = asyncHandler(async (req, res) => {
  const allbill = await Bill.find();
  return res
    .status(200)
    .json(new ApiResponse(200, allbill, "all bills fetched successfully"));
});

const getBill = async (req, res) => {
  try {
    const { billId } = req.body;
    const bill = await Bill.findById(billId);

    if (!bill) throw new ApiError(404, "bill not found");
    return res
      .status(200)
      .json(new ApiResponse(200, bill, "bill fetched successfully"));
  } catch (error) {
    console.log("error getting the bill", error);
  }
};

const deleteAllBills = async (req, res) => {
  const deleted = await Bill.deleteMany();
  if (!deleted) throw new ApiError(400, "bills deletion failed");
  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "all bills deleted successfully"));
};

export {
  createBill,
  handlePartialReturnProducts,
  handleCompleteReturn,
  handlePartialReturnAndExchange,
  getBill,
  getAllBill,
  deleteAllBills,
};
