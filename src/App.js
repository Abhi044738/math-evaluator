/* global chrome */
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("selectionHistory", (data) => {
      console.log("orignal data " + data.selectionHistory);
      setHistory(data.selectionHistory || []);
    });
    chrome.runtime.sendMessage({ type: "getAppStatus" }, (status) => {
      setRunning(status);
    });
  }, []);
  useEffect(() => {
    const handleStorage = (changes, area) => {
      if (area === "local" && changes.selectionHistory) {
        setHistory(changes.selectionHistory.newValue);
      }
    };
    chrome.storage.onChanged.addListener(handleStorage);
    return () => chrome.storage.onChanged.removeListener(handleStorage);
  }, []);
  const handleClear = () => {
    chrome.storage.local.set({ selectionHistory: [] }, () => setHistory([]));
  };
  const handleToggle = () => {
    let newStatus = !running;
    setRunning(newStatus);
    chrome.runtime.sendMessage({ type: "setAppStatus", value: newStatus });
  };

  return (
    <div className="App">
      <h2 className="color-container">Evaluator</h2>

      <div className="color-container container">
        <h2>History</h2>
        <button onClick={handleToggle}>{running ? "Stop" : "Start"}</button>
        <button onClick={handleClear}>Clear</button>
        <div>
          <br />
          <br />
        </div>
        <table>
          <thead>
            <tr>
              <th>Selected</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {console.log(history)}
            {history.map((value, i) => (
              <tr key={i}>
                <td>{value.text}</td>
                <td>
                  {/* {value.result} */}
                  {value.done ? value.result : "Waiting"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
