import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_DB, FIREBASE_AUTH } from '../config/firebase';
import { collection, updateDoc, getDocs, where, query } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function LostItemPostComponent(props) {
    const marker = props.marker;
    const usersCollectionRef = collection(FIREBASE_DB, "users");

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [userProfilePicture, setUserProfilePicture] = useState(null);

    const getProfilePicture = async () => {
        if (marker.userID !== undefined) {
            const imageRef = ref(FIREBASE_STORAGE, `images/${marker.userID}.jpg`);
            const downloadURL = await getDownloadURL(imageRef);
            setUserProfilePicture(downloadURL);
        }
    }

    useEffect(() => {
        getProfilePicture();
    }, [])


    const handleshowDetailes = () => {
        setIsModalVisible(true);
    }

    const handleContact = async () => {
        const q = query(usersCollectionRef, where("userID", "==", FIREBASE_AUTH.currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const updatedPoints = userDoc.data().points + 20;
            await updateDoc(userDoc.ref, { points: updatedPoints });
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.userInfoContainer}>
                <Image style={styles.userImage} source={userProfilePicture ? { uri: userProfilePicture } : require('../../assets/defaultProfilePicture.png')} />
                <View style={styles.userHeader}>
                    <Text style={styles.userUsername}>{marker.userUsername}</Text>
                    <TouchableOpacity onPress={handleshowDetailes}>
                        <Text style={styles.showPostText}>Show Detailes »</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.itemContainer}>
                <View style={styles.itemImageContainer}>
                    <Image style={styles.itemImage} source={marker.image ? { uri: marker.image } : require("../../assets/lostItemDefault.jpg")} />
                </View>
                <View style={styles.itemInfoContainer}>
                    <Text style={styles.infoTitleText} numberOfLines={2} ellipsizeMode="tail">{marker.title}</Text>
                    <Text style={styles.infoTypeText} numberOfLines={2} ellipsizeMode="tail">{marker.type}</Text>
                </View>
            </View>
            <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => { setIsModalVisible(false) }} color={"#385a64"} style={styles.modalBack}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                        <Text style={styles.modalBackText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.modalUser}>
                        <Text style={styles.modalUserUsername}>@{marker.userUsername}</Text>
                        <Image style={styles.modalUserImage} source={userProfilePicture ? { uri: userProfilePicture } : require('../../assets/defaultProfilePicture.png')} />
                    </View>
                </View>
                <ScrollView style={styles.modalItem}>
                    <Image style={styles.modalItemImage} source={marker.image ? { uri: marker.image } : require("../../assets/lostItemDefault.jpg")} />
                    <Text style={styles.modalItemTitle} >{marker.title}</Text>
                    <Text style={styles.modalItemDate} >{marker.dateTime}</Text>
                    <Text style={styles.modalItemDescriptionLabel} >Description:</Text>
                    <Text style={styles.modalItemDescription} >{marker.description}</Text>
                    <Text style={styles.modalItemTypeLabel} >Type: </Text>
                    <Text style={styles.modalItemType} >{marker.type}</Text>
                    <View style={styles.modalContact}>
                        <Text style={styles.modalContactTextLabel}>Contact:</Text>
                        <Text style={styles.modalContactText}>{marker.contact}</Text>
                    </View>
                    <TouchableOpacity onPress={handleContact} style={styles.modalContactCall}>
                        <Text style={styles.modalContactButtonText}>Contact if you have found item</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderColor: "#ffcb50",
        borderWidth: 1,
        backgroundColor: "#fff",
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 15
    },
    userInfoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderBottomColor: "#ffcb50",
        borderBottomWidth: 1,
        backgroundColor: "#ffcb50",
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14
    },
    userHeader: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        width: "85%"
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
        marginLeft: 12,
        marginVertical: 8,
        borderColor: "#385a64",
        borderWidth: 2
    },
    userUsername: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 400
    },
    showPostText: {
        marginRight: 15,
        fontStyle: "italic",
        fontSize: 15,
        fontWeight: 500,
        color: "#385a64"
    },
    itemContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    itemImageContainer: {
        width: "55%",
        height: 150,
        padding: 15
    },
    itemImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10
    },
    itemInfoContainer: {
        width: "45%",
        height: 150,
        paddingVertical: 18,
        paddingRight: 18
    },
    infoTitleText: {
        borderBottomColor: "#ffcb50",
        borderBottomWidth: 1,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 500,
        color: "#385a64",
        paddingBottom: 8,
        overflow: "hidden",
    },
    infoTypeText: {
        marginTop: 5,
        color: "#666",
        textAlign: "center"
    },
    modalHeader: {
        display: 'flex',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomColor: "#ffcb50",
        borderBottomWidth: 1
    },
    modalBack: {
        display: 'flex',
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10
    },
    modalBackText: {
        fontSize: 20,
        fontWeight: 500
    },
    modalUser: {
        display: 'flex',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    modalUserImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
        marginVertical: 15,
        marginRight: 15,
        marginLeft: 10,
        borderColor: "#ffcb50",
        borderWidth: 2
    },
    modalUserUsername: {
        fontSize: 18,
        fontWeight: 500,
        fontStyle: "italic"
    },
    modalItemImage: {
        // width: 400,
        // height: 300,
        borderWidth: 1,
        borderColor: "#385a64",
        width: 320,
        height: 230,
        marginTop: 15,
        marginHorizontal: 36,
        borderRadius: 17,
        marginBottom: 20
    },
    modalItem: {
        display: "flex",
    },
    modalItemTitle: {
        alignSelf: "center",
        fontSize: 24,
        fontWeight: 700,
        marginTop: 5,
        textAlign: "center",
        marginBottom: 5,
        paddingHorizontal: 20
    },
    modalItemDate: {
        alignSelf: "center",
        //fontStyle: "italic",
        fontSize: 16,
        fontWeight: 400,
        marginBottom: 25
    },
    modalItemDescription: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: 400,
        paddingHorizontal: 25
    },
    modalItemDescriptionLabel: {
        marginTop: 10,
        paddingHorizontal: 25,
        fontSize: 17,
        fontWeight: 800,
        color: "#385a64"
    },
    modalItemType: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: 400,
        paddingHorizontal: 25
    },
    modalItemTypeLabel: {
        marginTop: 10,
        paddingHorizontal: 25,
        fontSize: 17,
        fontWeight: 800,
        color: "#385a64"
    },
    modalContact: {
        marginTop: 5
    },
    modalContactText: {
        alignSelf: "flex-start",
        fontSize: 16,
        fontWeight: 400,
        paddingHorizontal: 25
    },
    modalContactTextLabel: {
        marginTop: 5,
        paddingHorizontal: 25,
        fontSize: 17,
        fontWeight: 800,
        color: "#385a64"
    },
    modalContactCall: {
        backgroundColor: "#ffcb50",
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 20
    },
    modalContactButtonText: {
        fontSize: 20,
        fontWeight: 700,
        textAlign: "center",
        color: "#385a64"
    },
})