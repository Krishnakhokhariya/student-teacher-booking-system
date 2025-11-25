import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Children } from "react";

function StudentRoutes({children}) {
    const {userProfile, loading} = useAuth();

    if(loading) return null;

    if(!userProfile || userProfile.role !== 'student'){
        return <Navigate to="/login" replace />
    }
  return children
}

export default StudentRoutes
