import { StyleSheet, Text, View, Button, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { query, collection, getDocs, where } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../config/firebase'

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState(null);
    const [profileImageURL, setProfileImageURL] = useState(FIREBASE_AUTH.currentUser.photoURL);
    const [userProfileData, setUserProfileData] = useState(null);

    const usersRefInDB = collection(FIREBASE_DB, "users");

    const getUserData = async () => {
        setLoading(true);
        try {
            const q = query(usersRefInDB, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    setUserProfileData({ ...doc.data(), id: doc.id });
                })
            } else {
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (userProfileData) {
            const documentRef = doc(FIREBASE_DB, "users", userProfileData.id);
            onSnapshot(documentRef, (snapshot) => {
                setUserProfileData({ ...snapshot.data(), id: snapshot.id });
            });
        }
    }, []);

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




    return (
        <View>
            <Text>ProfileScreen</Text>
            <Image styles={styles.profileImage}
                source={{ uri: profileImageURL }} />

            <Button onPress={() => /* navigation.navigate("") */ FIREBASE_AUTH.signOut()} title='Logout' />
            {/* {loading ? (
                <ActivityIndicator size="large" color="#ffcb50" />
            ) : (<>
            </>
            )} */}
        </View>
    )
}

const styles = StyleSheet.create({})