import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView from "react-native-maps"
import * as Location from "expo-location"

export default function MapScreen() {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 43.318887,
        longitude: 21.895935
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        })();
    }, []);

    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 43.318887,
                    longitude: 21.895935,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                userLocationUpdateInterval={5000}
                followsUserLocation={true} // samo za apple?
            />
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
    }
})