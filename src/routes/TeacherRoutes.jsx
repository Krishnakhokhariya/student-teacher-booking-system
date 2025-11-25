import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function TeacherRoutes({children}) {
    const {userProfile, loading} = useAuth();

    if(loading) return null;

    if(!userProfile || userProfile.role !== "teacher"){
        return <Navigate to="/login" replace/>
    }
  return children
}

export default TeacherRoutes
