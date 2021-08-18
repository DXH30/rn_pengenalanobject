import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, Button, Alert } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as facemesh from '@tensorflow-models/facemesh';
import { fetch } from '@tensorflow/tfjs-react-native';
const jpeg = require('jpeg-js');

//https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hotdog_-_Evan_Swigart.jpg/270px-Hotdog_-_Evan_Swigart.jpg
//https://oceana.org/sites/default/files/tiger_shark_0.jpg

export default function App() {
 const [url, setUrl] = React.useState('https://www.goodnewsfromindonesia.id/uploads/post/large-maxresdefault-23-2ac88660ee3988e5fb41ab2a77b782d7.jpg');

 const [displayText, setDisplayText] = React.useState('loading');

 async function getPrediction(url) {
  setDisplayText("Loading Tensor Flow");
  await tf.ready();
  setDisplayText("Loading Mobile Net");
  //const model = await mobilenet.load();
  const model = await mobilenet.load();
  const response = await fetch(url, {}, {isBinary: true});
  setDisplayText("Download to array buffer");
  const imageData = await response.arrayBuffer();
  setDisplayText("Data to Tensor");
  const imageTensor = imageToTensor(imageData);
  setDisplayText("Tensor to Prediction");
  const prediction = await model.classify(imageTensor);
  setDisplayText(JSON.stringify(prediction));
  Alert.alert(`Ini ${prediction[0].className} lo`);
 }

 function imageToTensor(rawData) {
  const {width, height, data} = jpeg.decode(rawData, true);
  const buffer = new Uint8Array(width*height*3);
  let offset = 0;
  for (let i=0; i < buffer.length; i+=3) {
   buffer[i] = data[offset]; // Red
   buffer[i+1] = data[offset + 1]; // Green
   buffer[i+2] = data[offset + 2]; // Blue // Alpha = Offset + 4
   offset +=4; // skip alpha
  }

  return tf.tensor3d(buffer, [height, width, 3]);
 }

  return (
    <View style={styles.container}>
     <Text>Cuma Bisa jpeg</Text>
     <TextInput
      style={{height: 40, width:"90%", borderColor: "gray", borderWidth: 1}}
      onChangeText={text => setUrl(text)}
      value={url}
     />
     <Image style={styles.imageStyle} source={{uri:url}}></Image>
     <Button title='classify Image' onPress={() => getPrediction(url)}>
     </Button>
     <Text>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
 },
 imageStyle: {
  width: 200,
  height: 200
 }
});
