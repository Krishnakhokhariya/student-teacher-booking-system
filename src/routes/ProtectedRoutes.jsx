import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoutes({children}) {
    const {firebaseUser, loading} = useAuth();
    if(loading) return null;

    if(!firebaseUser){
        return <Navigate to="/login" replace />
    }
  return children;
}

export default ProtectedRoutes
