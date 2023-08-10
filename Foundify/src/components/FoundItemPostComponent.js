import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

export default function FoundItemPostComponent(props) {
    const marker = props.marker;

    return (
        <View style={styles.container}>
            <View style={styles.userInfoContainer}>
                <Image style={styles.userImage} source={require("../../assets/defaultProfilePicture.png")} />
                <View style={styles.userHeader}>
                    <Text style={styles.userUsername}>{marker.userUsername}</Text>
                    <TouchableOpacity>
                        <Text style={styles.showPostText}>Show Post »</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.itemContainer}>
                <View style={styles.itemImageContainer}>
                    <Image style={styles.itemImage} source={{ uri: marker.image }} />
                </View>
                <View style={styles.itemInfoContainer}>
                    <Text style={styles.infoTitleText} >{marker.title}</Text>
                    <Text style={styles.infoType}>Type:</Text>
                    <Text style={styles.infoTypeText} /*numberOfLines={1} ellipsizeMode="tail"*/>{marker.type}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderColor: "#385a64",
        borderWidth: 1,
        backgroundColor: "#f6f6f6",
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 15
    },
    userInfoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderBottomColor: "#385a64",
        borderBottomWidth: 1,
        backgroundColor: "#385a64",
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
        borderColor: "#ffcb50",
        borderWidth: 2
    },
    userUsername: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 400,
        color: "#fff"
    },
    showPostText: {
        marginRight: 15,
        fontStyle: "italic",
        fontSize: 15,
        fontWeight: 500,
        color: "#ffcb50"
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
        paddingVertical: 15,
        paddingRight: 15
    },
    infoTitleText: {
        borderBottomColor: "#ffcb50", //e69b22 //ffcb50
        borderBottomWidth: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: 600,
        color: "#385a64",
        paddingBottom: 4
    },
    infoType: {

    },
    infoTypeText: {

    }
})

const styles2 = StyleSheet.create({
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
        borderBottomColor: "#385a64",
        borderBottomWidth: 1
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
        borderWidth: 1
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
        color: "#e69b22"
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
        paddingVertical: 15,
        paddingRight: 15
    },
    infoTitleText: {
        // borderBottomColor: "#385a64",
        // borderBottomWidth: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: 600,
        color: "#385a64",
        paddingBottom: 4
    },
    infoType: {

    },
    infoTypeText: {

    }
})