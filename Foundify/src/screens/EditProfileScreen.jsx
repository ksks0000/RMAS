import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { query, collection, getDocs, where, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView } from 'react-native-gesture-handler'
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";

import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../config/firebase'

export default function EditProfileScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [image, setImage] = useState("");
    const [isChanged, setIsChanged] = useState(false);
    const [popUpChangePhoto, setPopUpChangePhoto] = useState(false);
    const [profileImageURL, setProfileImageURL] = useState(FIREBASE_AUTH.currentUser.photoURL);
    const [userProfileData, setUserProfileData] = useState({
        email: "",
        firstName: "",
        image: FIREBASE_AUTH.currentUser.photoURL,
        lastName: "",
        password: "",
        phoneNumber: "",
        points: 0,
        userID: FIREBASE_AUTH.currentUser.uid,
        username: ""
    });

    const navigation = useNavigation();
    const usersRefInDB = collection(FIREBASE_DB, "users");

    // const getUserData = async () => {
    //     try {
    //         const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
    //         const querySnapshot = await getDocs(q);
    //         if (!querySnapshot.empty) {
    //             querySnapshot.forEach((doc) => {
    //                 setUserProfileData({ ...doc.data(), id: doc.id });
    //                 setEmail(userProfileData.email);
    //                 setPassword(userProfileData.password);
    //                 setUsername(userProfileData.username);
    //                 setFirstName(userProfileData.firstName);
    //                 setLastName(userProfileData.lastName);
    //                 setPhoneNumber(userProfileData.phoneNumber);
    //             })
    //         } else {
    //             return;
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // useEffect(() => {
    //     getUserData();
    // }, []);

    const getUserDataRealtime = () => {
        try {
            const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    setUserProfileData({ ...userData, id: querySnapshot.docs[0].id });
                    setEmail(userData.email);
                    setPassword(userData.password);
                    setUsername(userData.username);
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setPhoneNumber(userData.phoneNumber);
                    setImage(userData.image);
                } else {
                    setUserProfileData({});
                    setEmail('');
                    setPassword('');
                    setUsername('');
                    setFirstName('');
                    setLastName('');
                    setPhoneNumber('');
                }
            }, (error) => {
                console.error("Error getting user data:", error);
            });
            return unsubscribe;
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const unsubscribe = getUserDataRealtime();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);


    const handleChangeProfilePicture = () => {
        setPopUpChangePhoto(!popUpChangePhoto);
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
                    setProfileImageURL(result.assets[0].uri);
                    const imageRef = ref(FIREBASE_STORAGE, `images/${FIREBASE_AUTH.currentUser.uid}.jpg`);
                    const response = await fetch(profileImageURL);
                    const blob = await response.blob();
                    await uploadBytes(imageRef, blob);
                    blob.close();
                    const downloadURL = await getDownloadURL(imageRef);
                    setImage(downloadURL);
                    const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0].ref;
                        await updateDoc(userDoc, { image: downloadURL })
                    }
                    await updateProfile(FIREBASE_AUTH.currentUser, {
                        photoURL: downloadURL,
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
        finally {
            setPopUpChangePhoto(false);
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
                    setProfileImageURL(result.assets[0].uri);
                    const imageRef = ref(FIREBASE_STORAGE, `images/${FIREBASE_AUTH.currentUser.uid}.jpg`);
                    const response = await fetch(profileImageURL);
                    const blob = await response.blob();
                    await uploadBytes(imageRef, blob);
                    blob.close();
                    const downloadURL = await getDownloadURL(imageRef);
                    setImage(downloadURL);
                    const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0].ref;
                        await updateDoc(userDoc, { image: downloadURL })
                    }
                    await updateProfile(FIREBASE_AUTH.currentUser, {
                        photoURL: downloadURL,
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPopUpChangePhoto(false);
        }
    };

    // const uploadImage = async () => {
    //     if (profileImageURL) {
    //         try {
    //             const imageRef = ref(FIREBASE_STORAGE, `images/${FIREBASE_AUTH.currentUser.uid}.jpg`);
    //             const response = await fetch(profileImageURL);
    //             const blob = await response.blob();
    //             await uploadBytes(imageRef, blob);
    //             blob.close();
    //             const downloadURL = await getDownloadURL(imageRef);
    //             setImage(downloadURL);
    //             await updateProfile(FIREBASE_AUTH.currentUser, {
    //                 photoURL: downloadURL,
    //             });
    //             console.log("Image uploaded successfully");
    //         } catch (error) {
    //             console.log("Error uploading image:", error);
    //         }
    //     }
    // };


    const handleSaveChanges = async () => {
        if (!isChanged) {
            alert("You did not enter any changes to save");
            return;
        }
        try {
            const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].ref;
                await updateDoc(userDoc, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    username: username,
                    phoneNumber: phoneNumber,
                    //image: image
                })
            };
            alert("Profile informations have been successfully saved");
        } catch (error) {
            console.error(error);
            alert("Error has occured while saving profile changes");
        }
    }

    const handleCancelChanges = () => {
        navigation.goBack();
    }

    return (
        <ScrollView alignItems="center">
            <TouchableOpacity onPress={handleChangeProfilePicture}>
                {!popUpChangePhoto ? <Image
                    style={styles.profileImage}
                    source={profileImageURL ? { uri: profileImageURL } : require('../../assets/defaultProfilePicture.png')}
                /> :
                    <View style={styles.popUpChangePhotoContainer}>
                        <TouchableOpacity onPress={choosePhotoFromLibrary} style={styles.addimageOptions}>
                            <FontAwesome name="photo" size={28} color="#e69b22" />
                            <Text style={styles.buttonPhotoText}> Choose Photo </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePhotoByCamera} style={styles.addimageOptions}>
                            <Entypo name="camera" size={28} color="#e69b22" />
                            <Text style={styles.buttonPhotoText}> Take Photo </Text>
                        </TouchableOpacity>
                    </View>}
            </TouchableOpacity>
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.firstName}`}
                        value={firstName}
                        onChangeText={text => { setFirstName(text); setIsChanged(true) }}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.lastName}`}
                        value={lastName}
                        onChangeText={text => { setLastName(text); setIsChanged(true) }}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.email}`}
                        value={email}
                        onChangeText={text => { setEmail(text); setIsChanged(true) }}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="vpn-key" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.password}`}
                        value={password}
                        onChangeText={text => { setPassword(text); setIsChanged(true) }}
                        style={styles.input}
                        secureTextEntry
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="verified-user" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.username}`}
                        value={username}
                        onChangeText={text => { setUsername(text); setIsChanged(true) }}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="phone" size={24} color="gray" />
                    <TextInput
                        placeholder={`${userProfileData.phoneNumber}`}
                        value={phoneNumber}
                        onChangeText={text => { setPhoneNumber(text); setIsChanged(true) }}
                        style={styles.input}
                        keyboardType='numeric'
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelChangesButton} onPress={handleCancelChanges}>
                        <Text style={styles.cancelChangesButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveChangesButton} onPress={handleSaveChanges}>
                        <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        width: "80%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5
    },
    input: {
        backgroundColor: "#f6f6f6",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        margin: 5,
        width: "80%"
    },
    profileImage: {
        height: 150,
        width: 150,
        borderRadius: 75,
        marginTop: 25,
        left: 80,
        borderColor: "#edb65e",
        borderWidth: 4
    },
    buttonContainer: {
        width: "90%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        left: 15,
        marginTop: 15,
        marginBottom: 20
    },
    saveChangesButton: {
        backgroundColor: "#edb65e",
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    saveChangesButtonText: {
        color: "#fff",
        fontWeight: 500,
        fontSize: 16
    },
    cancelChangesButton: {
        borderColor: "#edb65e",
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    cancelChangesButtonText: {
        color: "#385a64",
        fontWeight: 500,
        fontSize: 16
    },
    popUpChangePhotoContainer: {
        marginTop: 25,
        left: 80
    },
    addimageOptions: {
        display: "flex", justifyContent: "center",
        alignItems: "center",
        width: "50%",
        marginVertical: 4,
        paddingVertical: 5
    },
    buttonPhotoText: {
        marginTop: 4,
        fontSize: 16,
        color: "#385a64"
    }
})

