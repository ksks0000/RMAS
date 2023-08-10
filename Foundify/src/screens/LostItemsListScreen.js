import { StyleSheet, Text, View, ActivityIndicator, Modal, Button, Pressable, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase"
import { collection, addDoc, updateDoc, GeoPoint, getDocs, where, query } from 'firebase/firestore';
import FoundItemPostComponent from '../components/FoundItemPostComponent';
import { ScrollView } from 'react-native-gesture-handler';

export default function LostItemsListScreen() {
    const [itemsDocs, setItemsDocs] = useState([]);

    const itemsCollectionRef = collection(FIREBASE_DB, "items");

    const getMarkers = async () => {
        try {
            const q = query(itemsCollectionRef, where("isFound", "==", false));
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

    return (
        <ScrollView style={styles.listContainer}>
            <Text style={styles.modalWelcomeText}>Together we can find it!</Text>
            <Image style={styles.modalWelcomeImage} source={require("../../assets/lostList.jpg")} />
            {itemsDocs.map((marker) => {
                return (
                    <FoundItemPostComponent key={marker.id} marker={marker} />
                );
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        backgroundColor: "#fff"
    },
    modalWelcomeImage: {
        width: 350,
        height: 350,
        marginBottom: 30,
        marginLeft: 20
    },
    modalWelcomeText: {
        fontSize: 20,
        marginHorizontal: 20,
        marginTop: 40,
        fontFamily: "notoserif",
        textAlign: "center",
        color: "#385a64",
        fontWeight: 700
    }
})