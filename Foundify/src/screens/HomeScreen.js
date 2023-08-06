import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FIREBASE_AUTH } from '../config/firebase'

export default function HomeScreen({ navigation }) {
    return (
        <View>
            <Button onPress={() => /* navigation.navigate("") */ FIREBASE_AUTH.signOut()} title='Logout' />
        </View>
    )
}

const styles = StyleSheet.create({})