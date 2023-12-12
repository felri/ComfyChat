import { useState } from "react";
import { BsChatSquareDots } from "react-icons/bs";
import PropTypes from "prop-types";
import { getStoredStoreIds } from "../../store/utils";
import { HiOutlineTrash } from "react-icons/hi2";
import { storeManager } from "../../store";
import Tooltip from "../Common/tooltip";

const Item = ({ id, updateScene, selected, onDelete }) => {
  const formatId = (id) => {
    if (!id) return "";
    // id is unixtime-random
    const split = id.split("-");
    const date = new Date(parseInt(split[0]));
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    return formattedDate;
  };

  return (
    <div
      className={`cursor-pointer p-2 border-b border-gray-700 hover:opacity-80 transition-opacity duration-300 ease-in-out flex justify-between items-center ${
        selected ? "bg-gray-900" : ""
      }`}
      onClick={() => updateScene(id)}
    >
      <div className="text-white">{formatId(id)}</div>
      {!selected && (
        <HiOutlineTrash
          className="text-white ml-2"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        />
      )}
    </div>
  );
};

Item.propTypes = {
  id: PropTypes.string.isRequired,
  updateScene: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};

function History({ updateScene, currentId, resetStore }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState(getStoredStoreIds());

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const onDelete = (id) => {
    if (id === currentId) {
      if (history.length > 1) {
        storeManager.removeStore(id);
        const first = getStoredStoreIds()[0];
        updateScene(first);
      } else {
        resetStore();
      }
    } else {
      storeManager.removeStore(id);
    }
    setHistory(getStoredStoreIds());
  };

  return (
    <div className="text-white font-bold">
      <div
        className="ml-1 mt-1 flex items-center cursor-pointer w-full justify-start hover:opacity-80 transition-opacity duration-300 ease-in-out py-1"
        onClick={toggleDropdown}
      >
        <Tooltip text="History">
          <BsChatSquareDots className="text-gray-200 mr-3" size={25} />
        </Tooltip>
      </div>

      {isOpen && (
        <div className="overflow-y-auto transition-height duration-300 ease-in-out">
          {history.map((id) => (
            <Item
              key={id}
              id={id}
              updateScene={updateScene}
              selected={id === currentId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

History.propTypes = {
  updateScene: PropTypes.func.isRequired,
  currentId: PropTypes.string,
  resetStore: PropTypes.func.isRequired,
};

export default History;
