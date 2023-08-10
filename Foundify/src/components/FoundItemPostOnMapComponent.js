import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function FoundItemPostOnMapComponent(props) {
  const marker = props.marker;
  const centerMapOnMarker = props.centerMapOnMarker;

  const handlePressOnPostMap = () => {
    centerMapOnMarker(marker.location);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePressOnPostMap}>
      <Image style={styles.postImage} source={{ uri: marker.image }} />
      <View style={styles.infoContainer}>
        <View style={styles.info}>
          <Text style={styles.infoLabel}>Title:</Text>
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">{marker.title}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">{marker.type}</Text>
        </View>
      </View>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    height: "95%",
    width: 230,
    marginHorizontal: 5,
    borderRadius: 5,
    borderColor: "#385a64",
    borderWidth: 1
  },
  postImage: {
    // height: "75%",
    // width: "100%",
    // borderTopRightRadius: 5,
    // borderTopLeftRadius: 5,
    height: "65%",
    width: "90%",
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  infoContainer: {
    display: "flex",
    width: "99%",
    height: "25%",
    backgroundColor: "#dee9ed", //dee9ed //f9f9f9
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  info: {
    display: "flex",
    flexDirection: "row",
  },
  infoLabel: {
    textAlign: "left",
    fontSize: 15,
    fontWeight: 700,
    marginHorizontal: 3
  },
  infoText: {
    fontSize: 15,
    fontWeight: 400,
    color: "#385a64",
    width: "80%"
  }
})