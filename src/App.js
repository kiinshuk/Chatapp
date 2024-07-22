import { Box, Button, Container, HStack, Input, VStack } from "@chakra-ui/react";
import Message from "./Components/Message";
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, addDoc, collection, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import app from "./firebase";
import { useEffect, useState } from "react";

const db = getFirestore(app);
const auth = getAuth(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider).catch((error) => {
    console.error("Error during sign-in:", error); // Handle sign-in errors
  });
};

const logoutHandler = () => {
  auth.signOut();
};

function App() {
  const [user, setUser] = useState(null); // Correct state initialization
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state
    });

    const q = query(collection(db, "Messages"), orderBy("createdAt","asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeAuth(); // Clean up subscription on unmount
      unsubscribeMessages(); // Clean up messages subscription
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const submitHandler = async (e) => {
    e.preventDefault();

    if (message.trim() !== "") {
      try {
        await addDoc(collection(db, "Messages"), {
          text: message,
          uid: user.uid,
          url: user.photoURL,
          createdAt: serverTimestamp()
        });
        setMessage(""); // Clear input after sending
      } catch (error) {
        console.error("Error adding document:", error); // Log error
      }
    }
  };

  return (
    <Box bg="red.50">
      {user ? (
        <Container h="100vh" bg="white">
          <VStack h="full" paddingY="4">
            <Button colorScheme="red" w="full" onClick={logoutHandler}>Logout</Button>
            <VStack h="full" w="full" overflowY="auto">
              {messages.map(item => (
                <Message key={item.id} text={item.text} user={item.uid === user.uid ? "me" : "other"} />
              ))}
            </VStack>
            <form style={{ width: "100%" }} onSubmit={submitHandler}>
              <HStack>
                <Input placeholder="Enter a message" value={message} onChange={(e) => setMessage(e.target.value)} />
                <Button colorScheme="purple" type="submit">Send</Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack bg="white" justifyContent="center" h="100vh">
          <Button onClick={loginHandler} colorScheme="purple">Sign in with Google</Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
