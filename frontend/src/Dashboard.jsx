import { useEffect, useState } from "react";
import mqtt from "mqtt";

export default function Dashboard() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  useEffect(() => {
    const client = mqtt.connect("ws://192.168.1.109:9001");

    client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      client.subscribe("kitchen/esp32/dht11");
    });

    client.on("message", (topic, msg) => {
      try {
        const data = JSON.parse(msg.toString());
        setTemperature(data.temperature);
        setHumidity(data.humidity);
      } catch (err) {
        console.error("Failed to parse message:", msg.toString());
      }
    });

    return () => client.end();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>test mqtt</h1>
      {temperature !== null && humidity !== null ? (
        <div>
          <p><b>Temperature:</b> {temperature} °C</p>
          <p><b>Humidity:</b> {humidity} %</p>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}
