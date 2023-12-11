import { useConfigStore } from "../../store";
import { CiLock, CiUnlock } from "react-icons/ci";

function LockView() {
  const [lockViewInOutput, setLockViewInOutput] = useConfigStore((state) => [
    state.lockViewInOutput,
    state.setLockViewInOutput,
  ]);

  return (
    <div className="text-white">
      {lockViewInOutput ? (
        <CiLock onClick={() => setLockViewInOutput(false)} size={35} />
      ) : (
        <CiUnlock onClick={() => setLockViewInOutput(true)} size={35} />
      )}
    </div>
  );
}

export default LockView;
