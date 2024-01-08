import { Button,Box,Container,VStack,Input, HStack } from "@chakra-ui/react";
import Message from "./Components/Message";

import {signOut,onAuthStateChanged,getAuth,GoogleAuthProvider,signInWithPopup} from "firebase/auth"
import { app } from "./firebase";
import { useState,useEffect } from "react";
import {query,orderBy,onSnapshot,getFirestore,getDoc, addDoc, collection, serverTimestamp} from "firebase/firestore"

const auth = getAuth(app);
const db = getFirestore(app)

const loginHandler = () =>{
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth,provider)
}

const logoutHandler = () =>{
  signOut(auth);
}



function App() {

 
const [user,setUser] = useState(false);
const [message,setMessage] = useState("");
const [messages,setMessages] = useState([]);

const submitHandler = async (e) => {
  e.preventDefault()

  try {

    await addDoc(collection(db,"Messages"), {
      text:message,
      uid:user.uid,
      uri:user.photoURL,
      createdAt:serverTimestamp()
     
    });

    setMessage("");
    
  } catch (error) {
    alert(error);
  }
}

useEffect(() => {
  const q = query(collection(db,"Messages"),orderBy("createdAt","asc"));
const unsub = onAuthStateChanged(auth,(data)=>{
  setUser(data)
});

const unsubmessage = onSnapshot(q,(snap)=>{
  setMessages(
    snap.docs.map((item)=>{
      const id = item.id;
      return {id,...item.data()};
    })
  )
})

return() =>{
  unsub();
  unsubmessage();
}
}, []);


  return <Box bg={"red.50"}>
   {
    user ? (
      <Container h={"100vh"} bg={"white"}>

      <VStack h="full" paddingY={"4"} >
        <Button w={"full"} colorScheme={"red"} onClick={logoutHandler}>
          LOGOUT
        </Button>
        <VStack h={"full"} w={"full"} overflowY={"auto"}> 
        {
          messages.map((item)=>{
            return <Message key={item.id} user={item.uid === user.uid?"me":"other" } text={item.text} uri={item.uri}/>
          })
        }
       
        
         </VStack>

        <form onSubmit= {submitHandler} style={{width:"100%"}}>
          <HStack>
           < Input value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Enter A Message"/>
           <Button colorScheme={"purple"} type="submit">SEND</Button>
           </HStack>
         </form>
          
      </VStack>
    </Container>
    ):(<VStack h={"100vh"} justifyContent={"center"}>
      <Button onClick={loginHandler}>Sign In With Google</Button>
    </VStack>)
   }
  </Box>
}

export default App;
