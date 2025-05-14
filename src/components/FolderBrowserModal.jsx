import React from "react";
import "./FolderBrowserModal.css";
import PropTypes from "prop-types";

function FolderBrowserModal({ title, folderData, onClose, onSelectFolder }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <ul>
          {folderData.map((item) => (
            <li key={item.name}>
              {item.type === "folder" ? (
                <button onClick={() => onSelectFolder(item)}>
                  {item.name}/
                </button>
              ) : (
                <span>{item.name}</span>
              )}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default FolderBrowserModal;

FolderBrowserModal.propTypes = {
  title: PropTypes.string.isRequired,
  folderData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["folder", "file"]).isRequired,
      children: PropTypes.array,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectFolder: PropTypes.func.isRequired,
};
