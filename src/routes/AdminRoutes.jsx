import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoutes( {children}) {
    const {userProfile, loading} = useAuth();

    if(loading) return null;

    if(!userProfile || userProfile.role !== 'admin'){
        return <Navigate to="/login" replace/>
    }
  return children;
}

export default AdminRoutes
