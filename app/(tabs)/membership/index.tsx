import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MembershipHeader,
  SubscriptionPlan,
} from "../../../components/membership";

export default function MembershipScreen() {
  const handleSubscribe = (planType: string) => {
    console.log("Subscribe to plan:", planType);
    // Handle subscription logic
  };

  const superFeatures = [
    { text: "Trái tim vô hạn", included: true },
    { text: "Không quảng cáo", included: true },
  ];

  const familyFeatures = [
    { text: "Trái tim vô hạn", included: true },
    { text: "Không quảng cáo", included: true },
    { text: "Tới đa 6 thành viên", included: true },
    { text: "Giảm giá tới 78% Super", included: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MembershipHeader
          title="Gói đăng ký"
          subtitle="SO SÁNH CÁC GÓI ĐĂNG KÝ"
        />

        <SubscriptionPlan
          title="Super"
          isRecommended={true}
          features={superFeatures}
          price="0 đ"
          buttonText="THỬ VỚI GIÁ"
          onSubscribe={() => handleSubscribe("super")}
        />

        <SubscriptionPlan
          title="Gói Super Gia Đình"
          features={familyFeatures}
          price="0 đ"
          buttonText="THỬ VỚI GIÁ"
          avatars={["👨", "👩"]}
          memberCount="+4"
          onSubscribe={() => handleSubscribe("family")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
});
