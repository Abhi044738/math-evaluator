/* global chrome */
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const handleToggle = () => {
    const action = running ? "Stopped" : "Started";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: action }, (response) => {
        if (chrome.runtime.lastError) {
          setStatusMessage("Cannot inject on this page");
        } else if (response?.status === "OK") {
          setRunning(() => {
            setStatusMessage(!running ? "Started" : "Stopped");
            return !running;
          });
          // setRunning((running) => !running);
          // setStatusMessage(running ? "Started" : "Stopped");
          setTimeout(() => setStatusMessage(""), 2000);
        }
      });
    });
  };
  useEffect(() => {
    chrome.storage.local.get("selectionHistory", (data) => {
      console.log("orignal data " + data.selectionHistory);
      setHistory(data.selectionHistory || []);
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
  return (
    <div className="App">
      <header className="App-header">
        <h1>Evaluator</h1>
        <button onClick={handleToggle}>{running ? "Stop" : "Start"}</button>
        {statusMessage && <p>{statusMessage}</p>}

        <h2>History</h2>
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
                  {console.log(value.done)}
                  {value.result}
                  {/* {value.done ? "done" : "not done"} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
