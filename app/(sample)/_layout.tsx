import { Text, View } from "react-native";

export default function SampleLayout() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Sample screen</Text>
        </View>
    );
}