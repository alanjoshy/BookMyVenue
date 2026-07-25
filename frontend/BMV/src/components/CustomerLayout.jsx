import { createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import CustomerTopbar from "./CustomerTopbar";

const CustomerLayoutContext = createContext(null);

export function useCustomerLayout() {
  return useContext(CustomerLayoutContext);
}

function CustomerLayout() {
  return (
    <CustomerLayoutContext.Provider value={{ inCustomerShell: true }}>
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
        <CustomerTopbar />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </CustomerLayoutContext.Provider>
  );
}

export default CustomerLayout;
