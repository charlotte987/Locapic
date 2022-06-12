import React, { useState, useEffect } from "react";
import { StyleSheet, ImageBackground } from "react-native";

import { Button, Input, Text } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
/*import du module*/
import AsyncStorage from "@react-native-async-storage/async-storage";

import { connect } from "react-redux";

function HomeScreen(props) {
  const [pseudo, setPseudo] = useState("");

  handelsubmit = () => {
    props.onSubmitPseudo(pseudo);
    props.navigation.navigate("BottomNavigator", { screen: "Map" });
    /*enregistrement du pseudo en local*/
    AsyncStorage.setItem("findpseudo", pseudo);
  };

  useEffect(() => {
    /*lecture du pseudo en local*/
    AsyncStorage.getItem("findpseudo", function (error, data) {
      if (data !== null) {
        setPseudo(data);
        console.log(data);
      }
    });
  }, []);

  return (
    <ImageBackground
      source={require("../assets/home.jpg")}
      style={styles.container}
    >
      {!pseudo ? (
        <Input
          containerStyle={{ marginBottom: 25, width: "70%" }}
          inputStyle={{ marginLeft: 10 }}
          placeholder="John"
          leftIcon={<Icon name="user" size={24} color="#eb4d4b" />}
          onChangeText={(val) => setPseudo(val)}
        />
      ) : (
        <Text
          style={{
            marginLeft: 10,
            fontSize: 25,
            marginBottom: 25,
            color: "white",
            fontWeight: "bold",
          }}
        >
          Welcome Back {pseudo}{" "}
        </Text>
      )}

      <Button
        icon={<Icon name="arrow-right" size={20} color="#eb4d4b" />}
        title="Go to Map"
        type="solid"
        onPress={() => handelsubmit()}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

function mapDispatchToProps(dispatch) {
  return {
    onSubmitPseudo: function (pseudo) {
      dispatch({ type: "savePseudo", pseudo: pseudo });
    },
  };
}

export default connect(null, mapDispatchToProps)(HomeScreen);
