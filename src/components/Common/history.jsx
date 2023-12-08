import { useState } from "react";
import { BsChatSquareDots } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import PropTypes from "prop-types";
import { getStoredStoreIds } from "../../store/utils";

const Item = ({ id, updateScene }) => {
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
      className="cursor-pointer py-2 border-b border-gray-700 hover:opacity-80 transition-opacity duration-300 ease-in-out"
      onClick={() => updateScene(id)}
    >
      <div className="text-white">{formatId(id)}</div>
    </div>
  );
};

Item.propTypes = {
  id: PropTypes.string.isRequired,
  updateScene: PropTypes.func.isRequired,
};

function History({ updateScene }) {
  const [isOpen, setIsOpen] = useState(false);
  const history = getStoredStoreIds();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="text-white">
      <div
        className="flex items-center cursor-pointer w-full justify-start hover:opacity-80 transition-opacity duration-300 ease-in-out pt-1"
        onClick={toggleDropdown}
      >
        <BsChatSquareDots className="text-gray-200 mr-3" size={21}/>
        <div className="">History</div>
        {isOpen ? (
          <IoIosArrowUp className="text-white" />
        ) : (
          <IoIosArrowDown className="text-white" />
        )}
      </div>

      {isOpen && (
        <div className="overflow-y-auto transition-height duration-300 ease-in-out">
          {history.map((id) => (
            <Item key={id} id={id} updateScene={updateScene} />
          ))}
        </div>
      )}
    </div>
  );
}

History.propTypes = {
  updateScene: PropTypes.func.isRequired,
};

export default History;
