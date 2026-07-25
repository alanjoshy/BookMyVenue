import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserAsync } from "../modules/auth/authSlice";
import { isAuthenticated as hasToken } from "../core/auth/tokenStorage";
import CustomerLayout from "./CustomerLayout";

/**
 * Uses the customer sidebar shell when logged in.
 * Guests still get the public page chrome (Navbar inside the page).
 */
function CustomerOrPublicLayout() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoadingUser, user } = useSelector((state) => state.auth);
  const tokenPresent = hasToken();

  useEffect(() => {
    if (tokenPresent && !user && !isLoadingUser) {
      dispatch(fetchCurrentUserAsync());
    }
  }, [dispatch, tokenPresent, user, isLoadingUser]);

  if (tokenPresent && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5]">
        <div className="w-8 h-8 border-2 border-rose-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <CustomerLayout />;
  }

  return <Outlet />;
}

export default CustomerOrPublicLayout;
