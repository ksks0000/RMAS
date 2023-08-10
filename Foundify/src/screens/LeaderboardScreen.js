import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_STORAGE } from "../config/firebase";


export default function LeaderboardScreen() {
    const [data, setData] = useState([]);
    const [userImage, setUserImage] = useState(null);

    const usersCollectionRef = collection(FIREBASE_DB, "users");

    const getUsers = async () => {
        try {
            const q = query(usersCollectionRef, orderBy("points", "desc"));
            const data = await getDocs(q);
            const users = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setData(users);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {data.map((user) => {
                return (
                    <View style={styles.userContainer} key={user.id}>
                        {user.photoURL ?
                            <Image style={styles.userImage} source={{ uri: user.photoURL }} />
                            :
                            <Image style={styles.userImage} source={require("../../assets/defaultProfilePicture.png")} />}
                        <View style={styles.userInfo}>
                            <Text style={styles.userUsername}>@{user.username}</Text>
                            <Text style={styles.userPoints}>{user.points}</Text>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        backgroundColor: "#fafafa"
    },
    userContainer: {
        marginVertical: 5,
        marginHorizontal: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderColor: "#e69b22",
        borderWidth: 2,
        zIndex: 2
    },
    userInfo: {
        backgroundColor: "#fff3cc", //fff3cc //fff9e6
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "75%",
        paddingVertical: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        position: "relative",
        left: -15
    },
    userUsername: {
        marginLeft: 18,
        color: "#385a64",
        fontSize: 20,
        fontWeight: 500
    },
    userPoints: {
        marginRight: 20,
        color: "#385a64",
        fontSize: 20,
        fontWeight: 700
    }
})