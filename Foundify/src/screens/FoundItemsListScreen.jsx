import { StyleSheet, Text, View, ActivityIndicator, Modal, Button, Pressable, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase"
import { collection, addDoc, updateDoc, GeoPoint, getDocs, where, query, onSnapshot } from 'firebase/firestore';
import FoundItemPostComponent from '../components/FoundItemPostComponent';
import { ScrollView } from 'react-native-gesture-handler';


export default function FoundItemsListScreen() {
    const [itemsDocs, setItemsDocs] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterUsername, setFilterUsername] = useState("");
    const [filterTitle, setFilterTitle] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filteredItemsDocs, setFilteredItemsDocs] = useState([]);

    const itemsCollectionRef = collection(FIREBASE_DB, "items");

    // const mapRef = useRef(null);

    // const centerMapOnLocation = (location) => {
    //     const newRegion = {
    //         latitude: location.latitude,
    //         longitude: location.longitude,
    //         latitudeDelta: 0.05,
    //         longitudeDelta: 0.05,
    //     };

    //     mapRef.current.animateToRegion(newRegion);
    // }

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
        const q = query(itemsCollectionRef, where("isFound", "==", true));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setItemsDocs(items);
            setFilteredItemsDocs(items);
        });
        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = getMarkersRealtime();
        return () => {
            unsubscribe();
        };
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


    return (
        <ScrollView style={styles.listContainer}>
            <Text style={styles.welcomeText}>Discover what is found!</Text>
            <Image style={styles.welcomeImage} source={require("../../assets/foundList.jpg")} />
            <TouchableOpacity onPress={handleFilterButtonPress} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
            {filteredItemsDocs.map((marker) => {
                return (
                    <FoundItemPostComponent key={marker.id} marker={marker} /*centerMapOnMarker={centerMapOnLocation}*/ />
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
        marginBottom: 5,
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
    filterButton: {
        backgroundColor: "#ffd84d", //ffc801
        marginBottom: 20,
        marginHorizontal: 20,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#385a64"
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
    }
})