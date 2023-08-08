import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { query, collection, getDocs, where } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../config/firebase'
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const [profileImageURL, setProfileImageURL] = useState(FIREBASE_AUTH.currentUser?.photoURL);
    const [userProfileData, setUserProfileData] = useState({
        email: "",
        firstName: "firstName",
        lastName: "lastName",
        password: "",
        phoneNumber: "",
        points: 0,
        userID: FIREBASE_AUTH.currentUser.uid,
        username: ""
    });

    const { navigate } = useNavigation();

    const usersRefInDB = collection(FIREBASE_DB, "users");

    const getUserData = async () => {
        try {
            const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUserProfileData({ ...doc.data(), id: doc.id });
                })
            } else {
                return;
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <View style={styles.profileContainer}>
            <Image
                style={styles.profileImage}
                source={profileImageURL ? { uri: profileImageURL } : require('../../assets/defaultProfilePicture.png')}
            />
            <View style={styles.userInfoContainer}>
                <Text style={styles.username}> {`${userProfileData.username}`} </Text>
                <Text style={styles.firstNameLastName}> {`${userProfileData.firstName} ${userProfileData.lastName}`} </Text>
                <Text style={styles.points}> Points: {`${userProfileData.points}`} </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => { navigate("EditProfileScreen", {}) }}>
                        <Text style={styles.buttonText}>EDIT PROFILE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => FIREBASE_AUTH.signOut()}>
                        <Text style={styles.buttonText}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.pointsTextContainer}>
                    <Text style={styles.pointsText}> In order to accumulate points, you can create posts (advertisements) about lost or found items. Simply navigate to the map and drop a marker at your current location, then check the leaderboard! </Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    profileContainer: {
        backgroundColor: "#edb65e", //e69b22
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    profileImage: {
        height: 150,
        width: 150,
        borderRadius: 75,
        borderColor: "#385a64",
        borderWidth: 2,
        position: "relative",
        top: 100,
        zIndex: 3
    },
    userInfoContainer: {
        backgroundColor: "#fefefe",
        display: "flex",
        // justifyContent: "center",
        alignItems: "center",
        height: "75%",
        width: "100%",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 95,
        marginBottom: 10,
        color: "#385a64"
    },
    firstNameLastName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#385a64",
        textAlign: "center",
        marginBottom: 10
    },
    points: {
        fontSize: 14,
        fontWeight: "500",
        color: "#385a64",
        textAlign: "center",
        marginBottom: 10
    },
    buttonContainer: {
        top: 40,
        width: "92%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderBottomColor: "gray",
        borderBottomWidth: 1
    },
    logoutButton: {
        backgroundColor: "#ffd166",
        //borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        // paddingHorizontal: 15,
        marginHorizontal: 5,
        marginBottom: 40,
        width: "40%"
    },
    editProfileButton: {
        backgroundColor: "#ffd166",
        // borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        // paddingHorizontal: 12,
        marginHorizontal: 5,
        marginBottom: 40,
        width: "40%"
    },
    buttonText: {
        color: "#385a64",
        fontWeight: 700,
        fontSize: 16,
        textAlign: "center"

    },
    pointsTextContainer: {
        width: "90%",
        top: 70
    },
    pointsText: {
        textAlign: "center",
        fontStyle: "italic",
        color: "gray"
    }
})