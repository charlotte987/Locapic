import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Button, Overlay, Input } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
/*import du module*/
import AsyncStorage from "@react-native-async-storage/async-storage";
import socketIOClient from "socket.io-client";
import { connect } from "react-redux";

var socket = socketIOClient("http://192.168.1.40:3000");

function MapScreen(props) {
  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [addPOI, setAddPOI] = useState(false);
  const [listPOI, setListPOI] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const [titrePOI, setTitrePOI] = useState();
  const [descPOI, setDescPOI] = useState();

  const [tempPOI, setTempPOI] = useState();
  const [listposition, setListPosition] = useState([]);

  /*Envoi de ma position et pseudo vers le backend*/
  useEffect(() => {
    async function askPermissions() {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === "granted") {
        Location.watchPositionAsync({ distanceInterval: 2 }, (location) => {
          socket.emit("sendPosition", {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            pseudo: props.pseudo,
          });
        });
      }
    }
    askPermissions();

    /*lecture des POI*/
    AsyncStorage.getItem("findPOI", function (error, data) {
      if (data) {
        var userData1 = JSON.parse(data);
        setListPOI(userData1);
        console.log(userData1);
      }
    });
  }, []);

  /*Récupère la position de l'utilisateur*/
  useEffect(() => {
    socket.on("sendPositionToAll", function (newPosition) {
      setListPosition([...listposition, newPosition]);
    });
  }, [listposition]);

  var selectPOI = (e) => {
    if (addPOI) {
      setAddPOI(false);
      setIsVisible(true);
      setTempPOI({
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      });
    }
  };

  /*enregistrement des POI en local*/
  var handleSubmit = () => {
    setListPOI([
      ...listPOI,
      {
        longitude: tempPOI.longitude,
        latitude: tempPOI.latitude,
        titre: titrePOI,
        description: descPOI,
      },
    ]);

    AsyncStorage.setItem(
      "findPOI",
      JSON.stringify([
        ...listPOI,
        {
          longitude: tempPOI.longitude,
          latitude: tempPOI.latitude,
          titre: titrePOI,
          description: descPOI,
        },
      ])
    );
    console.log(listPOI);
    setIsVisible(false);
    setTempPOI();
    setDescPOI();
    setTitrePOI();
  };

  var markerPOI = listPOI.map((POI, i) => {
    return (
      <Marker
        key={i}
        pinColor="blue"
        coordinate={{ latitude: POI.latitude, longitude: POI.longitude }}
        title={POI.titre}
        description={POI.description}
      />
    );
  });
  var isDisabled = false;
  if (addPOI) {
    isDisabled = true;
  }

  /*Map sur la position des utilisateurs*/
  var markerPosition = listposition.map((Pos, i) => {
    return (
      <Marker
        key={i}
        pinColor="red"
        coordinate={{ latitude: Pos.latitude, longitude: Pos.longitude }}
        title={Pos.pseudo}
      />
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => {
          setIsVisible(false);
        }}
      >
        <View>
          <Input
            containerStyle={{ marginBottom: 25 }}
            placeholder="titre"
            onChangeText={(val) => setTitrePOI(val)}
          />

          <Input
            containerStyle={{ marginBottom: 25 }}
            placeholder="description"
            onChangeText={(val) => setDescPOI(val)}
          />

          <Button
            title="Ajouter POI"
            buttonStyle={{ backgroundColor: "#eb4d4b" }}
            onPress={() => handleSubmit()}
            type="solid"
          />
        </View>
      </Overlay>

      <MapView
        onPress={(e) => {
          selectPOI(e);
        }}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 48.866667,
          longitude: 2.333333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {markerPosition}
        {markerPOI}
      </MapView>
      <Button
        disabled={isDisabled}
        title="Add POI"
        icon={<Icon name="map-marker" size={20} color="#ffffff" />}
        buttonStyle={{ backgroundColor: "#eb4d4b" }}
        type="solid"
        onPress={() => setAddPOI(true)}
      />
    </View>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmitPseudo: function (pseudo) {
      dispatch({ type: "savePseudo", pseudo: pseudo });
    },
  };
}

export default connect(null, mapDispatchToProps)(MapScreen);
