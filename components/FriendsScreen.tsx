import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';


const FriendsScreen = () => {
    return (
        <View style={styles.mainContent}>
            <View style={styles.emptyState}>
                <Image
                    source={require('../assets/images/friend.gif')}
                    style={styles.emptyImage}
                />
                <Text style={styles.emptyMessage}>
                    Kết nối bạn bè giúp học vui và hiệu quả hơn.
                </Text>
            </View>
        </View>


    );
};

const styles = StyleSheet.create({
    mainContent: {
        marginTop: -300,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyImage: {
        width: '80%',
        height: 200,
        marginBottom: 24,
        resizeMode: 'contain',
    },
    emptyMessage: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default FriendsScreen;