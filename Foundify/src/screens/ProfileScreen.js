import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { FIREBASE_AUTH } from '../config/firebase'

export default function ProfileScreen() {
    return (
        <View>
            <Text>ProfileScreen</Text>
            <Button onPress={() => /* navigation.navigate("") */ FIREBASE_AUTH.signOut()} title='Logout' />
        </View>
    )
}

const styles = StyleSheet.create({})