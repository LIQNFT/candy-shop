import React from "react"
import { useRoutes } from "react-router-dom"

import { userRoutes } from "./routes"

const Router: React.FC = () => {
  const router = useRoutes([userRoutes])

  return router
}

export default Router
