import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const BAR_WIDTH = width * 0.05; 
const BAR_HEIGHT = width * 0.3; 
const NUM_BARS = 4;

const barColors = ["#F5A623", "#FFBC42", "#5D9B9B", "#2A4D69"];

const LoadingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const bars = Array.from({ length: NUM_BARS }, () => useRef(new Animated.Value(20)).current);
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    bars.forEach((bar, index) => {  
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(bar, {
            toValue: 20 + Math.random() * (BAR_HEIGHT - 20),
            duration: 800 + index * 150,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 20,
            duration: 800 + index * 150,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(onFinish, 4000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={["#5D9B9B", "#2A4D69"]}
      style={styles.container}
    >
      <View style={styles.chartContainer}>
        {bars.map((bar, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: bar,
                backgroundColor: barColors[index],
                shadowColor: barColors[index],
              },
            ]}
          />
        ))}
      </View>
      <Animated.Text style={[styles.title, { opacity: fadeValue }]}>
        BIZMANAGER
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeValue }]}>
        Carregando...
      </Animated.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "60%",
    height: BAR_HEIGHT,
    marginBottom: 30,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 40,
    color: "#F5F5F5",
    fontFamily: "BebasNeue",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: "#F5F5F5",
    fontFamily: "BebasNeue",
  },
});

export default LoadingScreen;
