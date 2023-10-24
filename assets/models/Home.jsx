import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import * as Speech from 'expo-speech';
import ModalDropdown from 'react-native-modal-dropdown'; // Import the library
import Slider from 'react-native-slider';

const Home = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
//   const [isTTS, setIsTTS] = useState(false);
//   const [JSONvoices, setJSONVoices] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);

  const ws = useRef(new WebSocket('ws://localhost:3000')).current;

  const speakExpo = (msg) => {
    Speech.speak(msg, {
      voice: selectedVoice,
      rate: speechRate,
    });
  };

  const fetchVoices = async () => {
    const voiceArray = await Speech.getAvailableVoicesAsync();
    setVoices(voiceArray);
    if (voices.length > 0) {
      setSelectedVoice(voices[0].identifier);
    }
  };

  useEffect(() => {
    fetchVoices();

    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    ws.onclose = (e) => {
      console.log('WebSocket closed:', e);
    };

    ws.onmessage = (e) => {
      var message = JSON.parse(e.data);
      console.log('WebSocket message received:', message);
      setResponse(message.response);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSend = () => {
    ws.send(text);
  };

  const selectVoice = (index, value) => {
    setSelectedVoice(voices[index].identifier);
    console.log('Selected Voice:', value);
  };

  return (
    <View>
      <TextInput
        placeholder="Type a message..."
        value={text}
        onChangeText={(newText) => setText(newText)}
      />
      <Button title="Send" onPress={handleSend} />
      <Button title="Speak" onPress={() => speakExpo(response)} />

      {/* Speed Selector Slider */}
      <Text>Speech Rate: {speechRate.toFixed(2)}</Text>
      <Slider
        minimumValue={0.5}
        maximumValue={2}
        step={0.1}
        value={speechRate}
        onValueChange={(value) => setSpeechRate(value)}
      />

      <ModalDropdown
        options={voices.map((voice) => voice['name'])}
        onSelect={(index, value) => selectVoice(index, value)}
        defaultValue="Select Voice"
      />

      <Text>Response: {response}</Text>
    </View>
  );
};

export default Home;
