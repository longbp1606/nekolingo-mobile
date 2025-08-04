import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InviteFriendsCardProps {
  onInvite: () => void;
}

const InviteFriendsCard: React.FC<InviteFriendsCardProps> = ({ onInvite }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/add.png")}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mời bạn bè</Text>
          <Text style={styles.description}>
            Chia sẻ với bạn bè về ứng dụng học ngoại ngữ thú vị - Nekolingo nhé!
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onInvite}>
        <Text style={styles.buttonText}>GỬI LỜI MỜI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 12,
    marginTop: -10,
    marginBottom: -15,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B4B4B",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#00C2D1",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
});

export default InviteFriendsCard;
