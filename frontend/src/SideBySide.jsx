import AddEvidence from "./AddEvidence";
import CheckEvidence from "./CheckEvidence";
import "./SideBySide.css";

const SideBySide = () => {
  return (
    <div className="sidebyside-container">
      <div className="sidebyside-wrapper">
        <div className="panel left-panel">
          <AddEvidence />
        </div>
        <div className="panel right-panel">
          <CheckEvidence />
        </div>
      </div>
    </div>
  );
};

export default SideBySide;
