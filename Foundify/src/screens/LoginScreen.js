import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { addDoc, getDocs, where, collection, query } from 'firebase/firestore';
import * as ImagePicker from "expo-image-picker";
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [toRegister, setToRegister] = useState(false);
    const [popUpAddPhoto, setPopUpAddPhoto] = useState(false);

    const auth = FIREBASE_AUTH;
    const db = FIREBASE_DB;
    const storage = FIREBASE_STORAGE;

    const handleSignUp = async () => {
        if (!email ||
            !firstName ||
            !lastName ||
            !password ||
            !phoneNumber ||
            !profilePicture ||
            !username) {
            alert("Input all fields");
            return;
        }
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const userRegisterObject = {
                email,
                firstName,
                lastName,
                password,
                phoneNumber,
                points: 0,
                userID: response.user.uid,
                username
            }
            const usersRefInDB = collection(db, "users");
            await addDoc(usersRefInDB, userRegisterObject);
            alert("Account successfully created!");
            await uploadImage(response.user.uid);
        } catch (error) {
            console.error(error);
            alert("Registration failed:" + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSignIn = async () => {
        if (!username ||
            !password) {
            alert("Input all fields");
            return;
        }
        setLoading(true);
        try {
            let email = "";
            let pass = "";
            const usersRefInDB = collection(db, "users");
            console.log(usersRefInDB);
            const q = query(usersRefInDB, where("username", "==", `${username}`));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    email = doc.data().email;
                    pass = doc.data().password;
                });
            } else {
                return;
            }
            if (password === pass) {
                const response = await signInWithEmailAndPassword(auth, email, password);
                console.log("Logged in:", response.user.email);
            } else {
                alert("The password is incorrect, please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Login failed:" + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleAddPhoto = () => {
        setPopUpAddPhoto(!popUpAddPhoto);
    }

    const choosePhotoFromLibrary = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access media library denied");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                if (result.assets.length > 0) {
                    setProfilePicture(result.assets[0].uri);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const takePhotoByCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access camera denied');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                if (result.assets.length > 0) {
                    setProfilePicture(result.assets[0].uri);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const uploadImage = async (userID) => {
        if (profilePicture !== null && userID) {
            try {
                const imageRef = ref(storage, `images/${userID}.jpg`);
                const response = await fetch(profilePicture);
                const blob = await response.blob();
                await uploadBytes(imageRef, blob);
                blob.close();

                const downloadURL = await getDownloadURL(imageRef);
                await updateProfile(auth.currentUser, {
                    photoURL: downloadURL,
                });

                console.log("Image uploaded successfully");
            } catch (error) {
                console.log("Error uploading image:", error);
            }
        }
    };


    return (
        <View
            style={styles.container}
            behavior='padding'
        >

            {toRegister ? (
                <>
                    <View style={styles.addImageContainer}>
                        <TouchableOpacity
                            style={!profilePicture ? styles.addImage : styles.withoutBorder}
                            onPress={handleAddPhoto}
                        >
                            <View style={styles.profilePictureContainer}>
                                {profilePicture ? (<Image
                                    style={styles.addedImage}
                                    source={{ uri: profilePicture }}
                                />) : (!popUpAddPhoto ? (
                                    <Text style={styles.addPhotoText}> + Add Photo </Text>
                                ) : (
                                    <View style={styles.popUpAddPhotoContainer}>
                                        <TouchableOpacity onPress={choosePhotoFromLibrary} style={styles.addimageOptions}>
                                            <FontAwesome name="photo" size={28} color="#e69b22" />
                                            <Text style={styles.buttonChoosePhotoText}> Choose Photo </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={takePhotoByCamera} style={styles.addimageOptions}>
                                            <Entypo name="camera" size={28} color="#e69b22" />
                                            <Text style={styles.buttonTakePhotoText}> Take Photo </Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                                )}
                            </View>
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
                            value={phoneNumber}
                            onChangeText={text => setPhoneNumber(text)}
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
                            placeholder='Username'
                            value={username}
                            onChangeText={text => setUsername(text)}
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
        backgroundColor: "#fff",
        marginTop: 40  //zbog baterije, sati, obavestenja
    },
    inputContainer: {
        width: "80%"
    },
    input: {
        backgroundColor: "#f6f6f6",
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
        color: "#385a64"
    },
    buttonSignUpText: {
        fontWeight: "700",
        fontSize: 16,
        color: "#e69b22"
    },
    addPhotoText: {
        marginTop: 50,
        textAlign: "center",
        fontWeight: "700",
        fontSize: 16,
        color: "#e69b22"
    },
    buttonChoosePhotoText: {
        marginTop: 7,
        fontWeight: "600",
        fontSize: 16,
        color: "#e69b22",
        textAlign: 'center'
    },
    buttonTakePhotoText: {
        marginTop: 7,
        fontWeight: "600",
        fontSize: 16,
        color: "#e69b22",
        textAlign: 'center'
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
    },
    withoutBorder: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 130,
        backgroundColor: "#385a64", //ffcb50
        borderRadius: 10
    },
    profilePictureContainer: {
        height: "100%",
        width: "100%"
    },
    addedImage: {
        width: "40%",
        height: "100%",
        borderRadius: 15,
        borderColor: "#385a64",
        // borderWidth: 3,
        alignSelf: "center"
    },
    popUpAddPhotoContainer: {
        display: 'flex',
        flexDirection: "row",
        width: "100%",
        height: "100%",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    addimageOptions: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }
})