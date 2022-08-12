import React from "react"
import { Navigate, RouteObject } from "react-router-dom"
import Consumption from "../ui/Consumption"
// Components
import MainLayout from "../ui/MainLayout"
import CreateShop from "../ui/Shop/create"
import UpdateShop from "../ui/Shop/update"
import DeleteShop from "../ui/Shop/delete"
import GetShop from "../ui/Shop/get"
import OrderOfferAllowance from "../ui/OrderOfferAllowance"
import ConsumptionAllowance from "../ui/Consumption/Allowance"
import OrderFulfill from "../ui/Order/FulfillOrder"
import CancelOrder from "../ui/Order/CancelOrder"
import GetOrder from "../ui/Order/GetOrder"
import CreateOrder from "../ui/Order/CreateOrder"

export const userRoutes: RouteObject = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/order/create",
      element: <CreateOrder />,
    },
    {
      path: "/consumption",
      element: <Consumption />,
    },

    {
      path: "/shop/create",
      element: <CreateShop />,
    },
    {
      path: "/shop/update",
      element: <UpdateShop />,
    },
    {
      path: "/shop/delete",
      element: <DeleteShop />,
    },
    {
      path: "/shop/get",
      element: <GetShop />,
    },
    {
      path: "/order/get",
      element: <GetOrder />,
    },
    {
      path: "/consumption/allowance",
      element: <ConsumptionAllowance />,
    },
    {
      path: "/offer/allowance",
      element: <OrderOfferAllowance />,
    },
    {
      path: "/order/fulfill",
      element: <OrderFulfill />,
    },
    {
      path: "/order/cancel",
      element: <CancelOrder />,
    },
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ],
}
