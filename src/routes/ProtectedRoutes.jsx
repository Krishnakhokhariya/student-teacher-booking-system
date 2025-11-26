import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoutes({children}) {
    const {firebaseUser, loading} = useAuth();
    const location = useLocation();
    if(loading) return null;

    if(!firebaseUser){
      return <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    }
  return children;
}

export default ProtectedRoutes
