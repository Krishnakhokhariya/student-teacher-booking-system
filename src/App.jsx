import { db } from "./firebase/firebaseConfig";

function App() {
  console.log("Firebase connected:", db);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Firebase Connected Successfully</h1>
    </div>
  );
}

export default App;
