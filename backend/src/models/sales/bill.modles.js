import mongoose from "mongoose";

const ProductSchemaPurchased = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    }, // Reference to Product model
    barcodeNumber: {
      type: String,
      required: true,
    }, // Barcode number of the product
    name: {
      type: String,
      required: true,
    }, // Product name
    quantity: {
      type: Number,
      required: true,
      // min: 1,
    }, // Quantity purchased
    price: {
      type: Number,
      required: true,
      min: 0,
    }, // Price per unit
    total: {
      type: Number,
      required: true,
      min: 0,
    }, // Total price for this product (quantity * price)
  },
  {
    timestamps: true,
  }
);

// Create a Schema for each bill/transaction
const billSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: function () {
        return !this.isOnline;
      },
    }, // Unique bill number (required for offline transactions)
    transactionId: {
      type: String,
      required: function () {
        return this.isOnline;
      },
    }, // Transaction ID (required for online transactions)
    isOnline: {
      type: Boolean,
      required: true,
    }, // True for online transactions, false for offline
    // customerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Customer",
    //   required: true,
    // }, // Reference to Customer model
    salesPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesPerson",
      required: true,
    }, // Reference to SalesPerson model
    products: [ProductSchemaPurchased], // List of products in this bill
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    }, // Total amount for the bill

    //------
    discountType: String, // Optional, to specify 'percentage' or 'fixed'
    discountValue: Number, // Optional, to store the discount value itself
    subtotalAmount: Number, // Add this to store the subtotal
    discountAmount: Number, // Add this to store the discount amount
    //------

    paymentMode: {
      type: String,
      enum: ["cash", "card", "upi"],
      required: true,
    }, // Payment method
    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    }, // Payment status (in case of partial payments)
    // Date of transaction
    date: { type: Date, default: Date.now },
    isReturned: {
      type: Boolean,
      default: false,
    },
    isExchangedOrReturned: {
      type: Boolean,
      default: false,
    },

    // Reference to the Customer model
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    // createdByRole: {
    //   // Role of the person
    //   type: String,
    //   enum: ["SalesPerson", "Manager", "Admin"],
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalAmount based on products before saving the bill

// billSchema.pre("save", function (next) {
//   this.totalAmount = this.products.reduce(
//     (acc, product) => acc + product.total,
//     0
//   );
//   next();
// });

export const Bill = mongoose.model("Bill", billSchema);
