import React, { useEffect, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import { Button, ListItem, Input } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import socketIOClient from "socket.io-client";
import { connect } from "react-redux";

var socket = socketIOClient("http://192.168.1.40:3000");

function ChatScreen(props) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [listMessage, setListMessage] = useState([]);

  var handleSubmit = () => {
    socket.emit("sendMessage", {
      message: currentMessage,
      pseudo: props.monpseudo,
    });
    console.log(props.monpseudo);
    setCurrentMessage(" ");
  };

  useEffect(() => {
    socket.on("sendMessageToAll", function (dataFromBack) {
      setListMessage([...listMessage, dataFromBack]);
    });
  }, [listMessage]);
  console.log("liste des messages ", listMessage);

  var titleMessage = listMessage.map((message, i) => {
    var msg = message.message.replace(/:\)/g, "\u263A");
    msg = msg.replace(/:\(/g, "\u2639");
    msg = msg.replace(/:p/g, "\uD83D\uDE1B");

    var msg = msg.replace(/[a-z]*fuck[a-z]*/gi, "\u2022\u2022\u2022");

    return (
      <ListItem key={i}>
        <ListItem.Title>{msg}</ListItem.Title>
        <ListItem.Subtitle>{message.pseudo}</ListItem.Subtitle>
      </ListItem>
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, marginTop: 50 }}>{titleMessage}</ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Input
          containerStyle={{ marginBottom: 5 }}
          placeholder="Your message"
          onChangeText={(value) => setCurrentMessage(value)}
          value={currentMessage}
        />
        <Button
          icon={<Icon name="envelope-o" size={20} color="#ffffff" />}
          title="Send"
          buttonStyle={{ backgroundColor: "#eb4d4b" }}
          type="solid"
          onPress={() => handleSubmit()}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

function mapStateToProps(state) {
  return { monpseudo: state.pseudo };
}

export default connect(mapStateToProps, null)(ChatScreen);
