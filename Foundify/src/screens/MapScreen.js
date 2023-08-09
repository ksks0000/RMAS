import { StyleSheet, Text, View, ActivityIndicator, Modal, Button, Pressable, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from "../config/firebase"
import MapView, { Marker, Callout } from "react-native-maps"
import * as Location from "expo-location"
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, updateDoc, GeoPoint, getDocs, where, query } from 'firebase/firestore'

export default function MapScreen() {
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [isPermissionAllowed, setIsPermissionAllowed] = useState(true);
    const [itemsDocs, setItemsDocs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [itemImage, setItemImage] = useState(null);
    const [itemTitle, setItemTitle] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemType, setItemType] = useState("");
    const [itemUserPhone, setItemUserPhone] = useState("");
    // const [itemLocation, setItemLocation] = useState({ ...currentLocation });
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 43.318887,
        longitude: 21.895935
    });

    const itemsCollectionRef = collection(FIREBASE_DB, "items");
    const usersCollectionRef = collection(FIREBASE_DB, "users");

    // user location /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // useEffect(() => {
    //     setLoading(true);
    //     (async () => {
    //         let { status } = await Location.requestForegroundPermissionsAsync();
    //         if (status !== 'granted') {
    //             setIsPermissionAllowed(false);
    //             console.log('Permission to access location was denied');
    //             return;
    //         }
    //         let location = await Location.getCurrentPositionAsync({});
    //         setCurrentLocation({
    //             latitude: location.coords.latitude,
    //             longitude: location.coords.longitude
    //         });
    //         setItemLocation(currentLocation);
    //         setLoading(false);
    //     })();
    // }, []);


    useEffect(() => {
        setLoading(true);
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsPermissionAllowed(false);
                console.log('Permission to access location was denied');
                return;
            }
            const locationOptions = {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000
            };
            const locationListener = await Location.watchPositionAsync(locationOptions, (location) => {
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            });
            // setItemLocation(currentLocation);
            setLoading(false);
        })();
    }, []);


    // rendering markers from db /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const getMarkers = async () => {
        try {

            const q = query(itemsCollectionRef, where("isFound", "==", true));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const items = querySnapshot.docs.map((doc) => {
                    return {
                        ...doc.data(),
                        id: doc.id,
                    };
                });
                setItemsDocs(items);
            } else {
                console.log("No markers found");
            }
        } catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        getMarkers();
    }, [])


    // adding found item post ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleAddItemImage = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access camera denied');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                if (result.assets.length > 0) {
                    setItemImage(result.assets[0].uri);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostFoundItem = async () => {
        try {
            if (!itemTitle || !itemDescription || !itemImage || !itemType) {
                alert("Please input all required data");
                return;
            }
            setPostLoading(true);
            const q = query(usersCollectionRef, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];

                const userUsername = (userDoc.data().username !== "undefined") ? userDoc.data().username : "";
                const foundItemToAdd = {
                    contact: itemUserPhone,
                    dateTime: new Date().toDateString(),
                    description: itemDescription,
                    isFound: true,
                    location: currentLocation,
                    title: itemTitle,
                    type: itemType,
                    userID: FIREBASE_AUTH.currentUser.uid,
                    userUsername: userUsername
                };
                await addDoc(itemsCollectionRef, foundItemToAdd);

                const updatedPoints = userDoc.data().points + 30;
                await updateDoc(userDoc.ref, { points: updatedPoints });
                getMarkers();
                setPostLoading(false);
            } else {
                console.log("User document not found");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsModalVisible(false);
            setItemDescription("");
            setItemImage(null);
            setItemTitle("");
            setItemType("");
            setItemUserPhone("");
        }
    };


    return (
        <View style={styles.mapContainer}>
            {loading ? (
                <>
                    {isPermissionAllowed ? (
                        <>
                            <Text>Loading current location...please wait</Text>
                            <ActivityIndicator size="large" color="#ffcb50" />
                        </>
                    ) : (
                        <Text> For using map please allow location access </Text>
                    )}
                </>
            ) : (
                <>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: currentLocation.latitude, // 43.318887,
                            longitude: currentLocation.longitude, // 21.895935,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        showsUserLocation={true}
                        userLocationUpdateInterval={5000}
                        followsUserLocation={true} // samo za apple?
                    >
                        {itemsDocs.map((marker) => {
                            const coordinateMarker = {
                                latitude: marker.location.latitude,
                                longitude: marker.location.longitude,
                            };
                            return (
                                <Marker
                                    key={marker.id}
                                    coordinate={coordinateMarker}
                                    title={marker.title}
                                    onPress={() => { }}
                                >
                                    {/* <Callout style={styles.callout} accessible={false}>
                                        <Text style={styles.calloutText}>Title: {marker.title}</Text>
                                        <Text style={styles.calloutText}>Description: {marker.description}</Text>
                                        <Text style={styles.calloutText}>Type: {marker.type}</Text>
                                        <Text style={styles.calloutText}>Contact: {marker.contact}</Text>
                                    </Callout> */}
                                </Marker>
                            );
                        })}
                    </MapView>

                    <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                        <ScrollView style={styles.modalContainer} >
                            <Text style={styles.modalWelcomeText}>Tell us what you have found and help the owner find lost item!</Text>
                            <Image style={styles.modalWelcomeImage} source={require("../../assets/modalAddPin.jpg")} />
                            <Button title='Cancel' onPress={() => { setIsModalVisible(false) }} color={"#385a64"} />
                            <View style={styles.itemImageContainer}>
                                <TouchableOpacity onPress={handleAddItemImage} style={styles.addItemImageButton}>
                                    {itemImage ?
                                        <Image style={styles.addedItemImage} source={{ uri: itemImage }} />
                                        :
                                        <>
                                            <FontAwesome name="camera" size={28} color="#ffc801" />
                                            <Text style={styles.addItemImageText}>  Add Photo Of Item </Text>
                                        </>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={styles.itemFormContainer}>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Title:</Text>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder='Title of the post'
                                        value={itemTitle}
                                        onChangeText={text => setItemTitle(text)}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Description:</Text>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder='Description of the item'
                                        value={itemDescription}
                                        onChangeText={text => setItemDescription(text)}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Item Type:</Text>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder='Item type'
                                        value={itemType}
                                        onChangeText={text => setItemType(text)}
                                    />
                                </View>
                                <View style={styles.input}>
                                    <Text style={styles.inputLabel}>Contact:</Text>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder='My phone number (optional)'
                                        value={itemUserPhone}
                                        onChangeText={text => setItemUserPhone(text)}
                                    />
                                </View>
                            </View>
                            <View style={styles.itemButtonContainer}>
                                {!postLoading ?
                                    <TouchableOpacity onPress={handlePostFoundItem} style={styles.postButton}  >
                                        <Text style={styles.postButtonText}> POST </Text>
                                    </TouchableOpacity>
                                    /* <TouchableOpacity onPress={() => { setIsModalVisible(false) }} style={styles.cancelButton}  >
                                        <Text style={styles.cancelButtonText}> CANCEL </Text>
                                    </TouchableOpacity> */
                                    :
                                    <ActivityIndicator size="large" color="#ffcb50" />
                                }

                            </View>
                        </ScrollView>
                    </Modal>

                    <Pressable
                        onPress={() => setIsModalVisible(true)}
                        style={({ pressed }) => [
                            styles.addPinButton,
                            {
                                backgroundColor: !pressed ? '#fff' : '#e0e0e0',
                                borderWidth: pressed ? 2 : 1,
                                borderColor: '#d0d0d0',
                            },
                        ]}
                    >
                        <Text style={styles.addPinText}> Found item? Add pin </Text>
                    </Pressable>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        width: "100%",
        height: "100%"
    },
    addPinButton: {
        position: "absolute",
        top: 12,
        // left: 15,
        right: 60,
        height: 40,
        width: 230,
        paddingVertical: 4,
        borderRadius: 5,
        backgroundColor: "#ffcb50", //ffcb50 //385a64 //e69b22
    },
    addPinText: {
        textAlign: "center",
        fontWeight: 600,
        fontSize: 18,
        color: "#e69b22" //385a64
    },
    modalContainer: {
        display: "flex",
        backgroundColor: "#fff",
    },
    modalWelcomeImage: {
        width: 400,
        height: 300,
        marginBottom: 30
    },
    modalWelcomeText: {
        fontSize: 20,
        marginHorizontal: 20,
        marginTop: 40,
        fontFamily: "notoserif",
        textAlign: "center",
        color: "#385a64",
        fontWeight: 700
    },
    itemImageContainer: {
        height: 250,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#ffc801",
        borderWidth: 2,
        marginHorizontal: 30,
        marginVertical: 40,
        borderRadius: 20
    },
    addedItemImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20
    },
    addItemImageButton: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
    },
    addItemImageText: {
        textAlign: "center",
        fontWeight: "700",
        fontSize: 19,
        color: "#ffc801"
    },
    itemFormContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        marginBottom: 20
    },
    input: {
        width: "100%",
        marginBottom: 10,
        padding: 10
    },
    inputLabel: {
        fontSize: 20,
        fontWeight: 700,
        color: "#385a64",
        marginBottom: 3
    },
    inputField: {
        backgroundColor: "#fff9e6",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    itemButtonContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 25
    },
    postButton: {
        backgroundColor: "#ffcb50",
        width: "80%",
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: "#385a64",
        borderWidth: 2,
    },
    postButtonText: {
        textAlign: "center",
        fontWeight: 700,
        fontSize: 20,
        color: "#385a64"
    },
    cancelButton: {
        // backgroundColor: "#385a64",
        borderColor: "#ffc801", //385a64
        borderWidth: 1,
        width: "80%",
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 10
    },
    cancelButtonText: {
        textAlign: "center",
        fontWeight: 600,
        fontSize: 16,
        color: "#385a64"
    }
})