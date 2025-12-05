import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { addNotifications } from "../utils/notifications";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setFirebaseUser(user);

        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("AUTH ERROR:", error);

        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const registerStudent = async (
    name,
    email,
    password,
    department,
    studentId
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      department,
      studentId,
      role: "student",
      status: "pending",
      createdAt: new Date(),
    });

    const adminSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"))
    );

    adminSnap.forEach((admin) => {
      addNotifications({
        toUid: admin.id,
        toName: admin.data().name,
        fromUid: user.uid,
        fromName: name,
        type: "student_registration",
        message: `${name} has submitted a new student registration request.`,
      });
    });
    return user;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email) => {
    if(!email) throw new Error("Please enter your email");

    await sendPasswordResetEmail(auth, email);
    return "Password reset link sent";
  }

  const logout = () => {
    return signOut(auth);
  };

  const clearAuthState = () => {
    setUserProfile(null);
  };


  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        login,
        logout,
        registerStudent,
        resetPassword,
        clearAuthState,
      }}
    >
      {loading ? (
        <div className="h-screen flex items-center justify-center text-gray-600">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
