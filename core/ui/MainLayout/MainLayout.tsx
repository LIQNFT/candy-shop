import React from "react"
import { Outlet } from "react-router-dom"

const MainLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default MainLayout
