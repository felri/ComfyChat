import Scene from "./components/FlowComponents/scene";
import { ReactFlowProvider } from "reactflow";
import "./App.css";

function App() {
  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <Scene />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
