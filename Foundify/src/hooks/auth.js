// import { React, useEffect, useState } from "react";
// import { auth } from "../config/firebase";
// import { onAuthStateChanged, User } from "firebase/auth";

// export const Auth = () => {
//     const [user, setUser] = React.useState();

//     useEffect(() => {

//         if (user) {
//             setUser(user);
//         } else {
//             setUser(undefined);
//         }
//     });

//     const signIn = async () => {
//         try {
//             await createUserWithEmailAndPassword(auth, email, password);
//         } catch (err) {
//             console.error(err);
//         }
//     }

//     return (
//         <div>
//             <input placeholder="Email"></input>
//             <input placeholder="Password" type="password"></input>
//         </div>
//     );
// }