import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView from "react-native-maps"
import * as Location from "expo-location"

export default function MapScreen() {
    const [loading, setLoading] = useState(false);
    const [isPermissionAllowed, setIsPermissionAllowed] = useState(true);
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 43.318887,
        longitude: 21.895935
    });

    useEffect(() => {
        setLoading(true);
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsPermissionAllowed(false);
                console.log('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            setLoading(false);
        })();
    }, []);

    return (
        <View style={styles.mapContainer}>
            {loading ? (
                <>
                    {isPermissionAllowed ? (
                        <>
                            <ActivityIndicator size="large" color="#ffcb50" />
                            <Text>Loading current location...please wait</Text>
                        </>
                    ) : (
                        <Text> For using map please allow location access </Text>
                    )}
                </>
            ) : (
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
                />
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
    }
})