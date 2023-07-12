import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_AUTH } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState();
    const [photo, setPhoto] = useState(null);
    const [toRegister, setToRegister] = useState(false);

    const auth = FIREBASE_AUTH;

    const handleSignUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert("Account successfully created!");
        } catch (error) {
            console.error(error);
            alert("Registration failed:" + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error) {
            console.error(error);
            alert("Login failed:" + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleAddPhoto = () => {

    }

    return (
        <View
            style={styles.container}
            behavior='padding'
        >

            {toRegister ? (
                <>
                    <View style={styles.addImageContainer}>
                        {/* <Image
                            style={styles.addImage}
                            source={ }
                        /> */}
                        <TouchableOpacity
                            style={styles.addImage}
                            onPress={handleAddPhoto}
                        >
                            <Text style={styles.buttonSignUpText}> + Add Photo </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder='First Name'
                            value={firstName}
                            onChangeText={text => setFirstName(text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Last Name'
                            value={lastName}
                            onChangeText={text => setLastName(text)}
                            style={styles.input}
                        />
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
                        <TextInput
                            placeholder='Username'
                            value={username}
                            onChangeText={text => setUsername(text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder='Phone Number'
                            value={phone}
                            onChangeText={text => setPhone(text)}
                            style={styles.input}
                            keyboardType='numeric'
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#ffcb50" />
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleSignUp}
                                style={styles.buttonSignIn}
                            >
                                <Text style={styles.buttonSignInText}> Register </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setToRegister(!toRegister) }}
                                style={styles.buttonSignUp}
                            >
                                <Text style={styles.buttonSignUpText}> Login </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </>
            ) : (
                <>
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

                    {loading ? (
                        <ActivityIndicator size="large" color="#ffcb50" />
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleSignIn}
                                style={styles.buttonSignIn}
                            >
                                <Text style={styles.buttonSignInText}> Login </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { setToRegister(!toRegister) }}
                                style={styles.buttonSignUp}
                            >
                                <Text style={styles.buttonSignUpText}> Register </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </>
            )}

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
    },
    addImageContainer: {
        width: "80%",
        height: "20%",
        paddingBottom: 30,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    addImage: {
        borderColor: "#385a64",
        borderWidth: 1,
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 130
    }

})