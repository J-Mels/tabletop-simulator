import React, { useState } from "react";
import "./FolderBrowserModal.css";
import PropTypes from "prop-types";

function FolderBrowserModal({ title, folderData, onClose, onSelectFolder }) {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = async (item, path) => {
    const isExpanded = expandedFolders[path];

    if (isExpanded) {
      setExpandedFolders((prev) => ({ ...prev, [path]: false }));
    } else {
      if (!item.children || item.children.length === 0) {
        const children = await window.electronAPI.getFolderContents(path);
        item.children = children;
      }
      setExpandedFolders((prev) => ({ ...prev, [path]: true }));
    }
  };

  const renderTree = (items, depth = 0, parentPath = "") => {
    return (
      <ul style={{ paddingLeft: depth * 20 }}>
        {items.map((item) => {
          const fullPath = `${parentPath}/${item.name}`;
          const isExpanded = expandedFolders[fullPath];

          return (
            <li key={fullPath}>
              {item.type === "folder" ? (
                <>
                  <button
                    className="folder-button"
                    onClick={() => toggleFolder(item, fullPath)}
                  >
                    {isExpanded ? "📂" : "📁"} {item.name}
                  </button>
                  {isExpanded &&
                    item.children &&
                    renderTree(item.children, depth + 1, fullPath)}
                </>
              ) : (
                <span className="file-entry">📄 {item.name}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <div className="folder-tree">{renderTree(folderData)}</div>
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
  onSelectFolder: PropTypes.func.isRequired, // optional for future use
};
