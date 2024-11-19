import { ApiError } from "../../../utils/apiError.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Bill } from "../../models/sales/bill.modles.js";

const getTodayDateRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Set to midnight today
  const endOfDay = new Date(); // Current time (end of the day)
  return { startOfDay, endOfDay };
};
const getItemsSoldToday = async () => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  // Aggregate the quantity of products sold in bills created today
  const result = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lt: endOfDay }, // Filter bills by today's date
      },
    },
    {
      $unwind: "$products", // Deconstruct the products array
    },
    {
      $group: {
        _id: null,
        totalItemsSold: { $sum: "$products.quantity" }, // Sum the quantities of the products sold
      },
    },
  ]);

  return result.length > 0 ? result[0].totalItemsSold : 0;
};

const getTotalDailySales = async () => {

  const { startOfDay, endOfDay } = getTodayDateRange();

  // Aggregate the total amount of sales in bills created this month
  const result = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lt: endOfDay }, // Filter bills by the current month
      },
    },
    {
      $group: {
        _id: null,
        totalDailySales: { $sum: "$totalAmount" }, // Sum the totalAmount field in bills
      },
    },
  ]);

  return result.length > 0 ? result[0].totalDailySales : 0;
};

const getTodaySales = asyncHandler(async (req, res) => {
  const itemsSoldToday = await getItemsSoldToday();
  const todaySales = await getTotalDailySales();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { itemsSoldToday, todaySales },
        "todays sales report fetched successfully"
      )
    );
});

const getMonthDateRange = () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1); // Set the day to the 1st of the month
  startOfMonth.setHours(0, 0, 0, 0); // Set time to midnight

  const endOfMonth = new Date();
  endOfMonth.setMonth(startOfMonth.getMonth() + 1); // Move to the next month
  endOfMonth.setDate(0); // Set date to the last day of the current month
  endOfMonth.setHours(23, 59, 59, 999); // Set time to end of day

  return { startOfMonth, endOfMonth };
};

const getItemsSoldThisMonth = async () => {
  const { startOfMonth, endOfMonth } = getMonthDateRange();

  // Aggregate the quantity of products sold in bills created this month
  const result = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }, // Filter bills by the current month
      },
    },
    {
      $unwind: "$products", // Deconstruct the products array
    },
    {
      $group: {
        _id: null,
        totalItemsSold: { $sum: "$products.quantity" }, // Sum the quantities of the products sold
      },
    },
  ]);

  return result.length > 0 ? result[0].totalItemsSold : 0;
};

const getTotalMonthlySales = async () => {
  const { startOfMonth, endOfMonth } = getMonthDateRange();

  // Aggregate the total amount of sales in bills created this month
  const result = await Bill.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }, // Filter bills by the current month
      },
    },
    {
      $group: {
        _id: null,
        totalMonthlySales: { $sum: "$totalAmount" }, // Sum the totalAmount field in bills
      },
    },
  ]);

  return result.length > 0 ? result[0].totalMonthlySales : 0;
};

const getMonthSales = asyncHandler(async (req, res) => {
  const itemsSoldThisMonth = await getItemsSoldThisMonth();
  const monthlySales = await getTotalMonthlySales();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { itemsSoldThisMonth, monthlySales },
        "this month sales report"
      )
    );
});

// const getTotalItemsSold = async () => {
//   // Aggregate the total quantity of products sold from all bills
//   const result = await Bill.aggregate([
//     {
//       $unwind: "$products", // Deconstruct the products array
//     },
//     {
//       $group: {
//         _id: null,
//         totalItemsSold: { $sum: "$products.quantity" }, // Sum the quantities of all products sold
//       },
//     },
//   ]);

//   return result.length > 0 ? result[0].totalItemsSold : 0;
// };

export { getTodaySales, getMonthSales };
