import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("edvance_token");
  const navigate = useNavigate();

   useEffect(() => {
    if (!token) {
      toast.info("Please first login to access this page.");
      navigate("/login");
    }
  }, []);

  if (!token) {
    return null;
  }

 

  return <>{children}</>;
};

export default ProtectedWrapper;
