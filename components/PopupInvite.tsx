import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const theme = {
    color: {
        white: '#FFFFFF',
        title: '#4B4B4B',
        primary: '#00C2D1',
        darkPrimary: '#009EB2',
        description: '#777',
        red: '#FF4B4B',
        bgRed: '#FFDFE0',
        green: '#58CC02',
        bgGreen: '#D7FFB8',
        bgBlue: '#CCF2F5',
        darkGreen: '4DAA02',
        darkRed: 'E04343',
        lightOrange: 'FFD700',
        orange: 'FFA500',
        lightPurple: 'AB47BC',
        darkPurple: '9C27B0',
    },
};

const { width: screenWidth } = Dimensions.get('window');

type PopupInviteProps = {
    onClose: () => void;
    visible: boolean;
};

const PopupInvite: React.FC<PopupInviteProps> = ({ onClose, visible }) => {
    const [copied, setCopied] = useState(false);
    const inviteLink = 'https://invite.duolingo.com/BDHTZ...';

    const handleCopyLink = async () => {
        try {
            await Clipboard.setString(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể sao chép liên kết');
        }
    };

    const handleShare = (platform: string) => {
        console.log(`Sharing on ${platform}`);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    <View style={styles.characterWrapper}>
                        <Image source={require('../assets/images/hi.gif')} style={styles.img} />
                        <View style={styles.paper} />
                        <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
                        <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
                        <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
                    </View>

                    <Text style={styles.title}>Mời bạn bè</Text>
                    <Text style={styles.description}>
                        Chia sẻ trải nghiệm học ngôn ngữ miễn phí và vui nhộn trên Duolingo tới bạn bè!
                    </Text>

                    <View style={styles.inviteSection}>
                        <TextInput
                            style={styles.inviteInput}
                            value={inviteLink}
                            editable={false}
                            selectTextOnFocus={true}
                        />
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
                            <Text style={styles.copyButtonText}>
                                {copied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.socialText}>Hoặc chia sẻ trên...</Text>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.facebookButton]}
                            onPress={() => handleShare('facebook')}
                        >
                            <Text style={styles.socialButtonText}>FACEBOOK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.twitterButton]}
                            onPress={() => handleShare('twitter')}
                        >
                            <Text style={styles.socialButtonText}>TWITTER</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.bottomText}>
                        Kết nối bạn bè giúp học vui và hiệu quả hơn.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    popupContainer: {
        backgroundColor: theme.color.white,
        borderRadius: 16,
        padding: 50,
        maxWidth: 580,
        width: '100%',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 25,
        },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 25,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'transparent',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#9ca3af',
        fontSize: 20,
        fontWeight: '500',
    },
    characterWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    img: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    paper: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 32,
        height: 24,
        backgroundColor: '#fef08a',
        borderRadius: 4,
        transform: [{ rotate: '12deg' }],
        borderWidth: 1,
        borderColor: '#fde047',
    },
    sparkle: {
        position: 'absolute',
        fontSize: 12,
        color: '#facc15',
    },
    sparkle1: {
        top: -4,
        left: -4,
    },
    sparkle2: {
        top: -8,
        right: 8,
    },
    sparkle3: {
        top: 4,
        right: -12,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: theme.color.title,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        color: theme.color.description,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 26,
        fontSize: 16,
    },
    inviteSection: {
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    inviteInput: {
        flex: 1,
        backgroundColor: 'transparent',
        color: theme.color.title,
        fontSize: 14,
        paddingVertical: 0,
    },
    copyButton: {
        marginLeft: 8,
        backgroundColor: theme.color.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyButtonIcon: {
        color: 'white',
        fontSize: 16,
    },
    copyButtonText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    socialText: {
        color: theme.color.description,
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    facebookButton: {
        backgroundColor: '#2563eb',
        borderBottomColor: '#1e3a8a',
    },
    twitterButton: {
        backgroundColor: '#0ea5e9',
        borderBottomColor: '#0369a1',
    },
    socialButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomText: {
        color: theme.color.description,
        textAlign: 'center',
        fontSize: 14,
    },
});

export default PopupInvite;