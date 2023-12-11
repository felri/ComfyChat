import { useEffect } from "react";
import Scene from "./components/FlowComponents/scene";
import { ReactFlowProvider } from "reactflow";
import hljs from "highlight.js/lib/core";
import "./App.css";

function App() {
  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <Scene />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
