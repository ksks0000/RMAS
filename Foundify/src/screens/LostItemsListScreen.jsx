import { StyleSheet, Text, View, ActivityIndicator, Modal, Button, Pressable, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase"
import { collection, addDoc, updateDoc, GeoPoint, getDocs, where, query, ref, onSnapshot } from 'firebase/firestore';
import LostItemPostComponent from '../components/LostItemPostComponent';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from '@expo/vector-icons';

export default function LostItemsListScreen() {
    const [itemsDocs, setItemsDocs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [postLoading, setPostLoading] = useState(false);
    const [itemImageLoading, setitemImageLoading] = useState(false);
    const [itemImage, setItemImage] = useState(null);
    const [itemTitle, setItemTitle] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [itemType, setItemType] = useState("");
    const [itemContact, setItemContact] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterUsername, setFilterUsername] = useState("");
    const [filterTitle, setFilterTitle] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filteredItemsDocs, setFilteredItemsDocs] = useState([]);


    const itemsCollectionRef = collection(FIREBASE_DB, "items");
    const usersCollectionRef = collection(FIREBASE_DB, "users");

    // const getMarkers = async () => {
    //     try {
    //         const q = query(itemsCollectionRef, where("isFound", "==", false));
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
        const q = query(itemsCollectionRef, where("isFound", "==", false));
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
        });
        return unsubscribe;
    }

    useEffect(() => {
        const unsubscribe = getMarkersRealtime();
        return () => unsubscribe();
    }, []);


    const handleFilterButtonPress = () => {
        setShowFilterModal(true);
    };

    const handleFilterCancel = () => {
        setShowFilterModal(false);
    };

    const handleFilterClear = () => {
        setFilterUsername("");
        setFilterTitle("");
        setFilterType("");
        setFilterDate("");
        setFilteredItemsDocs(itemsDocs);
    };

    const handleFilterApply = () => {
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

    const handleAddLostItem = () => {
        setIsModalVisible(true);
    }

    const handleAddItemImage = async () => {
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

    const handlePostLostItem = async () => {
        try {
            if (!itemTitle || !itemDescription || !itemContact || !itemType) {
                alert("Please input all required data");
                return;
            }
            setPostLoading(true);
            const q = query(usersCollectionRef, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];

                const userUsername = (userDoc.data().username !== "undefined") ? userDoc.data().username : "";
                const lostItemToAdd = {
                    contact: itemContact,
                    dateTime: new Date().toDateString(),
                    description: itemDescription,
                    isFound: false,
                    title: itemTitle,
                    type: itemType,
                    userID: FIREBASE_AUTH.currentUser.uid,
                    userUsername: userUsername,
                    image: itemImage
                };
                await addDoc(itemsCollectionRef, lostItemToAdd);
                const updatedPoints = userDoc.data().points + 10;
                await updateDoc(userDoc.ref, { points: updatedPoints });
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
            setItemContact("");
        }
    };

    return (
        <ScrollView style={styles.listContainer}>
            <Text style={styles.welcomeText}>Together we can find it!</Text>
            <Image style={styles.welcomeImage} source={require("../../assets/lostList.jpg")} />
            <TouchableOpacity onPress={handleAddLostItem} style={styles.addLostItemButton}>
                <Text style={styles.addLostItemButtonText}>Add Lost Item Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFilterButtonPress} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
            {filteredItemsDocs.map((marker) => {
                return (
                    <LostItemPostComponent key={marker.id} marker={marker} />
                );
            })}

            <Modal visible={showFilterModal} transparent={true} onRequestClose={() => setShowFilterModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="Filter by username"
                            value={filterUsername}
                            onChangeText={setFilterUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Filter by title"
                            value={filterTitle}
                            onChangeText={setFilterTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Filter by type"
                            value={filterType}
                            onChangeText={setFilterType}
                        />
                        <TextInput
                            style={styles.inputDate}
                            placeholder="Filter by date"
                            value={filterDate}
                            onChangeText={setFilterDate}
                        />
                        <Text style={styles.filterDateText}>Format: Wed Aug 09 2023</Text>
                        <TouchableOpacity style={styles.applyButton} onPress={handleFilterApply}>
                            <Text style={styles.buttonText}>Apply</Text>
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleFilterCancel}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearButton} onPress={handleFilterClear}>
                                <Text style={styles.buttonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <ScrollView style={styles.addModalContainer} >
                    <Button title='Cancel' onPress={() => { setIsModalVisible(false) }} color={"#385a64"} />
                    <View style={styles.addItemImageContainer}>
                        <TouchableOpacity onPress={handleAddItemImage} style={styles.addItemImageButton}>
                            {itemImage ?
                                <Image style={styles.addedItemImage} source={{ uri: itemImage }} />
                                :
                                (itemImageLoading ?
                                    <ActivityIndicator size="large" color="#ffcb50" />
                                    :
                                    <>
                                        <FontAwesome name="photo" size={28} color="#ffc801" />
                                        <Text style={styles.addItemImageText}>  Add Old Photo Of Item </Text>
                                        <Text style={styles.addItemImageText}>  (optional) </Text>
                                    </>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addItemFormContainer}>
                        <View style={styles.addInput}>
                            <Text style={styles.addInputLabel}>Title:</Text>
                            <TextInput
                                style={styles.addInputField}
                                placeholder='Title of the post'
                                value={itemTitle}
                                onChangeText={text => setItemTitle(text)}
                            />
                        </View>
                        <View style={styles.addInput}>
                            <Text style={styles.addInputLabel}>Description:</Text>
                            <TextInput
                                style={styles.addInputField}
                                placeholder='Description of the item'
                                value={itemDescription}
                                onChangeText={text => setItemDescription(text)}
                            />
                        </View>
                        <View style={styles.addInput}>
                            <Text style={styles.addInputLabel}>Item Type:</Text>
                            <TextInput
                                style={styles.addInputField}
                                placeholder='Item type'
                                value={itemType}
                                onChangeText={text => setItemType(text)}
                            />
                        </View>
                        <View style={styles.addInput}>
                            <Text style={styles.addInputLabel}>Contact:</Text>
                            <TextInput
                                style={styles.addInputField}
                                placeholder='Phone number or email address'
                                value={itemContact}
                                onChangeText={text => setItemContact(text)}
                            />
                        </View>
                    </View>
                    <View style={styles.addItemButtonContainer}>
                        {!postLoading ?
                            <TouchableOpacity onPress={handlePostLostItem} style={styles.addPostButton}  >
                                <Text style={styles.addPostButtonText}> POST </Text>
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

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        backgroundColor: "#fff"
    },
    welcomeImage: {
        width: 350,
        height: 350,
        marginBottom: 20,
        marginLeft: 20
    },
    welcomeText: {
        fontSize: 20,
        marginHorizontal: 20,
        marginTop: 40,
        fontFamily: "notoserif",
        textAlign: "center",
        color: "#385a64",
        fontWeight: 700
    },
    addLostItemButton: {
        backgroundColor: "#385a64",
        marginBottom: 10,
        marginHorizontal: 20,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#385a64" //ffc801 //385a64
    },
    addLostItemButtonText: {
        textAlign: "center",
        fontWeight: 500,
        fontSize: 20,
        color: "#ffc801"
    },
    filterButton: {
        backgroundColor: "#fff",
        marginBottom: 30,
        marginHorizontal: 20,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#ffc801" //385a64 //ffc801
    },
    filterButtonText: {
        textAlign: "center",
        fontWeight: 500,
        fontSize: 20,
        color: "#385a64"
    },
    modalContainer: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: "100%"
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        width: "100%",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        color: "#385a64",
        fontSize: 15
    },
    inputDate: {
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
    applyButton: {
        backgroundColor: "#ffc801",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    buttonText: {
        color: "#385a64",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    clearButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#385a64",
        padding: 10,
        width: "49%"
    },
    cancelButton: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#385a64",
        padding: 10,
        width: "49%"
    },
    addModalContainer: {
        display: "flex",
        backgroundColor: "#fff",
        paddingTop: 30
    },
    addItemImageContainer: {
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
        flexDirection: "column",
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
    addItemFormContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        marginBottom: 20
    },
    addInput: {
        width: "100%",
        marginBottom: 10,
        padding: 10
    },
    addInputLabel: {
        fontSize: 20,
        fontWeight: 700,
        color: "#385a64",
        marginBottom: 3
    },
    addInputField: {
        backgroundColor: "#fff9e6",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    addItemButtonContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 25
    },
    addPostButton: {
        backgroundColor: "#ffcb50",
        width: "80%",
        paddingVertical: 8,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: "#385a64",
        borderWidth: 2,
    },
    addPostButtonText: {
        textAlign: "center",
        fontWeight: 700,
        fontSize: 20,
        color: "#385a64"
    },
})