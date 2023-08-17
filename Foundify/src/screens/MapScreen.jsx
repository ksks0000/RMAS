import { StyleSheet, Text, View, ActivityIndicator, Modal, Button, Pressable, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase"
import MapView, { Marker, Callout } from "react-native-maps"
import * as Location from "expo-location"
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, updateDoc, GeoPoint, getDocs, where, query, onSnapshot } from 'firebase/firestore';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import FoundItemPostOnMapComponent from '../components/FoundItemPostOnMapComponent'


export default function MapScreen() {
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [itemImageLoading, setitemImageLoading] = useState(false);
    const [isPermissionAllowed, setIsPermissionAllowed] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showFilterRadiusModal, setShowFilterRadiusModal] = useState(false);
    const [showFilterList, setShowFilterList] = useState(false);
    const [radius, setRadius] = useState();
    const [showFilterModal, setShowFilterModal] = useState(true);
    const [filterUsername, setFilterUsername] = useState("");
    const [filterTitle, setFilterTitle] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filteredItemsDocs, setFilteredItemsDocs] = useState([]);
    const [itemsDocs, setItemsDocs] = useState([]);
    const [itemImage, setItemImage] = useState(null);
    const [itemTitle, setItemTitle] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemType, setItemType] = useState("");
    const [itemUserPhone, setItemUserPhone] = useState("");
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 43.318887,
        longitude: 21.895935
    });

    const itemsCollectionRef = collection(FIREBASE_DB, "items");
    const usersCollectionRef = collection(FIREBASE_DB, "users");

    // // const navigation = useNavigation();
    // const route = useRoute();
    // const { centerLocation } = route.params || {};

    const mapRef = useRef(null);

    const centerMapOnLocation = (location) => {
        const newRegion = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };

        mapRef.current.animateToRegion(newRegion);
    }

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

    // const getMarkers = async () => {
    //     try {

    //         const q = query(itemsCollectionRef, where("isFound", "==", true));
    //         const querySnapshot = await getDocs(q);
    //         if (!querySnapshot.empty) {
    //             const items = querySnapshot.docs.map((doc) => {
    //                 return {
    //                     ...doc.data(),
    //                     id: doc.id,
    //                 };
    //             });
    //             setItemsDocs(items);
    //             setFilteredItemsDocs(items);
    //         } else {
    //             console.log("No markers found");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }

    // }

    // useEffect(() => {
    //     getMarkers();
    // }, [])

    const getMarkersRealtime = () => {
        try {
            const q = query(itemsCollectionRef, where("isFound", "==", true));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const items = querySnapshot.docs.map((doc) => {
                        return {
                            ...doc.data(),
                            id: doc.id,
                        };
                    });
                    setItemsDocs(items);
                    setFilteredItemsDocs(items);
                } else {
                    console.log("No markers found");
                }
            }, (error) => {
                console.error("Error getting markers data:", error);
            });
            return unsubscribe;
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const unsubscribe = getMarkersRealtime();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);


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
            // if (!result.canceled) {
            //     if (result.assets.length > 0) {
            //         setItemImage(result.assets[0].uri);
            //     }
            // }
            if (!result.canceled) {
                setitemImageLoading(true);
                const imageUri = result.assets[0].uri;
                const imageRef = ref(FIREBASE_STORAGE, `itemImages/${Date.now()}.jpg`);
                const response = await fetch(imageUri);
                const blob = await response.blob();
                await uploadBytes(imageRef, blob);
                blob.close();

                const imageUrl = await getDownloadURL(imageRef);
                setItemImage(imageUrl);
                setitemImageLoading(false);
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
                    userUsername: userUsername,
                    image: itemImage
                };
                await addDoc(itemsCollectionRef, foundItemToAdd);

                const updatedPoints = userDoc.data().points + 30;
                await updateDoc(userDoc.ref, { points: updatedPoints });
                // getMarkers();
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

    // filtering markers ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleFilterHide = () => {
        setShowFilterList(false);
    }

    const handleFilterShow = () => {
        setShowFilterList(true);
    }

    const handleFilterClear = () => {
        setFilteredItemsDocs(itemsDocs);
    }

    const handleFilterButtonPress = () => {
        const markersAfterFiltering = itemsDocs.filter((marker) => {
            return (
                calculateDistance(
                    marker.location.latitude,
                    marker.location.longitude,
                    currentLocation.latitude,
                    currentLocation.longitude
                ) < radius
            );
        });
        setFilteredItemsDocs(markersAfterFiltering);
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance * 1000;
    };

    const toRadians = (degrees) => {
        return degrees * (Math.PI / 180);
    };



    const handleFilterShowModal = () => {
        setShowFilterModal(true);
    };

    const handleFilterCancel2 = () => {
        setShowFilterModal(false);
    };

    const handleFilterClear2 = () => {
        setFilterUsername("");
        setFilterTitle("");
        setFilterType("");
        setFilterDate("");
        setFilteredItemsDocs(itemsDocs);
    };

    const handleFilterApply2 = () => {
        const filteredItemsDocs = itemsDocs.filter((item) => {
            const usernameMatch = item.userUsername.toLowerCase()
                .includes(filterUsername.toLowerCase());
            const titleMatch = item.title.toLowerCase()
                .includes(filterTitle.toLowerCase());
            const typeMatch = item.type.toLowerCase()
                .includes(filterType.toLowerCase());
            const dateMatch = item.dateTime.toLowerCase()
                .includes(filterDate.toLowerCase());
            return usernameMatch && titleMatch && typeMatch && dateMatch;
        });
        setFilteredItemsDocs(filteredItemsDocs);
        setShowFilterModal(false);
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
                        ref={mapRef}
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
                        {filteredItemsDocs.map((marker) => {
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
                                        (itemImageLoading ?
                                            <ActivityIndicator size="large" color="#ffcb50" />
                                            :
                                            <>
                                                <FontAwesome name="camera" size={28} color="#ffc801" />
                                                <Text style={styles.addItemImageText}>  Add Photo Of Item </Text>
                                            </>
                                        )
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

                    <Modal visible={showFilterModal} transparent={true} onRequestClose={() => setShowFilterModal(false)}>
                        <View style={styles.filterModalContainer}>
                            <View style={styles.filterModalContent}>
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Filter by username"
                                    value={filterUsername}
                                    onChangeText={setFilterUsername}
                                />
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Filter by title"
                                    value={filterTitle}
                                    onChangeText={setFilterTitle}
                                />
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder="Filter by type"
                                    value={filterType}
                                    onChangeText={setFilterType}
                                />
                                <TextInput
                                    style={styles.filterInputDate}
                                    placeholder="Filter by date"
                                    value={filterDate}
                                    onChangeText={setFilterDate}
                                />
                                <Text style={styles.filterDateText}>Format: Wed Aug 09 2023</Text>
                                <TouchableOpacity style={styles.filterApplyButton} onPress={handleFilterApply2}>
                                    <Text style={styles.filterApplyButtonText}>Apply</Text>
                                </TouchableOpacity>
                                <View style={styles.filterButtonContainer}>
                                    <TouchableOpacity style={styles.filterCancelButton} onPress={handleFilterCancel2}>
                                        <Text style={styles.filterButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.filterClearButton} onPress={handleFilterClear2}>
                                        <Text style={styles.filterButtonText}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>


                    {!showFilterList &&
                        <>
                            <TouchableOpacity onPress={handleFilterShow} style={styles.filterShow}>
                                <Text style={styles.filterShowText}>Show posts▲</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleFilterShowModal} style={styles.filterShowModal}>
                                <Text style={styles.filterShowModalText}>Filter</Text>
                            </TouchableOpacity>
                        </>
                    }
                    {showFilterList &&
                        <View style={styles.filteredListContainer}>
                            <View style={styles.filterRow}>
                                <TouchableOpacity onPress={handleFilterHide} style={styles.filterHide}>
                                    <Text style={styles.filterHideText}>Hide▼</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleFilterButtonPress} style={styles.filterButton}>
                                    <Text style={styles.filterButtonText}>Filter by radius</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.inputRadius}
                                    placeholder='∞ m'
                                    //value={`${radius.toString()}m`}
                                    value={radius}
                                    onChangeText={text => setRadius(text)}
                                    keyboardType='numeric'
                                />
                                <TouchableOpacity onPress={handleFilterClear} style={styles.filterClear}>
                                    <Text style={styles.filterClearText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.filteredList} horizontal={true}>
                                {filteredItemsDocs.map((marker) => {
                                    return (
                                        <FoundItemPostOnMapComponent key={marker.id} marker={marker} centerMapOnMarker={centerMapOnLocation} />
                                    );
                                })}
                            </ScrollView>

                            <Modal visible={showFilterRadiusModal} onRequestClose={() => setIsModalVisible(false)}>

                            </Modal>

                        </View>
                    }

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
        color: "#385a64" //385a64 //e69b22
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
    },
    filteredListContainer: {
        backgroundColor: "transparent",
        position: "absolute",
        height: "38%",
        bottom: 0,
        // display: "flex",
        // justifyContent: "space-between",
        // alignItems: "stretch"
    },
    filterButton: {
        backgroundColor: "#fff3cc", //ffd84d //edb65e //ffcb50 //fff3cc
        padding: 8,
        borderColor: "#385a64", //385a64 //e69b22
        borderWidth: 2,
        width: 160,
        borderRadius: 5,
        marginHorizontal: 5,
        marginBottom: 7
    },
    filterButtonText: {
        color: "#385a64",
        fontSize: 18,
        fontWeight: 700,
        textAlign: "center"
    },
    inputRadius: {
        width: 60,
        backgroundColor: "#fff3cc",
        borderColor: "#385a64",
        borderWidth: 2,
        color: "#385a64",
        fontSize: 16,
        padding: 8,
        alignSelf: "flex-start",
        borderRadius: 5,
        marginBottom: 7,
        paddingVertical: 0,
        height: "87%"
    },
    filterRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline"
    },
    filterClear: {
        backgroundColor: "#385a64",
        padding: 8,
        borderRadius: 5,
        borderColor: "#385a64",
        borderWidth: 2,
        marginHorizontal: 5
    },
    filterClearText: {
        color: "#fff3cc",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center"
    },
    filterHide: {
        backgroundColor: "#385a64",
        padding: 8,
        borderRadius: 5,
        borderColor: "#385a64",
        borderWidth: 2,
        marginLeft: 5
    },
    filterHideText: {
        color: "#fff3cc",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center"
    },
    filterShow: {
        position: "absolute",
        left: 5,
        bottom: 10,
        backgroundColor: "#385a64",
        padding: 8,
        borderRadius: 5,
        borderColor: "#385a64",
        borderWidth: 2
    },
    filterShowText: {
        color: "#fff3cc",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center"
    },
    filteredList: {

    },
    filterShowModal: {
        position: "absolute",
        left: 160,
        bottom: 10,
        backgroundColor: "#385a64",
        padding: 8,
        borderRadius: 5,
        borderColor: "#385a64",
        borderWidth: 2
    },
    filterShowModalText: {
        color: "#fff3cc",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center"
    },
    /////////////////////
    filterModalContainer: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: "100%"
    },
    filterModalContent: {
        backgroundColor: "white",
        padding: 20,
        width: "100%",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    filterInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        color: "#385a64",
        fontSize: 15
    },
    filterInputDate: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        color: "#385a64",
        fontSize: 15
    },
    filterDateText: {
        marginBottom: 20,
        color: "#aaa",
        fontStyle: "italic",
        paddingLeft: 5,
        paddingTop: 2
    },
    filterApplyButton: {
        backgroundColor: "#385a64",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    filterApplyButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center"
    },
    filterButtonText: {
        color: "#385a64",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center"
    },
    filterButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    filterClearButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#385a64",
        padding: 10,
        width: "49%"
    },
    filterCancelButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#385a64",
        padding: 10,
        width: "49%"
    }
})