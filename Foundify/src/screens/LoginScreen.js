import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react';
// import { auth } from '../config/firebase';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // const handleSignUp = async () => {
    //     const user = await auth.createUserWithEmailAndPassword(email, password)
    //     console.log(user.email);
    // }

    return (
        <View
            style={styles.container}
            behavior='padding'
        >
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/indexScreenImg.jpg')}
                    style={styles.image}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={() => { }}
                    style={styles.buttonSignIn}
                >
                    <Text style={styles.buttonSignInText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { }}
                    style={styles.buttonSignUp}
                >
                    <Text style={styles.buttonSignUpText}>Register</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: "#fff", // "#f6f6f6",
        marginTop: 40  //zbog baterije, sati, obavestenja
    },
    inputContainer: {
        width: "80%"
    },
    input: {
        backgroundColor: "#f6f6f6", //"#fff",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        margin: 5
    },
    buttonContainer: {
        width: "80%",
        marginTop: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonSignIn: {
        backgroundColor: "#ffcb50",
        width: "100%",
        padding: 15,
        borderRadius: 10,
        // borderColor: "#f7b81b",
        // borderWidth: 2,
        margin: 5,
        alignItems: "center"
    },
    buttonSignUp: {
        backgroundColor: "#fff",
        width: "100%",
        padding: 10,
        borderRadius: 10,
        borderColor: "#385a64",
        borderWidth: 1,
        marginTop: 5,
        marginBottom: 55,
        alignItems: "center"
    },
    buttonSignInText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#385a64" //"#fff"
    },
    buttonSignUpText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#e69b22" //"#e69b22"
    },
    imageContainer: {
        width: "90%",
        height: "35%",
        marginBottom: 45,
        borderRadius: 10,

    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 15
    }

})