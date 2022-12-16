import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";
const STORAGE_SETTINGS_KEY = "@settings";

export default function App() {
  const [settings, setSettings] = useState({});
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadToDos();
  }, []);

  const travel = () => {
    setWorking(false);
    setSettings({ working: false });
    saveSettings({ working: false });
  };

  const work = () => {
    setWorking(true);
    setSettings({ working: true });
    saveSettings({ working: true });
  };

  const onChangeText = (payload) => setText(payload);

  const saveSettings = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(toSave));
  };

  const loadSettings = async () => {
    const s = await AsyncStorage.getItem(STORAGE_SETTINGS_KEY);
    const json = JSON.parse(s);

    if (json) {
      setSettings(json);
      setWorking(json.working);
    } else {
      null;
    }
  };

  const clearAll = async () => {
    AsyncStorage.clear();
  };

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    s ? setToDos(JSON.parse(s)) : null;
  };

  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // 해시맵, Date.now() 를 [] 으로 감싼 것은, KEY 값이기 때문이다.
    // 해시맵이 배열(array)보다 훨씬 빠르다고 한다. ( 선형 탐색이 아니기 때문에 )
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, working },
    // });

    const newToDos = { ...toDos, [Date.now()]: { text, working } }; // ES6 문법

    console.log(newToDos);
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        returnKeyType="done"
        placeholder={
          working
            ? "What do you have to do? (top1)"
            : "Where do you want to go (top1)?"
        }
        style={styles.input}
      />
      <TouchableOpacity onPress={clearAll}>
        <Text style={{ color: "red", textAlign: "right" }}>CLEAR ALL</Text>
      </TouchableOpacity>

      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
