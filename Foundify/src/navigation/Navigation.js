
import { Image, Text } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import MapScreen from "../screens/MapScreen";
import LostItemsListScreen from "../screens/LostItemsListScreen";
import FoundItemsListScreen from "../screens/FoundItemsListScreen";
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Bottom Tabs
const Tab = createBottomTabNavigator();

function BottomTabsGroup() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, focused, size }) => {
                    let iconName;
                    size = 27;
                    if (route.name === "Profile") {
                        iconName = focused ? "account-circle" : "account-circle-outline";
                    } else if (route.name === "Leaderboard") {
                        iconName = focused ? "medal" : "medal-outline";
                    } else if (route.name === "Home") {
                        iconName = focused ? "home-circle" : "home-circle-outline";
                    } else if (route.name === "Map") {
                        iconName = focused ? "map-marker-radius" : "map-marker-radius-outline";
                    }
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: "#e69b22",
                tabBarInactiveTintColor: "#385a64"
            })}
        >
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Tab.Screen name="Home" component={TopTabsGroup} />
            <Tab.Screen
                name="Map"
                component={MapScreen}
            // options={{
            //     headerLeft: (props) => <HeaderLogo {...props} />
            // }}
            />
        </Tab.Navigator>
    )
}

// Stack
const InsideStack = createNativeStackNavigator();

function StackGroup() {
    return (
        <InsideStack.Navigator>
            <InsideStack.Screen name="" />
        </InsideStack.Navigator>
    )
}

// Top Tabs
const TopTabs = createMaterialTopTabNavigator();

function TopTabsGroup() {
    return (
        <TopTabs.Navigator>
            <TopTabs.Screen name="lost" component={LostItemsListScreen} />
            <TopTabs.Screen name="found" component={FoundItemsListScreen} />
        </TopTabs.Navigator>
    )

}

function HeaderLogo() {
    return (
        <Image
            style={{ width: 130, height: 55 }}
            source={require("../../assets/Foundify_HeaderLogo.png")}
        />
    )
}

export default function Navigation() {
    return (

        <BottomTabsGroup />
    )
}